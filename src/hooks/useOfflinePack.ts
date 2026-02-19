import { useCallback, useEffect, useState } from 'react';
import {
  downloadPackForOffline,
  getActivePackSlug,
  getDownloadedPacks,
  setActivePackSlug,
  subscribeOfflinePackState,
} from '../services/offlinePackService';
import type { CityPack, DownloadedPackMap, DownloadedPackMeta } from '../types/travelPack';

interface UseOfflinePackState {
  activePackSlug: string | null;
  downloadedPacks: DownloadedPackMap;
  downloadingSlug: string | null;
  error: string | null;
  clearError: () => void;
  setActivePack: (slug: string) => void;
  downloadPack: (pack: CityPack) => Promise<DownloadedPackMeta>;
}

export const useOfflinePack = (): UseOfflinePackState => {
  const [activePackSlug, setActivePackSlugState] = useState<string | null>(getActivePackSlug);
  const [downloadedPacks, setDownloadedPacksState] = useState<DownloadedPackMap>(getDownloadedPacks);
  const [downloadingSlug, setDownloadingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeOfflinePackState(() => {
      setActivePackSlugState(getActivePackSlug());
      setDownloadedPacksState(getDownloadedPacks());
    });

    return unsubscribe;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setActivePack = useCallback((slug: string) => {
    setActivePackSlug(slug);
    setActivePackSlugState(slug);
  }, []);

  const downloadPack = useCallback(async (pack: CityPack) => {
    setError(null);
    setDownloadingSlug(pack.slug);

    try {
      const meta = await downloadPackForOffline(pack);
      setDownloadedPacksState(getDownloadedPacks());
      setActivePackSlugState(meta.slug);
      return meta;
    } catch (downloadError) {
      const message =
        downloadError instanceof Error ? downloadError.message : 'Pack download failed';
      setError(message);
      throw downloadError;
    } finally {
      setDownloadingSlug(null);
    }
  }, []);

  return {
    activePackSlug,
    downloadedPacks,
    downloadingSlug,
    error,
    clearError,
    setActivePack,
    downloadPack,
  };
};
