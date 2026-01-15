import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'https://api.stage.inviteellie.ai',
        
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
    ],
  },
});