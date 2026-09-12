# Phase 2 local performance snapshot

Captured 2026-09-12T13:45:48.438Z using Chromium 153.0.8010.12. These are single local Chromium observations at 375 by 812 pixels, not a Lighthouse score, physical-phone result or field Core Web Vitals assessment.

| Route | Declared body bytes | Responses incl. document | TTFB | Load event | Observed LCP | Observed CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 88,220 | 6 | 108.4 ms | 567.9 ms | 780 ms | 0 |
| `/seafarers` | 30,784 | 5 | 29.8 ms | 421.5 ms | 528 ms | 0 |
| `/operators` | 30,466 | 5 | 34.9 ms | 424 ms | 656 ms | 0 |
| `/about` | 98,936 | 6 | 38.9 ms | 395.9 ms | 532 ms | 0 |
| `/solutions/crew-change` | 29,748 | 5 | 38.1 ms | 456.8 ms | 604 ms | 0 |
| `/resources` | 30,668 | 5 | 29.9 ms | 395.6 ms | 488 ms | 0 |
| `/contact` | 29,754 | 5 | 35.8 ms | 419.3 ms | 484 ms | 0 |

All measured local responses were successful; no failed local requests or page errors were recorded. No outside requests were made. The corporate app used its actual unconfigured contact state for that route, including the direct-email notice. No inquiry was submitted.

The final shared stylesheet is 16281 bytes and corporate JavaScript is 2501 bytes before transfer compression. The retained homepage image is 55,629 bytes. The founder portrait was proportionally resized from 655,397 to 68,416 bytes (680 by 808 JPEG, quality 85), keeping the original file and appearance. The sharing card is metadata and is not downloaded as page content. Pending illustrative media is not requested.

## Method and limits

Command: `npm.cmd run measure:performance` with `PLAYWRIGHT_BROWSERS_PATH` set to `.qa/browsers`. The script owns a loopback Express server, uses a fresh browser context per route, blocks outside requests and observes 1.5 seconds after load. It records response Content-Length totals including HTML; this excludes headers and is not compressed production transfer size. The final resource-category spacing is included.

No CPU/network throttling, physical mobile hardware or production proxy/CDN configuration was measured. LCP is the last initial buffered candidate and CLS is the largest observed initial shift session; neither measures the full user visit. Loopback timing varies with machine load and is useful only for like-for-like development checks. Field INP and real mobile connectivity are unmeasured.

## Retained performance choices

- Server-rendered pages and system fonts; no framework rewrite or added font requests.
- Eager, explicitly sized hero; lazy, explicitly sized founder portrait.
- Approximately 2.44 KiB of corporate JavaScript; legacy utility bundles are not loaded on corporate pages.
- Existing production-only analytics configuration retained. It is absent from these test-mode measurements.
- No autoplay media, decorative image-per-card loading or unapproved placeholders.

Raw measurement details are in ignored `.qa/performance.json`. Run production/mobile lab and field checks after release; these local numbers do not establish real-world loading speed.
