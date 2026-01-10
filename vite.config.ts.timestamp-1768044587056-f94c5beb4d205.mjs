// vite.config.ts
import { defineConfig } from "file:///C:/Users/Kamran/Desktop/testin/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Kamran/Desktop/testin/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    port: 3e3,
    host: true,
    proxy: {
      "/api": {
        target: "https://api.stage.inviteellie.ai",
        // target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        // Allow self-signed certificates
        cookieDomainRewrite: "localhost",
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxLYW1yYW5cXFxcRGVza3RvcFxcXFx0ZXN0aW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEthbXJhblxcXFxEZXNrdG9wXFxcXHRlc3RpblxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvS2FtcmFuL0Rlc2t0b3AvdGVzdGluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIHBvcnQ6IDMwMDAsXHJcbiAgICBob3N0OiB0cnVlLFxyXG4gICAgcHJveHk6IHtcclxuICAgICAgJy9hcGknOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9hcGkuc3RhZ2UuaW52aXRlZWxsaWUuYWknLFxyXG5cclxuICAgICAgICBcclxuICAgICAgICAvLyB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjgwMDAnLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICBzZWN1cmU6IGZhbHNlLCAvLyBBbGxvdyBzZWxmLXNpZ25lZCBjZXJ0aWZpY2F0ZXNcclxuICAgICAgICBjb29raWVEb21haW5SZXdyaXRlOiAnbG9jYWxob3N0JyxcclxuICAgICAgICBjb25maWd1cmU6IChwcm94eSwgX29wdGlvbnMpID0+IHtcclxuICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcScsIChwcm94eVJlcSwgcmVxLCBfcmVzKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIEZvcndhcmQgY29va2llcyBmcm9tIHRoZSBvcmlnaW5hbCByZXF1ZXN0XHJcbiAgICAgICAgICAgIGlmIChyZXEuaGVhZGVycy5jb29raWUpIHtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5zZXRIZWFkZXIoJ0Nvb2tpZScsIHJlcS5oZWFkZXJzLmNvb2tpZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBc1IsU0FBUyxvQkFBb0I7QUFDblQsT0FBTyxXQUFXO0FBRWxCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUE7QUFBQSxRQUlSLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQTtBQUFBLFFBQ1IscUJBQXFCO0FBQUEsUUFDckIsV0FBVyxDQUFDLE9BQU8sYUFBYTtBQUM5QixnQkFBTSxHQUFHLFlBQVksQ0FBQyxVQUFVLEtBQUssU0FBUztBQUU1QyxnQkFBSSxJQUFJLFFBQVEsUUFBUTtBQUN0Qix1QkFBUyxVQUFVLFVBQVUsSUFBSSxRQUFRLE1BQU07QUFBQSxZQUNqRDtBQUFBLFVBQ0YsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
