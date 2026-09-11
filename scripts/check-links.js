'use strict';
const request = require('supertest');
const { createApp } = require('../server');
const { pages } = require('../src/site-data');
async function main() {
  const app = createApp({ NODE_ENV: 'test' });
  const seen = new Map();
  for (const route of [...Object.keys(pages), '/missing-page']) {
    const response = await request(app).get(route);
    if (response.status !== (route === '/missing-page' ? 404 : 200)) throw new Error('Page failed: ' + route);
    seen.set(route, response.text);
  }
  const refs = new Set();
  for (const [route, html] of seen) {
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const target = match[1].replace(/&amp;/g, '&');
      if (!target.startsWith('/') && !target.startsWith('#')) continue;
      const url = new URL(target, 'http://localhost' + route);
      refs.add(url.pathname);
      if (url.hash && seen.has(url.pathname)) {
        const id = decodeURIComponent(url.hash.slice(1));
        if (!seen.get(url.pathname).includes('id="' + id + '"')) throw new Error('Missing anchor: ' + target + ' on ' + route);
      }
    }
  }
  for (const target of refs) {
    const response = await request(app).get(target);
    if (response.status !== (target === '/missing-page' ? 404 : 200)) throw new Error('Broken internal destination: ' + target + ' (' + response.status + ')');
  }
  console.log('Checked ' + seen.size + ' pages and ' + refs.size + ' internal pages/assets; no broken destinations.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
