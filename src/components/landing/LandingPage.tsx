import { useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initSite } from './site/siteScript';

const SITE_TITLE = 'Invite Ellie | Your agency gets more valuable with everything it learns';
// The <title> in index.html. Restored on leaving; the title in place on mount
// may already be SITE_TITLE, set by the inline script on a direct visit.
const APP_TITLE = 'Invite Ellie';

// The marketing page is a standalone design with its own global styles
// (:root tokens, html/body rules, dark mode). The vite landing-prerender
// plugin bakes its markup (as a <template>) and CSS (as a disabled <style>)
// into index.html, and on a direct visit to "/" an inline script shows it
// before this bundle loads, as #landing-static beside the React root.
//
// This page adopts that DOM instead of rendering a second copy, so nothing
// flashes or replays when the app takes over. When "/" is reached from inside
// the app, the same DOM is built from the template. On leaving, the DOM is
// removed and the CSS disabled so neither leaks into other routes.
function mountLandingDom(): HTMLElement {
  const existing = document.getElementById('landing-static');
  if (existing) return existing;
  const template = document.getElementById('landing-template') as HTMLTemplateElement;
  const landing = document.createElement('div');
  landing.id = 'landing-static';
  landing.className = 'ie-site';
  landing.appendChild(template.content.cloneNode(true));
  document.body.insertBefore(landing, document.getElementById('root'));
  return landing;
}

export function LandingPage(): JSX.Element | null {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useAuth();
  // The page DOM must not be torn down and rebuilt while it is showing, so
  // the mount effect reads navigate through a ref instead of depending on it.
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  // A logged-in user landing here (e.g. opening the app in a new tab, which
  // has its own localStorage-backed session already) should go straight to
  // the dashboard instead of seeing the marketing page again.
  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isInitializing, isAuthenticated, navigate]);

  // Layout effect so the page and its CSS are in place before the browser
  // paints, with no unstyled frame.
  useLayoutEffect(() => {
    const css = document.getElementById('landing-css') as HTMLStyleElement;
    css.media = 'all';
    document.documentElement.classList.add('js');
    document.title = SITE_TITLE;

    const landing = mountLandingDom();
    const cleanupSite = initSite();

    // Links to app routes (/signup, /login, /privacy, /terms) live in the
    // static markup, so route them through the router instead of reloading.
    const onClick = (event: MouseEvent): void => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const href = (event.target as Element).closest('a')?.getAttribute('href');
      if (!href || !href.startsWith('/') || href.startsWith('//')) return;
      event.preventDefault();
      navigateRef.current(href);
    };
    landing.addEventListener('click', onClick);

    return () => {
      landing.removeEventListener('click', onClick);
      cleanupSite();
      landing.remove();
      css.media = 'not all';
      document.documentElement.classList.remove('js');
      document.title = APP_TITLE;
    };
  }, []);

  return null;
}
