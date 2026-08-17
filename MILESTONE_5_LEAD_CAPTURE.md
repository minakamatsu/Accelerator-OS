# Milestone 5 lead capture and pipeline record

Completed for the fictional Atlas development pilot on August 15, 2026. No live provider delivery or real customer data is represented.

## Approved default public fields

- Full name (required)
- At least one of phone or email (required)
- Closest verified service category (optional; includes an honest “not sure” choice)
- Vehicle year, make, and model (optional)
- Plain-language service request (required)
- Additional context (optional)
- Contact consent (required)

No payment-card data, SMS consent, marketing opt-in, diagnosis, price promise, appointment promise, or invented service selection is collected.

## Consent record

Version: `contact-request-v1-2026-08-15`

Template: `By submitting this form, I agree that {business name} may contact me by phone call or email about this service request. This is not consent to marketing messages.`

The exact rendered disclosure, version, and timestamp are stored with every accepted lead. Production legal review remains a launch prerequisite.

## Duplicate and retry rule

Each rendered form receives one signed, opaque idempotency key. Replaying that key for the same server-resolved business returns the original accepted lead and creates no additional lead, event, or notification job. A newly rendered form receives a new key and represents a new request.

## Tenant and abuse controls

- The server action binds the expected slug server-side and verifies the request host. Custom domains must resolve to the same active business.
- The database resolves `business_id` from the active approved slug. The browser never submits a tenant ID.
- Direct anonymous table writes and direct execution of the capture RPC are denied.
- Zod and database constraints enforce lengths, contact requirements, service ownership, vehicle-year bounds, and consent.
- A honeypot, minimum completion-time signal, same-origin/host validation, and a short-window one-way request fingerprint protect development capture.
- Turnstile has a real server-verification adapter for enabled environments. The current pilot uses the explicitly labeled development adapter.
- Raw IP addresses and full request bodies are not written to logs or abuse-control columns.

## Atomic work and development email capture

The database function commits the lead, initial `lead.created` event, customer-confirmation job when email is supplied, and one business-notification job per configured recipient in a single transaction. Development delivery writes `message_deliveries.status = captured`, masks the recipient for display, and marks the corresponding job complete without sending an email. Resend is implemented behind the same server-only adapter but was not invoked without approved test credentials.

## Client pipeline

Authenticated tenant members can read only assigned businesses through RLS. Owners, managers, staff, and platform administrators can use authorization-checked RPCs to update status, record estimated/won value, and add internal notes. Viewers remain read-only. Every mutation writes a tenant-scoped event; delivery records are visible only where existing manager-level RLS permits them.
