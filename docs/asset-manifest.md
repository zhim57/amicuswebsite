# Amicus Shipping — Phase 2 asset manifest
> September 12 refinement: AS-005 now uses the existing founder portrait, resized to a 68 KB JPEG for About. The original remains in the repository. AS-002/003 remain optional and are not required for launch; current content takes priority over commissioning illustrations. See [content evidence](content-evidence.md) and the [current report](phase-2-report.md).
Prepared: 2026-09-11. Baseline: repository commit `b77e66c`.

**Recommendation: commission two supporting illustrations in Leonardo first. Keep the existing port photograph. Create a sharing card from an approved asset. Defer video and Mureka music until a short explainer has a clear use.**

AS-004 has now been designed locally and integrated for the next deployment. No paid media order or Leonardo/Mureka generation job has been started. The [JSON manifest](asset-manifest.json) tracks status, filenames and review evidence. The [Phase 2 plan](phase-2-plan.md) and [media integration guide](media-integration.md) explain the remaining work and how to activate reviewed illustrations.

## First order

| ID | Asset | Intended placement | Priority |
| --- | --- | --- | --- |
| AS-001 | Existing port photograph | Homepage hero | Retain; confirm rights |
| AS-002 | Crew ashore connectivity | Seafarers page, below initial purchase/help actions | Order first |
| AS-003 | Port-call preparation | Operators page, alongside inquiry preparation | Order second, matching AS-002 |
| AS-004 | Corporate sharing card | Link previews in messaging and social platforms | Created locally; integrated, awaiting deployment |
| AS-005 | Existing founder portrait | About page | Integrated as a 68 KB JPEG; newer professional photo optional |
| VD-001 | 20-second preparation explainer | Optional play button on Seafarers page | Defer until stills are approved |
| MU-001 | Original instrumental | Soundtrack within VD-001 only | Defer; silent video remains an option |

**Starter quantity:** at most three candidates for AS-002; select the visual direction, then at most three for AS-003. Deliver one selected master per concept. Crop/resize those masters for mobile; do not commission each size separately. Stop after these two usable images and review them in the page before ordering more.

No vendor prices or credit totals are assumed. The owner can check their existing account allowances and the displayed cost before placing this small batch. Nothing here subscribes to a plan or authorizes an automatic purchase.

## Shared creative direction

Quiet, practical maritime work. Deep navy, steel blue, crisp light surfaces and a little warm brass, matching the current site. Use gently simplified editorial illustration with natural proportions, subtle texture and restrained lighting. It should feel human and specific to the task.

The new scenes illustrate situations; they do not document actual Amicus employees, customers, vessels or equipment. Use a discreet visible caption, **“Illustrative image.”** Keep generated people out of founder profiles and testimonial sections. Retain actual brand lettering as editable design/HTML, not image-model text.

Avoid global network glows, giant globes, luxury cruise imagery, heroic fleet formations, fantasy ports, stock handshakes and fake dashboards. Keep SIM identifiers, passports, customer information, actual schedules, screens and QR codes out of reference uploads.

### AS-001 — Existing hero

Retain `public/assets/images/cs1.jpg` (806 × 605, 55,629 bytes). A larger existing version is `cs1b.jpg`; it is a potential crop source after rights confirmation, not a file to serve unoptimized. The photograph shows a vessel at sunset, including another company's markings. Present it as a port scene, never as an Amicus-owned ship or customer endorsement.

The current frame uses `object-fit: cover`, a fluid desktop height and fixed mobile heights. It is **not a fixed 4:3 frame**. Keep the vessel and horizon safe under those crops; verify at 320, 375, 390, 430, 768, 1024 and 1440px. Do not replace an authentic image merely because generated imagery is available.

### AS-002 — Crew ashore connectivity

**Leonardo prompt — paste as the main prompt:**

> Horizontal editorial illustration for a specialist maritime company's website. One adult maritime traveler in ordinary travel clothes sits comfortably in a quiet shoreside passenger terminal, a compact carry-on beside the seat, checking an unbranded smartphone. The phone screen faces the traveler and cannot be read. Through a large window, show a modest, believable commercial harbor at a distance, with a vessel alongside and calm water. The traveler is clearly on land. Natural posture, believable hands, calm concentration, no posed smile toward the viewer. Gently simplified forms, subtle painterly texture and natural proportions, visibly an editorial illustration rather than documentary photography. Deep navy and steel blue, clean light neutrals, small warm brass accents. Soft daylight, restrained contrast. One clear human focal point in the central area; generous surrounding context. No lettering or logos. Landscape 4:3 composition, safe for a tighter central crop.

**Negative prompt, or append as constraints if the selected model has no separate field:**

> No readable screens, QR codes, SIM cards or activation codes, passports, tickets, uniforms with company marks, recognizable faces, visible brands, text, watermark, extra fingers, warped phone, duplicate luggage, unsafe dockside activity, operating machinery, offshore cellular signal graphics, cruise vacation imagery, exaggerated luxury or sci-fi lighting.

**Deliver:** 2400 × 1800 PNG master if supported; otherwise highest-quality native 4:3 export with actual dimensions recorded. Do not upscale a poor result just to meet the number. Select only a scene that still reads correctly at 343px wide.

**Web delivery:** 480 × 360, 800 × 600, 1200 × 900 WebP; JPEG fallback from the same master. Target limits: 50/85/140 KB respectively. Proposed integration frame: fixed 4:3, with explicit dimensions and lazy loading. This is a future frame choice, separate from the current hero.

**Alt:** “Illustration of a maritime traveler checking a phone in a shoreside terminal.”

**Filename base:** `amicus-crew-ashore-connectivity`. First placement: `views/seafarers.ejs`, alongside the section labeled by `before-travel-heading`. Keep the checklist and initial CTAs visible and intact. The homepage does not need another image yet.

### AS-003 — Port-call preparation

**Leonardo prompt — paste as the main prompt:**

> Horizontal editorial illustration in the same visual style, palette and texture as the approved crew travel illustration. Two adult maritime coordinators sit at an ordinary, compact office desk, calmly discussing arrangements for an upcoming crew journey. Oblique view from a little above desk height, natural interaction rather than a posed corporate portrait. A closed notebook, a pen and an unbranded laptop with its screen facing away provide simple context. No open documents, schedules or readable data. A window shows distant, softly simplified commercial port activity. The office is modest and believable, with no claim of fleet ownership or a large operations center. Deep navy, steel blue, crisp light neutrals and a small warm brass accent. Natural daylight, restrained detail, believable hands and furniture. Gently simplified editorial illustration, not documentary photography. Keep people and objects centrally framed with crop space. No text, logos or company uniforms. Landscape 4:3.

**Negative prompt:**

> No handshake pose, executive boardroom, control-room wall, invented maps, charts or dashboards, readable documents, customer names, fake logos, passports, QR codes, duplicated hands, warped laptop, dramatic industrial hazards, glossy multinational advertising or photographic staff portrait.

Use selected AS-002 as a style reference only after its rights and privacy settings are checked. Same master, crop and export specifications as AS-002.

**Alt:** “Illustration of two maritime coordinators preparing travel arrangements at a desk.”

**Filename base:** `amicus-port-call-preparation`. First placement: `views/operators.ejs` near `inquiry-details-heading`. Keep the useful three-point inquiry checklist; add the image around that content rather than substituting it for information.

### AS-004 — Corporate sharing card

No extra AI image commission. The Phase 2 implementation uses a 1200 × 630 JPG with the existing brand geometry, navy background, brass rules and exact typeset text. A photograph is not needed for this card, avoiding an additional dependency on photo approval:

- AMICUS SHIPPING LLC
- Maritime knowledge. Practical tools.

Essential text and the mark sit at least 60px from edges. The export is 58,346 bytes, below the 180 KB target. Editable source: `src/brand/social-card.svg`. Public filename: `amicus-social-card-1200x630.jpg`. Regenerate with `npm run render:social` using the existing Playwright setup. The produced JPG is an ordinary public asset; server startup needs no browser tooling.

Open Graph/Twitter image and alt fields in `views/partials/header.ejs` now use this produced file, including its dimensions. The card was inspected locally; messaging-service cache refresh remains a post-deployment check. No fabricated ratings, coverage counts or partner logos.

### AS-005 — One authentic photo, if available

A phone portrait of the owner in a neutral work setting, or a simple genuine work-detail photograph, can strengthen About more than a generated biography image. This is optional; the current text remains the fallback.

Ask for the original file, preferably a 2000px or larger long edge, natural window light, a calm background and permission from people shown. No visible documents, identifiers or client material. Confirm who/what it depicts and approve a factual caption before use. Do not generate a founder, employee, office or claimed company operation to fill this slot.

### VD-001 — Optional 20-second explainer

**Purpose:** help a seafarer understand what to check before buying connectivity. Place below the main page content as a user-started video. It is not a homepage background.

Suggested edit:
| Time | Picture | Exact on-screen wording |
| --- | --- | --- |
| 0–5s | Gentle motion from approved AS-002 | Before your next crew journey |
| 5–10s | Same scene, then a simple designed text card | Check your phone and destinations |
| 10–15s | Quiet illustration detail; text added in editing | Read your plan’s activation instructions |
| 15–20s | Existing Amicus mark and simple ending card | Find plans and setup guidance at Amicus eSIM |

**Leonardo motion brief:**

> Animate the approved illustration with a very slow, steady camera movement and minimal natural movement. Preserve the person's identity, hands, phone, luggage, architecture and palette throughout. Phone screen remains hidden. Calm daylight and quiet port background. No generated text, morphing objects, abrupt cuts, zoom rush, new brands, audio or dramatic vessel motion. Deliver a clean five-second source shot for a longer edited guide.

Leonardo documents image-to-video and reference-frame workflows; use the approved still rather than creating an unrelated visual style. Model duration/export choices can vary, so make the final 20-second edit from available clips. [Leonardo video capabilities](https://www.leonardo.ai/ai-video-generator)

Deliver a 1920 × 1080 master/timeline if available, one 20-second H.264 MP4 targeted below 4 MB, and a 1280 × 720 poster below 100 KB. No portrait/social variants in the first video order. Add exact text in editing; never fabricate product UI or device setup demonstrations. If a later tutorial shows the store, use an actual current screen recording with test data.

The silent edit must communicate the entire message. Provide an adjacent text equivalent for its visual steps; captions for any speech or meaningful audio. Use controls, `playsinline`, `preload="none"`, no autoplay or loop, and a fixed frame. Defer attaching the video source until Play so initial loading remains image-only. Keep the ordinary checklist as the fallback.

### MU-001 — Optional instrumental for VD-001

Order only if the approved video benefits from a soundtrack. A music file has no independent placement on the corporate website.

**Mureka prompt:**

> Create an original instrumental background cue for a short maritime travel preparation video. Calm, capable and quietly optimistic. About 84 BPM, steady 4/4, sparse warm piano, a soft muted rhythmic pulse, restrained bass and a little airy texture. Leave generous space for spoken instructions if added later. Gentle entry, stable middle and a clean resolved ending; provide around 30 seconds so an editor can make a 20-second version. Natural dynamics and a small, human scale. No vocals, spoken words, choir, sea shanty, famous melody, artist imitation, epic trailer swell, siren, sonar ping, ship horn or aggressive percussion.

Request WAV at the best available native quality, ideally 48 kHz/24-bit stereo, plus a listening preview if useful. Record what the provider actually delivers. Mix quietly into the video; a starting target of -18 LUFS integrated and -1 dBTP true peak is adjustable, not a platform requirement. Speech, if later added, must remain easy to understand. Deliver the unscored video too.

## Provider terms to check when ordering

Checked 2026-09-11; save the applicable plan/terms evidence with each selected asset and recheck at generation time.

- **Leonardo:** its official guidance permits commercial image use, but distinguishes paid/private and public/free output. Use private generation where the account supports it, especially for original brand work; keep original prompts, asset IDs, plan and settings. This is a provider-license consideration, not a promise of exclusive statutory copyright. [Commercial-use guidance](https://intercom.help/leonardo-ai/en/articles/8044018-commercial-usage), [terms](https://www.leonardo.ai/terms-of-service)
- **Mureka:** the May 13, 2026 terms distinguish paid/purchased-credit output from free output; free-tier use is limited to internal, noncommercial purposes with attribution. Do not use a free-tier track for this business site. Confirm applicable commercial permissions for the account and generated track; provider-retained rights mean this is not an exclusivity promise. [Mureka terms, section 3(e)](https://www.mureka.ai/static/terms-20260513.pdf)

No account, subscription, export entitlement or specific model has been verified. Do not upload confidential or unreviewed repository material as a reference. The quarantined legacy photo is never an input.

## Handoff and acceptance

1. Deliver masters/candidates to `media-staging/`, outside public serving. Store receipts/license evidence privately there or in the owner's records; do not commit account details.
2. Record selected output ID, original filename, generation date/model, prompt version, plan/private mode, source references and rights evidence in the manifest. Pending values are intentionally null.
3. Reject malformed hands/geometry, readable secrets, misleading branding or scenes that imply offshore cellular coverage, actual staff/customer proof or unsupported services.
4. Select the final image before making derivatives. Review wide and narrow crops, small-screen clarity and the caption/alt wording. No watermark or AI-generated brand text.
5. Keep masters/provenance privately; strip unnecessary personal metadata from web copies. Preserve useful provenance in the records, not personal metadata in public files.
6. Put only approved optimized files in `public/assets/media/`. Add `picture/srcset/sizes`, dimensions and loading behavior at integration time. The current templates do not reference pending files.
7. Recheck responsive layout, accessibility, broken links and build. Measure actual page weight; at most one new illustration per supporting page, no additional homepage media by default.
8. Update manifest status through `received`, `selected`, `approved`, `integrated`, `published`, with dates. Deferred video/music stay deferred unless a usable edit is commissioned.

If an asset is rejected or never ordered, the existing complete page remains usable. New media is not a prerequisite for security, contact or SEO work.
