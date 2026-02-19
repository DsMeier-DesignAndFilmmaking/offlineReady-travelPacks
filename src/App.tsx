import { Navigate, Route, Routes } from 'react-router-dom';
import { CityPackPage } from './pages/CityPackPage';
import { HomePage } from './pages/HomePage';
import { LaunchPage } from './pages/LaunchPage';
import { NotFoundPage } from './pages/NotFoundPage';

const App = (): JSX.Element => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/city/:slug" element={<CityPackPage />} />
    <Route path="/launch" element={<LaunchPage />} />
    <Route path="/index.html" element={<Navigate replace to="/" />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default App;
