import type { DownloadedPackMap } from './travelPack';

export interface CachePackPayload {
  slug: string;
  version: string;
  resources: string[];
}

export type ServiceWorkerInboundMessage =
  | {
      type: 'CACHE_PACK';
      payload: CachePackPayload;
    }
  | {
      type: 'CACHE_MANDATORY_PACKS';
    }
  | {
      type: 'GET_PACK_REGISTRY';
    };

export type ServiceWorkerOutboundMessage =
  | {
      ok: true;
      type: 'CACHE_PACK_SUCCESS';
      payload: {
        slug: string;
        version: string;
      };
    }
  | {
      ok: true;
      type: 'PACK_REGISTRY';
      payload: DownloadedPackMap;
    }
  | {
      ok: false;
      type: 'CACHE_PACK_ERROR';
      error: string;
    };
