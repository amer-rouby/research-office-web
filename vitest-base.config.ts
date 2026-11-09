import { defineConfig } from 'vitest/config';

// Picked up by the Angular unit-test builder (angular.json -> test.options.runnerConfig: true).
export default defineConfig({
  test: {
    // @lucide/angular ships every icon in one ~11 MB module; the first spec file that
    // imports it pays ~10 s on a cold Windows run, which the 5 s default cannot absorb.
    testTimeout: 30_000,
  },
});
