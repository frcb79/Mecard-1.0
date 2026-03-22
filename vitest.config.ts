import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Start conservatively at 40% — raise by 10% each sprint as new tests are added.
      // Focus thresholds on the services layer where business logic lives.
      thresholds: {
        lines: 40,
        functions: 40,
        branches: 30,
        statements: 40,
      },
      include: ['src/services/**', 'src/lib/**'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/node_modules/**',
        'src/services/__tests__/**',
        'src/lib/env.test.ts',
        // Phase-2 components not yet in scope
        'src/_phase2/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
