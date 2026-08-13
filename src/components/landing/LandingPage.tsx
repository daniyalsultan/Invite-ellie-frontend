import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CTA } from './CTA';
import { FAQ } from './FAQ';
import { Features } from './Features';
import { Hero } from './Hero';
import { Integrations } from './Integrations';
import { Narrative } from './Narrative';
import { Trusted } from './Trusted';
import { Footer } from './Footer';

export function LandingPage(): JSX.Element {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useAuth();

  // A logged-in user landing here (e.g. opening the app in a new tab, which
  // has its own localStorage-backed session already) should go straight to
  // the dashboard instead of seeing the marketing page again.
  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isInitializing, isAuthenticated, navigate]);

  return (
    <>
      <main className="flex flex-col gap-[80px] lg:gap-[118px]">
        <Hero />
        <Integrations />
        <Trusted />
        <Features />
        <Narrative />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

