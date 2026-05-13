import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isLinux = process.platform === 'linux';
const watchUsePolling =
  process.env.GASTROHUB_POLL === '1' ||
  (isLinux && process.env.GASTROHUB_POLL !== '0');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@models': path.resolve(__dirname, './src/models'),
      '@context': path.resolve(__dirname, './src/context'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@constants': path.resolve(__dirname, './src/constants'),
    },
  },
  server: {
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**'],
      ...(watchUsePolling ? { usePolling: true, interval: 1000 } : {}),
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (proxyPath) => proxyPath.replace(/^\/api/, '/api'),
      },
    },
  },
});
