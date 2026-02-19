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
  const downloadedCount = Object.keys(downloadedPacks).length;
  const totalArrivals = sortedPacks.reduce(
    (total, pack) => total + pack.internationalArrivalsMillions,
    0,
  );

  return (
    <main className="app-shell">
      <section className="hero-panel hero-panel--home">
        <div className="hero-panel__content">
          <p className="eyebrow">Offline-first Travel Intelligence</p>
          <h1>Travel briefings designed for high-friction city moments</h1>
          <p>
            Browse online, save a destination pack, then launch from home screen with mission-critical
            guidance available from first offline open.
          </p>

          <div className="hero-panel__actions">
            <Link className="btn" to="/launch">
              Open Offline Launcher
            </Link>
            <span className={`network-indicator ${isOnline ? 'is-online' : 'is-offline'}`}>
              {isOnline ? 'Online catalog mode' : 'Offline mode: use launcher'}
            </span>
          </div>
        </div>

        <aside className="hero-panel__stats" aria-label="Catalog highlights">
          <article className="stat-card">
            <span className="stat-card__value">{sortedPacks.length}</span>
            <span className="stat-card__label">Global city packs</span>
          </article>
          <article className="stat-card">
            <span className="stat-card__value">{totalArrivals.toFixed(1)}M</span>
            <span className="stat-card__label">Combined annual arrivals</span>
          </article>
          <article className="stat-card">
            <span className="stat-card__value">{downloadedCount}</span>
            <span className="stat-card__label">
              Saved offline{activePackSlug ? ` • ${activePackSlug}` : ''}
            </span>
          </article>
        </aside>
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
        <div>
          <p className="eyebrow">Curated Catalog</p>
          <h2>Top 10 most visited global cities</h2>
          <p>Based on Euromonitor 2024 international arrivals dataset.</p>
        </div>
        <span className="section-chip">{isOnline ? 'Live online catalog' : 'Offline read-only catalog'}</span>
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
