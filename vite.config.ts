import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      // Proxy Slack endpoints to Railway backend (bot.py)
      '/api/slack': {
        target: 'https://web-production-07092.up.railway.app',
        // target: 'http://localhost:8080', // For local bot.py
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
        rewrite: (path) => path, // Preserve /api/slack prefix
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
          });
        },
      },
      // Proxy Notion endpoints to Railway backend (bot.py)
      '/api/notion': {
        target: 'https://web-production-07092.up.railway.app',
        // target: 'http://localhost:8080', // For local bot.py
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
        rewrite: (path) => path, // Preserve /api/notion prefix
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
          });
        },
      },
      // Proxy HubSpot endpoints to Railway backend (bot.py)
      '/api/hubspot': {
        target: 'https://web-production-07092.up.railway.app',
        // target: 'http://localhost:8080', // For local bot.py
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
        rewrite: (path) => path, // Preserve /api/hubspot prefix
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
          });
        },
      },
      // Proxy chat endpoint to Railway backend (bot.py)
      '/api/chat': {
        target: 'https://web-production-07092.up.railway.app',
        // target: 'http://localhost:8080', // For local bot.py
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
        rewrite: (path) => path, // Preserve /api/chat prefix
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
          });
        },
      },
      // Default proxy for all other /api routes to Django backend
      '/api': {
        target: 'https://api.stage.inviteellie.ai',
        // target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
        rewrite: (path) => path, // Preserve /api prefix
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
          });
        },
      },
    },
  },
});


