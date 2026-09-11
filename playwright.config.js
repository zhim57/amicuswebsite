const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './browser-tests',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  outputDir: '.qa/browser-results',
  use: { baseURL: process.env.BROWSER_TEST_URL, channel: 'chromium', headless: true, screenshot: 'only-on-failure' }
});
