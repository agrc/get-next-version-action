import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      cleanOnRerun: true,
      provider: 'c8',
      reporter: ['text', 'lcov'],
    },
  },
});
