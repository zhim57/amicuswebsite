# Phase 2 content evidence and product boundaries

Reviewed 2026-09-12. This record distinguishes professional history, current public product information and capabilities found in application source. It does not certify live operational readiness.

## Founder and company

| Published fact | Evidence | Boundary |
| --- | --- | --- |
| Jivko Atanassov is the founder of Amicus Shipping LLC | Owner's Phase 2 brief; existing corporate/portfolio material identifies Jivko Atanassov | No invented company incorporation date, exact experience total or current outside employment |
| Ship-agent, marine superintendent and petroleum-inspection background | Existing `public/assets/docs/cv2020-jivko.pdf`, professional experience sections | Historical roles only; former employers and vessel clients are not advertised as Amicus customers or partners |
| Cargo and bunker surveys in Amicus marine consulting work | Same CV, Marine Consultant entry for Amicus Shipping LLC | Described as background, not a promise of currently bookable surveying services or geographical availability |
| Vessel/terminal coordination, crew and spares arrangements, cargo quantity work | Same CV, agency and inspection responsibilities | No unsupported dry-cargo specialization, licensed profession or certification status |
| Spreadsheet templates used to simplify document processing | Same CV, ship-agent responsibilities | Supports the progression from operational work to software without inventing motivations, quotations or a chronology |
| Historical IFIA certification during inspection work | Same CV explicitly lists IFIA certification in inspection entries | No current certification, TIC Council endorsement, company accreditation or ASBA credential claimed |
| Existing portrait | `public/assets/images/jivko4a.jpg`, named repository portrait, visually inspected | Authentic existing asset, not generated. Served as `public/assets/media/jivko-atanassov-680.jpg`, a proportionally resized JPEG (680 by 808, quality 85) with no compositional changes. Reduced from 655,397 to 68,416 bytes; original retained. A newer approved professional portrait would improve presentation |

The CV is a 2020 document. Its open-ended employment dates do not establish current tenure. The website therefore uses a narrative and names supported roles instead of publishing a precise number of years. No residential/contact details from the CV are added to the page or structured data. No testimonial or organization logo was added.

## Connectivity and B2B

The current public [Amicus crew ordering page](https://sim.amicusshippingllc.com/crew), checked during Phase 2, supports individual discount-code batches with agreed values, limits and expiry. Each crew member uses their own email, checks device compatibility and buys through the store; activation information follows payment and provisioning. Company payment, invoicing or a different distribution arrangement must be confirmed. The page explicitly does not offer a fleet usage/activation dashboard.

This is the basis of the Operators workflow. Crew welfare, communication in transit and preparation before departure are use cases, not guarantees of signal, uptime, savings or travel outcomes. Plan coverage, pricing, compatibility, checkout and order support remain in the eSIM store. Store links remain in the same tab.

`support@amicusshippingllc.com` is published by the store for eSIM support. It has not been repurposed as the general corporate inquiry recipient. The Contact implementation documents actual mail configuration separately.

## Amicus Crew Change

Read-only source inspection used the existing adjacent `C:\Users\User\crew-app` checkout:

- `README.md`: multi-participant crew-change coordination and role-based access.
- `frontend/src/components/crewChange/CrewChangeForm.js`: vessel, port, joining/leaving crew and journey setup.
- `frontend/src/components/crewChange/CrewChangeDetail.js`: connected participants, journey legs/timeline, messages and alerts.
- `frontend/src/components/auth/Register.js`: direct crew registration and invitation-based coordination roles.

The new `/solutions/crew-change` landing describes those core features and the registration distinction. It makes the transition to the existing `https://crew.ship-port.com/register` explicit. A source implementation and a reachable registration shell do not prove every workflow is configured or available in production. The page makes no guarantee about automatic flight feeds, background GPS, transport bookings, emergency response, port coverage or service availability. Registration does not book a transfer.

No suitable clean product screenshots were found in the corporate repository. No private crew data, driver locations, operational records or fabricated UI were used. Real product screenshots can be added after a controlled demo account and approved sample journey are available. The adjacent repository was not edited.

## Petroleum inspection study

The existing linked application uses the title “IFIA Exam Study.” The retained corporate route `/solutions/inspection` explains question practice and its limitations before launching the existing external host. The existing Phase 1 external-link audit and current destination inspection support retaining it as a study interface, not as an accredited training provider. No question count, current syllabus match, guaranteed accuracy or official affiliation is advertised.

## External configuration still needed

- A proposed `crew.amicusshippingllc.com` requires DNS, TLS and reverse-proxy/application configuration, plus an end-to-end account and invitation test. The current `crew.ship-port.com` destination is retained.
- A proposed `inspection.amicusshippingllc.com` or `training.amicusshippingllc.com` requires a custom domain on the study host, DNS and TLS, then link verification. No nonexistent hostname was published.
- Corporate email delivery requires the documented SMTP setup. A working branded mailbox for business inquiries can then replace the existing corporate address through configuration; a store support address is not evidence of permission to reroute business mail.
- Before promising broader B2B buying, agree the supported invoicing, payment, code distribution and support responsibilities in the eSIM business workflow.

## Information worth getting from the owner

1. An updated career record and any credentials whose current status should be published; ASBA evidence if relevant.
2. A newer approved founder photograph and genuine recommendations explicitly cleared for website use.
3. The intended corporate inquiry mailbox and supported B2B payment/distribution process.
4. A controlled Crew Change demo journey and confirmation of the production roles/workflows ready for customer onboarding.

No optional fact above blocks the implemented content refinement.
