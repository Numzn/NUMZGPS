import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(() => {
  // Allow configurable HMR host for mobile device access
  // Set VITE_HMR_EXTERNAL env var to your host IP (e.g., 10.152.184.242) for mobile access
  // If not set, defaults to 'localhost' for local development
  // Use process.env in config file (import.meta.env is for runtime, not config time)
  const hmrHost = process.env.VITE_HMR_EXTERNAL || process.env.VITE_HMR_HOST || 'localhost';
  const hmrPort = process.env.VITE_HMR_PORT || 3002;

  // Detect if running locally (not in Docker)
  // Set LOCAL_DEV=true to use localhost URLs for backend services
  // This allows frontend to run locally while backend services run in Docker
  const isLocalDev = process.env.LOCAL_DEV === 'true';
  const traccarUrl = isLocalDev ? 'http://localhost:8082' : 'http://traccar-server:8082';
  const fuelApiUrl = isLocalDev ? 'http://localhost:3001' : 'http://fuel-api:3001';

  if (isLocalDev) {
    console.log('🔧 [Vite] Running in LOCAL development mode');
    console.log(`   Traccar: ${traccarUrl}`);
    console.log(`   Fuel API: ${fuelApiUrl}`);
  } else {
    console.log('🐳 [Vite] Running in DOCKER mode');
    console.log(`   Traccar: ${traccarUrl}`);
    console.log(`   Fuel API: ${fuelApiUrl}`);
  }

  return {
    server: {
      port: 3002,
      host: '0.0.0.0',
      hmr: {
        port: parseInt(hmrPort, 10),
        host: hmrHost,
        clientPort: parseInt(hmrPort, 10),
      },
      proxy: {
      // IMPORTANT: Order matters! More specific routes should come first
      // Socket.IO proxy MUST come before /api routes to avoid conflicts
      '/api/socket': {
        target: traccarUrl,
        ws: true,
        changeOrigin: true,
        secure: false,
      },
      // WebSocket proxy for fuel API Socket.IO
      // IMPORTANT: This must match Socket.IO requests BEFORE other routes
      // Socket.IO requests: /socket.io/?EIO=4&transport=polling&t=...
      '/socket.io': {
        target: fuelApiUrl,
        ws: true,
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: {
          '*': 'localhost'
        },
        // Don't rewrite the path - Socket.IO needs the full path with query params
        rewrite: (path) => path,
        // Ensure this proxy handles both HTTP and WebSocket
        configure: (proxy, options) => {
          const isDev = process.env.NODE_ENV === 'development';
          
          // Handle HTTP requests (Socket.IO handshake)
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (isDev) {
              console.log('🔌 [Vite Proxy] Socket.IO HTTP request:', req.url);
            }
            
            // Forward cookies for authentication
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
            
            // Forward other important headers
            if (req.headers['x-forwarded-for']) {
              proxyReq.setHeader('X-Forwarded-For', req.headers['x-forwarded-for']);
            }
          });
          
          // Handle WebSocket upgrade requests
          proxy.on('upgrade', (req, socket, head) => {
            if (isDev) {
              console.log('🔌 [Vite Proxy] Socket.IO WebSocket upgrade:', req.url);
            }
          });
          
          proxy.on('error', (err, req, socket) => {
            console.error('❌ [Vite Proxy] Socket.IO proxy error:', err.message);
            if (socket && !socket.destroyed) {
              socket.end();
            }
          });
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            if (isDev && proxyRes.statusCode >= 400) {
              console.error(`⚠️ [Vite Proxy] Socket.IO response error: ${proxyRes.statusCode}`, req.url);
            }
          });
        },
      },
      '/api/fuel-requests': {
        target: fuelApiUrl,
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: {
          '*': 'localhost'
        },
        configure: (proxy, options) => {
          const isDev = process.env.NODE_ENV === 'development';
          
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // CRITICAL: Forward all cookies to fuel-api
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
              if (isDev) {
                console.log('🍪 Forwarding cookies to fuel-api');
              }
            }
            
            // Also forward x-user-id header if present (fallback authentication)
            if (req.headers['x-user-id']) {
              proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
            }
          });
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Forward Set-Cookie headers back to client
            if (proxyRes.headers['set-cookie']) {
              proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(cookie => {
                return cookie.replace(/Domain=[^;]+/gi, 'Domain=localhost');
              });
            }
          });
          
          proxy.on('error', (err, req, res) => {
            console.error('❌ [Vite Proxy] Fuel API proxy error:', err.message);
          });
        },
      },
      '/api/vehicle-specs': {
        target: fuelApiUrl,
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: {
          '*': 'localhost'
        },
      },
      '/api': {
        target: traccarUrl,
        changeOrigin: true,
        secure: false,
      },
      // Session endpoint (Traccar uses /session not /api/session)
      '/session': {
        target: traccarUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
  plugins: [
    svgr(),
    react(),
    // VitePWA is disabled to prevent service worker and PWA caching issues
    viteStaticCopy({
      targets: [
        { src: 'node_modules/@mapbox/mapbox-gl-rtl-text/dist/mapbox-gl-rtl-text.js', dest: '' },
      ],
    }),
  ],
  };
});