export interface PackCatalogResponse {
  generatedAt: string;
  dataset: string;
  packs: PackCatalogEntry[];
}

export interface PackCatalogEntry {
  slug: string;
  city: string;
  country: string;
  rank: number;
  internationalArrivalsMillions: number;
  mandatory: boolean;
  tagline: string;
  accent: string;
}

export interface PackSection {
  id: string;
  title: string;
  summary: string;
  actions: string[];
}

export interface EmergencyContact {
  label: string;
  value: string;
}

export interface CityPack {
  slug: string;
  city: string;
  country: string;
  rank: number;
  internationalArrivalsMillions: number;
  version: string;
  updatedAt: string;
  hero: {
    title: string;
    subtitle: string;
  };
  painPoints: string[];
  sections: PackSection[];
  emergency: EmergencyContact[];
  offlineResources: string[];
}

export interface DownloadedPackMeta {
  slug: string;
  version: string;
  cachedAt: string;
}

export type DownloadedPackMap = Record<string, DownloadedPackMeta>;
