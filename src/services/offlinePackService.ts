import {
  ACTIVE_PACK_STORAGE_KEY,
  DOWNLOADED_PACKS_STORAGE_KEY,
  OFFLINE_LAUNCH_PATH,
  buildPackManifestUrl,
  buildPackUrl,
} from '../constants/offline';
import type { ServiceWorkerInboundMessage, ServiceWorkerOutboundMessage } from '../types/serviceWorker';
import type { CityPack, DownloadedPackMap, DownloadedPackMeta } from '../types/travelPack';
import { getActiveServiceWorker } from './swRegistration';

const OFFLINE_STATE_EVENT = 'offline-pack-state-changed';

const notifyStateChanged = (): void => {
  window.dispatchEvent(new Event(OFFLINE_STATE_EVENT));
};

const parseDownloadedPackMap = (value: string | null): DownloadedPackMap => {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    return parsed as DownloadedPackMap;
  } catch {
    return {};
  }
};

export const getDownloadedPacks = (): DownloadedPackMap =>
  parseDownloadedPackMap(localStorage.getItem(DOWNLOADED_PACKS_STORAGE_KEY));

export const getActivePackSlug = (): string | null => localStorage.getItem(ACTIVE_PACK_STORAGE_KEY);

export const setActivePackSlug = (slug: string): void => {
  localStorage.setItem(ACTIVE_PACK_STORAGE_KEY, slug);
  notifyStateChanged();
};

const setDownloadedPacks = (nextValue: DownloadedPackMap): void => {
  localStorage.setItem(DOWNLOADED_PACKS_STORAGE_KEY, JSON.stringify(nextValue));
  notifyStateChanged();
};

const postMessageToServiceWorker = async (
  message: ServiceWorkerInboundMessage,
): Promise<ServiceWorkerOutboundMessage> => {
  const serviceWorker = await getActiveServiceWorker();

  if (!serviceWorker) {
    throw new Error('Service worker is not active yet. Refresh and retry.');
  }

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error('Timed out waiting for service worker response'));
    }, 10000);

    const channel = new MessageChannel();
    channel.port1.onmessage = (event: MessageEvent<ServiceWorkerOutboundMessage>) => {
      window.clearTimeout(timeout);
      resolve(event.data);
    };

    serviceWorker.postMessage(message, [channel.port2]);
  });
};

const buildOfflineResourceSet = (pack: CityPack): string[] => {
  const resources = new Set<string>([
    OFFLINE_LAUNCH_PATH,
    '/manifest.webmanifest',
    buildPackManifestUrl(pack.slug),
    `/city/${pack.slug}`,
    buildPackUrl(pack.slug),
    ...pack.offlineResources,
  ]);

  return Array.from(resources);
};

export const downloadPackForOffline = async (pack: CityPack): Promise<DownloadedPackMeta> => {
  const response = await postMessageToServiceWorker({
    type: 'CACHE_PACK',
    payload: {
      slug: pack.slug,
      version: pack.version,
      resources: buildOfflineResourceSet(pack),
    },
  });

  if (!response.ok) {
    throw new Error(response.error);
  }

  const cachedAt = new Date().toISOString();
  const nextMeta: DownloadedPackMeta = {
    slug: pack.slug,
    version: pack.version,
    cachedAt,
  };

  const current = getDownloadedPacks();
  current[pack.slug] = nextMeta;
  setDownloadedPacks(current);
  setActivePackSlug(pack.slug);

  return nextMeta;
};

export const subscribeOfflinePackState = (listener: () => void): (() => void) => {
  const handleStorage = (event: StorageEvent): void => {
    if (
      event.key === ACTIVE_PACK_STORAGE_KEY ||
      event.key === DOWNLOADED_PACKS_STORAGE_KEY
    ) {
      listener();
    }
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(OFFLINE_STATE_EVENT, listener);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(OFFLINE_STATE_EVENT, listener);
  };
};
