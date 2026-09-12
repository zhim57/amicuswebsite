'use strict';

const fs = require('fs');
const path = require('path');
const { approvedMedia, isRaster, slots, validateMedia } = require('../src/media');

function main() {
  const errors = [];
  let pending = 0;
  let approved = 0;
  for (const [key, slot] of Object.entries(slots)) {
    const result = validateMedia(key, approvedMedia[key]);
    if (result.pending) {
      pending++;
      console.log(slot.id + ': pending; page keeps its complete text fallback.');
    } else if (result.media) {
      approved++;
      console.log(slot.id + ': approved registry and all four raster files checked.');
    }
    errors.push(...result.errors.map(error => slot.id + ': ' + error));
  }

  const existing = [
    { name: 'Homepage hero', file: 'public/assets/images/cs1.jpg', maxBytes: 60000 },
    { name: 'Corporate sharing card', file: 'public/assets/media/amicus-social-card-1200x630.jpg', maxBytes: 180000 },
  ];
  for (const asset of existing) {
    try {
      const content = fs.readFileSync(path.join(__dirname, '..', asset.file));
      if (!isRaster(content, '.jpg')) errors.push(asset.name + ': expected a JPEG file.');
      if (content.length > asset.maxBytes) errors.push(asset.name + ': exceeds ' + asset.maxBytes + ' bytes.');
    } catch {
      errors.push(asset.name + ': file is missing or unreadable.');
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('Assets checked: 2 existing images, ' + approved + ' approved illustration slots, ' + pending + ' pending. Human content, rights and crop review remains required for new deliveries.');
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { main };
