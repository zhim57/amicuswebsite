# Phase 2 implementation report
Date: 2026-09-11 (America/New_York). Starting revision: `5a873b9`.

The Phase 2 repository work improves inquiry completion, existing-customer help, sharing metadata, accessibility and media readiness. It includes two deployment corrections identified by direct live checks. **These Phase 2 changes have not been deployed by this task.** The Leonardo illustrations are intentionally pending; video and music remain deferred.

## Live findings and prepared corrections

Direct uncached HTTP checks confirm Phase 1 is live, including the upload retirement and quarantined-image block. Cached search-tool responses still showed older content, so they were not used as the deployment verdict. The [production audit](phase-2-production-audit.md) recorded 144 passing assertions and 14 failures representing two actual gaps:

- HSTS was missing on all 12 public corporate pages. The workflow now explicitly exports `NODE_ENV=production` before PM2 restarts, enabling the application's existing production headers. Missing production mode is a plausible explanation, not a privately verified VPS setting.
- `www` remained a duplicate public hostname. Express now redirects GET/HEAD requests for that specific hostname to the configured primary HTTPS origin, preserving path/query without trusting an arbitrary redirect host.

The existing HTTPS redirects, tested retired paths and six customer destinations were reachable. The crew tool check proves its public application shell loads, not that registrations succeed. Private Nginx/PM2 settings, a shared form secret, actual proxy trust and direct Node-port exposure still require infrastructure access.

After deploying, run `npm run audit:production -- --phase2`. This additionally checks the new sharing-image URLs, dimensions and JPEG availability. It must not be counted as a production pass before those changes are deployed.

## Customer-facing changes

- Seafarer inquiries carry only the reviewed visitor type and interest into Contact. Operational-tool inquiries preselect the appropriate topic; arbitrary query values and contact details are ignored.
- Company/phone fields are optional and collapsible. Entered values and associated errors remain visible when needed. Form field limits/options now come from the server's shared definitions.
- A prepared draft has an explicit subject, selectable message, Copy action and manual fallback when Clipboard access is unavailable. The original form collapses under “Edit inquiry details” after preparation.
- Form results receive focus below the sticky header. Enlarged-text testing found and fixed a header overflow.
- Seafarers have direct account/support links and three concise expandable answers covering land-based coverage, device checks and activation timing.
- Operators can reach the existing store's dedicated crew eSIM inquiry. The corporate site still does not duplicate checkout, guarantee transport or invent a new fulfillment service.

**Email behavior remains honest:** the visitor must send the email. No server email transport, new database or external message submission was added. The copy action sends no inquiry data to analytics.

## Assets and visual work

The 1200 × 630 sharing card is now produced and wired into Open Graph/Twitter metadata, including size/type/alt information. It is a 58,346-byte JPEG built from the existing vector brand geometry and real site copy, with an editable SVG source. No photograph or generated person was needed.

- Source: `src/brand/social-card.svg`
- Web file: `public/assets/media/amicus-social-card-1200x630.jpg`
- Rebuild command: `npm run render:social` with the documented Playwright browser setup

AS-002/AS-003 remain ready-to-order Leonardo briefs in the [asset manifest](asset-manifest.md). Their supporting-page integration is wired but emits no figure, image request or blank frame until an explicit reviewed registry entry and all approved raster files are present. The checker validates fixed paths, local containment, signatures, byte budgets and accessible metadata. Those checks do not certify image content, dimensions or rights: human review remains part of activation.

No Leonardo/Mureka jobs, purchases or account changes were made. Mureka audio is still reserved for an optional user-started video. Existing photography and private/legacy files remain preserved.

## Measurement definitions

The existing optional Umami service is preserved. Public website IDs are not credentials. Hooks send allowlisted event names and the corporate pathname; they do not send inquiry fields, draft contents, query strings or mailto URLs.

| Event | Meaning | Does not prove |
| --- | --- | --- |
| `buy_esim_click` / `seafarer_cta_click` | Marked purchase/audience action clicked | Purchase or provisioning |
| `shop_visit` | A reviewed store /shop link clicked, including seafarer CTAs | Destination completed loading or conversion |
| `inquiry_start` | A corporate Contact link clicked | Form submitted |
| `operator_inquiry` | Existing marked business-inquiry CTA clicked | Qualified lead or delivery |
| `email_draft_ready` | Validated draft page displayed, if tracker is available | Message sent |
| `contact_submit` / `email_app_open` | Legacy/current email-app handoff click | Email app launch success or inbox delivery |
| `inquiry_copy` | Clipboard write succeeded | User pasted or sent anything |
| `support_visit` / `account_visit` / `business_store_visit` | Marked store support/account/business link clicked | Authenticated action or sent inquiry |
| `crew_tool_click` / `resource_view` | Marked tool/resource link clicked | Tool registration or resource read to completion |

`resource_download` remains an available hook without a new downloadable guide UI. Custom events respect Do Not Track and Global Privacy Control; this is not a claim that every private analytics-server setting was verified. Automatic tracker behavior remains subject to its configuration. Cross-subdomain session stitching was not enabled or claimed; corporate outbound intent can be measured without inventing cross-domain attribution.

A [reproducible local performance snapshot](phase-2-performance.md) records initial requests and timing for three mobile-width pages. It is a local lab comparison, not a field Core Web Vitals score or real-phone measurement.

## Validation and evidence

- `npm run build`: production Webpack build passes without warnings.
- `npm run lint`, `npm run typecheck`: pass; strict `checkJs` includes current browser modules and central data.
- `npm test -- --runInBand`: 104 passing server/media/inquiry/deployment tests.
- `npm run test:browser`: 10 passing Chromium tests, including the 12-page accessibility sweep and 49 viewport/route overflow checks.
- Browser coverage includes safe prefill, clipboard success/denial, no contact-data analytics, pending-media suppression, keyboard FAQs/menu, JavaScript-disabled menu, draft focus/visibility and 200% text enlargement.
- `npm run check:links`: 13 rendered pages and 18 internal destinations pass.
- `npm run check:assets`: existing hero/sharing card pass; two illustration slots explicitly pending.
- `npm audit` and `npm audit --omit=dev`: zero reported vulnerabilities on successful final checks; no dependency packages were added or upgraded in this pass. One full-audit attempt encountered a transient registry DNS failure before the successful retry.
- Production baseline audit intentionally exits nonzero for the two live configuration gaps above.
- Visual review covers the sharing card, homepage, seafarer/operator pages, mobile Contact and the prepared-draft state. Git whitespace checks pass.

All browser form data was synthetic, and no email, account registration or purchase was submitted externally. Tests use a fresh local app on an isolated port and close their server/browser afterward.

## Remaining work

1. Deploy the prepared repository changes, then rerun the Phase 2 production acceptance audit; verify proxy/environment settings privately.
2. Order AS-002/AS-003 when ready, record provenance/permission evidence, and follow [media integration](media-integration.md). The current pages remain complete without them.
3. Verify actual phones, email-client behavior and controlled authenticated customer journeys.
4. Confirm company biography/photo rights and legacy recharge/rewards policies before publishing new claims or migrating customers.
5. Connect owner-authorized Search Console/analytics evidence and establish deployed performance baselines. Choose a real email delivery provider only if that workflow is wanted.
6. Reconsider video/music only when there is a defined explanatory or marketing use.
