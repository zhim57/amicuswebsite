# Phase 1 security audit

Audit and implementation date: 11 September 2026. Scope: this Express application and its checked-in configuration. Production infrastructure, historical access logs, retained files, and external applications require separate owner/operator review.

## Findings and remediation

| Priority | Evidence in the original repository | Phase 1 result |
| --- | --- | --- |
| P0 | `server.js` accepted anonymous `POST /upload` through Multer. The extension allowlist included `.html` and `.htm`; accepted files were written into `UPLOAD_DIR` and served on the corporate origin at `/uploads`. | The multipart handler is removed. All methods under `/upload`, `/uploads`, and `/files` return 410 with `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store`. No upload body is parsed and no submitted file is written. |
| P0 | `GET /files` enumerated retained filenames to any visitor. There was no authentication, MIME/content validation, malware scanning, submission rate limit, or safe download disposition. | Filename enumeration and public retained-file access are disabled. Files remain on disk for private review. An `UPLOAD_DIR` nested in public assets is explicitly denied, including asset symlinks into that storage. |
| P0 | Visual review identified a legacy SIM photo at `/assets/images/ps4.jpg` containing printed SIM identifiers and security codes. No values are reproduced in this audit. | The resolved asset path, including encoded URL aliases, returns 410/noindex. The original image is preserved on disk and is not used by the current marketing pages. |
| P1 | The original 5 MB limit and filename construction (`Date.now() + '_' + file.originalname`) did not address same-origin active content. Extension checks alone did not establish that bytes were safe. | Anonymous uploads are retired rather than relying on additional extension filters. Reintroducing uploads requires a separate authenticated publishing design. No exploit or traversal test was run against production. |
| P1 | `express.static(public)` exposed archived pages under `public/deleted_code`, including obsolete scripts, inline analytics, and mailto forms. | Static serving is limited to `/assets`; dotfiles and directory indexes are denied. Known old content routes redirect permanently. Remaining `/deleted_code` routes return 410/noindex; source is retained. |
| P1 | The active homepage inquiry form prepared a `mailto:` URL in browser JavaScript. Its six-hour throttle used editable localStorage. No server-side validation or delivery integration existed. | `POST /contact` validates and bounds all fields, enforces category allowlists, checks a honeypot and signed expiring token, and throttles attempts on the server. Success prepares an encoded draft; the visitor must open their email app and send it. No email transport was removed or added. |
| P1 | There were no application security headers or explicit proxy trust policy. | Responses use CSP, fresh nonces for JSON-LD, `nosniff`, same-origin referrers, denied framing and unnecessary device permissions. HSTS is enabled only in production. Forwarded addresses are untrusted by default. |
| P1 | Uploaded documents and duplicate/archived HTML were reachable without indexing controls; no application sitemap or robots policy existed. | Sitemap URLs come from the reviewed page registry. Retired content returns status 410/noindex. Robots allows crawlers to retrieve those statuses; blocking these URLs in robots would prevent crawlers from observing removal. |

The original upload handler used an extension allowlist, not truly unrestricted extension acceptance. SVG was not listed; HTML was. The audit establishes an active-content exposure and missing protections, not a proven compromise or a confirmed path-traversal exploit. No private file contents were needed for this remediation.

Legacy `buy_sim.html` and `buy_Dsim.html` pages contain Square/recharge destinations, so both root-level and `/deleted_code/` versions redirect to `/contact#existing-sim` rather than ending the customer's path. Legacy `crew_change.html` only embeds a VesselFinder map; its two URL forms redirect to `/solutions#operations`. Archived source and checkout URLs remain on disk; this does not certify that old products, prices, or payment destinations remain suitable for current sales.

The existing public `/assets/docs/cv2020-jivko.pdf` is preserved as a direct download. Documents under `/assets/docs` receive attachment disposition, `nosniff`, and `noindex, nofollow`; they are outside the curated sitemap and navigation. Attachment headers discourage inline document rendering but do not sanitize file contents or make previously public information private. Review whether the CV should remain publicly available before linking or promoting it.

## Contact behavior and boundaries

- Required fields: name, email, visitor type, area of interest, message. Company and phone/WhatsApp are optional.
- Maximum lengths are 100 characters for name, 254 for email, 140 for company, 60 for phone, and 2,000 for message. Duplicate field values, invalid selections, and control characters in single-line fields are rejected. EJS must escape all reflected values.
- URL-encoded request bodies are limited to 16 KB and 20 parameters. Invalid submissions preserve bounded field values. Prepared results are sent with `no-store` and `noindex`.
- Signed tokens expire after one hour. `CONTACT_FORM_SECRET` can provide a shared secret of at least 32 characters; otherwise a random process-local secret is generated. Restarting without a persistent secret invalidates open forms. The token proves that this application issued a form; it is not authentication or proof of a human visitor.
- Browser submissions with a cross-site Fetch Metadata value or a mismatched Origin are rejected. The honeypot and five-attempt/15-minute throttle reduce simple automation; they are not an anti-bot guarantee.
- The throttle holds at most 10,000 client entries in process memory, expires them, and fails closed when its map is full. It resets with a process restart and is not shared between processes. Shared-IP users share a limit; changing IPs can evade a per-IP limit. Use an edge/shared-store limiter if traffic warrants it.
- No inquiry is persisted in a database, written to a file, sent to a mail provider, or included in application logs. The server necessarily receives it to validate and render the draft. Review reverse-proxy and analytics logging separately; do not record request bodies or field values there.
- A `mailto:` draft depends on the visitor's email application and its URL-length support. The contact page also exposes the recipient and a copyable plain-text draft. No delivery confirmation is available.

## Deployment configuration

`PORT` keeps its existing default of `3016`. `UPLOAD_DIR` keeps its existing path-resolution behavior and is used to prevent exposure, without creating, deleting, listing, or migrating storage.

Set `NODE_ENV=production` behind working HTTPS. HSTS applies to the corporate host only (`max-age=15552000`), not unverified subdomains. TLS termination and HTTP-to-HTTPS redirects belong to the existing reverse proxy; this repository does not establish that infrastructure configuration.

`TRUST_PROXY` defaults to false. If the VPS forwards all traffic through one local proxy, a verified setting such as `loopback` may be appropriate. A numeric hop count (for example `1`) is supported only when all routes have that fixed proxy topology and direct public access to the Node port is blocked. Comma-separated trusted addresses/CIDRs are also supported. Blanket `true` is rejected. A wrong setting can make all visitors share one limit or let clients forge their address.

Set a long random `CONTACT_FORM_SECRET` through deployment secrets when running multiple workers or preserving open forms across restarts. Do not commit its value. A shared secret does not make the in-memory rate limiter shared.

CSP permits local assets, the configured HTTPS analytics origin, and nonce-authorized scripts. It does not permit arbitrary inline JavaScript, inline style, `eval`, plugins, or framed pages. Local JSON-LD scripts must carry the response nonce. Any future third-party embed needs a deliberate policy review.

## Remaining operational work

1. Verify the live reverse proxy does not directly serve `/uploads`, `/files`, archived HTML, or the repository root and thereby bypass Express. The repository contains no reverse-proxy configuration proving this. Check 410 responses on the production hostname after deployment.
2. Review retained uploaded files and the quarantined legacy SIM photo privately, access logs, and the origin's indexing history. Determine whether any identifiers or security codes shown in the historical photo remain active and need provider remediation. Preserve evidence and backups before any cleanup; Phase 1 does not delete them or claim to remove prior search-engine caches.
3. Validate the proxy trust setting, HTTPS redirect, production HSTS, and secret provisioning against the actual VPS/PM2 topology.
4. Use a shared rate-limit store or edge protection if deploying multiple instances or observing abuse. Keep authenticated administrative publishing separate from the public corporate application.
5. Confirm analytics configuration, retention, and contact mailbox ownership. This change preserves the existing recipient and configured analytics destination without asserting their operational availability or delivery.

## Verification

`__tests__/server.test.js` covers retired upload methods and filesystem preservation, retained HTML access, an `UPLOAD_DIR` inside assets, sensitive-photo quarantine including encoded URLs, archived routes, public-document attachment/noindex headers, path traversal/source exposure, meaningful pages and canonical URLs, redirects and their destination sections, sitemap/robots, security headers/nonces, production HSTS, valid mailto preparation, invalid/oversized/duplicate fields, control-character injection, honeypots, missing/tampered/expired tokens, cross-origin posts, and rate limiting despite forged forwarding headers. These are local application tests; they do not prove production proxy behavior, email-app behavior, or absence of a historical compromise.
