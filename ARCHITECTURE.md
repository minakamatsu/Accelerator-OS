# Architecture

Status: Approved simplified agency and analytics-only client baseline — 2026-08-17

## 1. System shape

One Next.js App Router application serves three surfaces:

- `admin`: platform-wide agency operations.
- `portal`: authenticated, tenant-scoped client website analytics and diagnostics.
- `site`: retained fictional public preview pages; production client websites may be hosted separately.

The default runtime is Node.js. Server Components read internal data, Server Actions handle authenticated UI mutations, and Route Handlers accept public/external HTTP calls.

## 2. Service boundaries

| Concern             | MVP choice             | Boundary                                                     |
| ------------------- | ---------------------- | ------------------------------------------------------------ |
| Web application     | Next.js + TypeScript   | App Router, server-first rendering                           |
| Database            | Supabase Postgres      | Source-controlled migrations, grants, and RLS                |
| Authentication      | Supabase Auth          | Browser receives only publishable credentials                |
| Assets              | Supabase Storage       | Private tenant-prefixed objects and storage policies         |
| Transactional email | Resend                 | Server-only adapter with development capture                 |
| Billing             | Square hosted checkout | Server-only adapter; no card data                            |
| Hosting             | Vercel                 | Preview first; production needs explicit approval            |
| Spam protection     | Cloudflare Turnstile   | Development adapter locally; real verification before launch |
| Analytics           | First-party events     | Tenant-scoped, minimal payloads, no secret client data       |

## 3. Client account and routing model

Client identities have one business membership in the MVP. After authentication, `/portal` resolves memberships server-side:

- one business: redirect to `/portal/businesses/[businessId]`;
- no business: show a clear access-setup state;
- multiple businesses: fail closed with a configuration message so the agency can issue separate account identities.

The browser never supplies a trusted tenant choice. Every dashboard read is constrained by authenticated server code and database RLS. Individual estimate-request records and lead stages are not exposed in the client portal. Platform administrators retain a separate cross-business agency surface.

## 4. Public tenant resolution

1. Normalize the request hostname.
2. Match only an active, verified domain, or use an explicit development/preview slug.
3. Derive `business_id` from that trusted lookup.
4. Never accept `business_id` from a public form or analytics request as authority.
5. Unknown, unverified, or suspended tenants return a neutral unavailable response.

Separately hosted websites use a different but equivalent trusted lookup: a random publishable `site_key` resolves one `analytics_connections` row, and the request `Origin` hostname must exactly match that row's configured hostname. The browser never submits `business_id`. Rotated, disabled, suspended, or archived connections fail closed.

## 5. Analytics flow

Platform-hosted preview pages record allow-listed events through same-origin Route Handlers. Separately hosted sites load the generated tracker and send the same minimal event shape to a cross-origin Route Handler. That handler validates the publishable key and `Origin`, hashes the anonymous visitor identifier, and invokes a narrowly scoped service-role database function that resolves the tenant again.

- `page_view`: one public route view/navigation; authenticated agency preview mode is excluded.
- `phone_click`: a telephone-link press; it is never labeled as a completed call.
- `directions_click`: a map/directions-link press; it is never labeled as a completed visit.
- `contact_click`: an email/contact-link press; it is never labeled as a sent message.
- `estimate_request`: an accepted public request used only to attribute a high-intent action to an anonymous visitor; the authoritative request total still comes from accepted request records.
- estimate requests are counted from accepted tenant-owned request records, not client-side events.

Page views carry a one-way anonymous visitor identifier, normalized traffic source, and viewport-derived device category. The raw browser identifier, raw IP address, and full external referring URL are not stored. The visitor identifier is scoped by business before hashing so it cannot correlate the same browser across tenants.

Request records remain protected operational data used for aggregate counts and one-way business-email delivery. They are not a client CRM surface.

Dashboard aggregation runs server-side for the authorized business and selected date range. Agency administrators deliberately reuse this same route and aggregation instead of maintaining an agency-only copy. It returns only serializable counts and trend points. Event rows remain protected by RLS and indexed by business, type, and timestamp.

The client dashboard intentionally excludes website health, speed, Core Web Vitals, deployment, and infrastructure data. Those are agency/developer concerns, not business-performance statistics.

## 6. Data access and authorization

- Server Components and server-only repository functions perform reads.
- Authenticated mutations use Server Actions with validation, session checks, membership checks, and RLS.
- Public writes use Route Handlers with origin/spam validation and idempotency where applicable.
- Service-role access is isolated to server-only modules and narrowly scoped operations.
- Grants and RLS are both maintained explicitly; UI visibility is never authorization.
- Every tenant-owned record contains `business_id` and cross-tenant relationships are database-constrained.

## 7. Background work

The durable unit of notification work is a tenant-owned database outbox row, not an in-memory timer. Each accepted estimate request creates the eligible business job in the same transaction. A server-only worker atomically claims due work with a five-minute lease and unpredictable lease token, re-checks the current recipient, renders the versioned plain-text template, and completes, cancels, or schedules a bounded retry. The provider receives the job's deterministic idempotency key, and one delivery outcome is stored per job.

The public form schedules a best-effort post-response worker run for prompt local handling. A secret-protected route can process remaining due work on an external schedule; production scheduling is deferred until production readiness. The agency delivery log is the only UI for operational status and manual terminal-failure retry. Client accounts have no read grant for notification jobs or provider delivery records.

Customer confirmations, reminders, SMS, two-way messaging, and expanded follow-up automation are not enabled. Email delivery is not required for analytics.

## 8. Caching and observability

- Admin and portal data are dynamic and user-scoped.
- Public configuration caches are keyed and invalidated per business.
- Logs may include request/event IDs and authorized business IDs, but never full form bodies, tokens, secrets, or email content.
- Marketing analytics and operational health remain distinct.

## 9. Environments

- Local: seeded fictional tenants and safe development providers.
- Preview: isolated non-production data and provider test modes.
- Production: live credentials only after security review and explicit approval.

No preview is promoted to production without explicit user authorization.
