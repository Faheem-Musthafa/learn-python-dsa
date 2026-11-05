import { cloudflareTest } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

// Runs the tests inside workerd, the real Workers runtime, with Miniflare's KV and rate limit bindings.
export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.toml' },
    }),
  ],
  test: {
    include: ['test/**/*.test.js'],
    testTimeout: 30000,
  },
});
