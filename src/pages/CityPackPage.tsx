import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SectionBlock } from '../components/SectionBlock';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { useOfflinePack } from '../hooks/useOfflinePack';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePackContent } from '../hooks/usePackContent';

export const CityPackPage = (): JSX.Element => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { pack, loading, notFound, error } = usePackContent(slug);
  const {
    activePackSlug,
    downloadedPacks,
    downloadingSlug,
    error: offlineError,
    clearError,
    setActivePack,
    downloadPack,
  } = useOfflinePack();
  const { canInstall, promptInstall } = useInstallPrompt();

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isDownloaded = useMemo(
    () => (pack ? Boolean(downloadedPacks[pack.slug]) : false),
    [downloadedPacks, pack],
  );
  const isActive = useMemo(
    () => (pack ? activePackSlug === pack.slug : false),
    [activePackSlug, pack],
  );

  if (loading) {
    return (
      <main className="app-shell compact-shell">
        <p className="state-text">Loading city pack...</p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="app-shell compact-shell">
        <p className="state-text state-text--error">Pack not found.</p>
        <Link className="btn" to="/">
          Back to catalog
        </Link>
      </main>
    );
  }

  if (error || !pack) {
    return (
      <main className="app-shell compact-shell">
        <p className="state-text state-text--error">{error ?? 'Unable to load this pack.'}</p>
        <Link className="btn" to="/">
          Back to catalog
        </Link>
      </main>
    );
  }

  const handleDownload = async (): Promise<void> => {
    clearError();
    setStatusMessage(null);

    try {
      await downloadPack(pack);
      setStatusMessage(
        `Saved ${pack.city}. This pack is now set as home-screen launch target for offline mode.`,
      );
    } catch {
      setStatusMessage(null);
    }
  };

  const handleSetActive = (): void => {
    setActivePack(pack.slug);
    setStatusMessage(`${pack.city} is now the launch pack for home-screen offline open.`);
  };

  const handleInstall = async (): Promise<void> => {
    const outcome = await promptInstall();

    if (outcome === 'accepted') {
      setStatusMessage('App installed. Launch from home screen to open your selected city pack.');
      return;
    }

    if (outcome === 'dismissed') {
      setStatusMessage('Install prompt dismissed. You can install again later.');
      return;
    }

    setStatusMessage('Install prompt unavailable. Use browser Add to Home Screen in this page.');
  };

  const canDownload = isOnline || isDownloaded;

  return (
    <main className="app-shell city-shell">
      <div className="page-nav-top">
        <Link className="btn btn--secondary" to="/">
          Back to Catalog
        </Link>
      </div>

      <header className="hero-panel hero-panel--city">
        <p className="eyebrow">
          #{pack.rank} global arrivals • {pack.internationalArrivalsMillions.toFixed(1)}M annual visits
        </p>
        <h1>{pack.hero.title}</h1>
        <p>{pack.hero.subtitle}</p>

        <div className="hero-panel__actions">
          <button className="btn" disabled={!canDownload || downloadingSlug === pack.slug} onClick={handleDownload}>
            {downloadingSlug === pack.slug ? 'Saving...' : 'Save Pack for Offline'}
          </button>

          {isDownloaded && !isActive ? (
            <button className="btn btn--secondary" onClick={handleSetActive}>
              Set as Home Launch Pack
            </button>
          ) : null}

          {isDownloaded ? (
            <button className="btn btn--secondary" onClick={() => navigate('/launch')}>
              Test Offline Launcher
            </button>
          ) : null}

          {isDownloaded ? (
            <button className="btn btn--install" onClick={handleInstall}>
              {canInstall ? 'Add To Home Screen' : 'Install Instructions'}
            </button>
          ) : null}
        </div>
      </header>

      {!isOnline && !isDownloaded ? (
        <section className="banner banner--warning">
          <strong>This pack is not cached yet.</strong>
          <p>Go online once, save this pack, then it will open offline from first launch.</p>
        </section>
      ) : null}

      {offlineError ? <p className="state-text state-text--error">{offlineError}</p> : null}
      {statusMessage ? <p className="state-text state-text--success">{statusMessage}</p> : null}

      <section className="city-meta-grid">
        <article>
          <h2>Field pain points</h2>
          <ul>
            {pack.painPoints.map((painPoint) => (
              <li key={painPoint}>{painPoint}</li>
            ))}
          </ul>
        </article>
        <article>
          <h2>Emergency contacts</h2>
          <ul>
            {pack.emergency.map((contact) => (
              <li key={contact.label}>
                <strong>{contact.label}:</strong> {contact.value}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="section-stack">
        {pack.sections.map((section) => (
          <SectionBlock key={section.id} section={section} />
        ))}
      </section>

      <footer className="page-footer">
        <Link className="btn btn--secondary" to="/">
          Back to Catalog
        </Link>
      </footer>
    </main>
  );
};
