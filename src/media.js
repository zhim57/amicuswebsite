'use strict';

const fs = require('fs');
const path = require('path');

const MEDIA_ROOT = path.join(__dirname, '..', 'public', 'assets', 'media');
const MEDIA_URL = '/assets/media/';
const MEDIA_SIZES = '(max-width: 760px) calc(100vw - 36px), (max-width: 1160px) 45vw, 520px';
const slots = Object.freeze({
  crewConnectivity: { id: 'AS-002', base: 'amicus-crew-ashore-connectivity' },
  operations: { id: 'AS-003', base: 'amicus-port-call-preparation' },
});

// Edit only after the review in docs/media-integration.md. File presence alone
// never activates an image. Keep candidates, masters and evidence outside public.
const approvedMedia = Object.freeze({
  crewConnectivity: null,
  operations: null,
});

function isRaster(buffer, extension) {
  if (extension === '.jpg') {
    return buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  return extension === '.webp' && buffer.length >= 16 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP' &&
    ['VP8 ', 'VP8L', 'VP8X'].includes(buffer.toString('ascii', 12, 16));
}

// The filenames below are fixed per slot; input cannot select a remote URL,
// SVG, legacy photograph, arbitrary path or symlink outside this directory.
function validateMedia(key, candidate, { mediaRoot = MEDIA_ROOT } = {}) {
  const errors = [];
  const slot = Object.hasOwn(slots, key) ? slots[key] : null;
  if (!slot) return { media: null, pending: false, errors: ['Unknown media slot.'] };
  if (candidate === null) return { media: null, pending: true, errors };
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return { media: null, pending: false, errors: ['Approved media must be a complete object or null.'] };
  }

  const files = [
    { name: slot.base + '-480.webp', maxBytes: 50000 },
    { name: slot.base + '-800.webp', maxBytes: 85000 },
    { name: slot.base + '-1200.webp', maxBytes: 140000 },
    { name: slot.base + '-1200.jpg', maxBytes: 140000 },
  ];
  const expectedSrc = MEDIA_URL + files[3].name;
  const expectedSrcSet = files.slice(0, 3).map((file, index) => MEDIA_URL + file.name + ' ' + [480, 800, 1200][index] + 'w').join(', ');
  if (candidate.src !== expectedSrc) errors.push('JPEG fallback must use the approved slot filename.');
  if (candidate.srcSet !== expectedSrcSet) errors.push('WebP srcSet must include the three approved slot filenames and widths.');
  if (candidate.width !== 1200 || candidate.height !== 900) errors.push('The image must declare the reviewed 1200 by 900 aspect ratio.');
  if (typeof candidate.alt !== 'string' || candidate.alt.trim().length < 10 || candidate.alt.length > 300) errors.push('Provide a concise, meaningful alt description (10-300 characters).');
  if (candidate.caption !== 'Illustrative image') errors.push('Generated illustrations require the visible caption "Illustrative image".');
  if (candidate.sizes !== MEDIA_SIZES) errors.push('Use MEDIA_SIZES to match the supporting-page layout.');
  if (errors.length) return { media: null, pending: false, errors };

  for (const file of files) {
    const absoluteFile = path.resolve(mediaRoot, file.name);
    try {
      const stat = fs.lstatSync(absoluteFile);
      if (!stat.isFile() || stat.isSymbolicLink() || path.dirname(fs.realpathSync(absoluteFile)) !== path.resolve(mediaRoot)) {
        errors.push(file.name + ': must be a regular file within public/assets/media.');
        continue;
      }
      if (stat.size < 1 || stat.size > file.maxBytes) {
        errors.push(file.name + ': exceeds the delivery budget or is empty (' + file.maxBytes + ' bytes maximum).');
        continue;
      }
      if (!isRaster(fs.readFileSync(absoluteFile), path.extname(file.name))) errors.push(file.name + ': content does not match its raster file type.');
    } catch {
      errors.push(file.name + ': file is missing or unreadable.');
    }
  }

  return {
    pending: false,
    errors,
    media: errors.length ? null : Object.freeze({
      src: candidate.src, srcSet: candidate.srcSet, width: candidate.width,
      height: candidate.height, alt: candidate.alt.trim(), caption: candidate.caption, sizes: candidate.sizes,
    }),
  };
}

function getMedia(key) {
  return validateMedia(key, Object.hasOwn(approvedMedia, key) ? approvedMedia[key] : undefined).media;
}

module.exports = { approvedMedia, getMedia, isRaster, MEDIA_ROOT, MEDIA_SIZES, slots, validateMedia };
