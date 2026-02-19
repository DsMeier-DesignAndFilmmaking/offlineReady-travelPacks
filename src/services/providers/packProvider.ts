import type { CityPack, PackCatalogEntry } from '../../types/travelPack';

export interface PackProvider {
  getCatalog: () => Promise<PackCatalogEntry[]>;
  getPack: (slug: string) => Promise<CityPack | null>;
}
