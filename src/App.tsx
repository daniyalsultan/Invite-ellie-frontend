import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/landing/Header';
import { LandingPage } from './components/landing/LandingPage';
import { SetupProfilePage } from './components/setupProfile/SetupProfilePage';

function ScrollToHash(): null {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [location]);

  return null;
}

function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/setup-profile" element={<SetupProfilePage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
      <ScrollToHash />
    </div>
  );
}

export default App;