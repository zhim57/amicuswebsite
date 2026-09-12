# Phase 2 security audit

Review date: 12 September 2026. Scope: the current Express application, checked-in deployment workflow, local regression tests and repository cleanup. No production deployment, external SMTP message or infrastructure mutation was performed. Earlier Phase 1 behavior remains recorded in [the historical assessment](phase-1-audit.md); [the Phase 2 report](phase-2-report.md) describes this release.

## Findings and remediation

| Priority | Earlier exposure | Current implementation |
| --- | --- | --- |
| P0 | Anonymous multipart uploads accepted HTML/HTM and exposed files on the corporate origin. | No upload middleware, body handler, listing or static upload mount remains. All methods under `/upload`, `/uploads`, `/files`, `/api/upload`, `/api/uploads`, `/api/resources` and `/resources/upload` return 410/noindex before parsing a body. Upload packages are absent from the current dependencies. |
| P0 | The obsolete Resources & Cheatsheets archive preserved upload UI and developer-resource listings. | The archived resource page was deleted. `/resources` renders the curated maritime EJS page from the explicit registry. Only `/assets` is served statically; old resource/upload files cannot win route precedence. The inspected local uploads directory contained no developer cheat sheets to retain. |
| P0 | Old active uploads could be served through a broad public directory or deployment alias. | No root public mount exists. Static access checks reject paths outside the asset directory, any configured legacy `UPLOAD_DIR` within it, and symlinks resolving outside the asset boundary or into upload storage. Remove any obsolete untracked files/static aliases on the deployed VPS during rollout; a git pull alone does not delete untracked uploads. |
| P0 | A legacy SIM photograph contains identifiers/security codes. | `/assets/images/ps4.jpg`, including encoded aliases, remains denied with 410/noindex. The file is not linked by current pages. This audit does not reproduce private values or determine whether historically visible codes remain active. |
| P1 | Duplicate homepage and legacy rewards pages offered obsolete journeys. | The stale `public/index.html`, root `rewards.html` and archived rewards page were deleted; archived SIM pages no longer advertise rewards. Known rewards routes return 410. No balance migration or fulfillment claim is made. |
| P1 | Contact required the visitor to prepare/copy/send an email draft. | A validated inquiry now passes through configured SMTP. Success requires acceptance of the intended recipient. Missing configuration and delivery failure produce a safe 503 with escaped fields and a direct-email fallback. No provider exception reaches the browser. |
| P1 | Earlier pages lacked consistent headers, indexing controls and proxy trust. | CSP/nonces, `nosniff`, same-origin referrers, denied framing and unused device permissions remain enforced. HSTS is production-only. Forwarded addresses are untrusted by default. Sitemap entries derive from the page registry; robots allows retired URLs to be crawled so their 410/noindex status can be observed. |

The original upload extension allowlist included HTML and HTM, not SVG. Its active-content exposure does not by itself prove historical compromise. No exploit or traversal request was made against production in this review.

Known old content URLs redirect only to relevant replacements. SIM/recharge pages lead to `/contact#existing-sim`; both old crew-change URL forms lead to `/solutions/crew-change`. Other archived paths return 410. Unknown URLs return the corporate 404 page. Encoded malformed variants that do not match a retired route remain inaccessible with 404/410 instead of redirecting to the homepage.

The existing `/assets/docs/cv2020-jivko.pdf` remains a direct download. Files under `/assets/docs` receive attachment disposition, `nosniff` and `noindex, nofollow`; they stay outside navigation and sitemap. These headers do not sanitize file contents or make an already public CV private.

## Contact behavior and boundaries

- Required: name, email, interest and message. Visitor type, company and phone/WhatsApp are optional. Reviewed URL defaults accept only exact listed role/topic values; they never copy personal fields.
- Maximum lengths: name 100, email 254, company 140, phone 60, message 2,000, and role/topic 40 characters. Duplicate fields, unsupported controls, malformed/batched email addresses and invalid selections are rejected. Reflected values are EJS-escaped.
- URL-encoded bodies are limited to 16 KB and 20 parameters. GET/POST contact responses are not cached. POST results have noindex. Errors retain bounded safe values; successful delivery clears reflected fields.
- Signed tokens expire after one hour. A stable `CONTACT_FORM_SECRET` of at least 32 characters is needed across workers/restarts to preserve open forms. A token is not authentication or proof of a human visitor. Cross-site Fetch Metadata and mismatched Origin submissions are rejected.
- Honeypot and five-attempt/15-minute limiting run before delivery. The rate-limit map holds at most 10,000 clients and fails closed when full. Shared-IP visitors share a limit; changing IPs can evade a per-IP limit.
- Same-token, same-content concurrent requests share one delivery promise. Successful repeats reuse the accepted result; changed content on a used token receives 409 and a new form. Token/payload hashes and outcomes expire with the one-hour token lifetime; the map is bounded to 10,000 entries.
- Rate limits and deduplication are per Node process. A shared token secret does not share these maps. Multiple workers/restarts require shared abuse and idempotency storage for cross-process guarantees. SMTP cannot generally guarantee exactly-once delivery when an acknowledgement is lost; the workflow performs no automatic resend.
- SMTP uses TLS with certificate validation: required STARTTLS on the default port 587 or implicit TLS on configured port 465. Provider credentials remain server-only. The configured sender and single recipient form a fixed envelope; the validated visitor address becomes a structured Reply-To.
- Inquiry content is plain text, with no HTML message or attachments. Nodemailer file/URL access and SMTP debug logging are disabled. Only allowlisted failure codes enter application logs; no raw exception, SMTP response, request body, address or credential is logged by the contact workflow.
- The app does not persist inquiry text to a database or file. The selected mail provider and receiving mailbox process/store email. Provider acceptance confirms handoff, not inbox placement. Review proxy, mailbox and analytics retention separately.

See [contact delivery](contact-delivery.md) for environment settings, recipient migration and test details. Repository inspection found no configured SMTP infrastructure. A branded corporate inquiry mailbox was not invented; the existing corporate email fallback remains. The separately published eSIM support mailbox is not silently repurposed.

## Deployment configuration

`PORT` retains default `3016`. `UPLOAD_DIR` is a denial boundary for old deployment settings, not an application storage feature. Startup does not create, migrate or serve uploads. User-authorized deletion of obsolete uploaded content is part of rollout; runtime protection does not require preserving it.

The existing GitHub workflow validates before updating `/var/www/amicusshipping` and restarting PM2 process `amicusshippingllc`. It does not provision SMTP, inspect nginx aliases or clean untracked deployed uploads. No reverse-proxy or PM2 topology configuration in this repository proves the production runtime is safe.

Set `NODE_ENV=production` behind working HTTPS. HSTS applies only to the corporate host (`max-age=15552000`), without unverified subdomains. TLS termination and HTTP-to-HTTPS redirects remain reverse-proxy responsibilities.

`TRUST_PROXY` defaults to false. Configure a verified proxy allowlist, such as loopback for a single local proxy, and block public access to the Node port. Numeric hop counts require all routes to have the same topology. Blanket `true` is rejected. Incorrect trust can combine every visitor into one limit or let clients forge addresses.

Provision SMTP and a stable form secret privately. Do not commit values. CSP permits local assets, the configured HTTPS analytics origin and scripts carrying a fresh nonce; it disallows arbitrary inline JavaScript/styles, eval, plugins and frames. Changing external embeds requires review of the policy.

## Remaining operational work

1. Configure a working SMTP provider/authorized sender and verify corporate inquiry recipient ownership. Then perform a controlled owner-approved delivery/reply check, including inbox/spam placement. No live SMTP test was performed here.
2. Deploy the release, remove obsolete deployed untracked uploads and nginx/static aliases, and verify public retired-path responses. Check the actual proxy, Node port exposure, PM2 worker layout and shared secret privately.
3. Review historical access/indexing records and whether previously exposed SIM identifiers need provider remediation. Local cleanup does not erase search caches or establish absence of past compromise.
4. Add shared rate-limit/idempotency storage or appropriate edge controls when using multiple workers or observing abuse. Keep any future authenticated publishing service separate from this public site.
5. Confirm analytics retention, mailbox handling and the accuracy of the privacy notice against the deployed services.

## Verification

`__tests__/server.test.js` checks retired endpoints/methods, multipart rejection without filesystem changes, nested upload storage denial, photo quarantine, document headers, traversal/source protection, route metadata, sitemap/robots, security headers, body limits, validation, tokens/origin and rate limiting. Test fixtures deliberately retain synthetic HTML privately to prove that runtime denies access; this is not an instruction to preserve obsolete production uploads.

`__tests__/contact-phase2.test.js` checks complete local contact submission, SMTP failure/configuration handling, escaped errors, secret-safe logs, delivery acceptance requirements, duplicate concurrency and bounded state. Nodemailer's real stream transport constructs MIME locally; provider acceptance is synthetic in tests and no external email is sent. Browser tests exercise form focus/progress/success with an explicitly injected local handler.

An additional read-only local probe covered 15 encoded, mixed-case, delimiter and traversal paths with GET/POST/PUT/OPTIONS (60 requests). Every variant returned 404/410 with no exposed file or active upload handler. These tests do not prove production reverse-proxy behavior, SMTP deliverability, real-phone behavior or absence of historical compromise. Actual full-suite commands and outcomes belong in [the release report](phase-2-report.md).
