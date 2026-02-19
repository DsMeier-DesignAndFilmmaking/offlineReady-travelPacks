import { useEffect, useState } from 'react';
import type { CityPack } from '../types/travelPack';
import { packRepository } from '../services/packRepository';

interface UsePackContentState {
  pack: CityPack | null;
  loading: boolean;
  notFound: boolean;
  error: string | null;
}

export const usePackContent = (slug: string | undefined): UsePackContentState => {
  const [state, setState] = useState<UsePackContentState>({
    pack: null,
    loading: true,
    notFound: false,
    error: null,
  });

  useEffect(() => {
    if (!slug) {
      setState({
        pack: null,
        loading: false,
        notFound: true,
        error: null,
      });
      return;
    }

    let cancelled = false;

    const loadPack = async (): Promise<void> => {
      try {
        const pack = await packRepository.getPack(slug);

        if (cancelled) {
          return;
        }

        if (!pack) {
          setState({
            pack: null,
            loading: false,
            notFound: true,
            error: null,
          });
          return;
        }

        setState({
          pack,
          loading: false,
          notFound: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState({
          pack: null,
          loading: false,
          notFound: false,
          error: error instanceof Error ? error.message : 'Failed to load pack',
        });
      }
    };

    loadPack().catch(() => {
      // Already handled in loadPack.
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
};
