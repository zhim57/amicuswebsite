# Phase 2 release status

Updated September 12, 2026 after production deployment and owner-confirmed email delivery. This status supersedes the pending deployment/SMTP entries in the original implementation handoff.

## Verified complete

- Commit `5f8b143` reached remote master and the VPS. Both validation and deployment succeeded in [workflow run 34700198907](https://github.com/zhim57/amicuswebsite/actions/runs/34700198907), completed at 14:46 UTC / 10:46 AM New York time.
- Live About, Crew Change, inspection and the new vessel-to-home resource returned 200 with the new content. The follow-up public audit recorded 221 passes, zero failed assertions and 15 inconclusive assertions caused by network errors on several retirement probes.
- After correction of environment names and the SMTP hostname, a live contact test at 15:49 UTC returned 200 and confirmed mail-service acceptance. Reference: `AMICUS-SMTP-20260912154939591`. The owner confirmed inbox receipt. Submission, SMTP sending and inbox delivery are verified end to end; reply routing and long-term deliverability are separate checks.
- Further public GET checks confirmed 410 and noindex for `/upload`, `/uploads/probe.html`, `/files`, `/deleted_code/schedule.html` and `/assets/images/ps4.jpg`. No historical file body was downloaded. Earlier inconclusive probes are not evidence of exposed content.

## Remaining release checks

1. Inspect actual VPS upload storage and reverse-proxy aliases; remove obsolete files if any remain. Git deployment does not delete untracked files. Public retirement responses do not reveal remote disk state or rule out another alias.
2. Confirm the stable contact-form secret, trusted-proxy setting, PM2 worker layout and public Node-port restrictions. These cannot be inferred from successful form delivery. Shared rate-limit/deduplication storage is conditional on multiple workers or operational need.
3. Walk through the corporate site on real phones, including inquiry reply routing, eSIM handoff/setup and a controlled Crew Change invitation/onboarding. Automated mobile layout checks are complete; no purchase or Crew Change registration was performed by this website task.
4. Verify the sitemap/indexed URLs in Search Console and intended Umami conversion events, cross-subdomain handling and retention. No authenticated analytics/Search Console review has been completed.

## Optional improvements

- Branded Crew Change and inspection/training subdomains after DNS, TLS and application routing are configured.
- A branded corporate inquiry mailbox/public contact address if desired; current receiving mail works.
- Confirm broader B2B payment/invoicing/distribution arrangements before advertising them.
- An approved Crew Change demo for authentic screenshots, updated credentials where appropriate, a newer professional portrait and genuine recommendations cleared for publication.

Suggested next work: complete the VPS storage/proxy/configuration check. No known failed application test or deployment step remains from the Phase 2 implementation.
