# Security and Privacy Requirements

Status: Approved baseline; Milestone 2 authentication, authorization, RLS, and tenant constraints are implemented and tested.

## Non-negotiable invariants

1. A client must never read or modify another client's data.
2. Tenant authority is derived server-side; browser-supplied `business_id` is never trusted.
3. Database service credentials, webhook secrets, and email/payment keys remain server-only.
4. Payment-card data never enters this application.
5. Unavailable credentials produce an explicit disabled/development state, not a pretend-success integration.

## Authentication and authorization

- Require authentication for admin and client routes.
- Use both application checks and database row-level security.
- Re-check membership and role on every mutation.
- Keep platform-admin capabilities distinct from tenant membership.
- Enforce one business membership per client identity in the MVP; multiple businesses require separate account identities.
- Deny by default for missing, suspended, or ambiguous tenant context.
- Test horizontal access by changing IDs and vertical access by using lower roles.

## Public lead endpoint

- Resolve tenant from verified host or server-side development slug.
- Validate input with strict schemas, size limits, and canonical formats.
- Enforce origin/host expectations where reliable, rate limits, honeypot/timing signals, and Turnstile before production.
- Store exact consent disclosure version and time when consent is relied upon.
- Return a generic success response that does not expose tenant internals.
- Escape untrusted content in email and UI; never render customer HTML.
- Bind the expected public slug in the server action, verify custom-host resolution, and derive `business_id` again inside the service-role database function.
- Deduplicate accepted retries with a tenant-scoped submission key before applying short-window rate limits.
- Store only a one-way request fingerprint for abuse controls; do not store raw IP addresses for this purpose.

## Public analytics endpoint

- Accept only allow-listed page-view, phone, directions, contact, and accepted estimate-request event types through same-origin Route Handlers or the validated request action.
- Derive the tenant from a trusted active slug/host lookup; never accept a browser tenant ID.
- For separately hosted sites, resolve the tenant from a random publishable site key and require an exact match between the request Origin hostname and the agency-configured hostname. Re-resolve both inside the service-role database function.
- Keep analytics installation keys admin-only in normal table reads. Rotation invalidates the prior key; disabling, pausing, or archiving blocks new events.
- Exclude authenticated agency preview mode so internal review does not inflate client results.
- Hash a random browser identifier with the trusted business slug before storage so the stored value cannot correlate a browser across businesses.
- Store only the event type, public path, normalized referral hostname, bounded UTM source, device category, and timestamp needed for aggregate reporting. Never store the raw browser identifier, raw IP address, or full referring URL.
- Never label a phone, directions, or contact click as a connected call, completed visit, sent message, or qualified customer.

## Webhooks and jobs

- Verify provider signatures against the raw request body when required.
- Store and enforce provider event IDs for idempotency.
- Acknowledge only according to the provider's retry contract.
- Re-check current state before processing a delayed action.
- Use job leases, bounded retries, and a visible terminal failure state.
- Protect scheduled worker routes with a secret or platform-supported authentication.

## Data minimization

- Collect only information needed to respond to the service request.
- Do not send form contents or contact details to general analytics.
- Redact logs and exception context.
- Define retention/export/deletion procedures before production.
- Treat review excerpts, photos, logos, and claims as publishable only when the client confirms rights/accuracy.
- Legacy preview assets remain private. Website production facts and image-rights records belong to the separate production workflow, not the simplified Accelerator OS client record.

## Secrets and environment configuration

- `.env*` is ignored except `.env.example`.
- Public environment variables are limited to intentionally publishable identifiers.
- Import server-only modules behind a `server-only` boundary.
- Validate environment variables at startup/build without printing secret values.
- Use separate credentials and databases for preview and production.

## Billing

- Redirect users to provider-hosted checkout.
- Persist external IDs and normalized subscription state only.
- Verify webhook authenticity and deduplicate events.
- Failed payment does not instantly take a client's site offline in the MVP; notify the agency for manual review.

## Email and consent

- Business request notifications identify the business and why the shop address is receiving them.
- The worker re-reads the tenant, request, enabled event kind, and current notification recipient immediately before delivery; a removed recipient cancels unsent work.
- Worker claims use short leases and unpredictable lease tokens. Provider calls use deterministic idempotency keys, retries are bounded, and stored failure codes never contain provider responses or customer content.
- Client accounts cannot read internal outbox or provider-delivery records; operational visibility and terminal retry remain agency-admin only.
- Development captures are never labeled as sent. A provider-accepted message is not labeled as delivered without verified provider evidence.
- Customer confirmations, reminders, suppression workflows, and other follow-ups are not enabled in the current scope.
- No SMS is implemented until consent language, opt-out handling, sender registration, and legal/provider requirements are separately approved.

## Verification gates

Before preview:

- Dependency, secret, authorization, validation, accessibility, and responsive checks.
- Automated tenant-isolation tests using at least two tenants and three roles.
- Webhook replay and duplicate-delivery tests.

Before production:

- Review every environment variable and provider mode.
- Verify RLS is enabled and policies are deployed.
- Run a real provider test-mode lead/email/billing flow.
- Verify backup/restore and incident contacts.
- Complete applicable privacy policy, terms, consent text, and client agreements with qualified legal input.
