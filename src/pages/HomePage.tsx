import { Link } from 'react-router-dom';
import { PackCard } from '../components/PackCard';
import { useOfflinePack } from '../hooks/useOfflinePack';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePackCatalog } from '../hooks/usePackCatalog';

export const HomePage = (): JSX.Element => {
  const isOnline = useOnlineStatus();
  const { packs, loading, error } = usePackCatalog();
  const { downloadedPacks, activePackSlug } = useOfflinePack();

  const sortedPacks = [...packs].sort((first, second) => first.rank - second.rank);

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">Offline-first Travel Intelligence</p>
        <h1>City packs for disruption-heavy travel days</h1>
        <p>
          Browse online, then save a city pack so it launches directly from home screen with
          offline content available on first open.
        </p>

        <div className="hero-panel__actions">
          <Link className="btn" to="/launch">
            Open Offline Launcher
          </Link>
          <span className={`network-indicator ${isOnline ? 'is-online' : 'is-offline'}`}>
            {isOnline ? 'Online catalog mode' : 'Offline mode: use launcher'}
          </span>
        </div>
      </section>

      {!isOnline ? (
        <section className="banner banner--warning">
          <strong>Catalog is intended for online use.</strong>
          <p>
            You can still open downloaded packs from <Link to="/launch">/launch</Link>.
          </p>
        </section>
      ) : null}

      <section className="section-head">
        <h2>Top 10 most visited global cities</h2>
        <p>Based on Euromonitor 2024 international arrivals dataset.</p>
      </section>

      {loading ? <p className="state-text">Loading city packs...</p> : null}
      {error ? <p className="state-text state-text--error">{error}</p> : null}

      {!loading && !error ? (
        <section className="pack-grid">
          {sortedPacks.map((pack) => (
            <PackCard
              key={pack.slug}
              pack={pack}
              isDownloaded={Boolean(downloadedPacks[pack.slug])}
              isActive={activePackSlug === pack.slug}
            />
          ))}
        </section>
      ) : null}
    </main>
  );
};
