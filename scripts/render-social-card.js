'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
async function main() {
  const source = fs.readFileSync(path.join(__dirname, '../src/brand/social-card.svg'), 'utf8');
  const destination = path.join(__dirname, '../public/assets/media/amicus-social-card-1200x630.jpg');
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const browser = await chromium.launch({ channel: 'chromium', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await page.setContent('<style>body{margin:0}svg{display:block}</style>' + source);
    await page.screenshot({ path: destination, type: 'jpeg', quality: 90 });
    console.log('Rendered 1200 x 630 corporate sharing card: ' + fs.statSync(destination).size + ' bytes.');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
