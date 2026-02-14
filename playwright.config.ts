import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const shouldStartWebServer =
  baseURL.startsWith('http://localhost') || baseURL.startsWith('http://127.0.0.1');

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: shouldStartWebServer
    ? {
        command: 'npm run dev',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120 * 1000,
      }
    : undefined,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
