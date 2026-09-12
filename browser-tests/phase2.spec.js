const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

async function fillInquiry(page) {
  await page.getByLabel('Name', { exact: true }).fill('Preview User');
  await page.getByLabel('Email', { exact: true }).fill('preview@example.com');
  await page.getByLabel('How can we help?').fill('Please help with our crew travel preparation.');
}
test('intent links preselect safe choices and webmail copying works without transmitting inquiry data', async ({ page }) => {
  await page.addInitScript(() => {
    window.testEvents = [];
    window.umami = { track: (name, data) => window.testEvents.push({ name, data }) };
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { window.testCopiedText = text; } } });
  });
  await page.goto('/seafarers');
  await page.getByRole('link', { name: 'Contact Amicus', exact: true }).first().click();
  await expect(page.getByLabel('I am a…')).toHaveValue('Seafarer');
  await expect(page.getByLabel('Interested in')).toHaveValue('Crew Connectivity');
  await expect(page.getByLabel('Company (optional)', { exact: true })).toBeHidden();
  await fillInquiry(page);
  await page.getByRole('button', { name: 'Prepare email' }).click();
  const clearOfHeader = await page.evaluate(() => document.querySelector('#email-draft h2').getBoundingClientRect().top >= document.querySelector('.site-header').getBoundingClientRect().bottom);
  expect(clearOfHeader).toBe(true);
  await expect(page.getByRole('group').filter({ has: page.locator('summary', { hasText: 'Edit inquiry details' }) })).not.toHaveAttribute('open');
  await expect(page.getByLabel('Subject', { exact: true })).toHaveValue('Amicus inquiry: Crew Connectivity');
  await page.getByRole('button', { name: 'Copy message', exact: true }).click();
  await expect(page.locator('#copy-message-status')).toContainText('Message copied.');
  expect(await page.evaluate(() => window.testCopiedText)).toContain('Please help with our crew travel preparation.');
  const events = await page.evaluate(() => window.testEvents);
  expect(events.map(event => event.name)).toEqual(expect.arrayContaining(['email_draft_ready', 'inquiry_copy']));
  for (const event of events) expect(event.data).toEqual({ page: '/contact' });
  expect(JSON.stringify(events)).not.toContain('preview@example.com');
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
  await page.screenshot({ path: '.qa/contact-prepared-desktop.png', fullPage: true });
});
test('denied clipboard access selects the message and leaves a clear manual fallback', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('Denied'); } } });
  });
  await page.goto('/contact?visitorType=Ship%20Agent&interest=Maritime%20Tools');
  await fillInquiry(page);
  await page.getByRole('button', { name: 'Prepare email' }).click();
  await page.getByRole('button', { name: 'Copy message', exact: true }).click();
  await expect(page.locator('#copy-message-status')).toContainText('The message is selected.');
  const selection = await page.locator('#prepared-message').evaluate(element => [element.selectionStart, element.selectionEnd, element.value.length]);
  expect(selection).toEqual([0, selection[2], selection[2]]);
  await expect(page.getByRole('button', { name: 'Copy message', exact: true })).toBeEnabled();
});
test('seafarer help works by keyboard and no pending media is requested', async ({ page }) => {
  const missing = [];
  page.on('response', response => { if (response.status() >= 400) missing.push(response.url()); });
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto('/seafarers');
  const question = page.locator('.faq-list summary').first();
  await question.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.faq-list details').first()).toHaveAttribute('open');
  await expect(page.getByRole('link', { name: 'Your eSIM account' })).toHaveAttribute('href', 'https://sim.amicusshippingllc.com/account');
  await expect(page.locator('.supporting-media')).toHaveCount(0);
  await page.goto('/operators');
  await expect(page.locator('.supporting-media')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Crew eSIM enquiries' })).toHaveAttribute('href', 'https://sim.amicusshippingllc.com/crew');
  expect(missing).toEqual([]);
});
test('store intent is counted once and custom events exclude query contents', async ({ page }) => {
  await page.addInitScript(() => {
    window.testEvents = [];
    window.umami = { track: (name, data) => window.testEvents.push({ name, data }) };
  });
  await page.goto('/?email=not-for-analytics%40example.com');
  await page.evaluate(() => document.addEventListener('click', event => { if (event.target.closest('a')) event.preventDefault(); }));
  await page.locator('.header-cta').click();
  const events = await page.evaluate(() => window.testEvents);
  expect(events.filter(event => event.name === 'shop_visit')).toHaveLength(1);
  expect(events.filter(event => event.name === 'buy_esim_click')).toHaveLength(1);
  for (const event of events) expect(event.data).toEqual({ page: '/' });
  expect(JSON.stringify(events)).not.toContain('email');
});
test('new help and contact layouts remain usable with enlarged text', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.route('**/assets/css/style.css', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()) + '\nhtml { font-size: 200%; }' });
  });
  for (const route of ['/seafarers', '/contact']) {
    await page.goto(route);
    const overflow = await page.evaluate(() => Array.from(document.querySelectorAll('body *')).filter(element => element.getBoundingClientRect().right > innerWidth + 1).map(element => element.tagName + '.' + element.className).slice(0, 12));
    expect(overflow, route).toEqual([]);
    await expect(page.locator('main')).toBeVisible();
  }
});
