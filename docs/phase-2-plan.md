# Amicus Shipping — Phase 2 plan
Prepared: 2026-09-11. Baseline: committed Phase 1 rebuild `b77e66c`.

Phase 2 should improve trust and customer journeys while adding a small, deliberate asset set. The owner has limited photography, so the plan keeps the existing maritime hero and uses two clearly illustrative supporting scenes. The [asset manifest and ready-to-paste prompts](asset-manifest.md) are ready; the [structured register](asset-manifest.json) records order and integration status.

This document is a work plan. It does not claim that production deployment, inbox delivery, analytics configuration, asset generation or all Phase 2 work is complete. Phase 1 test results in the prior audit are historical evidence until rerun against a changed implementation.

## Execution order

| Order | Work | Concrete result / completion check | Dependency |
| --- | --- | --- | --- |
| 1 | Verify deployed security and deployment compatibility | Public upload/list paths remain retired; quarantined photo inaccessible; correct headers/canonicals; inspect actual proxy aliases, Node version, PM2 environment and trusted proxy configuration. | Current production access/topology; repository alone cannot verify Nginx. |
| 2 | Baseline real customer journeys | Test seafarer path, compatibility/setup destination, operator inquiry, mobile menu and form on actual phones. Record each friction point and distinguish an email draft from delivery. | Available phone/browser and controlled external accounts when needed. |
| 3 | Commission and integrate the starter assets | Select AS-002/003, make responsive exports and AS-004 sharing card, then verify captions, crops, page weight and usability. | Selected deliverables and recorded rights; current pages remain the fallback. |
| 4 | Strengthen factual trust and contact continuity | Owner-approved company details; optional real About photograph; resolve old SIM/recharge/rewards guidance. If server email is wanted, specify recipient/provider and verify actual delivery. | Owner facts and business/provider access; do not invent or infer migration. |
| 5 | Measure and refine | Search Console/indexing baseline, deployed performance, existing Umami event semantics and corporate-to-store attribution review. Rank changes by evidence. | Existing analytics/search access and enough real usage; no new tracker required. |
| 6 | Consider a short explainer | Only commission VD-001/MU-001 if the written guide needs help or there is a defined marketing use. Provide user-started playback and complete text equivalent. | Approved stills, clear use and an acceptable media delivery budget. |

Asset ordering can proceed alongside steps 1–2. Security, contact improvements and SEO do not wait for media. There is no initial order for a replacement hero, a music player, a video background, image-per-card decoration or generated founder/team photography.

## Asset integration decisions

- **Homepage:** keep the current real port scene and immediate solution/eSIM actions. Confirm photo rights; do not imply ownership of the pictured vessel.
- **Seafarers:** AS-002 provides human travel context below initial CTAs. Keep the three-check guidance and device/help links.
- **Operators:** AS-003 supports the inquiry-preparation section. Retain the useful details checklist and contact action.
- **Link previews:** AS-004 adds exact brand text and a deliberate 1200 × 630 composition; do not depend on an image model for typography.
- **About:** use approved facts now. One genuine phone photograph can be supplied later; a synthetic employee or office would weaken trust.
- **Resources/Contact:** keep them focused and lightweight. No decorative illustration requirement on each guide or beside the inquiry fields.

The detailed prompts, proposed filenames, alt text, sizes, optional video storyboard and Mureka brief are in the manifest. They are production targets, not a claim that a vendor exposes every requested control or export size.

## What to measure before adding more media

Record baseline page bytes and mobile rendering, then compare the image integration. Keep text/eSIM links available before below-fold media loads. Use the Phase 1 viewport range and keyboard/axe checks again after layout changes, plus a real phone check where possible. Field Core Web Vitals need actual deployment data.

Use the existing event hooks to observe store visits and inquiry entry/handoff. Do not interpret `contact_submit` as a delivered email. Compare whether added media helps comprehension and task completion; low traffic may not support a meaningful A/B test.

## Owner and implementation handoff

The owner can place the two Leonardo briefs using their account and return the selected files. No purchase, vendor login or commercial communication has been made by this task. Save generation IDs and applicable permission evidence with the files. Optional music stays uncommissioned until a video edit has a use.

Implementation work then selects/optimizes the masters, adds the explicit image frames, creates the sharing card and reruns relevant checks. Keep drafts in the ignored `media-staging/` directory; only approved web exports enter `public/assets/media/`. No public upload mechanism is introduced.

## Phase 2 completion criteria

- Production security/deployment checks recorded with unresolved items explicit.
- Primary journeys reviewed, significant friction addressed and validation rerun.
- Starter images either approved and integrated or intentionally deferred with current pages intact.
- Honest company/legacy-service information; no fabricated claims or documentary-looking synthetic proof.
- Sharing preview verified and image weights/crops checked.
- A documented measurement baseline and ranked next changes.
- Video/music only if they serve an identified need, with controlled loading/playback and a silent/text alternative.
