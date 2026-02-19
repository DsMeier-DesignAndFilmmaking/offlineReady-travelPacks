import { useEffect, useState } from 'react';
import type { PackCatalogEntry } from '../types/travelPack';
import { packRepository } from '../services/packRepository';

interface UsePackCatalogState {
  packs: PackCatalogEntry[];
  loading: boolean;
  error: string | null;
}

export const usePackCatalog = (): UsePackCatalogState => {
  const [state, setState] = useState<UsePackCatalogState>({
    packs: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const loadCatalog = async (): Promise<void> => {
      try {
        const packs = await packRepository.getCatalog();
        if (cancelled) {
          return;
        }

        setState({
          packs,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState({
          packs: [],
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load catalog',
        });
      }
    };

    loadCatalog().catch(() => {
      // Already handled in loadCatalog.
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};
