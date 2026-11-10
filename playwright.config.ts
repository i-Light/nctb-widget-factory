import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Budget Android Chrome (360x800)',
      use: { ...devices['Galaxy S9+'], viewport: { width: 360, height: 800 } },
    },
  ],
});
