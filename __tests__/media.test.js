'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const ejs = require('ejs');
const { getMedia, MEDIA_SIZES, validateMedia } = require('../src/media');

let tempDirectory;
let mediaDirectory;
const base = 'amicus-crew-ashore-connectivity';
const files = [480, 800, 1200].map(width => base + '-' + width + '.webp').concat(base + '-1200.jpg');
const partial = fs.readFileSync(path.join(__dirname, '..', 'views', 'partials', 'media.ejs'), 'utf8');

function candidate(overrides = {}) {
  return {
    src: '/assets/media/' + base + '-1200.jpg',
    srcSet: [480, 800, 1200].map(width => '/assets/media/' + base + '-' + width + '.webp ' + width + 'w').join(', '),
    width: 1200,
    height: 900,
    alt: 'Illustration of a maritime traveler checking a phone in a shoreside terminal.',
    caption: 'Illustrative image',
    sizes: MEDIA_SIZES,
    ...overrides,
  };
}

beforeAll(() => {
  tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'amicus-media-test-'));
  mediaDirectory = path.join(tempDirectory, 'media');
  fs.mkdirSync(mediaDirectory);
});

beforeEach(() => {
  for (const file of files) {
    // Signature-only fixtures exercise the delivery guard, not an image decoder.
    fs.writeFileSync(path.join(mediaDirectory, file), file.endsWith('.jpg') ? Buffer.from([0xff, 0xd8, 0xff, 0xd9]) : Buffer.from('RIFF0000WEBPVP8 '));
  }
});

afterAll(() => {
  if (path.dirname(tempDirectory) !== path.resolve(os.tmpdir()) || !path.basename(tempDirectory).startsWith('amicus-media-test-')) {
    throw new Error('Refusing cleanup outside the media test temporary directory.');
  }
  fs.rmSync(tempDirectory, { recursive: true, force: true });
});

test('pending media produces no broken image or empty frame even when files have arrived', () => {
  expect(getMedia('constructor')).toBeNull();
  const result = validateMedia('crewConnectivity', null, { mediaRoot: mediaDirectory });
  expect(result).toEqual({ media: null, pending: true, errors: [] });
  expect(ejs.render(partial, { media: result.media }).trim()).toBe('');
});

test('complete reviewed media renders accessible responsive markup and escaped descriptions', () => {
  const result = validateMedia('crewConnectivity', candidate({ alt: 'Illustration of a traveler <checking> a phone.' }), { mediaRoot: mediaDirectory });
  expect(result.errors).toEqual([]);
  const html = ejs.render(partial, { media: result.media });
  expect(html).toContain('<picture>');
  expect(html).toContain('type="image/webp"');
  expect(html).toContain('480.webp 480w, ');
  expect(html).toContain('1200.webp 1200w');
  expect(html).toContain('width="1200" height="900"');
  expect(html).toContain('alt="Illustration of a traveler &lt;checking&gt; a phone."');
  expect(html).toContain('loading="lazy" decoding="async"');
  expect(html).toContain('<figcaption>Illustrative image</figcaption>');
});

test.each([
  { src: 'https://example.com/image.jpg' },
  { src: '/assets/media/../images/ps4.jpg' },
  { src: '/assets/media/%2e%2e/images/ps4.jpg' },
  { src: '/assets/media/' + base + '-1200.svg' },
  { src: '/assets/media/' + base + '-1200.jpg?other=1' },
  { srcSet: 'https://example.com/image.webp 480w' },
  { caption: '' },
  { alt: '' },
  { width: 0 },
  { height: 800 },
  { sizes: '' },
])('unapproved URLs, types and incomplete accessible metadata fail closed: %j', changes => {
  const result = validateMedia('crewConnectivity', candidate(changes), { mediaRoot: mediaDirectory });
  expect(result.media).toBeNull();
  expect(result.pending).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);
});

test('one missing derivative suppresses the entire figure', () => {
  fs.unlinkSync(path.join(mediaDirectory, files[1]));
  const result = validateMedia('crewConnectivity', candidate(), { mediaRoot: mediaDirectory });
  expect(result.media).toBeNull();
  expect(result.errors).toContain(files[1] + ': file is missing or unreadable.');
  expect(ejs.render(partial, { media: result.media }).trim()).toBe('');
});

test('an active document renamed as a raster file cannot activate a figure', () => {
  fs.writeFileSync(path.join(mediaDirectory, files[0]), '<html><script>alert(1)</script></html>');
  const result = validateMedia('crewConnectivity', candidate(), { mediaRoot: mediaDirectory });
  expect(result.media).toBeNull();
  expect(result.errors).toContain(files[0] + ': content does not match its raster file type.');
});

test('oversized media fails the delivery check', () => {
  fs.writeFileSync(path.join(mediaDirectory, files[0]), Buffer.alloc(50001));
  const result = validateMedia('crewConnectivity', candidate(), { mediaRoot: mediaDirectory });
  expect(result.media).toBeNull();
  expect(result.errors[0]).toContain('exceeds the delivery budget');
});

test('a directory junction cannot redirect the media root outside its configured location', () => {
  const linkedDirectory = path.join(tempDirectory, 'linked-media');
  fs.symlinkSync(mediaDirectory, linkedDirectory, 'junction');
  const result = validateMedia('crewConnectivity', candidate(), { mediaRoot: linkedDirectory });
  expect(result.media).toBeNull();
  expect(result.errors).toHaveLength(4);
  expect(result.errors.every(error => error.includes('must be a regular file within public/assets/media'))).toBe(true);
});
