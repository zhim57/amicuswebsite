const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { pages } = require('../src/site-data');
test('public routes are accessible, load assets and do not produce script errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of Object.keys(pages)) {
    const response = await page.goto(route);
    expect(response.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toBeVisible();
    const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(accessibility.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), route).toEqual([]);
  }
  expect(errors).toEqual([]);
});
test('required viewport sizes have no horizontal overflow', async ({ page }) => {
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/solutions', '/seafarers', '/operators', '/resources', '/about', '/contact']) {
      await page.goto(route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route + ' at ' + width).toBe(true);
    }
  }
});
test('mobile navigation works with keyboard and without JavaScript', async ({ page, browser }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const menu = page.locator('.mobile-nav summary');
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(page.locator('.mobile-nav')).not.toHaveAttribute('open');
  await menu.click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Contact', exact: true }).click();
  await expect(page).toHaveURL(/contact$/);
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 800 } });
  const plain = await context.newPage();
  await plain.goto(process.env.BROWSER_TEST_URL);
  await plain.locator('.mobile-nav summary').click();
  await expect(plain.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
  await context.close();
});
test('contact prepares an honest draft and preserves user input', async ({ page }) => {
  await page.goto('/contact');
  await page.getByLabel('Name', { exact: true }).fill('Website Test');
  await page.getByLabel('Email', { exact: true }).fill('test@example.com');
  await page.getByLabel('I am a…').selectOption('Ship Agent');
  await page.getByLabel('Interested in').selectOption('Crew Connectivity');
  await page.getByLabel('How can we help?').fill('Preparing crew connectivity for a test journey.');
  await page.getByRole('button', { name: 'Prepare email' }).click();
  await expect(page.getByRole('heading', { name: 'Your email draft is ready' })).toBeVisible();
  await expect(page.getByText('Your inquiry has not been sent yet.', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open email draft' })).toHaveAttribute('href', /^mailto:/);
  await expect(page.getByLabel('Your prepared message')).toContainText('Preparing crew connectivity');
  const response = await page.goto('/not-a-real-page');
  expect(response.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'Back to home' })).toBeVisible();
});
test('visual review captures desktop, mobile and contact', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.screenshot({ path: '.qa/home-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.screenshot({ path: '.qa/home-mobile.png', fullPage: true });
  await page.goto('/contact');
  await page.screenshot({ path: '.qa/contact-mobile.png', fullPage: true });
  await page.goto('/seafarers');
  await page.screenshot({ path: '.qa/seafarers-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const route of ['/solutions', '/about', '/resources', '/seafarers', '/operators']) {
    await page.goto(route);
    await page.screenshot({ path: '.qa/' + route.slice(1) + '-desktop.png', fullPage: true });
  }
});
