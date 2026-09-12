# Amicus Shipping LLC corporate website

The corporate site at <https://amicusshippingllc.com> introduces crew connectivity, crew-change tools and maritime resources. Purchases remain in the [dedicated eSIM store](https://sim.amicusshippingllc.com/shop); the parent site does not implement checkout or provision connectivity.

This is a small Node.js application using Express 4, EJS, Webpack and Sass. Pages render on the server; a small browser script enhances navigation, contact feedback and optional analytics. Nodemailer delivers contact inquiries through configured SMTP. There is no database or user authentication in this repository.

## Local setup

Use Node.js 22 for parity with CI; `package.json` requires Node.js 20.19 or later. npm and the committed lockfile are the package-management source of truth.

PowerShell:

```powershell
npm.cmd ci
if (!(Test-Path -LiteralPath .env)) { Copy-Item -LiteralPath .env.example -Destination .env }
# In .env, set NODE_ENV=development for local work.
npm.cmd run build
npm.cmd start
```

Do not overwrite an existing `.env`. Open <http://localhost:3016>. The `npm.cmd` spelling avoids PowerShell execution-policy conflicts with the npm script shim; on Linux use `npm`.

Webpack writes generated JavaScript and CSS to `public/assets`. Run the build after editing `src/js` or `src/scss`; production startup does not build assets automatically.

## Configuration

Keep deployment values in the existing environment or private `.env`; never commit secret values.

| Variable | Default / behavior |
| --- | --- |
| `PORT` | `3016`, preserving the existing VPS application port. |
| `NODE_ENV` | Set `development` locally and `production` behind production HTTPS. Production enables HSTS and permits the existing analytics script to load. |
| `UPLOAD_DIR` | `./uploads`, resolved from the process working directory when configured. Retained for compatibility and access-denial checks. Storage is not created, listed, served or deleted by the application. |
| `TRUST_PROXY` | `false`. Set only for the verified reverse-proxy topology. `loopback`, explicit trusted addresses/CIDRs, or a justified numeric hop count are supported; blanket `true` is rejected. Keep the Node port inaccessible to the public when trusting a proxy. |
| `CONTACT_FORM_SECRET` | Optional stable random secret of at least 32 characters. Configure the same value across workers/restarts so open forms remain valid. Without it, each process creates an ephemeral secret. Never commit the value. |
| `SMTP_HOST`, `SMTP_FROM` | Required for contact delivery: provider hostname and one authorized sender mailbox. |
| `SMTP_PORT`, `SMTP_SECURE` | Default `587`/`false` requires STARTTLS. Use `465`/`true` for implicit TLS. Certificates are always validated. |
| `SMTP_USER`, `SMTP_PASS` | Supply a complete credential pair when the provider requires authentication. |
| `CONTACT_TO` | Optional single inquiry recipient; defaults to the existing corporate `site.email`. |
| `ANALYTICS_ENABLED` | Production tracker is enabled unless this is exactly `false`. It remains disabled outside production. |

The contact throttle and successful-submission deduplication are held in memory per process. Sharing the form secret does not share these stores; multi-instance deployments need shared abuse/idempotency storage for guarantees across workers. See [contact delivery configuration](docs/contact-delivery.md). Missing or invalid SMTP configuration never produces a false success.

## Application layout

| File / directory | Responsibility |
| --- | --- |
| `server.js` | Application factory, routes, redirects, retired-path handling, reviewed static assets, sitemap, robots and error responses. |
| `src/site-data.js`, `src/resources.js` | Company presentation, verified destinations, navigation, metadata and curated maritime articles. |
| `src/server/contact.js` | Validation, signed expiring tokens, origin checks, honeypot, rate limit and duplicate-submission protection. |
| `src/server/mail.js` | SMTP configuration, plain-text inquiry delivery, fixed sender/recipient and safe acceptance checks. |
| `src/server/security.js` | Security headers, CSP nonces and explicit proxy-trust parsing. |
| `views/` | EJS page templates and shared header/footer; `article.ejs` renders structured maritime guides. |
| `src/scss/style.scss` | Shared responsive visual system. |
| `src/js/site.js`, `contact.js`, `analytics.js` | Menu enhancement, form-result focus, sending state and optional analytics hooks. |
| `src/media.js`, `views/partials/media.ejs` | Reviewed illustration slots; pending assets render nothing. |
| `src/brand/social-card.svg` | Editable source for the produced corporate sharing card. |
| `public/assets/` | Only this reviewed asset directory is served statically. |
| `public/deleted_code/` | Remaining unrelated legacy source is inaccessible; obsolete resource uploader and rewards archives were deleted. |
| `__tests__/`, `browser-tests/`, `scripts/check-links.js` | Application regression tests, browser/accessibility checks and internal-link checks. |
| `.github/workflows/deploy.yml` | Validation followed by the existing VPS/PM2 deployment path. |

Public pages include `/`, `/solutions`, `/solutions/crew-change`, `/seafarers`, `/operators`, `/resources`, `/about`, `/contact`, `/privacy` and `/terms`. Curated guides live at `/resources/:slug`, with their content in `src/resources.js` and routes in the page registry. The server also generates `/sitemap.xml` and `/robots.txt`. Add a page to the registry and its EJS template together; metadata and sitemap entries derive from that registry.

Known old content URLs redirect permanently to relevant replacements. `/upload`, `/uploads`, `/files`, their retired API aliases, `/resources/upload` and obsolete rewards routes return `410 Gone` with `noindex` for every method. Remaining `/deleted_code` paths return `410`; unknown pages receive the corporate 404 page. The server does not expose arbitrary repository/static HTML.

## Contact workflow

`POST /contact` validates submitted fields and sends a plain-text inquiry through SMTP. Success appears only after the provider accepts the configured recipient; this confirms the handoff, not inbox placement. No email application is required. The website does not persist inquiry text in a file/database, but the mail provider and recipient mailbox process and store email.

Name, email, interest and message are required; visitor type, company and phone/WhatsApp are optional. Reviewed links preselect only allowlisted role/topic values; query parameters never prefill personal details. The form works without JavaScript. Validation or delivery failures preserve bounded escaped inputs and show accessible errors. Tokens expire after one hour; a honeypot, origin checks and an in-memory five-attempt/15-minute limit reduce simple abuse. Duplicate requests with the same token/content share a delivery outcome within the process.

No SMTP infrastructure was configured in the inspected repository. Provision a working sender/provider and verify recipient ownership before production use. The existing corporate email remains a visible fallback. Read [contact delivery](docs/contact-delivery.md) and [the security audit](docs/security-audit.md) for setup, tests and limits; no live mail was sent during implementation.

## Analytics

The existing Umami service at `analytics.amicusshippingllc.com` is retained for production. Site configuration and its public website ID live in `src/site-data.js`. The tracker is instructed to respect Do Not Track, exclude search strings and limit tracking to corporate domains. Browser hooks send only an allowlisted event name and page pathname, never form fields or email addresses.

Events distinguish consumer purchase intent (`buy_esim_click`), B2B inquiry intent (`operator_inquiry`), accepted contact submissions (`contact_submit`), tool handoffs (`crew_change_click`) and guide engagement (`resource_view`, `resource_cta_click`). `contact_submit` fires on the server-confirmed success page; it does not prove inbox placement. See the [Phase 2 report](docs/phase-2-report.md) for definitions. No new analytics vendor was added. Cross-subdomain attribution, retention and privacy configuration need separate verification in the existing service.

## Validation

Run from the repository root after `npm.cmd ci`:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test -- --runInBand
npm.cmd run build
npm.cmd run check:links
npm.cmd run check:assets
npm.cmd audit
```

The typecheck uses `checkJs` for the current browser modules and central site data; legacy JavaScript has not been converted to TypeScript. The link checker validates internal pages, assets and known anchors. The asset checker validates reviewed media files and records pending slots without rendering placeholders.

Install Chromium once and keep the same browser-directory environment variable for browser runs:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.qa/browsers'
npx.cmd playwright install chromium
npm.cmd run test:browser
```

The browser runner owns a fresh server on a random loopback port and closes it when testing finishes; it does not reuse a local preview. Browser output is stored under `.qa/browser-results`. Its explicitly injected test mail handler sends no external messages. Backend tests also inspect a real MIME message built locally by Nodemailer's stream transport. Reapply `PLAYWRIGHT_BROWSERS_PATH` in a new terminal. Emulation does not replace checking real phones, production SMTP/DNS/proxy behavior or authenticated external services.

## VPS and PM2 deployment

The existing deployment remains `/var/www/amicusshipping` with PM2 process `amicusshippingllc` and the existing GitHub SSH secrets. No hosting migration is introduced.

The workflow validates pull requests and pushes to `master` with install, lint, typecheck, Jest, production build, internal links, media checks and Chromium browser tests. CI installs Chromium with `playwright install --with-deps --no-shell chromium` before running `test:browser`. Deployment runs only for a validated push. On the VPS it fast-forwards `master`, verifies the checkout matches the triggering commit, runs `npm ci --include=dev` and `npm run build`, then explicitly exports `NODE_ENV=production` and restarts the existing PM2 process with `--update-env` and saves PM2 state. Build dependencies must be present even if the VPS already sets `NODE_ENV=production`.

These changes have **not** been deployed by this task; see the [production verification report](docs/phase-2-production-audit.md) for separately recorded live observations. Before deployment, verify Node compatibility, SMTP/environment/secret provisioning, PM2 working directory and HTTPS/proxy settings. Inspect Nginx (or the actual reverse proxy) for direct `/uploads`, `/files`, `/deleted_code` or repository-root aliases: these could bypass Express restrictions. After deployment, verify retired routes return the intended status from the public hostname. The git-based deployment does not remove historical untracked uploads already on the VPS; remove obsolete deployed files and static aliases there as part of rollout.

## Audits and next work

- [Phase 2 implementation report](docs/phase-2-report.md)
- [Production verification](docs/phase-2-production-audit.md) and [local performance snapshot](docs/phase-2-performance.md)
- [Media integration guide](docs/media-integration.md)
- [Phase 2 plan](docs/phase-2-plan.md)
- [Asset manifest and Leonardo/Mureka briefs](docs/asset-manifest.md) ([structured register](docs/asset-manifest.json))
- [Phase 1 assessment and ranked follow-up](docs/phase-1-audit.md)
- [Security findings and deployment checks](docs/security-audit.md)
- [Contact SMTP setup, behavior and tests](docs/contact-delivery.md)
- [External applications, factual evidence and legacy payment paths](docs/external-links-audit.md)

Obsolete resource/uploader pages and rewards marketing were removed; the inspected local uploads directory contained no developer cheat sheets. Remaining old SIM/recharge URLs lead to Contact; this does not promise fulfillment or rewards migration. Keep company claims tied to evidence and the corporate site separate from product checkout. Historical Phase 1 documents describe the earlier implementation; the current Phase 2 report and contact/security guides describe this release.
