import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './medical-doc/tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    timeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Only start local server if BASE_URL is not provided
  ...(process.env.BASE_URL ? {} : {
    webServer: {
      command: 'npx http-server medical-doc -p 8080',
      port: 8080,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  }),
});
