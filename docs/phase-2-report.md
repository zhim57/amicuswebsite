# Amicus Shipping LLC — Phase 2 refinement report

> Follow-up: deployment and live email delivery are now verified. See [current release status](release-status.md). The dated implementation report below preserves the original handoff and test baseline; its pending deployment/SMTP entries are superseded.

Completed locally: September 12, 2026. This report supersedes the earlier Phase 2 draft-workflow/media handoff. The existing Express/EJS/Sass website and visual system are retained. No production deployment, DNS change, mailbox creation, external email, registration or purchase was performed during that initial implementation.

## 1. Phase 2 summary

Amicus now presents a documented maritime background and clear product paths: eSIM purchases first, crew connectivity for businesses second, then coordination tools and maritime knowledge. The homepage remains a concise company introduction; the founder story belongs on About. Corporate Seafarers explains the vessel-to-home journey while prices, coverage, device checks and checkout stay in the dedicated store.

Contact is a real server submission: validate, send through SMTP, confirm only after the configured recipient is accepted. The repository contains no SMTP configuration, so production sending needs the settings in [contact-delivery.md](contact-delivery.md). An unconfigured site displays a direct-email notice and safely rejects sending rather than reporting false success.

## 2. Legacy cleanup and actual Resources cause

Deleted these obsolete files:

- `public/deleted_code/resources.html`: the archived upload form, file listing and upload/list JavaScript.
- `public/deleted_code/rewards_program.html`: obsolete Rewards promotion.
- `rewards.html`: unused standalone Rewards stub.
- `public/index.html`: obsolete static homepage with a competing legacy phone-compatibility link.

Removed Rewards links from the retained `public/deleted_code/buy_sim.html` and `buy_Dsim.html`. Those private archive payment records and unrelated scheduling source were preserved because their business function was not proven obsolete. They are not served as static pages or advertised. Current support remains available for existing SIM/recharge customers; no rewards-balance migration is promised.

The repository and configured local upload directory were inspected, including ignored files. The directory is empty: **zero cheat-sheet files and zero active-content uploads were present locally to delete**. There is no database/resource seed system. No fictional deletion inventory is claimed.

Historical server code (`2652ec3` and `b9be5e7`) explicitly routed `/resources` to a template populated with `fs.readdir(uploadDir)`, registered Multer, served `/uploads` and the whole public directory, and exposed `/files`. The current checkout had already replaced that handler and removed Multer. Live `/resources` also returned the corporate shell, so the alleged Phase 1 route-ordering failure is **not currently reproducible**. The remaining local cause of possible resurfacing was archived uploader/static homepage source; it has now been removed. The server's page registry is authoritative.

All methods on `/upload`, `/uploads`, `/files`, `/api/upload`, `/api/uploads`, `/api/resources` and `/resources/upload` return 410 before body parsing. Old Rewards routes also return 410. Existing Resources-page aliases redirect 301 to `/resources`; unknown unrelated URLs remain 404. Every old filename under `/uploads` is covered without enumerating or redirecting cheat sheets to the homepage.

## 3. Credibility changes

About identifies founder Jivko Atanassov and uses the existing 2020 CV for ship-agent work, a marine-superintendent role, petroleum inspection, cargo/bunker survey background, crew/spares arrangements and spreadsheet-based document improvements. Historical IFIA certification is described as professional history, without claiming a current certification, company accreditation or unsupported ASBA credential. No precise experience total, testimonial, partner logo, customer count or incorporation date was invented.

The existing named portrait is used, resized proportionally from 655,397 to 68,416 bytes. No generated likeness or compositional change was made. The homepage adds specific ship-agency/inspection experience and a clear founder link. Detailed evidence and its boundaries are in [content-evidence.md](content-evidence.md).

## 4. Commercial and product changes

- **Operators:** before departure, multi-country transit, shore time and repeat rotations; a segmented “Discuss Crew Connectivity” CTA. The documented current purchasing path is individual discount-code batches followed by each crew member's purchase and setup. Centralized payment, invoicing and alternative distribution invite discussion; no fleet dashboard is claimed. Source: [current Amicus crew ordering information](https://sim.amicusshippingllc.com/crew).
- **Seafarers:** covers joining, travelling, sign-off, support, coordination and resources. The dedicated eSIM store owns purchase intent and product details. Cellular service is explicitly distinguished from onboard satellite connectivity.
- **Contact:** required name, email, interest and message; optional visitor type, company and phone/WhatsApp. Browser success/failure states, preserved invalid fields, optional field expansion, keyboard focus and ordinary HTML submission without JavaScript. Yahoo remains a centralized corporate fallback because no corporate inquiry mailbox was configured; the store's published branded support address remains the store-support path.
- **Crew Change:** new `/solutions/crew-change` explains the problem, supported trip/participant/journey/message capabilities, audiences and four steps before launching registration. Features were checked against current adjacent application source, not inferred from a registration shell. Live operational readiness remains separate. No fake screenshots were added.
- **Inspection:** new `/solutions/inspection` explains petroleum question practice and independent-study limitations. Raw Heroku branding is replaced by a clear Amicus landing and named launch action; the working underlying host remains unchanged.
- **Hierarchy/navigation:** eSIM and B2B connectivity lead; tools and resources follow. All store links use the same tab. External Crew Change/inspection launches use a separate tab with appropriate rel attributes and an accessible notice.

## 5. Resources, SEO and indexing

Four concise articles cover a three-airport crew change, phone/eSIM preparation, vessel-to-home connection changes, and choosing crew/inspection tools. All three existing article slugs remain; `/resources/vessel-to-home-connectivity` is added. Only three populated categories appear. Technical statements link to authoritative Apple, Samsung, FCC, Inmarsat or TIC Council sources; see [resource-evidence.md](resource-evidence.md).

Unique page titles/descriptions distinguish company, audience and product intent. Organization data adds legal name, founder, stable identity and the supported product-company link. About adds modest Person data. Articles add author, headline, canonical identity and actual modification date; breadcrumbs include product parents. JSON syntax and relevant identities are verified by tests.

The sitemap automatically includes all 15 current public routes and excludes retired uploads/Rewards. Robots lets crawlers see 410/noindex responses. Known equivalent aliases use 301, including historical Crew Change URLs to its new landing; unknown pages use 404. Existing restrictive headers and canonical-host redirect remain. `/favicon.ico` now permanently redirects to the declared valid SVG icon; touch icon and sharing JPEG are checked.

## 6. Security, analytics and performance

Upload middleware/storage/listing is absent; public serving is restricted to assets with path, realpath, legacy-upload and sensitive-photo denial checks. Removed archived source cannot revive the uploader. No upload dependency remains. SMTP uses TLS, certificate checking, a fixed envelope/sender, structured Reply-To and plain text. File/URL attachments and SMTP debug logging are disabled.

Contact retains body-size/field limits, allowlisted choices, signed expiring tokens, origin checks, honeypot and five-attempt/15-minute rate limiting. Concurrent repeats share one in-flight send; errors expose only generic text while logs record an allowlisted code. Rate limits and duplicate suppression remain per process; a cluster needs shared state for cross-worker guarantees. SMTP acceptance is not proof of inbox placement, and a lost SMTP acknowledgement can make a deliberate retry duplicate mail.

Existing Umami hooks distinguish `buy_esim_click`, `operator_inquiry`, `contact_submit`, `crew_change_click`, `resource_view` and `resource_cta_click`. Contact success records acceptance, not a draft; resource views are article loads. Events contain only an allowlisted name and pathname. No new tracker or analytics identifier was introduced; existing cross-subdomain/account configuration was not changed.

The built corporate script is about 2.44 KiB and CSS about 15.9 KiB before transfer compression. System fonts, an eager dimensioned 55.6 KB hero, lazy dimensioned founder portrait and no extra third-party scripts keep pages small. Seven local lab observations had zero observed initial CLS; these are not field Core Web Vitals or real mobile-network claims. See [performance evidence](phase-2-performance.md).

## 7. External infrastructure still requiring action

1. Configure real SMTP host/sender/credentials and the intended recipient; verify inbox/spam placement and reply routing with a controlled live inquiry. Create a branded corporate mailbox if desired, then update configuration. Never publish a nonexistent mailbox.
2. Deploy the validated source/build through the existing VPS/PM2 workflow. Inspect actual reverse-proxy aliases and privately remove or quarantine any obsolete upload files remaining on that server. **Git deployment does not delete untracked VPS uploads.** Local emptiness and public 410 probes do not prove remote storage is empty.
3. Verify trusted-proxy topology, Node access restrictions, shared form secret and worker layout. Confirm hostname TLS/canonical behavior, CDN response handling and Search Console removal after deployment.
4. For `crew.amicusshippingllc.com` and `inspection.amicusshippingllc.com` (or `training`), configure DNS, TLS and the actual application/custom-domain routing before changing links. No imaginary hostnames were published.
5. Verify real Crew Change invitations/onboarding and eSIM customer paths on phones. Public HTTP 200 proves page/shell delivery, not purchase, registration, provisioning or operation completion.

The read-only production audit returned 191 passing checks, 38 failures and 7 inconclusive checks. Most failures reflect the new pages/metadata not being deployed; network failures remain explicitly inconclusive. Existing upload probes were 410 and corporate Resources was 200. Details: [production audit](phase-2-production-audit.md).

## 8. Tests run and actual outcomes

Environment: Windows PowerShell, Node 24.19.0; CI remains Node 22. The browser test server injects synthetic acceptance locally, and Nodemailer's real MIME generation is tested without sending external email.

| Command | Final outcome |
| --- | --- |
| `npm.cmd install nodemailer --cache .npm` | Installed maintained SMTP transport; audit reported zero vulnerabilities |
| `npm.cmd ci --cache .npm` | Passed; lockfile installs cleanly. Default cache initially lacked write permission, resolved with workspace cache |
| `npm.cmd run lint` | Passed |
| `npm.cmd run typecheck` | Passed |
| `npm.cmd test -- --runInBand` | **153 tests passed**, five suites |
| `npm.cmd run build` | Production Webpack build passed |
| `npm.cmd run check:links` | 16 rendered pages including 404; 22 internal pages/assets; no broken destinations |
| `npm.cmd run check:assets` | Three served images checked; two optional illustration slots remain unused |
| `npm.cmd run test:browser` with workspace Playwright browser path | **11 tests passed**; all 15 pages checked with axe; 105 viewport checks at 320/375/390/430/768/1024/1440; keyboard, no-JS contact, error focus, metadata/link behavior, 200% text and screenshots |
| `npm.cmd audit --json --cache .npm` | **0 reported vulnerabilities** |
| `npm.cmd run measure:performance` | Seven successful local Chromium observations; no local failed requests, script errors or initial observed CLS |
| `npm.cmd run audit:production -- --phase2` | Exit 1: 191 pass / 38 fail / 7 inconclusive; not a deployment acceptance pass |
| `git diff --check` | Passed |

An initial browser run exposed two test issues: the new descendant navigation uses valid `aria-current="location"`, and Playwright's click-stability check stalled during a no-JS mobile scroll. The expected aria state was corrected and the no-JS workflow was verified through keyboard activation. The subsequent complete browser run passed. No failing implementation check is represented as passed.

After tightening spacing between resource categories, the three affected route/accessibility, viewport and screenshot tests also passed again. Lint, typecheck, build and the expanded three-image asset check passed on that final layout.

Manual screenshots were reviewed as a first-time visitor, seafarer on a phone, crew manager and maritime professional. The company purpose and buy action are prominent, B2B workflow/CTA explicit, existing visual continuity intact, and product launches follow explanations. Optional illustration slots produce neither missing images nor empty frames.

## 9. Important files changed

- `server.js`, `src/server/contact.js`, new `src/server/mail.js`: routing, retirement and actual contact delivery.
- `src/site-data.js`, new `src/resources.js`: destinations, hierarchy, metadata and sourced guides.
- `views/`: homepage, audiences, About, Contact, Resources/articles, legal wording, shared shell and two new product landings.
- `src/js/`, `src/scss/style.scss`, built stylesheet and founder image: interaction, conversion events and restrained layout/performance work.
- `package.json`, lockfile, `.env.example`: SMTP dependency and deployment configuration.
- `__tests__/`, `browser-tests/`, `scripts/`: delivery/security/route checks, browser validation, asset/performance and public audit coverage.
- Removed archive files listed above; current README, evidence and operational documentation updated.

## 10. Highest-value Phase 3

1. Finish SMTP and production rollout acceptance, including remote upload storage and proxy inspection.
2. Confirm and exercise the B2B payment/code-distribution process and a real Crew Change demo; capture approved product screenshots from that demo.
3. Use deployed inquiry/store events and Search Console to prioritize customer friction and maritime article topics. Validate physical phones before adding more features or decoration.

## Information worth getting from the owner

- The intended corporate inquiry mailbox and mail-provider setup.
- An updated career record/current credentials if precise dates or certifications should be published, plus a newer professional portrait and recommendations cleared for website use.
- Confirmed company payment/invoicing/distribution arrangements beyond individual crew discount codes.
- Which production Crew Change workflows are ready for customer onboarding, and a controlled demo journey for authentic screenshots.
