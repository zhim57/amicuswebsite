const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { pages, site } = require('../src/site-data');

async function fillInquiry(page) {
  await page.getByLabel('Name', { exact: true }).fill('Preview User');
  await page.getByLabel('Email', { exact: true }).fill('preview@example.com');
  await page.getByLabel('How can we help?').fill('Please help with our crew travel preparation.');
}

test('operator intent reaches the form and accepted sending records no inquiry data', async ({ page }) => {
  await page.addInitScript(() => {
    window.testEvents = [];
    window.umami = { track: (name, data) => window.testEvents.push({ name, data }) };
  });
  await page.goto('/operators');
  await page.locator('main a[data-event="operator_inquiry"]').first().click();
  await expect(page.getByLabel('Interested in')).toHaveValue('Crew Connectivity');
  await expect(page.getByLabel('Company (optional)', { exact: true })).toBeHidden();
  await fillInquiry(page);
  await page.getByRole('button', { name: 'Send inquiry' }).click();
  await expect(page.locator('#contact-success')).toBeVisible();
  const clearOfHeader = await page.evaluate(() => document.querySelector('#contact-success h2').getBoundingClientRect().top >= document.querySelector('.site-header').getBoundingClientRect().bottom);
  expect(clearOfHeader).toBe(true);
  const events = await page.evaluate(() => window.testEvents);
  expect(events.filter(event => event.name === 'contact_submit')).toHaveLength(1);
  for (const event of events) expect(event.data).toEqual({ page: '/contact' });
  expect(JSON.stringify(events)).not.toContain('preview@example.com');
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.screenshot({ path: '.qa/contact-success-desktop.png', fullPage: true });
});

test('server validation preserves fields and associates accessible errors', async ({ page }) => {
  await page.goto('/contact?interest=Maritime%20Tools');
  await fillInquiry(page);
  await page.getByLabel('Email', { exact: true }).fill('invalid-address');
  await page.locator('form[data-contact-form]').evaluate(form => { form.noValidate = true; });
  await page.getByRole('button', { name: 'Send inquiry' }).click();
  await expect(page.locator('#form-errors')).toBeFocused();
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Preview User');
  await expect(page.getByLabel('Email', { exact: true })).toHaveAttribute('aria-describedby', 'email-error');
  await page.locator('#form-errors a[href="#email"]').click();
  await expect(page.getByLabel('Email', { exact: true })).toBeFocused();
  await expect(page.locator('#contact-success')).toHaveCount(0);
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(accessibility.violations).toEqual([]);
});

test('contact works with JavaScript disabled and without an email application', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 800 } });
  const page = await context.newPage();
  await page.goto(process.env.BROWSER_TEST_URL + '/contact?interest=Crew%20Change');
  await fillInquiry(page);
  await page.getByRole('button', { name: 'Send inquiry' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#contact-success')).toBeVisible();
  await context.close();
});

test('Amicus store links stay in this tab and product launch follows an explanation', async ({ page }) => {
  for (const path of Object.keys(pages)) {
    await page.goto(path);
    const storeLinks = page.locator('a[href^="https://sim.amicusshippingllc.com"]');
    for (const link of await storeLinks.all()) await expect(link).not.toHaveAttribute('target', '_blank');
    if (path !== '/solutions/crew-change') await expect(page.locator('main a[href="' + site.crewUrl + '"]')).toHaveCount(0);
    if (path !== '/solutions/inspection') await expect(page.locator('main a[href="' + site.inspectionUrl + '"]')).toHaveCount(0);
    await expect(page.locator('a[href*="rewards"], a[href*="imei-zhim57"], form[action="/upload"]')).toHaveCount(0);
  }
  await page.goto('/solutions/crew-change');
  await expect(page.locator('a[data-event="crew_change_click"]')).toHaveAttribute('href', site.crewUrl);
  await expect(page.locator('.desktop-nav a[href="/solutions"]')).toHaveAttribute('aria-current', 'location');
});

test('consumer and resource events exclude query contents', async ({ page }) => {
  await page.addInitScript(() => {
    window.testEvents = [];
    window.umami = { track: (name, data) => window.testEvents.push({ name, data }) };
  });
  await page.goto('/?email=not-for-analytics%40example.com');
  await page.evaluate(() => document.addEventListener('click', event => { if (event.target.closest('a')) event.preventDefault(); }));
  await page.locator('.header-cta').click();
  let events = await page.evaluate(() => window.testEvents);
  expect(events.filter(event => event.name === 'buy_esim_click')).toHaveLength(1);
  for (const event of events) expect(event.data).toEqual({ page: '/' });
  expect(JSON.stringify(events)).not.toContain('email');
  await page.goto('/resources/crew-change-connectivity');
  await page.evaluate(() => document.addEventListener('click', event => { if (event.target.closest('a')) event.preventDefault(); }));
  await page.locator('.article-aside a.button[data-event="resource_cta_click"]').click();
  events = await page.evaluate(() => window.testEvents);
  expect(events.filter(event => event.name === 'resource_view')).toHaveLength(1);
  expect(events.filter(event => event.name === 'resource_cta_click')).toHaveLength(1);
  expect(events.filter(event => event.name === 'buy_esim_click')).toHaveLength(1);
});

test('new layouts remain usable with enlarged text', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.route('**/assets/css/style.css', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()) + '\nhtml { font-size: 200%; }' });
  });
  for (const route of ['/seafarers', '/operators', '/about', '/solutions/crew-change', '/contact']) {
    await page.goto(route);
    const overflow = await page.evaluate(() => Array.from(document.querySelectorAll('body *')).filter(element => element.getBoundingClientRect().right > innerWidth + 1).map(element => element.tagName + '.' + element.className).slice(0, 12));
    expect(overflow, route).toEqual([]);
  }
});
