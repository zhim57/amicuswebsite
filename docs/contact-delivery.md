# Contact delivery — Phase 2

`POST /contact` now validates a normal HTML form, sends a plain-text inquiry through SMTP, and reports success only after the transport accepts the configured recipient. The form works without JavaScript; JavaScript adds a sending state and prevents accidental repeat clicks. Errors keep escaped input available for correction. Provider acceptance confirms the handoff, not inbox placement or a reply.

No SMTP settings or corporate-domain inquiry mailbox were found in repository configuration. Only environment key names were inspected. The existing corporate email remains the direct fallback; store support is a separate destination. No external email was sent during implementation or tests.

> Production follow-up: corrected SMTP environment names and hostname are loaded. The live form returned 200 for test `AMICUS-SMTP-20260912154939591`, and the owner confirmed inbox receipt. SMTP provisioning is complete; see [release status](release-status.md). The configuration instructions below remain useful for maintenance.

## Deployment configuration

Provision these settings privately in the existing server/PM2 environment; `.env.example` contains names and comments only:

| Setting | Purpose |
| --- | --- |
| `SMTP_HOST` | The chosen provider's SMTP hostname. Required. |
| `SMTP_FROM` | One real mailbox authorized to send through that provider. Required; use a bare address. |
| `SMTP_PORT` | Default `587`, with mandatory STARTTLS. Use `465` with `SMTP_SECURE=true` for implicit TLS. |
| `SMTP_SECURE` | `true` for implicit TLS; otherwise `false`. Certificate validation remains enabled in both modes. |
| `SMTP_USER`, `SMTP_PASS` | A complete credential pair when the provider requires authentication. An authenticated internal relay can use its existing access controls without these values. |
| `CONTACT_TO` | Optional single inquiry recipient. Defaults to `site.email` in `src/site-data.js`. |
| `CONTACT_FORM_SECRET` | At least 32 random characters, stable across workers/restarts. |
| `TRUST_PROXY` | Trust only the actual proxy path so client rate limits cannot be forged. |

An absent or invalid mail configuration produces a friendly 503 response with a direct-email fallback. It never fabricates a delivered inquiry. Configure a branded mailbox only after it exists and can receive messages. Then set `CONTACT_TO` and update the centralized public `site.email` as appropriate. Do not repurpose the store support mailbox as the corporate inquiry recipient without confirming ownership and routing.

After configuration, a controlled owner-approved live submission should verify SMTP acceptance, inbox/spam placement, reply routing and any provider sender-domain requirements. A server restart may be needed to load environment changes. The application does not create mailboxes, alter DNS or deploy credentials.

## Security and operational behavior

- Name, email, interest and message are required. Company, phone/WhatsApp and visitor type are optional. Choices are allowlisted and lengths bounded on the server.
- Duplicate fields, single-line controls, malformed/batched addresses, honeypots, expired/tampered form tokens and cross-site submissions are rejected before delivery. The existing five attempts per fifteen minutes per client limit remains ahead of body parsing.
- SMTP uses a fixed configured envelope and sender. The validated visitor address is a structured Reply-To. The message is plain text; reflected browser values are EJS-escaped. File/URL attachment access is disabled, and SMTP debug logging is disabled.
- Only allowlisted error codes enter application logs. Request bodies, addresses, SMTP responses, credentials and exception stacks are not logged by this workflow. Review proxy/provider retention separately.
- Concurrent retries with the same signed token and content share one pending delivery; successful refreshes reuse the outcome. Changed content on a used token receives a new form and a 409. The bounded in-memory map retains token/payload hashes and outcomes until the one-hour token expiry, without storing inquiry content.
- This duplicate protection and rate limiting are per Node process. Multi-worker deployments need shared abuse and idempotency storage for guarantees across workers/restarts. SMTP has no general exactly-once guarantee: if an acknowledgement is lost after acceptance, a deliberate retry can still duplicate mail. The failure message therefore says delivery could not be confirmed. No automatic retry or database queue is introduced.
- Successful delivery clears the reflected form fields. The website does not persist inquiry text in a file/database; the configured mail provider and recipient mailbox necessarily process/store email. The current privacy page must reflect that behavior.

## Verification

`__tests__/contact-phase2.test.js` exercises the complete local HTTP success/error workflow with an injected mail transport, validation, origin/token protection, rate limiting, duplicate concurrency, memory bounds, TLS settings and acceptance requirements. Nodemailer's real stream transport builds and inspects MIME locally; it sends no external messages and its acceptance result is explicitly synthetic. Missing configuration and SMTP rejection are tested as errors, not successes.

Implementation references: [Nodemailer SMTP transport](https://nodemailer.com/smtp), [message configuration](https://nodemailer.com/message), and [SMTP envelope](https://nodemailer.com/smtp/envelope).
