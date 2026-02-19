/// <reference lib="WebWorker" />

import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import {
  MANDATORY_PACK_SLUGS,
  OFFLINE_LAUNCH_PATH,
  buildPackManifestUrl,
  buildPackUrl,
} from './constants/offline';
import type {
  CachePackPayload,
  ServiceWorkerInboundMessage,
  ServiceWorkerOutboundMessage,
} from './types/serviceWorker';
import type { DownloadedPackMap } from './types/travelPack';

declare let self: ServiceWorkerGlobalScope;

declare global {
  interface ServiceWorkerGlobalScope {
    __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
  }
}

const PACK_CACHE_PREFIX = 'travel-pack-cache';
const PACK_DATA_CACHE = 'travel-pack-data-v1';
const STATIC_CACHE = 'travel-static-assets-v1';
const PACK_REGISTRY_CACHE = 'travel-pack-registry-v1';
const PACK_REGISTRY_URL = '/__offline__/pack-registry.json';

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
clientsClaim();
self.skipWaiting();

registerRoute(
  ({ request, url }) => request.method === 'GET' && url.pathname.startsWith('/content/packs/'),
  new NetworkFirst({
    cacheName: PACK_DATA_CACHE,
    networkTimeoutSeconds: 3,
  }),
);

registerRoute(
  ({ request }) => ['style', 'script', 'worker', 'font'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: STATIC_CACHE,
  }),
);

const appShellHandler = createHandlerBoundToURL('/index.html');
registerRoute(
  new NavigationRoute(appShellHandler, {
    denylist: [/^\/api\//],
  }),
);

const toAbsoluteUrl = (resource: string): string => new URL(resource, self.location.origin).toString();

const readPackRegistry = async (): Promise<DownloadedPackMap> => {
  const cache = await caches.open(PACK_REGISTRY_CACHE);
  const response = await cache.match(PACK_REGISTRY_URL);

  if (!response) {
    return {};
  }

  try {
    const data = (await response.json()) as unknown;
    if (!data || typeof data !== 'object') {
      return {};
    }

    return data as DownloadedPackMap;
  } catch {
    return {};
  }
};

const writePackRegistry = async (registry: DownloadedPackMap): Promise<void> => {
  const cache = await caches.open(PACK_REGISTRY_CACHE);
  const payload = JSON.stringify(registry);

  await cache.put(
    PACK_REGISTRY_URL,
    new Response(payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  );
};

const clearOldPackCaches = async (slug: string, keepCacheName: string): Promise<void> => {
  const cacheNames = await caches.keys();

  await Promise.all(
    cacheNames
      .filter((cacheName) => {
        const isSlugCache = cacheName.startsWith(`${PACK_CACHE_PREFIX}-${slug}-`);
        return isSlugCache && cacheName !== keepCacheName;
      })
      .map((cacheName) => caches.delete(cacheName)),
  );
};

const cachePackAtomically = async (payload: CachePackPayload): Promise<void> => {
  const resources = Array.from(new Set(payload.resources.map(toAbsoluteUrl)));
  const finalCacheName = `${PACK_CACHE_PREFIX}-${payload.slug}-${payload.version}`;
  const tempCacheName = `${finalCacheName}-tmp-${Date.now()}`;
  const tempCache = await caches.open(tempCacheName);

  try {
    for (const resource of resources) {
      const response = await fetch(resource, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to cache ${resource} (${response.status})`);
      }

      await tempCache.put(resource, response.clone());
    }

    const finalCache = await caches.open(finalCacheName);
    const requests = await tempCache.keys();

    await Promise.all(
      requests.map(async (request) => {
        const response = await tempCache.match(request);
        if (response) {
          await finalCache.put(request, response);
        }
      }),
    );

    await clearOldPackCaches(payload.slug, finalCacheName);

    const registry = await readPackRegistry();
    registry[payload.slug] = {
      slug: payload.slug,
      version: payload.version,
      cachedAt: new Date().toISOString(),
    };
    await writePackRegistry(registry);
  } finally {
    await caches.delete(tempCacheName);
  }
};

const cacheMandatoryPacks = async (): Promise<void> => {
  for (const slug of MANDATORY_PACK_SLUGS) {
    try {
      await cachePackAtomically({
        slug,
        version: 'bootstrap',
        resources: [OFFLINE_LAUNCH_PATH, buildPackManifestUrl(slug), `/city/${slug}`, buildPackUrl(slug)],
      });
    } catch (error) {
      console.warn(`Mandatory pack caching failed for ${slug}`, error);
    }
  }
};

const postMessageResponse = (
  event: ExtendableMessageEvent,
  response: ServiceWorkerOutboundMessage,
): void => {
  const [port] = event.ports;
  if (port) {
    port.postMessage(response);
  }
};

const handleMessage = async (event: ExtendableMessageEvent): Promise<void> => {
  const message = event.data as ServiceWorkerInboundMessage | undefined;

  if (!message || typeof message !== 'object' || !('type' in message)) {
    return;
  }

  switch (message.type) {
    case 'CACHE_PACK': {
      try {
        await cachePackAtomically(message.payload);
        postMessageResponse(event, {
          ok: true,
          type: 'CACHE_PACK_SUCCESS',
          payload: {
            slug: message.payload.slug,
            version: message.payload.version,
          },
        });
      } catch (error) {
        postMessageResponse(event, {
          ok: false,
          type: 'CACHE_PACK_ERROR',
          error: error instanceof Error ? error.message : 'Unable to cache selected pack',
        });
      }
      break;
    }
    case 'CACHE_MANDATORY_PACKS': {
      try {
        await cacheMandatoryPacks();
        postMessageResponse(event, {
          ok: true,
          type: 'CACHE_PACK_SUCCESS',
          payload: {
            slug: 'mandatory',
            version: 'bootstrap',
          },
        });
      } catch (error) {
        postMessageResponse(event, {
          ok: false,
          type: 'CACHE_PACK_ERROR',
          error: error instanceof Error ? error.message : 'Unable to cache mandatory packs',
        });
      }
      break;
    }
    case 'GET_PACK_REGISTRY': {
      const registry = await readPackRegistry();
      postMessageResponse(event, {
        ok: true,
        type: 'PACK_REGISTRY',
        payload: registry,
      });
      break;
    }
    default:
      break;
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil(cacheMandatoryPacks());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  event.waitUntil(handleMessage(event));
});
