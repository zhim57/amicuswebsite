# Phase 2 production verification

Read-only audit: 2026-09-12T13:31:42Z. Command: `npm.cmd run audit:production -- --phase2`. No live files, accounts, DNS, SMTP settings or deployment processes were changed.

## Acceptance result

**191 passed, 38 failed, 7 inconclusive; exit code 1.** The local refinement has not been deployed. Most failed requirements compare the current local registry with the older live site; they are not evidence that the new local implementation fails its tests.

| Check | Observation |
| --- | --- |
| `/resources` | HTTP 200, corporate maritime shell. The alleged old uploader page is no longer the current live route. |
| `/upload`, `/uploads/probe.html`, `/files` | GET/HEAD returned 410 with retirement/indexing controls. No upload or historical content was submitted/read. |
| Archived schedule and sensitive-photo paths | Blocked by the current public response. This does not inspect private disk contents. |
| New Crew Change/inspection landings and vessel-to-home article | 404 live; created and validated locally, awaiting deployment. |
| New page titles/descriptions and sitemap | Live registry differs from local refinements, as expected before deployment. |
| New `/api/upload`, `/resources/upload`, `/rewards.html` retirement checks | Live unknown/retired responses did not yet have the local 410/no-store behavior; one HEAD request timed out. |
| HTTP primary hostname and HTTP `www` | Permanent redirect chains ended at the HTTPS primary hostname and preserved the page path. |
| Direct HTTPS `www` | One network/TLS request was inconclusive; the HTTP `www` redirect chain did successfully traverse the HTTPS host in the same audit. Do not infer a persistent outage from that one request. |
| eSIM account | Redirected to login, final 200. No authentication performed. |
| eSIM support and crew inquiry | 200 with HTML titles; public support address and the business workflow were inspectable. No inquiry was submitted. |
| Crew registration | 200 application shell. No account, invitation or operational workflow was exercised. |
| Petroleum study host | 200, titled HTML study page. No accreditation or question-currency claim follows from reachability. |
| eSIM shop/help | Direct Node probes encountered ENOTFOUND; their status/installation-anchor checks remain inconclusive in the audit. The web-reading service separately retrieved both pages; that is corroborating content evidence, not a replacement for direct deployment acceptance. |

A targeted Node recheck of shop/help/HTTPS-www and the API retirement route also encountered DNS errors. These are recorded under ignored `.qa/public-recheck.json`, without bodies or secrets. No DNS changes or broken-link replacements were made based only on these environment errors. Reviewed public destinations remain [the shop](https://sim.amicusshippingllc.com/shop), [device/setup help](https://sim.amicusshippingllc.com/help), [crew purchasing information](https://sim.amicusshippingllc.com/crew) and their existing account/support routes.

## Repository and server boundary

The configured local upload directory exists and contains no files. Historical repository code used an explicit upload-backed Resources renderer, Multer, a file-list endpoint and public static mounts. Those handlers were already removed before this refinement; the remaining archived uploader and obsolete static homepage have now been deleted.

The actual VPS filesystem, Nginx configuration and complete PM2 worker topology are not available in this repository. Public 410 responses establish only the tested response behavior. They do not prove every historical upload deleted or rule out another reverse-proxy alias. A normal `git pull` cannot delete untracked upload files on the server.

Before release, inspect the real old upload location and any aliases for `/uploads`, `/files`, `/deleted_code` or the repository root. Remove the unwanted developer sheets/active uploads from that public boundary. Keep document/privacy review separate from publishing product screenshots; never expose private crew or activation information.

## Release checks

1. Provision SMTP and the intended recipient according to [contact delivery](contact-delivery.md); use a stable form secret and verified proxy trust. SMTP is currently absent from this checkout.
2. Deploy the validated source and build with the existing VPS/PM2 process. Inspect remote untracked upload storage and reverse-proxy/static aliases.
3. Rerun `npm run audit:production -- --phase2`. The script compares titles, descriptions, canonical/social tags, sitemap, headers and retired paths to the current source. It also checks the current external study host and recognizes both valid slash forms of the Organization URL.
4. Verify a controlled contact send reaches the intended inbox and replies route correctly. Browser/MIME tests use local synthetic acceptance; they are not inbox evidence.
5. Check real phones, Crew Change invitations and eSIM customer workflows separately. Verify intended Umami/cross-subdomain settings and Search Console indexing/removals using authorized service access.

Raw report: ignored `.qa/production-audit.json`. Its bounded probes log statuses, sanitized paths and assertions; they do not persist response bodies, cookies, credentials or inquiry contents. Earlier production-audit outcomes in historical Phase 1 documents describe earlier states and are superseded by this dated observation.
