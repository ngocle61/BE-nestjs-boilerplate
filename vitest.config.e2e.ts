import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});
