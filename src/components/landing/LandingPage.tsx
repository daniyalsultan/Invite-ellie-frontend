import { useEffect } from 'react';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import siteHtml from './site/site.html?raw';
import siteCss from './site/site.css?raw';
import { initSite } from './site/siteScript';

const SITE_TITLE = 'Invite Ellie | Your agency gets more valuable with everything it learns';
const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Space+Grotesk:wght@500;600;700&display=swap';

// The marketing page is a standalone design with its own global styles
// (:root tokens, html/body rules, dark mode). They are injected only while
// this page is mounted so they never leak into the app's other routes.
function useSiteStyles(): void {
  useEffect(() => {
    if (!document.querySelector(`link[href="${FONTS_URL}"]`)) {
      const fonts = document.createElement('link');
      fonts.rel = 'stylesheet';
      fonts.href = FONTS_URL;
      document.head.appendChild(fonts);
    }

    const style = document.createElement('style');
    style.textContent = siteCss;
    document.head.appendChild(style);
    document.documentElement.classList.add('js');

    const previousTitle = document.title;
    document.title = SITE_TITLE;

    return () => {
      style.remove();
      document.documentElement.classList.remove('js');
      document.title = previousTitle;
    };
  }, []);
}

export function LandingPage(): JSX.Element {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useAuth();

  useSiteStyles();

  // A logged-in user landing here (e.g. opening the app in a new tab, which
  // has its own localStorage-backed session already) should go straight to
  // the dashboard instead of seeing the marketing page again.
  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isInitializing, isAuthenticated, navigate]);

  useEffect(() => initSite(), []);

  // Links to app routes (/signup, /login, /privacy, /terms) live in the static
  // markup, so route them through the router instead of a full page reload.
  const handleClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const href = (event.target as Element).closest('a')?.getAttribute('href');
    if (!href || !href.startsWith('/') || href.startsWith('//')) return;
    event.preventDefault();
    navigate(href);
  };

  return (
    <div className="ie-site" onClick={handleClick} dangerouslySetInnerHTML={{ __html: siteHtml }} />
  );
}
