# External application and company-content audit

Audit date: **2026-09-11**. Scope: existing EJS templates, static/archived HTML, source JavaScript, and their linked public applications. Checks were read-only HTTP GET requests with redirects followed and 10–20 second timeouts. No registrations, purchases, emails, IMEI submissions, authenticated workflows, or external changes were performed. A `200` verifies delivery of a page, not the business workflow behind it. SPA shells require separate browser/account verification.

The web search/open tool initially could not open several application URLs. Direct Node `fetch` requests succeeded and are the basis of the status table. Search-index snippets for the SIM store differed from current responses, so current responses take precedence.

## Primary application decisions

| Destination found in repository | Live observation | Classification | Phase 1 treatment |
| --- | --- | --- | --- |
| [SIM store](https://sim.amicusshippingllc.com/) and [plan shop](https://sim.amicusshippingllc.com/shop) | Both `200`; Amicus eSIM storefront and current prepaid eSIM plans. | **KEEP** | Use `/shop` for Buy eSIM / Find a plan. Retain transactions on the dedicated storefront. Avoid copying dynamic price/coverage claims. |
| [Crew registration](https://crew.ship-port.com/register) | `200`; JavaScript application shell titled “Maritime Crew Logistics.” | **KEEP** | Retain an explicitly labeled crew logistics application link. This is already a branded hostname. Registration/backend behavior was not tested. |
| [Legacy Rewards](https://cards-reward-app-47c3b7cf1eb6.herokuapp.com/) | `503`, “Application Error,” on two requests. | **DEPRECATE** | Remove prominent CTA/navigation. Preserve the old destination in this record. Do not promise balance migration. |
| [Legacy IMEI checker](https://imei-zhim57-app.herokuapp.com/) | `200`; IMEI/device and network compatibility checker with a dashboard link. | **REMOVE FROM NAVIGATION** | Direct the eSIM purchase journey to the store's verified compatibility guide. Preserve this IMEI tool as a separate legacy capability; a guide is not proof of feature-equivalent replacement. |
| [Petroleum inspection study tool](https://calm-ridge-53583.herokuapp.com/) | `200`; “IFIA Exam Study,” showing a 514-question study interface. | **KEEP BUT REBRAND LINK** | Keep among maritime/professional resources using a clear study-tool label. Do not imply official certification, endorsement, or independently verified question accuracy. Existing parent copy misspells IFIA as “IFFIA.” |
| [Reminded](https://reminded-b105f03dfb98.herokuapp.com/) | `200`; “Reminded” SPA shell. | **REMOVE FROM NAVIGATION** | Personal productivity is unrelated to corporate maritime positioning. No app deletion. |
| [Synaptiq42](https://synaptiq42.com/) | `200`; “Synaptiq42 — Cognitive Gym” SPA shell. | **REMOVE FROM NAVIGATION** | No evidenced maritime business connection. No app deletion. |
| [Climat-BG](https://climat-bg.com/) | `200`; Bulgarian air-conditioning sales/installation/repair business. | **REMOVE FROM NAVIGATION** | Unrelated business; old “environmental services” parent description is misleading. No external changes. |
| [Ship-port parent domain](https://ship-port.com/) | `200`; “Vessel Management V2,” describing itself as an internal Amicus tool with sign-in. | **INVESTIGATE** | Do not substitute the parent domain for the public crew registration URL or promote it as a customer product. No sign-in or administrative actions were attempted. |

For the retained IFIA tool, a future hostname such as `tools.amicusshippingllc.com` could improve presentation, but DNS, TLS and application configuration are outside this repository. A friendly label can be implemented now; no hostname migration is claimed.

## Authoritative SIM journeys

These routes came from links in the current storefront, not guesses:

| Customer intent | Verified destination | Evidence |
| --- | --- | --- |
| Browse/purchase plans | [Shop](https://sim.amicusshippingllc.com/shop) | `200`; plan comparison and checkout entry points. |
| Check eSIM capability | [Help and compatibility](https://sim.amicusshippingllc.com/help) | `200`; exact device/variant, eSIM hardware and carrier-unlock guidance. The `compatibility` ID marks confirmation, so the plain help URL starts customers at the actual explanatory guide. |
| Installation | [Installation instructions](https://sim.amicusshippingllc.com/help#installation) | `200` page and matching `id="installation"`. |
| Seafarer connectivity | [Seafarers](https://sim.amicusshippingllc.com/seafarers) | `200`; transit/port/shore-leave guidance. |
| Crew/business arrangements | [Crew enquiries](https://sim.amicusshippingllc.com/crew) | `200`; enquiry form and individual discount-code batch workflow. |
| Existing orders/account | [Account](https://sim.amicusshippingllc.com/account) | Redirects to `/login`, final `200`, for an unauthenticated visitor. |
| Order/setup support | [Support](https://sim.amicusshippingllc.com/support) | `200`; published `support@amicusshippingllc.com`. |

### Rewards: evidence and uncertainty

The newer SIM platform shows evidence of rewards/credit functionality: its current login page describes a travel eSIM store and rewards; its public checkout JavaScript handles `useCredit`, credit and invite selections. An indexed, older version of `/shop` also describes store credit and invites. Current public home/shop/help/about/seafarer/crew/support/terms responses did not advertise rewards amounts or link a dedicated rewards page. An exploratory GET to `/rewards` returned `404`, and the sitemap did not list a rewards route.

This supports consolidating customer entry through the SIM shop/account. It does **not** establish that historical card balances migrated, that every former rewards feature survives, or that any previous reward amount remains valid. Keep reward promises out of the parent site until account behavior and migration policy are confirmed.

### Compatibility: avoid conflating two different checks

The old app accepts an IMEI and describes network compatibility. The store help page guides customers through eSIM hardware and carrier-unlock requirements, with confirmation integrated into purchase. Use the latter for eSIM buying. Retaining the old app's source/destination does not require exposing two equal-priority purchase journeys.

## Legacy applications and payment paths

Archived `public/deleted_code/buy_sim.html` and `buy_Dsim.html` contain payment links that still serve Amicus product pages. All **13** links returned `200`; this is a reason to preserve business history and investigate fulfillment before declaring those offerings obsolete.

All Square rows below are **INVESTIGATE** and should remain out of new corporate navigation. The full historical URLs remain in the source files. Titles are recorded only as evidence, not current product recommendations or availability claims.

| Historical Square path or token | Observed product title / redirect |
| --- | --- |
| `/merchant/Q3ENDY6VR9Z7Z/checkout/OOKQ6LGPFU4UI3RSKN7BAMPX` | $20 / 10GB data SIM add-on. |
| `/merchant/Q3ENDY6VR9Z7Z/checkout/NOSBCOR5CGEFHK4M2BD2ROIB` | Pack of 10 blank data SIM cards. |
| `/merchant/Q3ENDY6VR9Z7Z/checkout/VKSA3TAL4SJWSZ4GHQWVQHFS` | Pack of 20 blank data SIM cards. |
| `/buy/SFX6HVNF5SGGUD2JS7X4SMUC` | $100 Power SIM recharge; redirects to checkout `TFUNGJT7EEU2CBVRSQDATTWS`. |
| `/buy/BVLIFSO772RJWKCATZFCENCA` | $50 Power SIM recharge; redirects to checkout `BK6PI3N2PNOP7EPZKJ6YWG3W`. |
| `/buy/ZPDB72D7QRCOUDKSNZYGLUJR` | $30 Power SIM recharge; redirects to checkout `RTHW3UVXBVEFWOML5SPCY2EY`. |
| `/buy/MPDC7F2UW7EZ5YZYARWKUG7G` | $20 Power SIM recharge; redirects to checkout `52KNRI6XX7BWZD3EIJ7DFC6M`. |
| `/merchant/Q3ENDY6VR9Z7Z/checkout/LO6HDVEX3L35VYOKV335XO5W` | Power3 add-on. |
| `/merchant/Q3ENDY6VR9Z7Z/checkout/RO6X2MN7IMK7ZGOLGNQ6SNLD` | Power5 add-on. |
| `/merchant/Q3ENDY6VR9Z7Z/checkout/GI4G7PJHUP2DMNMKC7VMAL3C` | Power6 add-on. |
| `/merchant/Q3ENDY6VR9Z7Z/checkout/QXEOT3TELKHBDYJBZ6F2HDHW` | Power20 add-on. |
| `square.link/u/Vz3sfxNe` | $29 / 12GB data SIM add-on; redirects to checkout `Y3TM7FSIHUCKSFA5QUFQPOOD`. |
| `/merchant/Q3ENDY6VR9Z7Z/checkout/AJGZLQASULYQCWIXNLCVCYWH` | Power eSIM. |

Additional legacy links:

| Destination / source | Observation | Classification |
| --- | --- | --- |
| `https://mybilling.global1tel.com:8445/` in archived SIM/rewards/resources pages | DNS `ENOTFOUND` from this environment. Its SOAP host in `src/js/test_soap.js` is the same hostname; no SOAP call was made. | **INVESTIGATE**; unavailable here, preserve legacy integration evidence. |
| `zhim57.github.io/safe-trails/` and its GitHub repository | Both `200`. | **REMOVE FROM NAVIGATION**; personal project. |
| `zhim57.github.io/daily-planner` and its GitHub repository | Both `200`; app canonicalizes with trailing slash. | **REMOVE FROM NAVIGATION**; personal project. |
| `zhim57.github.io/weather-dashboard` and its GitHub repository | Both `200`; app canonicalizes with trailing slash. | **REMOVE FROM NAVIGATION**; personal project. |
| `https://archive.org/`, `https://chitanka.info/` | Both `200`; general digital libraries. | **REMOVE FROM NAVIGATION**; no specific maritime resource selected. |
| `http://lib.ru/` | DNS `ENOTFOUND` here; insecure historical URL. | **REMOVE FROM NAVIGATION**. |
| `https://www.vesselfinder.com/aismap.js` | Legacy crew-change embed, not current EJS navigation. No application workflow tested. | **INVESTIGATE** before reinstating; privacy/licensing and usefulness need review. |
| `https://api.maerskline.com/maeu/schedules/port` | Source-only legacy API call; no authenticated/query request executed. | **INVESTIGATE** before reinstating; current API contract is not verified. |

Source inventory also contains CDN assets (Bootstrap, Font Awesome, Materialize, jQuery, Popper, Google Fonts), the EJS documentation URL, and archived legal-template regulator/generator links. They are infrastructure/reference dependencies, not corporate applications. Removing legacy navigation does not require preserving these as public resource recommendations.

## Analytics destination

The EJS header includes `https://analytics.amicusshippingllc.com/script.js`, which returned `200` JavaScript. Preserve this configured first-party analytics integration. The old static homepage and archived pages also contain GA4 initialization. Its historical presence does not establish that GA4 remains part of the currently served EJS experience. No analytics event was deliberately sent during this HTTP audit.

## Factual company content available for the rebuild

- Existing `public/index.html` explicitly connects Amicus Shipping LLC with international maritime transportation and tools for maritime professionals. Existing EJS cards support SIM connectivity, crew logistics and a petroleum-inspection study resource.
- [Current SIM About](https://sim.amicusshippingllc.com/about) identifies Amicus eSIM as the consumer storefront of Amicus Shipping LLC, confirms digital delivery and email support, and publishes a New Jersey registered-agent business address. This is evidence for restrained U.S./New Jersey business wording; it is not evidence of a staffed office or visitor location.
- [Current SIM crew page](https://sim.amicusshippingllc.com/crew) supports discussing individual discount-code batches. It explicitly does not offer a fleet usage/activation dashboard and requires confirmation of alternative company payment/invoice arrangements.
- Store connectivity uses supported land-based networks. Do not promise offshore/satellite coverage, guaranteed signal at every berth, uninterrupted service, universal device compatibility, specific delivery time, or fixed support response time.
- The corporate inquiry currently points to `zhim57@yahoo.com`; preserve that configured recipient unless deliberately changed. The SIM support email is a separately verified public contact and is appropriate for store help.
- Archived portfolio/contact files name Jivko Atanassov but do not establish a verified founder biography, maritime licenses, specific years of experience, customer names or credentials. The archived testimonials page has no substantive testimonials. Do not invent those facts.
- An old privacy page contains an older street address. Do not promote it into new company metadata; use verified business details only when needed and avoid publishing residential-looking historical data.
- Hidden “coming soon” husbandry and cash-to-master cards are not evidence of currently available full-service port agency or worldwide cash delivery.

## Highest-value owner/application follow-up

1. Verify legacy rewards balances and the supported account/credit workflow in the SIM platform before announcing migration.
2. Confirm whether existing physical SIM customers still need the active Square recharge/add-on links and replace the unavailable billing path appropriately.
3. Exercise crew registration with a controlled test account and confirm which operational capabilities are ready for public description.
4. Review the IFIA study content, current terminology and ownership; add a branded hostname only after DNS/TLS/app configuration is available.
5. Supply approved company history, business contact details and professional credentials if these should appear publicly.
