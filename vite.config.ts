import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      reporter: ['json', 'text-summary'],
      exclude: ['src/config.ts', 'src/index.ts', 'src/generate.ts', 'test/*'],
    },
  },
});
