# Phase 2 production verification

## Deployment follow-up — 2026-09-12

After the owner's VPS pull, restart and environment update, `npm run audit:production -- --phase2` passed **184 checks, with 0 failures and 0 inconclusive results**, at `2026-09-12T04:04:28.805Z`. The local repository revision was `f6b1dea`.

The public responses now verify HSTS, canonical `www` redirects, upload/legacy-content retirement, current sharing-image metadata/dimensions and JPEG availability. The homepage declares the configured analytics script. Script presence does not prove analytics ingestion, and public HTTP checks do not expose or verify private environment secrets, inbox delivery or physical-phone behavior.

An initial run encountered transient network/DNS timeouts; the full rerun passed. No forms, purchases or analytics events were sent by this verification. The latest sanitized machine report is `.qa/production-audit.json`.

A separate direct check also confirmed the deployed corporate JavaScript (2,792 bytes) and CSS (16,140 bytes) match the validated local build byte-for-byte by SHA-256. This rules out stale frontend bundles for those two files.

Next priorities: a real-phone inquiry/copy/email test, analytics and Search Console confirmation, then the two planned Leonardo illustrations. The earlier baseline below is retained as history; its HSTS and hostname failures are resolved in this follow-up.

## Earlier baseline, before the VPS update

Verified **2026-09-11 in America/New_York / 2026-09-12 UTC** using direct, uncached public HTTP requests. The exact timestamp and individual results are saved locally in `.qa/production-audit.json`. This task did not deploy, push, restart PM2, change DNS/Nginx, submit forms, register accounts or send analytics events.

The Phase 1 rebuild is now visible on the live corporate domain. The historical Phase 1 report's observation of the previous application directory no longer describes the current public response.

## Result

**144 checks passed; 14 failed; none remained inconclusive on the final run.** The 14 failures represent two production configuration issues: missing HSTS on 12 public pages and missing canonical redirects for the two `www` entry points. The audit exits with status `1` until these acceptance requirements pass.

| Area | Current public evidence | Result |
| --- | --- | --- |
| Retired upload endpoint | `/upload` returns `410` for GET and HEAD, with `noindex, nofollow` and `no-store`. | Pass |
| Retained upload access | `/uploads/probe.html` returns the same retirement response. The probe is an invented filename; no retained filename was discovered or requested. | Pass for the probe; server configuration still requires review |
| Public file listing | `/files` returns `410`, `noindex, nofollow`, `no-store` for GET and HEAD. | Pass |
| Archived executable page | `/deleted_code/schedule.html` returns `410`, `noindex, nofollow`, `no-store` for GET and HEAD. | Pass |
| Quarantined legacy photograph | The previously identified image URL returns `410`, `noindex, nofollow`, `no-store` for GET and HEAD. Its body was not downloaded or displayed. | Pass |
| Public pages | All 12 registered public pages return `200`; titles/descriptions match the local page registry; canonical and social URLs use the primary HTTPS domain. | Pass |
| Indexing and structured data | Expected indexing controls; valid homepage Organization JSON-LD; robots advertises the sitemap; sitemap contains exactly the 12 indexable public routes. | Pass |
| Application security headers | Restrictive CSP directives, `nosniff`, `DENY`, `same-origin` referrer policy and permissions policy are present. | Pass |
| HSTS | `Strict-Transport-Security` is absent on all 12 corporate pages. | **Fail; pending deployment/configuration correction** |
| HTTP primary hostname | `http://amicusshippingllc.com/seafarers` permanently redirects to the matching primary HTTPS path. | Pass |
| HTTPS `www` hostname | `https://www.amicusshippingllc.com/seafarers` serves `200` on `www` instead of redirecting to the primary hostname. The page still declares the primary canonical URL. | **Fail; duplicate hostname remains reachable** |
| HTTP `www` hostname | HTTP redirects permanently to HTTPS `www`, then serves `200` on `www`. | **Fail; does not reach the primary hostname** |
| Selected assets | Stylesheet, corporate JavaScript, existing hero/sharing photograph, favicon and touch icon all return `200` with expected MIME types. | Pass |
| Current sharing preview | The live homepage still uses the existing photograph. The Phase 2 sharing-card configuration is not live yet. | Pending deployment; recorded as an observation |
| Analytics declaration | The live corporate homepage does not declare the configured Umami script. No analytics event was sent to test collection. | Deployment setting/configuration follow-up |

Public responses establish that the tested dangerous paths are blocked at the edge currently reached by the audit. They do not prove every historical file inaccessible, establish the absence of alternate proxy aliases, or establish the safety of retained content. Private server configuration and storage review remain separate work.

## Production corrections prepared in this repository

The deployment workflow now sets `NODE_ENV=production` explicitly for the PM2 restart. The existing application enables HSTS only in production mode; it also declares Umami only in production unless analytics is explicitly disabled. The simultaneous absence of HSTS and the analytics script is **consistent with a missing production environment setting**, but public HTTP responses do not prove that setting or rule out upstream header handling or an intentional analytics opt-out.

The application now permanently redirects public GET/HEAD requests on `www` to the configured primary HTTPS hostname. This does not change the requirement for a valid `www` TLS certificate: TLS negotiation happens before Express receives an HTTPS request. Rerun the audit after deployment to verify the complete redirect chain through Nginx and the application.

These are repository corrections pending deployment during this Phase 2 task. The live failures above have not been silently described as fixed.

## Customer destination checks

| Journey | Direct result | What this establishes |
| --- | --- | --- |
| [SIM shop](https://sim.amicusshippingllc.com/shop) | `200` with an HTML title. | Public plan-shopping page reachable; no purchase made. |
| [Device/setup help](https://sim.amicusshippingllc.com/help) | `200`; the `installation` anchor exists. | The published help and installation deep link resolve. |
| [Existing SIM account](https://sim.amicusshippingllc.com/account) | `302` to `/login`, then `200`. | The anonymous account path reaches login; authentication and historical balances untested. |
| [SIM support](https://sim.amicusshippingllc.com/support) | `200`; the expected published store-support address is present. | Public support contact continuity; inbox delivery untested. |
| [Crew connectivity inquiry](https://sim.amicusshippingllc.com/crew) | `200`. | Public business inquiry page reachable; no submission or commercial commitment. |
| [Crew registration](https://crew.ship-port.com/register) | `200` on the final full run; JavaScript application shell. | Shell delivery only; app rendering, registration, backend behavior and phone use remain untested. |

Earlier runs reported transient network errors for crew registration, HTTPS `www`, and one upload-retirement probe; subsequent direct checks and the final complete rerun succeeded for those requests. Those temporary environment errors are not evidence of an application outage. The reusable script classifies network/TLS errors as inconclusive rather than inventing an HTTP result.

## Reproduce and interpret

Run from the repository root with the supported Node version; no added dependency or credential is required:

```powershell
node scripts/audit-production.js
```

After deploying Phase 2, opt into the additional release checks:

```powershell
node scripts/audit-production.js --phase2
```

The `--phase2` profile adds assertions on every public page that both Open Graph and Twitter reference the current configured sharing card, and that Open Graph declares its 1200 by 630 dimensions. It also sends a HEAD request to the configured card and requires `200` with a JPEG content type. These additional checks will fail while the card and its metadata are still pending deployment. Without the flag, the baseline profile retains the checks used for the historical 144-pass/14-fail result above. The report records the selected profile; either command refreshes the same local `.qa/production-audit.json` file.

The script uses the configured production origin and a fixed list of reviewed public destinations. Requests carry `Cache-Control: no-cache, no-store`, `Pragma: no-cache` and a per-run cache-busting query parameter. Each request/redirect chain has a 12-second timeout and at most five redirects; body reads stop at 256 KiB; corporate page checks use at most three concurrent requests. Retired responses and asset HEAD responses are cancelled without reading bodies. Redirects are restricted to reviewed origins. No cookies, credentials or external SDKs are used.

The JSON report stores status codes, sanitized public paths, redirect status/path observations, timing, decoded page sizes and assertion results. It never stores page bodies, contact data, response cookies, full security-policy nonces, discovered filenames or redirect queries. It is ignored by Git; this document preserves the reviewed outcome. Exit codes are `0` for acceptance passed, `1` for failed requirements, and `2` for inconclusive checks or an incomplete audit. Do not treat an inconclusive run as successful acceptance.

Exact title/description and sitemap checks compare production to the current local page registry. An intentional local page change awaiting deployment can therefore fail those assertions. The default profile records the live sharing-image observation separately so that an otherwise healthy Phase 1 deployment is not represented as already having Phase 2 media. Use `--phase2` when assessing readiness of the Phase 2 release itself.

The homepage HTML was approximately **12.1 KB decoded** in this run. This single response size and network timing are observations, not a field performance baseline, Lighthouse score or Core Web Vitals measurement. Separate browser and device validation is still required.

## Deployment evidence and remaining checks

The unauthenticated public GitHub Actions API reported a successful [Validate and deploy to VPS run](https://github.com/zhim57/amicuswebsite/actions/runs/34661690858) for commit `5a873b97d322d075484413fa97b45b8b622ac4dd`, created at `2026-09-12T00:27:24Z`. This is supporting workflow metadata; matching live page content and public security behavior are stronger evidence of what visitors receive. A successful workflow alone does not prove the active Node version, correct PM2 environment or absence of proxy bypasses.

Before calling production acceptance complete, deploy the prepared changes, rerun this script, and inspect the actual proxy aliases, active Node version, PM2 environment mode, shared contact-token secret provisioning, proxy trust and direct Node access restrictions. Check the production homepage's analytics declaration against the owner's intended analytics setting. The shared form secret must be verified privately without printing it. Search Console, authenticated analytics, actual inbox delivery, controlled account workflows, historical rewards/SIM fulfillment and physical phone behavior require their own evidence.
