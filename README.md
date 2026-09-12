# Amicus Shipping LLC corporate website

The corporate site at <https://amicusshippingllc.com> introduces crew connectivity, crew-change tools and maritime resources. Purchases remain in the [dedicated eSIM store](https://sim.amicusshippingllc.com/shop); the parent site does not implement checkout or provision connectivity.

This is a small Node.js application using Express 4, EJS, Webpack and Sass. Pages render on the server; a small browser script enhances navigation and optional analytics. There is no database, user authentication or SMTP/email delivery integration in this repository.

## Local setup

Use Node.js 22 for parity with CI; `package.json` requires Node.js 20.19 or later. npm and the committed lockfile are the package-management source of truth.

PowerShell:

```powershell
npm.cmd ci
Copy-Item -LiteralPath .env.example -Destination .env
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
| `ANALYTICS_ENABLED` | Production tracker is enabled unless this is exactly `false`. It remains disabled outside production. |

The contact throttle is held in memory per process. Sharing the form secret does not share rate limits; multi-instance or higher-volume deployments may need edge or shared-store limiting.

## Application layout

| File / directory | Responsibility |
| --- | --- |
| `server.js` | Application factory, routes, redirects, retired-path handling, reviewed static assets, sitemap, robots and error responses. |
| `src/site-data.js` | Company presentation, verified application destinations, primary navigation, page metadata and resource registry. |
| `src/server/contact.js` | Input validation, signed expiring tokens, cross-origin checks, honeypot, rate limit and email-draft preparation. |
| `src/server/security.js` | Security headers, CSP nonces and explicit proxy-trust parsing. |
| `views/` | EJS page templates and shared header/footer; `article.ejs` contains initial curated guide content. |
| `src/scss/style.scss` | Shared responsive visual system. |
| `src/js/site.js`, `contact.js`, `analytics.js` | Menu enhancement, form-result focus, clipboard fallback and optional analytics hooks. |
| `src/media.js`, `views/partials/media.ejs` | Reviewed illustration slots; pending assets render nothing. |
| `src/brand/social-card.svg` | Editable source for the produced corporate sharing card. |
| `public/assets/` | Only this reviewed asset directory is served statically. |
| `public/deleted_code/` and old HTML files | Preserved legacy source, not a public archive or publishing mechanism. |
| `__tests__/`, `browser-tests/`, `scripts/check-links.js` | Application regression tests, browser/accessibility checks and internal-link checks. |
| `.github/workflows/deploy.yml` | Validation followed by the existing VPS/PM2 deployment path. |

Public pages are `/`, `/solutions`, `/seafarers`, `/operators`, `/resources`, `/about`, `/contact`, `/privacy` and `/terms`. Three curated guides live at `/resources/:slug`, using entries explicitly registered in `src/site-data.js`. The server also generates `/sitemap.xml` and `/robots.txt`. Add a page to the registry and its EJS template together; metadata and sitemap entries derive from that registry.

Known old content URLs redirect permanently to relevant replacements. `/upload`, `/uploads` and `/files` return `410 Gone` with `noindex` for every method. Remaining `/deleted_code` paths return `410`; unknown pages receive the corporate 404 page. The server does not expose arbitrary repository/static HTML.

## Contact workflow

`POST /contact` validates submitted fields and prepares an email draft for the existing corporate recipient. The visitor then opens their email app and sends it, or copies the prepared text. **A prepared draft is not a delivered message.** No inquiry is persisted in a database or dispatched to an email provider by this app.

The form supports visitor type and interest, with optional company and phone/WhatsApp fields collapsed until needed. Reviewed links may preselect only an allowlisted role/topic; query parameters never prefill contact details or messages. The prepared draft shows subject and body, with a Copy action and selectable-text fallback. Validation failures preserve bounded inputs and expose accessible errors. Tokens expire after one hour; a honeypot, cross-origin checks and an in-memory five-attempt/15-minute limit reduce simple abuse. Read [the security audit](docs/security-audit.md) for implementation limits and operational requirements.

## Analytics

The existing Umami service at `analytics.amicusshippingllc.com` is retained for production. Site configuration and its public website ID live in `src/site-data.js`. The tracker is instructed to respect Do Not Track, exclude search strings and limit tracking to corporate domains. Browser hooks send only an allowlisted event name and page pathname, never form fields or email-draft URLs.

Supported names include `buy_esim_click`, `shop_visit`, `contact_submit`, `operator_inquiry`, `seafarer_cta_click`, `crew_tool_click`, `resource_view` and `resource_download`. Phase 2 distinguishes inquiry entry, draft readiness, email-app handoff, successful copying and store support/account visits. `contact_submit` remains a legacy handoff event and never proves delivery. See the Phase 2 report for event definitions. No new analytics vendor was added. Cross-subdomain attribution, retention and privacy configuration need separate verification in the existing service.

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

The browser runner owns a fresh server on a random loopback port and closes it when testing finishes; it does not reuse a local preview. Browser output is stored under `.qa/browser-results`. Reapply `PLAYWRIGHT_BROWSERS_PATH` in a new terminal. Emulation does not replace checking real phones, email applications, production DNS/proxy behavior or authenticated external services.

## VPS and PM2 deployment

The existing deployment remains `/var/www/amicusshipping` with PM2 process `amicusshippingllc` and the existing GitHub SSH secrets. No hosting migration is introduced.

The workflow validates pull requests and pushes to `master` with install, lint, typecheck, Jest, production build, internal links, media checks and Chromium browser tests. CI installs Chromium with `playwright install --with-deps --no-shell chromium` before running `test:browser`. Deployment runs only for a validated push. On the VPS it fast-forwards `master`, verifies the checkout matches the triggering commit, runs `npm ci --include=dev` and `npm run build`, then explicitly exports `NODE_ENV=production` and restarts the existing PM2 process with `--update-env` and saves PM2 state. Build dependencies must be present even if the VPS already sets `NODE_ENV=production`.

A subsequent direct audit confirmed Phase 1 is live. These Phase 2 changes have **not** been deployed by this task; see the production verification report. Before deployment, verify Node compatibility, environment/secret provisioning, PM2 working directory and HTTPS/proxy settings. Inspect Nginx (or the actual reverse proxy) for direct `/uploads`, `/files`, `/deleted_code` or repository-root aliases: these could bypass Express restrictions. After deployment, verify retired routes return the intended status from the public hostname.

## Audits and next work

- [Phase 2 implementation report](docs/phase-2-report.md)
- [Production verification](docs/phase-2-production-audit.md) and [local performance snapshot](docs/phase-2-performance.md)
- [Media integration guide](docs/media-integration.md)
- [Phase 2 plan](docs/phase-2-plan.md)
- [Asset manifest and Leonardo/Mureka briefs](docs/asset-manifest.md) ([structured register](docs/asset-manifest.json))
- [Phase 1 assessment and ranked follow-up](docs/phase-1-audit.md)
- [Security findings and deployment checks](docs/security-audit.md)
- [External applications, factual evidence and legacy payment paths](docs/external-links-audit.md)

Existing resources/uploads and legacy source are preserved for private review. Do not delete old payment paths, promise rewards-balance migration, publish unverified credentials or restore public uploads without resolving the uncertainties recorded in these audits.
