import { Link } from 'react-router-dom';

export const NotFoundPage = (): JSX.Element => (
  <main className="app-shell compact-shell">
    <h1>Page not found</h1>
    <p className="state-subtext">This route is not part of the travel pack app.</p>
    <Link className="btn" to="/">
      Back to catalog
    </Link>
  </main>
);
