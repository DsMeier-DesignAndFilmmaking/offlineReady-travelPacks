import { Link } from 'react-router-dom';
import type { PackCatalogEntry } from '../types/travelPack';

interface PackCardProps {
  pack: PackCatalogEntry;
  isDownloaded: boolean;
  isActive: boolean;
}

export const PackCard = ({ pack, isDownloaded, isActive }: PackCardProps): JSX.Element => {
  return (
    <article className="pack-card">
      <div className="pack-card__visual" aria-hidden="true">
        <span className="pack-rank">#{pack.rank}</span>
        <span className="pack-arrivals">{pack.internationalArrivalsMillions.toFixed(1)}M arrivals</span>
      </div>

      <div className="pack-card__content">
        <h3>{pack.city}</h3>
        <p className="pack-country">{pack.country}</p>
        <p className="pack-tagline">{pack.tagline}</p>

        <div className="pack-card__state-row">
          {pack.mandatory ? <span className="pill">Pre-cached</span> : null}
          {isDownloaded ? <span className="pill">Saved Offline</span> : null}
          {isActive ? <span className="pill pill--active">Home Launch</span> : null}
        </div>
      </div>

      <Link className="btn btn--card" to={`/city/${pack.slug}`} reloadDocument>
        Open Pack
      </Link>
    </article>
  );
};
