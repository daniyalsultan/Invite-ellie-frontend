import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const LANDING_DIR = new URL('./src/components/landing/site/', import.meta.url);

// Bakes the marketing page into index.html so "/" paints straight from the
// HTML instead of showing a blank page until the app bundle has loaded. The
// markup ships inert in a <template> and its CSS ships disabled; an inline
// script turns both on only for a signed-out visit to "/". LandingPage then
// adopts that DOM rather than rendering a second copy (see LandingPage.tsx).
function landingPrerender(): Plugin {
  return {
    name: 'landing-prerender',
    transformIndexHtml(html) {
      const css = readFileSync(new URL('site.css', LANDING_DIR), 'utf8');
      const markup = readFileSync(new URL('site.html', LANDING_DIR), 'utf8');
      const head = `
    <style id="landing-css" media="not all">${css}</style>
    <script>
      // Show the baked-in landing page only where the app would show it: a
      // signed-out visit to "/" that is not an auth redirect in progress.
      (function () {
        var l = window.location;
        var signedIn = false;
        try {
          signedIn = !!(localStorage.getItem('ellie_session') || sessionStorage.getItem('ellie_session'));
        } catch (e) {}
        var show =
          l.hostname !== 'www.inviteellie.ai' &&
          l.pathname === '/' &&
          !signedIn &&
          !/[?&]code=/.test(l.search) &&
          !/access_token=|type=recovery|type=signup/.test(l.hash);
        window.__landingPrerender = show;
        if (show) {
          document.getElementById('landing-css').media = 'all';
          document.documentElement.classList.add('js');
          document.title = 'Invite Ellie | Your agency gets more valuable with everything it learns';
        }
      })();
    </script>
  </head>`;
      const body = `<template id="landing-template">${markup}</template>
    <script>
      if (window.__landingPrerender) {
        var landing = document.createElement('div');
        landing.id = 'landing-static';
        landing.className = 'ie-site';
        landing.appendChild(document.getElementById('landing-template').content.cloneNode(true));
        document.body.insertBefore(landing, document.getElementById('root'));
        // The page sets scroll-behavior:smooth. A smooth jump to a #section
        // started this early in page load never finishes and blocks every
        // later smooth scroll, so jump instantly and restore it after load.
        if (window.location.hash) {
          var html = document.documentElement;
          html.style.scrollBehavior = 'auto';
          window.addEventListener('load', function () {
            setTimeout(function () { html.style.scrollBehavior = ''; }, 300);
          });
        }
      }
    </script>
    <div id="root"></div>`;
      return html.replace('</head>', head).replace('<div id="root"></div>', body);
    },
  };
}

// Vite puts the app stylesheet in <head>, where it blocks the inline script
// that shows the baked-in landing page, so "/" could not paint until the app
// CSS had downloaded. Move the link to just after that script: the landing
// page (which has its own inline CSS) paints first, while app pages are still
// styled before React renders, because the app's module script waits for
// every pending stylesheet.
function landingPaintsBeforeAppCss(): Plugin {
  return {
    name: 'landing-paints-before-app-css',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const links = html.match(/<link rel="stylesheet"[^>]*href="\/assets\/[^"]+\.css"[^>]*>/g) ?? [];
        for (const link of links) html = html.replace(link, '');
        return html.replace('<div id="root"></div>', `${links.join('\n    ')}\n    <div id="root"></div>`);
      },
    },
  };
}

// www.inviteellie.ai and inviteellie.ai are separate origins with separate
// storage, so everything must run on the apex (see the script in index.html).
// Redirect on the server so www visitors never download the app twice.
function redirectWwwToApex(): Plugin {
  return {
    name: 'redirect-www-to-apex',
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if ((req.headers.host ?? '').toLowerCase().split(':')[0] === 'www.inviteellie.ai') {
          res.statusCode = 301;
          res.setHeader('Location', `https://inviteellie.ai${req.url ?? '/'}`);
          res.end();
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), landingPrerender(), landingPaintsBeforeAppCss(), redirectWwwToApex()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'https://innovative-sparkle-production-3b41.up.railway.app',

        // target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false, // Allow self-signed certificates
        cookieDomainRewrite: 'localhost',
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Forward cookies from the original request
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
          });
        },
      },
    },
  },
  preview: {
    host: true,
    port: 3000,
    allowedHosts: [
      'beta.inviteellie.ai',
      'invite-ellie-frontend.vercel.app',
      'localhost',
      'invite-ellie-frontend-production.up.railway.app',
      'inviteellie.ai',
      'www.inviteellie.ai',
    ],
  },
});
