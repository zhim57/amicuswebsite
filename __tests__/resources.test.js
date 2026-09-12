const request = require('supertest');
const { createApp } = require('../server');
const { site, resources } = require('../src/site-data');

const app = createApp({ NODE_ENV: 'test' });

test('the resource index has working category anchors and no application-registration shortcuts', async () => {
  const response = await request(app).get('/resources');
  expect(response.status).toBe(200);
  const categoryNavigation = response.text.match(/<nav[^>]*aria-label="Resource categories"[^>]*>([\s\S]*?)<\/nav>/)[1];
  const anchors = [...categoryNavigation.matchAll(/href="#([^"]+)"/g)];
  expect(anchors.length).toBeGreaterThan(0);
  for (const [, id] of anchors) {
    expect(response.text).toContain(`id="${id}"`);
    expect(response.text).toContain(`aria-labelledby="${id}"`);
  }
  expect(response.text).not.toContain(site.crewUrl);
  expect(response.text).not.toContain(site.inspectionUrl);
  for (const [, href] of response.text.matchAll(/href="(\/resources\/[^"#]+)"/g)) {
    expect((await request(app).get(href)).status).toBe(200);
  }
});

test.each(resources.map(resource => resource.slug))('guide %s has source links, related routes and same-tab tracked product CTAs', async slug => {
  const response = await request(app).get(`/resources/${slug}`);
  expect(response.status).toBe(200);
  expect(response.text).toContain('data-resource-article');
  expect(response.text).toContain(`<link rel="canonical" href="${site.url}/resources/${slug}">`);
  const body = response.text.match(/<article class="article-body"[^>]*>([\s\S]*?)<\/article>/)[1];
  expect(body).toMatch(/href="https:\/\/(?:support\.apple\.com|www\.samsung\.com|help\.bdc\.fcc\.gov|www\.inmarsat\.com|www\.tic-council\.org)\//);
  const aside = response.text.match(/<aside class="article-aside"[^>]*>([\s\S]*?)<\/aside>/)[1];
  const productLinks = [...aside.matchAll(/<a\b[^>]*data-event="resource_cta_click"[^>]*>/g)];
  expect(productLinks.length).toBeGreaterThanOrEqual(2);
  for (const [link] of productLinks) expect(link).not.toContain('target="_blank"');
  for (const [, href] of (body + aside).matchAll(/href="(\/[^"#?]+)[^"]*"/g)) {
    expect((await request(app).get(href)).status).toBe(200);
  }
});

test('existing guide URLs and the new vessel-to-home guide remain in the sitemap', async () => {
  const response = await request(app).get('/sitemap.xml');
  for (const slug of ['esim-before-you-travel', 'crew-change-connectivity', 'maritime-tools', 'vessel-to-home-connectivity']) {
    expect(response.text).toContain(`<loc>${site.url}/resources/${slug}</loc>`);
  }
});
