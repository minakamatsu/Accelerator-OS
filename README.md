# Personal Business Accelerator OS

Internal agency software for managing client businesses and showing each client clear, tenant-safe website performance analytics. Website production happens separately; Accelerator OS connects to the finished site.

The product measures website activity and accepted estimate requests. It does not claim to generate sales, and a phone-button click is not presented as a completed call.

## Current status

Milestones 1 through 10 are complete. Milestone 11 awaits approval.

The repository includes Supabase authentication and RLS, a compact agency business roster, origin-bound analytics connections for separately hosted websites, an original fictional automotive preview, estimate-request capture, a durable one-way business-notification worker, an agency delivery log, development email capture, and a single-business client analytics dashboard with unique visitors, top pages, traffic sources, high-intent actions, device mix, and previous-period comparisons. Estimate requests appear to clients only as aggregate analytics; the CRM-style request workspace and guided website-building questionnaire are retired. Atlas and Beacon are clearly fictional local fixtures; no live email, billing, DNS, schedule, or production service is connected.

## Run locally

Requirements: Node.js 20.9 or newer, npm, and Docker Desktop for the local Supabase stack.

```bash
npm install
npm run db:start
npm run dev
```

Open `http://localhost:3000`. On Windows systems where PowerShell blocks `npm.ps1`, use `npm.cmd`.

To exercise authentication, copy the local Supabase values reported by `npm run db:start` into `.env.local` using `.env.example`. Never commit `.env.local` or expose `SUPABASE_SECRET_KEY` publicly.

Seed users use the development-only password `LocalOnly!ChangeMe2026`:

- `admin@accelerator.test` — agency administrator.
- `owner-a@accelerator.test` — Atlas client owner.
- `owner-b@accelerator.test` — Beacon client owner.
- `staff-a@accelerator.test` and `viewer-a@accelerator.test` — Atlas authorization fixtures.

## Key routes

- `/sign-in` — agency-issued account authentication.
- `/admin` — client business roster and add-business flow.
- `/admin/notifications` — agency-only business-email delivery status and terminal retry.
- `/admin/businesses/[businessId]` — client contact, location, lifecycle, website connection, and analytics installation.
- `/portal` — resolves a client directly to their single authorized business.
- `/portal/businesses/[businessId]` — client website-performance dashboard.
- `/portal/businesses/[businessId]/leads` — retired URL that returns clients to analytics.
- `/site/demo-atlas-auto` — active fictional public site.
- `/tracker.js?site=[publishable-key]` — external-site analytics tracker generated from an agency-managed connection.

## Quality gates

```bash
npm run validate
npm run validate:db
```

The individual gates are format checking, lint, strict TypeScript, application tests, production build, database reset, and database tests.

## Product documentation

- `PRODUCT_SPEC.md` — approved MVP outcome, scope, and metric definitions.
- `ARCHITECTURE.md` — application, tenancy, and analytics boundaries.
- `DATABASE_SCHEMA.md` — logical tenant-owned data model.
- `SECURITY.md` — security and privacy invariants.
- `PLAN.md` — milestone order, deliverables, and acceptance criteria.
- `AGENTS.md` — permanent repository working agreement.

Do not connect live services, change DNS, push externally, or deploy to production without explicit authorization.
