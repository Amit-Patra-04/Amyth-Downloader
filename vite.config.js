import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { spawn } from 'child_process'
import http from 'http'

let backendProc = null;
let isStarting = false;

function ensureBackend() {
  if (isStarting) return;
  isStarting = true;

  const req = http.get('http://localhost:5000/api/health', (res) => {
    isStarting = false;
  });

  req.on('error', () => {
    console.log('🚀 Starting backend server on port 5000 (node server/server.js)...');
    backendProc = spawn('node', ['server/server.js'], {
      stdio: 'inherit',
      shell: true,
    });

    backendProc.on('error', (err) => {
      console.error('Failed to spawn backend server:', err);
    });

    backendProc.on('exit', () => {
      backendProc = null;
      isStarting = false;
    });

    setTimeout(() => {
      isStarting = false;
    }, 2000);
  });
}

function autoBackendPlugin() {
  return {
    name: 'auto-backend-starter',
    configureServer(server) {
      ensureBackend();

      const cleanup = () => {
        if (backendProc) {
          try {
            backendProc.kill();
          } catch (e) {}
          backendProc = null;
        }
      };

      process.on('exit', cleanup);
      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);
      server.httpServer?.on('close', cleanup);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), autoBackendPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', () => {
            ensureBackend();
          });
        },
      },
    },
  },
})
