import type { CityPack, PackCatalogEntry } from '../../types/travelPack';
import type { PackProvider } from './packProvider';

interface CatalogApiPayload {
  packs: PackCatalogEntry[];
}

export class ApiPackProvider implements PackProvider {
  private readonly baseUrl: string;

  public constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  public async getCatalog(): Promise<PackCatalogEntry[]> {
    const response = await fetch(`${this.baseUrl}/packs`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API catalog request failed (${response.status})`);
    }

    const payload = (await response.json()) as CatalogApiPayload;
    return payload.packs;
  }

  public async getPack(slug: string): Promise<CityPack | null> {
    const response = await fetch(`${this.baseUrl}/packs/${slug}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`API pack request failed (${response.status})`);
    }

    const payload = (await response.json()) as CityPack;
    return payload;
  }
}
