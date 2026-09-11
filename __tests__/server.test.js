const request = require('supertest');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { createTokens } = require('../src/server/contact');
const { parseTrustProxy } = require('../src/server/security');
const { site, pages } = require('../src/site-data');

let tempDir;
let app;
let createApp;

beforeAll(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'amicus-security-test-'));
  fs.writeFileSync(path.join(tempDir, 'retained.html'), '<script>window.unsafeUpload = true</script>');
  createApp = require('../server').createApp;
});

beforeEach(() => {
  app = createApp({ UPLOAD_DIR: tempDir, NODE_ENV: 'test' });
});

afterAll(() => {
  if (path.dirname(tempDir) !== path.resolve(os.tmpdir()) || !path.basename(tempDir).startsWith('amicus-security-test-')) {
    throw new Error('Refusing cleanup outside the test temporary directory.');
  }
  fs.rmSync(tempDir, { recursive: true, force: true });
});

async function contactToken(target = app) {
  const response = await request(target).get('/contact');
  expect(response.status).toBe(200);
  const input = response.text.match(/<input\b[^>]*\bname="formToken"[^>]*>/);
  expect(input).not.toBeNull();
  return input[0].match(/\bvalue="([^"]+)"/)[1];
}

function validInquiry(formToken, overrides = {}) {
  return {
    formToken, name: 'Casey Mariner', email: 'casey@example.com', company: 'Example Fleet',
    visitorType: 'Ship Operator / Manager', interest: 'Crew Connectivity',
    message: 'Please discuss connectivity for our next crew change.', phone: '', website: '', ...overrides,
  };
}

test.each([
  ['get', '/files'], ['post', '/files'], ['get', '/upload'], ['post', '/upload'],
  ['get', '/uploads/retained.html'], ['head', '/uploads/retained.html'], ['get', '/uploads'],
])('%s %s retires uploads without disclosure', async (method, url) => {
  const response = await request(app)[method](url);
  expect(response.status).toBe(410);
  expect(response.headers['x-robots-tag']).toContain('noindex');
  expect(response.headers['x-content-type-options']).toBe('nosniff');
  expect(response.text || '').not.toContain('window.unsafeUpload');
  expect(fs.readFileSync(path.join(tempDir, 'retained.html'), 'utf8')).toContain('window.unsafeUpload');
});

test('multipart uploads cannot create files, including active HTML', async () => {
  const before = fs.readdirSync(tempDir);
  const response = await request(app).post('/upload').attach('file', Buffer.from('<script>alert(1)</script>'), 'untrusted.html');
  expect(response.status).toBe(410);
  expect(fs.readdirSync(tempDir)).toEqual(before);
});

test('retained uploads remain blocked when UPLOAD_DIR points inside public assets', async () => {
  const nested = createApp({ UPLOAD_DIR: path.join(__dirname, '..', 'public', 'assets', 'images'), NODE_ENV: 'test' });
  const response = await request(nested).get('/assets/images/favicon.svg');
  expect(response.status).toBe(410);
  expect(response.headers['x-robots-tag']).toContain('noindex');
});

test('assets remain available while archived HTML cannot execute', async () => {
  expect((await request(app).get('/assets/images/favicon.svg')).status).toBe(200);
  const archived = await request(app).get('/deleted_code/schedule.html');
  expect(archived.status).toBe(410);
  expect(archived.headers['x-robots-tag']).toContain('noindex');
  expect(archived.text).not.toContain('<script');
});

test.each(['/assets/images/ps4.jpg', '/assets/images/%70s4.jpg'])('sensitive legacy photo is quarantined at %s without deleting it', async (url) => {
  const photoPath = path.join(__dirname, '..', 'public', 'assets', 'images', 'ps4.jpg');
  const before = fs.statSync(photoPath);
  const response = await request(app).get(url);
  expect(response.status).toBe(410);
  expect(response.headers['x-robots-tag']).toContain('noindex');
  expect(response.headers['content-type']).not.toContain('image/');
  const after = fs.statSync(photoPath);
  expect(after.size).toBe(before.size);
  expect(after.mtimeMs).toBe(before.mtimeMs);
});

test('existing public documents download without indexing or automatic inline embedding', async () => {
  const response = await request(app).get('/assets/docs/cv2020-jivko.pdf');
  expect(response.status).toBe(200);
  expect(response.headers['content-type']).toContain('application/pdf');
  expect(response.headers['content-disposition']).toBe('attachment; filename="cv2020-jivko.pdf"');
  expect(response.headers['x-robots-tag']).toContain('noindex');
  expect(response.headers['x-content-type-options']).toBe('nosniff');
});

test.each(['/unknown-route', '/.env', '/server.js', '/assets/../deleted_code/schedule.html', '/assets/%2e%2e/%2e%2e/server.js'])('%s cannot expose source or unknown content', async (url) => {
  const response = await request(app).get(url);
  expect([400, 404, 410]).toContain(response.status);
  expect(response.text).not.toContain("require('express')");
  expect(response.text).not.toContain('dotenv.config');
});

test.each(Object.keys(pages))('GET %s has unique metadata, one main heading and a canonical URL', async (route) => {
  const response = await request(app).get(route);
  expect(response.status).toBe(200);
  expect(response.headers['content-type']).toContain('text/html');
  expect(response.text.match(/<h1\b/g)).toHaveLength(1);
  expect(response.text).toMatch(/<title>[^<]+<\/title>/);
  expect(response.text).toMatch(/<meta\s+name="description"\s+content="[^"]+"/);
  expect(response.text).toContain(`rel="canonical" href="${site.url}${route}"`);
  expect(response.text).not.toContain('climat-bg.com');
});

test.each([
  ['/index.html', '/'], ['/resources.html', '/resources'], ['/contact.html', '/contact'],
  ['/services.html', '/solutions'], ['/about.html', '/about'], ['/operators-agencies', '/operators'],
  ['/buy_sim.html', '/contact#existing-sim'], ['/buy_Dsim.html', '/contact#existing-sim'],
  ['/deleted_code/buy_sim.html', '/contact#existing-sim'], ['/deleted_code/buy_Dsim.html', '/contact#existing-sim'],
  ['/crew_change.html', '/solutions#operations'], ['/deleted_code/crew_change.html', '/solutions#operations'],
  ['/deleted_code/contact.html', '/contact'], ['/deleted_code/privacy_policy.html', '/privacy'],
])('%s permanently redirects to %s', async (from, to) => {
  const response = await request(app).get(from);
  expect(response.status).toBe(301);
  expect(response.headers.location).toBe(to);
});

test('legacy SIM and crew-change redirects lead to existing sections', async () => {
  const contact = await request(app).get('/contact');
  const solutions = await request(app).get('/solutions');
  expect(contact.text).toContain('id="existing-sim"');
  expect(solutions.text).toContain('id="operations"');
});

test('security headers cover pages and use a fresh matching JSON-LD nonce', async () => {
  const first = await request(app).get('/');
  const second = await request(app).get('/');
  const policy = first.headers['content-security-policy'];
  const nonce = policy.match(/'nonce-([^']+)'/)[1];
  expect(policy).toContain("object-src 'none'");
  expect(policy).toContain("form-action 'self'");
  expect(policy).not.toContain("'unsafe-inline'");
  expect(policy).not.toContain("'unsafe-eval'");
  expect(first.text).toContain(`nonce="${nonce}"`);
  expect(second.headers['content-security-policy']).not.toBe(policy);
  expect(first.headers['x-content-type-options']).toBe('nosniff');
  expect(first.headers['referrer-policy']).toBe('same-origin');
  expect(first.headers['permissions-policy']).toContain('camera=()');
  expect(first.headers['x-frame-options']).toBe('DENY');
  expect(first.headers['x-powered-by']).toBeUndefined();
  expect(first.headers['strict-transport-security']).toBeUndefined();
});

test('production enables HSTS without extending it to unverified subdomains', async () => {
  const production = createApp({ NODE_ENV: 'production' });
  const response = await request(production).get('/robots.txt');
  expect(response.headers['strict-transport-security']).toBe('max-age=15552000');
});

test('sitemap only contains meaningful canonical pages; crawlers can see retired-URL status', async () => {
  const sitemap = await request(app).get('/sitemap.xml');
  expect(sitemap.status).toBe(200);
  expect(sitemap.headers['content-type']).toContain('application/xml');
  expect(sitemap.text).toContain(`<loc>${site.url}/resources/esim-before-you-travel</loc>`);
  expect(sitemap.text).not.toMatch(/uploads|deleted_code|localhost|\.html<\/loc>/);
  const robots = await request(app).get('/robots.txt');
  expect(robots.text).toContain(`Sitemap: ${site.url}/sitemap.xml`);
  expect(robots.text).not.toContain('Disallow: /uploads');
});

test('contact GET is not cached and does not create a tracking or session cookie', async () => {
  const response = await request(app).get('/contact');
  expect(response.headers['cache-control']).toBe('no-store');
  expect(response.headers['set-cookie']).toBeUndefined();
});

test('valid inquiry prepares an encoded mailto draft without claiming delivery', async () => {
  const formToken = await contactToken();
  const response = await request(app).post('/contact').type('form').send(validInquiry(formToken));
  expect(response.status).toBe(200);
  expect(response.headers['cache-control']).toBe('no-store');
  expect(response.headers['x-robots-tag']).toContain('noindex');
  expect(response.text).toContain(`mailto:${site.email}?subject=Amicus%20inquiry`);
  expect(response.text).toContain('casey%40example.com');
  expect(response.text).not.toMatch(/inquiry (?:was |has been )?sent|message (?:was |has been )?sent/i);
});

test('invalid contact fields return an accessible error and retain safe values', async () => {
  const formToken = await contactToken();
  const response = await request(app).post('/contact').type('form').send(validInquiry(formToken, { email: 'bad-address', message: '', name: 'Casey <script>alert(1)</script>' }));
  expect(response.status).toBe(400);
  expect(response.text).toContain('Please enter a valid email address.');
  expect(response.text).toContain('Please add a message.');
  expect(response.text).toContain('&lt;script&gt;');
  expect(response.text).not.toContain('<script>alert(1)</script>');
  expect(response.text).not.toContain('?subject=Amicus%20inquiry');
});

test.each([
  ['visitor type', { visitorType: 'Unlisted visitor' }], ['interest', { interest: 'Not a supported selection' }],
  ['long message', { message: 'x'.repeat(2001) }], ['honeypot', { website: 'https://spam.example' }],
  ['email control characters', { email: 'casey@example.com\r\nBcc: other@example.com' }], ['duplicate name', { name: ['First', 'Second'] }],
])('server rejects invalid inquiry: %s', async (reason, invalid) => {
  const formToken = await contactToken();
  const response = await request(app).post('/contact').type('form').send(validInquiry(formToken, invalid));
  expect(response.status).toBe(400);
  expect(response.text).not.toContain('?subject=Amicus%20inquiry');
});

test('missing, tampered and expired form tokens cannot prepare an inquiry', async () => {
  const secret = 'a-shared-testing-secret-with-at-least-32-characters';
  const target = createApp({ NODE_ENV: 'test', CONTACT_FORM_SECRET: secret });
  const signer = createTokens(secret);
  for (const token of ['', (await contactToken(target)) + 'x', signer.issue(Date.now() - 3600001)]) {
    const response = await request(target).post('/contact').type('form').send(validInquiry(token));
    expect(response.status).toBe(403);
    expect(response.text).toContain('This form has expired.');
    expect(response.text).not.toContain('?subject=Amicus%20inquiry');
  }
});

test('cross-origin browser submissions are rejected even with a valid form token', async () => {
  const formToken = await contactToken();
  const response = await request(app).post('/contact').set('Origin', 'https://unrelated.example').type('form').send(validInquiry(formToken));
  expect(response.status).toBe(403);
  expect(response.text).not.toContain('?subject=Amicus%20inquiry');
});

test('oversized inquiry bodies return a bounded, safe error', async () => {
  const response = await request(app).post('/contact').type('form').send({ message: 'x'.repeat(17000) });
  expect(response.status).toBe(413);
  expect(response.text).not.toContain('PayloadTooLargeError');
  expect(response.headers['cache-control']).toBe('no-store');
});

test('server throttles attempts despite forged forwarding headers', async () => {
  const formToken = await contactToken();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await request(app).post('/contact').set('X-Forwarded-For', `198.51.100.${attempt + 1}`).type('form').send(validInquiry(formToken));
    expect(response.status).toBe(200);
  }
  const limited = await request(app).post('/contact').set('X-Forwarded-For', '198.51.100.99').type('form').send(validInquiry(formToken));
  expect(limited.status).toBe(429);
  expect(Number(limited.headers['retry-after'])).toBeGreaterThan(0);
  expect(limited.headers['ratelimit-remaining']).toBe('0');
});

test('proxy trust is opt-in and rejects blanket trust', () => {
  expect(parseTrustProxy()).toBe(false);
  expect(parseTrustProxy('false')).toBe(false);
  expect(parseTrustProxy('1')).toBe(1);
  expect(parseTrustProxy('loopback')).toEqual(['loopback']);
  expect(() => parseTrustProxy('true')).toThrow('TRUST_PROXY');
});
