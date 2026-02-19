export const PACK_INDEX_URL = '/content/packs/index.json';

export const buildPackUrl = (slug: string): string => `/content/packs/${slug}.json`;

export const ACTIVE_PACK_STORAGE_KEY = 'travelpacks.activePackSlug';
export const DOWNLOADED_PACKS_STORAGE_KEY = 'travelpacks.downloadedPacks';

export const MANDATORY_PACK_SLUGS = ['bangkok', 'istanbul', 'london'] as const;

export const OFFLINE_LAUNCH_PATH = '/launch';
