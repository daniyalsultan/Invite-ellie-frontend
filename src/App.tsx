import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/landing/Header';
import { LandingPage } from './components/landing/LandingPage';
import { SetupProfilePage } from './components/setupProfile/SetupProfilePage';
import { ComingSoonPage } from './components/comingSoon/ComingSoonPage';
import { SignupPage } from './components/signup/SignupPage';
import { LoginPage } from './components/login/LoginPage';
import { ResetPasswordPage } from './components/resetpassword/ResetPasswordPage';
import { NewPasswordPage } from './components/resetpassword/NewPasswordPage';

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
  const location = useLocation();
  const hideHeader = location.pathname === '/coming-soon';

  return (
    <div className="min-h-screen bg-white">
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/setup-profile" element={<SetupProfilePage />} />
        <Route path="/coming-soon" element={<ComingSoonPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/new-password" element={<NewPasswordPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
      <ScrollToHash />
    </div>
  );
}

export default App;