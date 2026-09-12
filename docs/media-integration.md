# Integrating the commissioned illustrations

The supporting pages are ready for AS-002 and AS-003 from the [asset manifest](asset-manifest.md). No Leonardo or Mureka order, purchase or generation job has been made by this implementation. Both image slots remain pending. The pages retain their complete text, checklists and inquiry links with no empty frame.

## Receive and review

1. Use the two Leonardo briefs in the manifest. Receive candidates, selected masters and account/rights evidence in `media-staging/` or the owner's private records, outside public serving. Never use the quarantined legacy photograph as a reference. Do not include account details, customer records, SIM identifiers, documents or QR codes in generation inputs or public deliverables.
2. Record the provider output ID, generation date/model, prompt version, plan, private-mode setting and applicable commercial-use evidence in the manifest. Verify the terms applicable to the actual order. Keep receipts and account information private.
3. Review the selected scene for misleading operational claims, identifiable people, readable information, brands, malformed anatomy and geometry. Generated people must remain illustrative scenes, never claimed staff or customers. Approve the crop and descriptive alt text. The visible caption is always **Illustrative image** for these two slots.
4. Export and inspect real 480 by 360, 800 by 600 and 1200 by 900 WebP derivatives, plus a 1200 by 900 JPEG fallback. Strip unnecessary private metadata. Keep the first two WebP files below 50,000 and 85,000 bytes; keep both 1200px files below 140,000 bytes. Inspect every exported image in an image viewer; the automated checker verifies signatures and size budgets, not visual content, decoded dimensions or rights.
5. Place only the four approved web derivatives for each selected scene in `public/assets/media/`. Filenames must match the manifest exactly. Merely adding files does not enable the images.

## Activate a reviewed scene

`src/media.js` is the reviewed static registry. There is no upload interface or media administration API. Replace only the corresponding `null` entry in `approvedMedia` with the complete object below after reviewing the actual delivered image. The crew example is ready to adapt:

```js
crewConnectivity: {
  src: '/assets/media/amicus-crew-ashore-connectivity-1200.jpg',
  srcSet: '/assets/media/amicus-crew-ashore-connectivity-480.webp 480w, /assets/media/amicus-crew-ashore-connectivity-800.webp 800w, /assets/media/amicus-crew-ashore-connectivity-1200.webp 1200w',
  width: 1200,
  height: 900,
  alt: 'Illustration of a maritime traveler checking a phone in a shoreside terminal.',
  caption: 'Illustrative image',
  sizes: MEDIA_SIZES,
},
```

For `operations`, use the `amicus-port-call-preparation` filename base and describe the actual selected coordinators scene. Keep the same dimensions, caption and sizes. The helper accepts only these exact raster filenames under the media directory and rejects missing files, remote URLs, traversal, symlinks, incompatible signatures, oversized files and incomplete display metadata. Invalid configuration suppresses the whole figure; the asset check fails so it can be corrected before deployment.

`getMedia('crewConnectivity')` and `getMedia('operations')` return a validated object or `null`. Initialize the two values when creating the app, then expose them to the templates. The `views/partials/media.ejs` partial accepts `{ media }` and renders a WebP picture with a JPEG fallback, explicit dimensions, lazy loading, async decoding, escaped alt text and visible caption. It emits no element for `null`. Restart the app after changing the registry or delivered files so startup validation uses the new release.

## Verify and publish

Run `npm run check:assets`, `npm run check:links`, `npm run lint`, `npm test -- --runInBand`, `npm run build` and the browser checks for the release. The asset checker also verifies the retained homepage photograph and the local corporate sharing card. Pending illustration slots are reported as pending and do not fail the check; an invalid activated slot does fail.

Inspect each supporting page at 320, 375, 390, 430, 768, 1024 and 1440px after integration. Check the subject, caption, reading order, crop, layout stability and primary actions. Test the WebP source and JPEG fallback. Measure the actual transferred image size on a small screen, and verify there are no image requests for pending slots. A signature check alone does not establish a valid image, privacy clearance, licensing or accessibility compliance.

Update the manifest review/status evidence when selected, approved, integrated and published. Set a registry entry back to `null` to withdraw that figure while retaining the complete page. Video and music remain deferred: no background playback, autoplay or additional third-party media requests have been introduced.
