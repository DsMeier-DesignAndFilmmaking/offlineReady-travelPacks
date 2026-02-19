import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MANDATORY_PACK_SLUGS } from '../constants/offline';
import { useOfflinePack } from '../hooks/useOfflinePack';

const fallbackSlug = MANDATORY_PACK_SLUGS[0];

export const LaunchPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { activePackSlug, downloadedPacks } = useOfflinePack();

  useEffect(() => {
    const downloadedSlugs = Object.keys(downloadedPacks);
    const nextSlug = activePackSlug ?? downloadedSlugs[0] ?? fallbackSlug;

    navigate(`/city/${nextSlug}`, {
      replace: true,
    });
  }, [activePackSlug, downloadedPacks, navigate]);

  return (
    <main className="app-shell compact-shell">
      <section className="hero-panel hero-panel--compact">
        <p className="eyebrow">Offline Launcher</p>
        <h1>Preparing your saved city pack</h1>
        <p className="state-subtext">
          If redirect does not complete, open a city pack from <Link to="/">the online catalog</Link> first.
        </p>
      </section>
    </main>
  );
};
