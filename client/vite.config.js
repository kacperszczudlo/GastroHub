import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isLinux = process.platform === 'linux';
const npmEvent = process.env.npm_lifecycle_event || '';
const isVitestRunner =
  npmEvent === 'test' ||
  npmEvent === 'test:watch' ||
  npmEvent === 'test:watch:poll' ||
  process.argv.some((arg) => {
    const base = arg.replace(/\\/g, '/').split('/').pop() || '';
    return base === 'vitest' || base.startsWith('vitest.');
  });

const viteDevWatchPolling =
  process.env.GASTROHUB_POLL === '1' ||
  (isLinux && process.env.GASTROHUB_POLL !== '0');

const vitestWatchPolling =
  process.env.GASTROHUB_VITEST_POLL === '1' ||
  (isLinux && process.env.GASTROHUB_VITEST_POLL !== '0');

const watchUsePolling = isVitestRunner ? vitestWatchPolling : viteDevWatchPolling;

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    css: true,
  },
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
      followSymlinks: false,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/coverage/**',
      ],
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
