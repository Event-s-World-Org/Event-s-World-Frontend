import { defineConfig, devices } from '@playwright/test';

const PORT = 4200;
const isCI = !!process.env['CI'];

/**
 * End-to-end tests (architecture/frontend.md §10): every test runs on a phone (Pixel 7) and on
 * desktop. In CI the tests run against the production SSR build (`npm run build` first); locally
 * they reuse `npm start` if it is already running, or start it.
 */
export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: isCI ? 'npm run serve:ssr:EventsWorld' : 'npm start',
    url: `http://localhost:${PORT}`,
    env: { PORT: String(PORT) },
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
