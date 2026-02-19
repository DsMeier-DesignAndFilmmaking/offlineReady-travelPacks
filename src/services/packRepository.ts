import type { CityPack, PackCatalogEntry } from '../types/travelPack';
import { ApiPackProvider } from './providers/apiPackProvider';
import type { PackProvider } from './providers/packProvider';
import { StaticPackProvider } from './providers/staticPackProvider';

const apiBaseUrl = import.meta.env.VITE_PACK_API_BASE_URL as string | undefined;

const createRemoteProvider = (): PackProvider | null => {
  if (!apiBaseUrl) {
    return null;
  }

  return new ApiPackProvider(apiBaseUrl);
};

export class PackRepository {
  private readonly staticProvider: PackProvider;
  private readonly remoteProvider: PackProvider | null;

  public constructor(staticProvider: PackProvider, remoteProvider: PackProvider | null) {
    this.staticProvider = staticProvider;
    this.remoteProvider = remoteProvider;
  }

  public async getCatalog(): Promise<PackCatalogEntry[]> {
    if (this.remoteProvider && navigator.onLine) {
      try {
        return await this.remoteProvider.getCatalog();
      } catch {
        return this.staticProvider.getCatalog();
      }
    }

    return this.staticProvider.getCatalog();
  }

  public async getPack(slug: string): Promise<CityPack | null> {
    if (this.remoteProvider && navigator.onLine) {
      try {
        const remotePack = await this.remoteProvider.getPack(slug);
        if (remotePack) {
          return remotePack;
        }
      } catch {
        return this.staticProvider.getPack(slug);
      }
    }

    return this.staticProvider.getPack(slug);
  }
}

export const packRepository = new PackRepository(new StaticPackProvider(), createRemoteProvider());
