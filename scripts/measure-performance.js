'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const { createApp } = require('../server');

const viewport = { width: 375, height: 812 };
const observationAfterLoadMs = 1500;
const round = value => typeof value === 'number' ? Math.round(value * 100) / 100 : null;

async function measurePage(browser, baseURL, route) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, serviceWorkers: 'block' });
  const responseTasks = [];
  const blockedExternalRequests = [];
  const failedRequests = [];
  const pageErrors = [];
  try {
    // Test mode omits analytics. This additional boundary prevents a future
    // template change from contacting an outside service during a local check.
    await context.route('**/*', requestRoute => {
      const url = new URL(requestRoute.request().url());
      if (url.origin === baseURL) return requestRoute.continue();
      blockedExternalRequests.push(url.origin + url.pathname);
      return requestRoute.abort('blockedbyclient');
    });
    const page = await context.newPage();
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('requestfailed', request => {
      const url = new URL(request.url());
      if (url.origin === baseURL) failedRequests.push({ path: url.pathname, error: request.failure()?.errorText || 'Unknown request error' });
    });
    page.on('response', response => {
      responseTasks.push((async () => {
        await response.finished();
        const headers = await response.allHeaders();
        const length = headers['content-length'];
        return {
          path: new URL(response.url()).pathname,
          resourceType: response.request().resourceType(),
          status: response.status(),
          declaredBodyBytes: typeof length === 'string' && /^\d+$/.test(length) ? Number(length) : null,
          contentEncoding: headers['content-encoding'] || 'identity',
        };
      })());
    });
    await page.addInitScript(() => {
      const state = { lcpMs: null, cls: 0, supported: [], observers: [] };
      window.__amicusPerformance = state;
      if (!window.PerformanceObserver) return;
      state.supported = window.PerformanceObserver.supportedEntryTypes || [];
      if (state.supported.includes('largest-contentful-paint')) {
        const observer = new window.PerformanceObserver(list => {
          for (const entry of list.getEntries()) state.lcpMs = entry.startTime;
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        state.observers.push(observer);
      }
      if (state.supported.includes('layout-shift')) {
        let sessionValue = 0;
        let sessionStart = 0;
        let previousShift = 0;
        const observer = new window.PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.hadRecentInput) continue;
            if (sessionValue > 0 && entry.startTime - previousShift < 1000 && entry.startTime - sessionStart < 5000) {
              sessionValue += entry.value;
            } else {
              sessionValue = entry.value;
              sessionStart = entry.startTime;
            }
            previousShift = entry.startTime;
            state.cls = Math.max(state.cls, sessionValue);
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        state.observers.push(observer);
      }
    });

    const navigation = await page.goto(baseURL + route, { waitUntil: 'load', timeout: 15000 });
    if (!navigation || navigation.status() !== 200) throw new Error(route + ': navigation failed.');
    await page.waitForTimeout(observationAfterLoadMs);
    const timing = await page.evaluate(() => {
      const navigationEntry = window.performance.getEntriesByType('navigation')[0];
      const state = window.__amicusPerformance;
      const values = {
        navigationTtfbMs: navigationEntry?.responseStart ?? null,
        navigationLoadMs: navigationEntry?.loadEventEnd ?? null,
        observedUntilMs: window.performance.now(),
        lcpMs: state?.lcpMs ?? null,
        cls: state?.supported.includes('layout-shift') ? state.cls : null,
        supportedEntryTypes: state?.supported || [],
      };
      state?.observers.forEach(observer => observer.disconnect());
      return values;
    });
    const responses = await Promise.all(responseTasks);
    const result = {
      route,
      responseCount: responses.length,
      resourceCountExcludingDocument: responses.filter(response => response.resourceType !== 'document').length,
      declaredBodyBytes: responses.reduce((total, response) => total + (response.declaredBodyBytes ?? 0), 0),
      responsesWithoutDeclaredLength: responses.filter(response => response.declaredBodyBytes === null).length,
      navigationTtfbMs: round(timing.navigationTtfbMs),
      navigationLoadMs: round(timing.navigationLoadMs),
      lcpMs: round(timing.lcpMs),
      cls: timing.cls === null ? null : Math.round(timing.cls * 100000) / 100000,
      observedUntilMs: round(timing.observedUntilMs),
      observerSupport: {
        lcp: timing.supportedEntryTypes.includes('largest-contentful-paint'),
        cls: timing.supportedEntryTypes.includes('layout-shift'),
      },
      blockedExternalRequests,
      failedRequests,
      pageErrors,
      responses,
    };
    if (failedRequests.length || pageErrors.length || responses.some(response => response.status >= 400)) {
      throw new Error(route + ': page or resource errors prevent a useful measurement.');
    }
    return result;
  } finally {
    await context.close();
  }
}

async function main() {
  let server;
  let browser;
  try {
    server = createApp({ NODE_ENV: 'test' }).listen(0, '127.0.0.1');
    await new Promise((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });
    const baseURL = 'http://127.0.0.1:' + server.address().port;
    // Honors Playwright's existing PLAYWRIGHT_BROWSERS_PATH environment setting.
    browser = await chromium.launch({ channel: 'chromium', headless: true });
    const report = {
      generatedAt: new Date().toISOString(),
      kind: 'Local lab snapshot; not a score or field Core Web Vitals report',
      browser: 'Chromium ' + browser.version(),
      viewport,
      deviceScaleFactor: 1,
      transport: 'Loopback HTTP, Express test mode, no network or CPU throttling',
      cache: 'Fresh browser context per route; no warmed browser cache',
      observationAfterLoadMs,
      byteDefinition: 'Sum of response Content-Length headers, including the HTML document and loaded resources; excludes HTTP headers and is not production wire-transfer size. Missing lengths are counted separately.',
      timingDefinition: 'Navigation responseStart and loadEventEnd in milliseconds since navigation start. LCP is the last buffered candidate; CLS is the maximum shift session during this short initial viewport observation. No scrolling or interactions.',
      limitations: 'One sample per route on this computer. Test mode omits analytics; outside requests are blocked and listed. Browser process and server are reused, while browser contexts are fresh. No mobile hardware, mobile-network, production proxy/compression, field INP or lifetime CLS claims.',
      pages: [],
    };
    for (const route of ['/', '/seafarers', '/contact']) {
      const result = await measurePage(browser, baseURL, route);
      report.pages.push(result);
      console.log(route + ': ' + result.declaredBodyBytes + ' declared body bytes, ' + result.responseCount + ' responses, TTFB ' + result.navigationTtfbMs + ' ms, load ' + result.navigationLoadMs + ' ms, LCP ' + result.lcpMs + ' ms, observed CLS ' + result.cls + '.');
    }
    const outputDirectory = path.join(__dirname, '..', '.qa');
    fs.mkdirSync(outputDirectory, { recursive: true });
    fs.writeFileSync(path.join(outputDirectory, 'performance.json'), JSON.stringify(report, null, 2) + '\n');
    console.log('Wrote .qa/performance.json. Local snapshots only; compare like-for-like and verify production separately.');
  } finally {
    try {
      if (browser) await browser.close();
    } finally {
      if (server?.listening) {
        await new Promise(resolve => {
          server.close(resolve);
          server.closeAllConnections();
        });
      }
    }
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
