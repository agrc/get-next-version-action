import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      cleanOnRerun: true,
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['index.ts', 'cjs-shim.ts', 'dist/*'],
    },
  },
});
