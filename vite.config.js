import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      cleanOnRerun: true,
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['src/index.ts', 'support/cjs-shim.ts', 'dist/*'],
    },
  },
});
