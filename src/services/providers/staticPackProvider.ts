import { PACK_INDEX_URL, buildPackUrl } from '../../constants/offline';
import type { CityPack, PackCatalogEntry, PackCatalogResponse } from '../../types/travelPack';
import type { PackProvider } from './packProvider';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const asString = (value: unknown, field: string): string => {
  if (typeof value !== 'string') {
    throw new Error(`Invalid ${field}: expected string`);
  }

  return value;
};

const asNumber = (value: unknown, field: string): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Invalid ${field}: expected number`);
  }

  return value;
};

const asBoolean = (value: unknown, field: string): boolean => {
  if (typeof value !== 'boolean') {
    throw new Error(`Invalid ${field}: expected boolean`);
  }

  return value;
};

const asStringArray = (value: unknown, field: string): string[] => {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid ${field}: expected array`);
  }

  return value.map((entry, index) => asString(entry, `${field}[${index}]`));
};

const parseCatalogEntry = (value: unknown): PackCatalogEntry => {
  if (!isRecord(value)) {
    throw new Error('Invalid pack catalog entry');
  }

  return {
    slug: asString(value.slug, 'catalog.slug'),
    city: asString(value.city, 'catalog.city'),
    country: asString(value.country, 'catalog.country'),
    rank: asNumber(value.rank, 'catalog.rank'),
    internationalArrivalsMillions: asNumber(value.internationalArrivalsMillions, 'catalog.internationalArrivalsMillions'),
    mandatory: asBoolean(value.mandatory, 'catalog.mandatory'),
    tagline: asString(value.tagline, 'catalog.tagline'),
    accent: asString(value.accent, 'catalog.accent'),
  };
};

const parseCatalogResponse = (value: unknown): PackCatalogResponse => {
  if (!isRecord(value) || !Array.isArray(value.packs)) {
    throw new Error('Invalid catalog response');
  }

  return {
    generatedAt: asString(value.generatedAt, 'generatedAt'),
    dataset: asString(value.dataset, 'dataset'),
    packs: value.packs.map(parseCatalogEntry),
  };
};

const parseSection = (value: unknown) => {
  if (!isRecord(value)) {
    throw new Error('Invalid section');
  }

  return {
    id: asString(value.id, 'section.id'),
    title: asString(value.title, 'section.title'),
    summary: asString(value.summary, 'section.summary'),
    actions: asStringArray(value.actions, 'section.actions'),
  };
};

const parseEmergencyContact = (value: unknown) => {
  if (!isRecord(value)) {
    throw new Error('Invalid emergency contact');
  }

  return {
    label: asString(value.label, 'emergency.label'),
    value: asString(value.value, 'emergency.value'),
  };
};

const parseCityPack = (value: unknown): CityPack => {
  if (!isRecord(value)) {
    throw new Error('Invalid city pack payload');
  }

  const heroValue = value.hero;
  if (!isRecord(heroValue)) {
    throw new Error('Invalid city pack hero');
  }

  if (!Array.isArray(value.sections)) {
    throw new Error('Invalid city pack sections');
  }

  if (!Array.isArray(value.emergency)) {
    throw new Error('Invalid city pack emergency');
  }

  return {
    slug: asString(value.slug, 'pack.slug'),
    city: asString(value.city, 'pack.city'),
    country: asString(value.country, 'pack.country'),
    rank: asNumber(value.rank, 'pack.rank'),
    internationalArrivalsMillions: asNumber(value.internationalArrivalsMillions, 'pack.internationalArrivalsMillions'),
    version: asString(value.version, 'pack.version'),
    updatedAt: asString(value.updatedAt, 'pack.updatedAt'),
    hero: {
      title: asString(heroValue.title, 'pack.hero.title'),
      subtitle: asString(heroValue.subtitle, 'pack.hero.subtitle'),
    },
    painPoints: asStringArray(value.painPoints, 'pack.painPoints'),
    sections: value.sections.map(parseSection),
    emergency: value.emergency.map(parseEmergencyContact),
    offlineResources: asStringArray(value.offlineResources, 'pack.offlineResources'),
  };
};

export class StaticPackProvider implements PackProvider {
  public async getCatalog(): Promise<PackCatalogEntry[]> {
    const response = await fetch(PACK_INDEX_URL, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to load pack catalog (${response.status})`);
    }

    const data = (await response.json()) as unknown;
    return parseCatalogResponse(data).packs;
  }

  public async getPack(slug: string): Promise<CityPack | null> {
    const response = await fetch(buildPackUrl(slug), {
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to load pack ${slug} (${response.status})`);
    }

    const data = (await response.json()) as unknown;
    return parseCityPack(data);
  }
}
