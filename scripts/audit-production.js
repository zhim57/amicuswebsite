'use strict';
/* global fetch, AbortSignal */
// Read-only public acceptance checks. No cookies, credentials, form submissions,
// response bodies, private filenames, or redirect query strings enter the report.
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { performance } = require('node:perf_hooks');
const { site, pages } = require('../src/site-data');

const TIMEOUT_MS = 12000;
const MAX_BODY_BYTES = 256 * 1024;
const MAX_REDIRECTS = 5;
const nonce = randomUUID();
const expectedOrigin = new URL(site.url).origin;
const allowedOrigins = new Set([
  expectedOrigin, expectedOrigin.replace('https:', 'http:'),
  expectedOrigin.replace('://', '://www.'),
  expectedOrigin.replace('https://', 'http://www.'),
  'https://sim.amicusshippingllc.com', 'https://crew.ship-port.com',
]);

function safeUrl(value) {
  const url = new URL(value);
  return url.origin + url.pathname;
}

async function probe(address, { readBody = false, follow = false, method = 'GET' } = {}) {
  const started = performance.now();
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  const redirects = [];
  let current = new URL(address);
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (!allowedOrigins.has(current.origin) || current.username || current.password) {
        return { error: 'redirect-outside-reviewed-origins', redirects };
      }
      current.searchParams.set('_amicus_audit', nonce);
      const response = await fetch(current, {
        method, redirect: 'manual', signal,
        headers: {
          'Cache-Control': 'no-cache, no-store', Pragma: 'no-cache',
          'User-Agent': 'Amicus-ReadOnly-Deployment-Audit/1.0',
        },
      });
      const result = {
        status: response.status, finalUrl: safeUrl(current), redirects,
        elapsedMs: Math.round(performance.now() - started),
        headers: response.headers, body: '',
      };
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        await response.body?.cancel();
        const location = response.headers.get('location');
        if (!location) return result;
        const destination = new URL(location, current);
        redirects.push({ status: response.status, target: safeUrl(destination) });
        if (!follow) return result;
        current = destination;
        continue;
      }
      if (!readBody) {
        await response.body?.cancel();
        return result;
      }
      if (!response.body) return result;
      const chunks = [];
      let bytes = 0;
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_BODY_BYTES) {
          await reader.cancel();
          return { ...result, error: 'response-body-limit-exceeded' };
        }
        chunks.push(Buffer.from(value));
      }
      result.body = Buffer.concat(chunks).toString('utf8');
      result.decodedBytes = bytes;
      result.elapsedMs = Math.round(performance.now() - started);
      return result;
    }
    return { error: 'redirect-limit-exceeded', redirects };
  } catch (error) {
    const code = error.cause?.code;
    const safeCode = typeof code === 'string' && /^[A-Z_0-9]{2,50}$/.test(code) ? code : 'unclassified';
    return { error: signal.aborted ? 'request-timeout' : `network-or-tls-error:${safeCode}`, redirects };
  }
}

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) result[match[1].toLowerCase()] = match[2] ?? match[3];
  return result;
}

function htmlMetadata(html) {
  const metadata = {};
  for (const tag of html.matchAll(/<(?:meta|link)\b[^>]*>/gi)) {
    const attrs = attributes(tag[0]);
    if (attrs.rel === 'canonical') metadata.canonical = attrs.href;
    if (attrs.name) metadata[attrs.name] = attrs.content;
    if (attrs.property) metadata[attrs.property] = attrs.content;
  }
  metadata.title = html.match(/<title\b[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
  return metadata;
}

function decodeHtml(value) {
  return (value || '').replace(/&(amp|quot|#39|lt|gt);/g, (entity) => ({
    '&amp;': '&', '&quot;': '"', '&#39;': "'", '&lt;': '<', '&gt;': '>',
  }[entity]));
}

async function runAudit({ phase2 = false } = {}) {
  const checks = [];
  const observations = [];
  const add = (id, condition, detail, response) => checks.push({
    id, status: response?.error ? 'inconclusive' : condition ? 'pass' : 'fail',
    detail: response?.error || detail,
  });
  const observe = (id, response) => observations.push({
    id, status: response.status || null, finalUrl: response.finalUrl || null,
    redirects: response.redirects || [], elapsedMs: response.elapsedMs || null,
    decodedBytes: response.decodedBytes || null, error: response.error || null,
  });

  // These known retired paths are deliberately never read or enumerated.
  for (const route of ['/upload', '/uploads/probe.html', '/files', '/deleted_code/schedule.html', '/assets/images/ps4.jpg']) {
    for (const method of ['GET', 'HEAD']) {
      const response = await probe(expectedOrigin + route, { method });
      const id = `retired:${route}:${method}`;
      observe(id, response);
      add(id, [404, 410].includes(response.status), `HTTP ${response.status || 'unavailable'}; expected 404 or 410`, response);
      add(`${id}:indexing`, /\bnoindex\b/i.test(response.headers?.get('x-robots-tag') || ''), 'Retired response must prevent indexing', response);
      add(`${id}:cache`, /\bno-store\b/i.test(response.headers?.get('cache-control') || ''), 'Retired response must prevent storage', response);
    }
  }

  const publicRoutes = Object.keys(pages);
  const bodies = new Map();
  // Keep concurrency small and predictable; all requests are bounded.
  for (let index = 0; index < publicRoutes.length; index += 3) {
    const results = await Promise.all(publicRoutes.slice(index, index + 3).map(async route => ({
      route, response: await probe(expectedOrigin + route, { readBody: true }),
    })));
    for (const { route, response } of results) {
      const id = `page:${route}`;
      observe(id, response);
      add(id, response.status === 200, `HTTP ${response.status || 'unavailable'}; expected 200 without redirect`, response);
      const metadata = htmlMetadata(response.body || '');
      bodies.set(route, response.body || '');
      add(`${id}:title`, decodeHtml(metadata.title) === pages[route].title, 'Title must match the current local page registry', response);
      add(`${id}:description`, decodeHtml(metadata.description) === pages[route].description, 'Description must match the current local page registry', response);
      add(`${id}:canonical`, metadata.canonical === expectedOrigin + route, 'Canonical must use HTTPS, the primary hostname and the page path', response);
      add(`${id}:social`, metadata['og:url'] === expectedOrigin + route && !!metadata['og:image'] && !!metadata['twitter:card'], 'Social URL, image and card metadata required', response);
      if (phase2) {
        const configuredImage = expectedOrigin + site.socialImage;
        add(`${id}:phase2-social-image`, !!site.socialImage && metadata['og:image'] === configuredImage && metadata['twitter:image'] === configuredImage, 'Open Graph and Twitter images must match the current Phase 2 sharing image', response);
        add(`${id}:phase2-social-dimensions`, metadata['og:image:width'] === '1200' && metadata['og:image:height'] === '630', 'Sharing-image metadata must declare 1200 by 630 pixels', response);
      }
      const policy = response.headers?.get('content-security-policy') || '';
      add(`${id}:csp`, ["default-src 'self'", "object-src 'none'", "base-uri 'none'", "frame-ancestors 'none'", "form-action 'self'"].every(part => policy.includes(part)), 'Expected restrictive Content-Security-Policy directives', response);
      const headers = response.headers;
      add(`${id}:headers`, headers?.get('x-content-type-options') === 'nosniff' && headers?.get('x-frame-options') === 'DENY' && headers?.get('referrer-policy') === 'same-origin' && !!headers?.get('permissions-policy'), 'Nosniff, framing, referrer and permissions controls required', response);
      add(`${id}:hsts`, /(?:^|;)\s*max-age=[1-9]\d*/i.test(headers?.get('strict-transport-security') || ''), 'HTTPS production response must include a positive HSTS max-age', response);
      add(`${id}:indexing`, !!pages[route].noindex === /\bnoindex\b/i.test((metadata.robots || '') + ' ' + (headers?.get('x-robots-tag') || '')), 'Indexing controls must match the current page registry', response);
    }
  }

  const homeMetadata = htmlMetadata(bodies.get('/') || '');
  const homeResponse = observations.find(item => item.id === 'page:/');
  const jsonLd = (bodies.get('/') || '').match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i)?.[1];
  let organization = false;
  try {
    const schema = JSON.parse(jsonLd || 'null');
    organization = schema?.['@type'] === 'Organization' && schema?.name === site.name && schema?.url === expectedOrigin;
  } catch { /* Invalid JSON-LD fails the acceptance check without printing content. */ }
  add('seo:organization', organization, 'Homepage must have valid Organization JSON-LD with the configured name and URL', homeResponse);

  const robots = await probe(expectedOrigin + '/robots.txt', { readBody: true });
  observe('seo:robots', robots);
  add('seo:robots', robots.status === 200 && robots.body.includes('Sitemap: ' + expectedOrigin + '/sitemap.xml') && !/^Disallow:\s*\/\s*$/im.test(robots.body), 'Robots must permit indexing and advertise the sitemap', robots);
  const sitemap = await probe(expectedOrigin + '/sitemap.xml', { readBody: true });
  observe('seo:sitemap', sitemap);
  const sitemapUrls = [...(sitemap.body || '').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => decodeHtml(match[1]));
  const expectedSitemap = Object.entries(pages).filter(([, page]) => page.sitemap !== false && !page.noindex).map(([route]) => expectedOrigin + route);
  add('seo:sitemap', sitemap.status === 200 && sitemapUrls.length === expectedSitemap.length && expectedSitemap.every(url => sitemapUrls.includes(url)), 'Sitemap must contain exactly the current indexable public pages', sitemap);

  for (const origin of [expectedOrigin.replace('https:', 'http:'), expectedOrigin.replace('://', '://www.'), expectedOrigin.replace('https://', 'http://www.')]) {
    const response = await probe(origin + '/seafarers', { follow: true });
    const id = `canonical:${origin}`;
    observe(id, response);
    add(id, response.status === 200 && response.finalUrl === expectedOrigin + '/seafarers' && response.redirects.length > 0 && response.redirects.every(hop => [301, 308].includes(hop.status)), 'Permanent redirect to the HTTPS primary hostname, preserving the public path', response);
  }

  const assets = [
    ['/assets/css/style.css', /text\/css/i],
    ['/assets/js/site.js', /(?:application|text)\/javascript/i],
    ['/assets/images/cs1.jpg', /image\/jpeg/i],
    ['/assets/images/favicon.svg', /image\/svg\+xml/i],
    ['/assets/images/apple-touch-icon.png', /image\/png/i],
  ];
  if (homeMetadata['og:image']) {
    try {
      const sharingImage = new URL(homeMetadata['og:image'], expectedOrigin);
      if (sharingImage.origin === expectedOrigin && /^\/assets\/(?:images|media)\/[\w.-]+$/.test(sharingImage.pathname)) {
        assets.push([sharingImage.pathname, /image\//i]);
      } else add('asset:social-image-location', false, 'Sharing image must use a reviewed local asset path');
    } catch { add('asset:social-image-location', false, 'Sharing image URL is invalid'); }
  }
  if (phase2) {
    const validImagePath = typeof site.socialImage === 'string' && /^\/assets\/media\/[\w.-]+\.jpe?g$/i.test(site.socialImage);
    add('phase2:sharing-image-config', validImagePath, 'The configured Phase 2 sharing image must be a reviewed local media JPEG');
    if (validImagePath) assets.push([site.socialImage, /^image\/jpeg(?:\s*;|$)/i]);
  }
  for (const [route, type] of new Map(assets)) {
    const response = await probe(expectedOrigin + route, { method: 'HEAD' });
    const id = `asset:${route}`;
    observe(id, response);
    add(id, response.status === 200 && type.test(response.headers?.get('content-type') || ''), 'Expected a successful response with the correct asset content type', response);
  }

  const destinations = [
    ['shop', 'https://sim.amicusshippingllc.com/shop'],
    ['help', 'https://sim.amicusshippingllc.com/help'],
    ['account', 'https://sim.amicusshippingllc.com/account'],
    ['support', 'https://sim.amicusshippingllc.com/support'],
    ['crew-inquiry', 'https://sim.amicusshippingllc.com/crew'],
    ['crew-registration', 'https://crew.ship-port.com/register'],
  ];
  for (const [name, url] of destinations) {
    const response = await probe(url, { readBody: true, follow: true });
    const id = `journey:${name}`;
    observe(id, response);
    add(id, response.status === 200 && !!htmlMetadata(response.body || '').title, 'Public page must return 200 with an HTML title; transaction/account behavior is not tested', response);
    if (name === 'help') add(`${id}:installation`, /\bid=["']installation["']/.test(response.body || ''), 'Installation deep-link anchor must exist', response);
    if (name === 'account') add(`${id}:login`, response.finalUrl === 'https://sim.amicusshippingllc.com/login', 'An anonymous account visit must reach the published login page', response);
    if (name === 'support') add(`${id}:contact`, /support@amicusshippingllc\.com/i.test(response.body || ''), 'Expected published store-support contact must be present', response);
  }

  const summary = { pass: 0, fail: 0, inconclusive: 0 };
  for (const check of checks) summary[check.status]++;
  return {
    auditedAt: new Date().toISOString(), origin: expectedOrigin, profile: phase2 ? 'phase2' : 'baseline',
    acceptance: summary.fail ? 'failed' : summary.inconclusive ? 'inconclusive' : 'passed',
    summary, limits: { timeoutMs: TIMEOUT_MS, bodyBytes: MAX_BODY_BYTES, redirects: MAX_REDIRECTS, maxConcurrency: 3 },
    homepage: {
      decodedBytes: homeResponse?.decodedBytes || null,
      analyticsScriptDeclared: (bodies.get('/') || '').includes(site.analyticsOrigin + '/script.js'),
      sharingImageMatchesCurrentConfig: site.socialImage ? homeMetadata['og:image'] === expectedOrigin + site.socialImage : null,
    },
    scope: 'Uncached public GET/HEAD only. No credentials, cookies, writes, forms, purchases or analytics events. Retired response bodies are cancelled without reading. Page bodies are inspected in memory and never saved.',
    limitations: [
      'Public responses do not establish the VPS Node version, proxy aliases, firewall configuration, PM2 worker environment or shared contact secret.',
      'Reachable external pages do not prove registration, purchase, inbox delivery, rewards migration or legacy SIM fulfillment.',
      'Timings are a single network observation, not Core Web Vitals or a Lighthouse performance score.',
      'Exact title, description and sitemap checks compare production against the current local page registry; pending local changes can fail acceptance.',
      'A 404 or 410 on the probe does not establish private handling of every retained historical upload; server configuration still needs review.',
    ],
    checks, observations,
  };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some(argument => argument !== '--phase2')) {
    console.error('Usage: node scripts/audit-production.js [--phase2]');
    process.exitCode = 2;
    return;
  }
  const output = path.resolve(__dirname, '..', '.qa', 'production-audit.json');
  const report = await runAudit({ phase2: args.includes('--phase2') });
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, JSON.stringify(report, null, 2) + '\n');
  console.log(`Production acceptance (${report.profile}) ${report.acceptance}: ${report.summary.pass} passed, ${report.summary.fail} failed, ${report.summary.inconclusive} inconclusive.`);
  for (const check of report.checks.filter(item => item.status !== 'pass')) console.log(`${check.status.toUpperCase()} ${check.id}: ${check.detail}`);
  console.log('Report: .qa/production-audit.json (no response bodies or secrets).');
  process.exitCode = report.summary.fail ? 1 : report.summary.inconclusive ? 2 : 0;
}

if (require.main === module) main().catch(() => {
  console.error('Production audit could not complete; no response content has been logged.');
  process.exitCode = 2;
});

module.exports = { runAudit, htmlMetadata };
