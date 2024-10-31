import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: false,
  /* Retry on CI only */
  retries: 2,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env['AUSKUNFT_URL'] || 'http://localhost:4400',
    trace: 'on' /* Collect trace always. See https://playwright.dev/docs/trace-viewer */,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    //video: "on",
    //screenshot:"on",
    headless: true,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['Chromium'],
    },
    {
      name: 'Safari',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['Firefox'],
    },

    /* Test against branded browsers. */
    /*
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
      dependencies: ['Safari']
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
      dependencies: ['Microsoft Edge']
    },
    */
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npx ng serve',
    port: 4400,
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
});
