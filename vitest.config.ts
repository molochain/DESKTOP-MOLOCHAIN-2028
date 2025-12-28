import { defineConfig } from 'vitest/config';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./server/tests/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        'dist',
        'client',
        'public',
        '*.config.js',
        '*.config.ts',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts'
      ]
    },
    pool: 'forks',
    testTimeout: 30000,
    hookTimeout: 15000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './server'),
      '@db': path.resolve(__dirname, './db'),
      '@db/schema': path.resolve(__dirname, './db/schema'),
      '@shared': path.resolve(__dirname, './shared'),
      '@server': path.resolve(__dirname, './server')
    }
  }
});