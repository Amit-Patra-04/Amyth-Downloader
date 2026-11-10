import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { spawn } from 'child_process'
import http from 'http'

function autoBackendPlugin() {
  let backendProc = null;

  return {
    name: 'auto-backend-starter',
    configureServer(server) {
      // Check if backend on port 5000 is already active
      const req = http.get('http://localhost:5000/api/health', (res) => {
        console.log('✅ Backend server is already running on port 5000');
      });

      req.on('error', () => {
        console.log('🚀 Port 5000 is inactive. Auto-starting backend server (node server/server.js)...');
        backendProc = spawn('node', ['server/server.js'], {
          stdio: 'inherit',
          shell: true,
        });

        backendProc.on('error', (err) => {
          console.error('Failed to auto-spawn backend server:', err);
        });
      });

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
      },
    },
  },
})
