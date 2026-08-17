# Database Schema

Status: Milestones 2 through 10 implemented in `supabase/migrations` and verified with pgTAP tenant-isolation, public-site, request-capture, expanded client-analytics, notification, and external-analytics tests.

## Conventions

- Primary keys are UUIDs.
- Tenant-owned tables contain a non-null `business_id` foreign key.
- Times are stored as timezone-aware timestamps.
- Money is stored as integer minor units plus ISO currency code.
- Mutable tables include `created_at` and `updated_at`.
- User-facing deletion defaults to archival/soft deletion when records are needed for audit or billing.

## Platform and tenancy

### `businesses`

Tenant root: `id`, internal `slug`, `name`, `category`, `status`, `timezone`, `currency`, private client-contact name/email/phone, legacy onboarding fields retained for fixture compatibility, timestamps.

Status: `draft | active | suspended | archived`.

### `profiles`

Platform user profile keyed to the authentication provider: `id`, `display_name`, `platform_role`, timestamps.

Platform role: `admin | member`. Client authorization still requires a membership.

### `business_memberships`

Tenant-owned: `id`, `business_id`, `user_id`, `role`, `status`, timestamps.

Role: `owner | manager | staff | viewer`.

Unique `(business_id, user_id)`. The MVP also enforces unique `user_id`, so one client identity cannot belong to multiple businesses. Platform administrators manage businesses through their separate platform role rather than extra client memberships.

### `business_domains`

Tenant-owned: `id`, `business_id`, `hostname`, `status`, `verification_token_hash`, `verified_at`, `is_primary`, timestamps.

Unique normalized `hostname`. Status: `pending | verified | failed | removed`.

## Business content

### `business_profiles`

Tenant-owned one-to-one content record: `business_id`, public phone/email, website URL, contact preference, address fields, service area, hours JSON, map URL, review URL, primary CTA, short value proposition, approved offer, tone, fact-source notes, locale, timestamps.

### `brand_settings`

Tenant-owned one-to-one design input: `business_id`, logo asset reference/treatment, color direction/tokens, image permissions/source notes, typography direction, shape/motion preferences, signature feature, design notes, timestamps.

### `services`

Tenant-owned: `id`, `business_id`, `name`, `slug`, `short_description`, `display_order`, `is_featured`, `is_active`, timestamps.

Unique `(business_id, slug)`.

### `business_assets`

Tenant-owned: `id`, `business_id`, `storage_path`, `kind`, `alt_text`, `source`, `permission_notes`, timestamps.

Files are stored in the private `business-assets` bucket with tenant-prefixed paths, five-megabyte limits, approved raster MIME types, storage RLS, and authenticated no-store delivery.

## Website requests and activity

### `leads`

Tenant-owned: `id`, `business_id`, `status`, contact fields, service request, vehicle fields, message, source/UTM fields, consent text/version/time, submission idempotency key, one-way short-window request fingerprint, estimated value, won value, currency, assigned user, contacted/won/lost timestamps, loss reason, timestamps.

Indexes begin with `business_id`, followed by commonly filtered time/status fields.

### `lead_notes`

Tenant-owned: `id`, `business_id`, `lead_id`, `author_user_id`, `body`, timestamps.

The database verifies that the note and lead share the same `business_id`.

### `lead_events`

Tenant-owned append-only audit stream: `id`, `business_id`, `lead_id`, `event_type`, `actor_type`, `actor_user_id`, minimal JSON metadata, `created_at`.

### `site_events`

Tenant-owned: `id`, `business_id`, `event_type`, business-scoped anonymous visitor hash, source/UTM fields, normalized referral hostname, device category, public path, `created_at`.

The public recorder accepts only `page_view`, `phone_click`, `directions_click`, `contact_click`, and accepted `estimate_request` attribution events. It derives the tenant from an active server-resolved slug and is executable only by the server service role. Client reads remain RLS-scoped. Indexes support business/type/date queries and distinct visitor aggregation.

No free-form sensitive contact data, raw browser identifier, raw IP address, or full referring URL belongs in this table. Click events prove only that the corresponding tracked link was pressed; they are not evidence of a completed call, visit, message, or job.

### `analytics_connections`

Tenant-owned one-to-one installation record: `id`, `business_id`, random publishable `site_key`, normalized allowed hostname, connection status, last accepted event time, timestamps.

Normal reads and mutations are agency-admin only. The external recorder is executable only by the server role and resolves the tenant from both the site key and exact origin hostname. Rotation invalidates the old key; disconnected, suspended, and archived businesses cannot record new external events.

## Messaging and automation

### `automation_rules`

Tenant-owned: `id`, `business_id`, `kind`, `enabled`, delay, template version, eligibility configuration, timestamps.

### `notification_recipients`

Tenant-owned: `id`, `business_id`, recipient type/address, enabled event kinds, verified state, timestamps.

### `outbox_jobs`

Tenant-owned durable jobs: `id`, `business_id`, `lead_id`, `kind`, `run_after`, `status`, `attempt_count`, `lease_until`, unpredictable `lease_token`, `idempotency_key`, sanitized payload, last error code, timestamps.

Unique `idempotency_key`. Status: `pending | processing | sent | canceled | failed`.

`capture_public_lead` is service-role only. It derives `business_id` from an active approved slug and atomically creates the request, initial event, and eligible one-way business notification jobs. Customer-confirmation jobs are suppressed because customer automation is outside the approved scope. Server-only claim/complete/fail/cancel functions enforce the active lease token and bounded four-attempt schedule. Client accounts have no table grant for jobs or delivery records.

### `message_deliveries`

Tenant-owned: `id`, `business_id`, `lead_id`, unique `outbox_job_id`, `provider`, `provider_message_id`, masked recipient display, template/version, status, timestamps. `captured` is development evidence only; `sent` means the provider accepted the request and is not presented as inbox delivery proof.

## Billing and integrations

### `subscriptions`

Tenant-owned: `id`, `business_id`, `provider`, external customer/subscription IDs, plan code, normalized status, current period end, last webhook time, timestamps.

No card or bank data.

### `webhook_events`

Provider/system table: `id`, `provider`, `external_event_id`, signature_verified`, received/processed times, status, sanitized error. Payload storage is minimized and encrypted/redacted where retained.

Unique `(provider, external_event_id)`.

### `integration_connections`

Tenant-owned: `id`, `business_id`, `provider`, external account reference, status, capability flags, timestamps. Secrets are stored in a managed secret system or encrypted server-only store, not exposed through normal selects.

## Audit

### `audit_log`

Tenant-owned when related to a tenant: `id`, `business_id`, actor, action, resource type/id, safe before/after summary, request ID, `created_at`.

Platform-only actions may have no tenant and must be restricted to platform administrators.

## Authorization policy outline

- Platform admins can operate across tenants through explicit admin-only server paths.
- Client users can select tenant rows only when an active membership exists.
- Client mutations are restricted by membership role and allowed columns/transitions.
- Public visitors cannot select tenant tables and can only submit through the validated server endpoint.
- Storage objects use server-generated tenant prefixes and equivalent membership policies.
- Service-role access is never available to browser code.
