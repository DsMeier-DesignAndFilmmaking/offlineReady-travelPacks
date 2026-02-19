import { Link } from 'react-router-dom';

export const NotFoundPage = (): JSX.Element => (
  <main className="app-shell compact-shell">
    <section className="hero-panel hero-panel--compact">
      <p className="eyebrow">Navigation</p>
      <h1>Page not found</h1>
      <p className="state-subtext">This route is not part of the travel pack app.</p>
      <Link className="btn" to="/">
        Back to catalog
      </Link>
    </section>
  </main>
);
