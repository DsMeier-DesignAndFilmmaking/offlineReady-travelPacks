import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { PackCatalogEntry } from '../types/travelPack';

interface PackCardProps {
  pack: PackCatalogEntry;
  isDownloaded: boolean;
  isActive: boolean;
}

export const PackCard = ({ pack, isDownloaded, isActive }: PackCardProps): JSX.Element => {
  const style = {
    '--pack-accent': pack.accent,
  } as CSSProperties;

  return (
    <article className="pack-card" style={style}>
      <div className="pack-card__meta">
        <span className="pack-rank">#{pack.rank}</span>
        <span className="pack-arrivals">{pack.internationalArrivalsMillions.toFixed(1)}M arrivals</span>
      </div>

      <h3>{pack.city}</h3>
      <p className="pack-country">{pack.country}</p>
      <p className="pack-tagline">{pack.tagline}</p>

      <div className="pack-card__state-row">
        {pack.mandatory ? <span className="pill">Pre-cached</span> : null}
        {isDownloaded ? <span className="pill">Saved Offline</span> : null}
        {isActive ? <span className="pill pill--active">Home Launch</span> : null}
      </div>

      <Link className="btn btn--card" to={`/city/${pack.slug}`}>
        Open Pack
      </Link>
    </article>
  );
};
