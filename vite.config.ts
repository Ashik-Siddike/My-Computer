import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

function apiServerPlugin(): Plugin {
  let cachedApp: any = null;

  return {
    name: 'api-server-plugin',
    configureServer(server) {
      server.watcher.on('change', (file) => {
        if (file.includes('server')) {
          cachedApp = null;
        }
      });

      server.middlewares.use(async (req, res, next) => {
        if (req.url && (
          req.url === '/api' ||
          req.url.startsWith('/api/') ||
          req.url === '/uploads' ||
          req.url.startsWith('/uploads/')
        )) {
          try {
            if (!cachedApp) {
              const mod = await server.ssrLoadModule('/server/app.ts');
              cachedApp = mod.app;
            }
            cachedApp(req, res, (err?: any) => {
              if (err) {
                console.error('[Vite API Middleware Error]:', err);
                if (!res.headersSent) {
                  res.statusCode = err.status || 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: false,
                    error: err.message || 'Internal API Error',
                  }));
                }
              } else {
                next();
              }
            });
          } catch (err: any) {
            console.error('[Vite API Load Error]:', err);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                error: err.message || 'Failed to initialize API server',
              }));
            }
          }
        } else {
          next();
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    apiServerPlugin(),
  ],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
          }
          if (id.includes('src/data/mockData') || id.includes('src/data/asusMonitorsData')) {
            return 'catalog-data';
          }
        },
      },
    },
  },
})
