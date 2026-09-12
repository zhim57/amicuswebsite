'use strict';
const request = require('supertest');
const { createApp } = require('../server');
const { site } = require('../src/site-data');

test('www GET and HEAD preserve the path/query in a fixed canonical-origin redirect', async () => {
  const app = createApp({ NODE_ENV: 'production' });
  for (const method of ['get', 'head']) {
    const response = await request(app)[method]('/contact?interest=Crew%20Change').set('Host', 'www.amicusshippingllc.com');
    expect(response.status).toBe(301);
    expect(response.headers.location).toBe(site.url + '/contact?interest=Crew%20Change');
  }
});
test('unrecognized hosts and forwarded hosts cannot control canonical redirects', async () => {
  const app = createApp({ NODE_ENV: 'production' });
  const response = await request(app).get('/').set('Host', 'untrusted.example').set('X-Forwarded-Host', 'www.amicusshippingllc.com');
  expect(response.status).toBe(200);
  expect(response.headers.location).toBeUndefined();
  expect(response.text).toContain('href="' + site.url + '/"');
});
test('production enables HSTS and existing analytics while disabling tracking remains possible', async () => {
  const live = await request(createApp({ NODE_ENV: 'production' })).get('/');
  expect(live.headers['strict-transport-security']).toContain('max-age=');
  expect(live.text).toContain(site.analyticsOrigin + '/script.js');
  const disabled = await request(createApp({ NODE_ENV: 'production', ANALYTICS_ENABLED: 'false' })).get('/');
  expect(disabled.text).not.toContain(site.analyticsOrigin + '/script.js');
  const development = await request(createApp({ NODE_ENV: 'development' })).get('/');
  expect(development.headers['strict-transport-security']).toBeUndefined();
  expect(development.text).not.toContain(site.analyticsOrigin + '/script.js');
});
test('metadata shares the produced brand image instead of an arbitrary request host', async () => {
  const response = await request(createApp({ NODE_ENV: 'test' })).get('/seafarers');
  expect(response.text).toContain('property="og:image" content="' + site.url + site.socialImage + '"');
  expect(response.text).toContain('property="og:image:width" content="1200"');
  expect(response.text).toContain('property="og:image:height" content="630"');
  const image = await request(createApp({ NODE_ENV: 'test' })).get(site.socialImage);
  expect(image.status).toBe(200);
  expect(image.headers['content-type']).toMatch(/image\/jpeg/);
});
