# Phase 2 local performance snapshot

Captured 2026-09-12T01:12:33.018Z using Chromium 153.0.8010.12 and the final local Phase 2 build. These are single local browser observations for development comparison, not a performance score, a physical-phone result or a field Core Web Vitals assessment.

| Route | Declared body bytes | Responses, including document | Navigation TTFB | Load event | Observed LCP | Observed CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 87,484 | 6 | 17.6 ms | 116 ms | 188 ms | 0 |
| `/seafarers` | 30,281 | 5 | 5.3 ms | 31.5 ms | 92 ms | 0 |
| `/contact` | 29,030 | 5 | 7.6 ms | 75.8 ms | 84 ms | 0 |

All responses were HTTP 200, and all supplied a Content-Length header. There were no failed local requests, page script errors or attempted external requests. Neither pending commissioned illustration was requested. The sharing card is link-preview metadata and was not downloaded as page content.

The shared stylesheet was 16,140 bytes and the corporate script was 2,792 bytes. The homepage's retained photograph was 55,629 bytes. This identifies the existing hero as the largest initial body on the homepage; it does not establish a reason to replace the image or infer mobile-network timing.

## What was measured

`scripts/measure-performance.js` starts its own Express app in test mode on a random loopback port and launches headless Chromium. Each route gets a fresh browser context at 375 by 812 CSS pixels, device scale factor 1, with no network or CPU throttling. This is a narrow desktop-browser viewport, not emulated phone hardware. The browser process and server are reused across the three samples, so later routes can benefit from process/server warmup even though browser contexts are fresh.

Response totals sum the declared Content-Length for the HTML document and resources actually loaded during the observation. They exclude HTTP headers and are not production compressed transfer sizes. The raw report lists absent length headers separately. Counts represent responses, not unique URLs: the same small SVG is loaded for the brand image and favicon. Request routing blocks outside services and disables the browser HTTP cache. Production analytics is omitted by test mode.

Navigation TTFB is Navigation Timing's `responseStart`, and load is `loadEventEnd`, both measured from navigation start. Buffered PerformanceObservers capture the last Largest Contentful Paint candidate and the maximum layout-shift session observed until 1.5 seconds after load. Layout shifts following recent input are excluded; sessions use a maximum five-second window with gaps below one second. These pages were neither scrolled nor interacted with. Zero observed CLS applies only to this short initial viewport interval, and no INP measurement is claimed.

The runner writes `.qa/performance.json`, including per-resource sizes, timings, observer support and errors. This local QA artifact is not published. It closes each browser context, the browser and the HTTP server on completion or failure.

## Reproduce

Build first, then use the same local Chromium installation as the browser suite:

```powershell
npm.cmd run build
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.qa/browsers'
npm.cmd run measure:performance
```

The runner installs nothing and does not require a fixed port or an existing preview process. If Chromium is missing, use the existing browser setup instructions in the README. Each run replaces `.qa/performance.json`; update the dated table above only after inspecting a new report.

Before interpreting timing changes, compare the same build mode, browser, viewport, cache policy and machine conditions. Repeat after approved media is integrated. Production checks must separately account for the VPS, TLS, compression, network latency, analytics, real devices and longer sessions. Establish field metrics after deployment and sufficient real traffic rather than extrapolating them from this snapshot.
