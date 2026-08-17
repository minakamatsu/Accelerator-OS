# Personal Business Accelerator OS — Product Specification

Status: Approved simplified agency and analytics-only client MVP — 2026-08-17  
Initial vertical: General automotive repair  
Product type: Internal agency operating system with a focused client portal

## 1. Product outcome

Personal Business Accelerator OS lets one agency keep a compact client roster, connect separately produced local-business websites, and show each client clear evidence of how that website is being used. It does not build the websites or promise that software generates sales.

The client-facing product answers these questions first:

1. How many people visited and how has that changed?
2. Which pages and traffic sources attracted them?
3. How many estimate requests and other high-intent actions occurred?
4. Were visitors primarily using mobile, tablet, or desktop devices?

Estimate requests contribute to the dashboard count, but individual request records are not exposed in the client portal. The MVP is an analytics product—not a CRM, shop-management system, estimating system, appointment scheduler, or inbox replacement. A separate one-way notification sends accepted request details to the shop once live email credentials are configured.

## 2. Primary users

### Agency administrator

The agency owner can add businesses, keep client contact/location details, connect or disable a live website analytics installation, activate, pause, archive, or restore a client, and inspect the same website dashboard the client sees.

### Business owner or staff member

Each client account belongs to exactly one business in the MVP. After signing in, the user goes directly to that business's website-performance dashboard. A person who owns multiple businesses receives a separate account/email identity for each business.

The client experience must be calm, analytics-led, plain-language, mobile-first, and immediately understandable to a busy business owner. It should use restrained presentation, clear metric definitions, and complete empty/error/loading states.

### Prospective customer

A public visitor can view the correct business site, press a phone link, and submit an estimate request without creating an account.

## 3. MVP scope

### Agency administration

- Secure sign-in and role-based access.
- Business roster with inactive, active, paused, and archived states.
- Compact private record for client contact, location, website URL, and reporting timezone.
- One revocable analytics connection and copyable external-site installation snippet per business.
- Direct agency access to the same tenant-scoped analytics dashboard the client sees.
- Website facts, service writing, design direction, imagery, and production approvals stay in the agency's separate website-building workflow.

### Public business site

- An original, multi-page automotive-repair experience populated only from approved facts.
- Excellent mobile layout, crawlable navigation, route-specific metadata, and accessible calls to action.
- Estimate-request form, page-view recording, and click-to-call recording.
- Tenant resolution by trusted development slug or verified custom domain.
- Unknown or suspended tenants fail closed and never expose another tenant's content.

Each activated site requires approved facts, imagery rights, brand direction, CTA, and originality review. Unsupported services, testimonials, ratings, certifications, guarantees, hours, or claims are never invented.

### Client dashboard

- Direct entry to the signed-in client's single business.
- Date ranges for recent website performance.
- Website page views.
- Unique website visitors and comparison with the immediately preceding period.
- Estimate requests received through the website.
- Phone-button, directions, and contact clicks, each described as an action rather than a completed customer outcome.
- Visitor action rate, defined as identified visitors with at least one tracked high-intent action divided by identified visitors.
- Top pages, normalized traffic sources, and mobile/tablet/desktop breakdowns.
- A readable activity trend and honest zero-data states.
- No client-facing website health, speed, Core Web Vitals, deployment, or infrastructure metrics.

### Estimate-request capture

- Validated estimate-request submission with consent, source/UTM capture, and spam defense.
- Tenant-scoped records retained as the trusted source for aggregate request counts and one-way shop email notifications.
- No client-facing request list, individual request record, lead stage, note, recorded value, or pipeline action.
- Each accepted request atomically creates one business-notification job per configured shop address. Development capture must not be presented as live delivery.
- Automatic estimates, invoicing, appointment scheduling, and two-way customer messaging are not part of this milestone.

### Email and billing foundations

- Idempotent, lease-based business-notification worker with bounded retries, template versions, recipient re-checks, and an agency-only delivery log.
- Customer confirmations, reminders, and other follow-up automation are not enabled.
- Development providers are visibly labeled and never presented as live delivery.
- Billing stores only external references and normalized subscription status; card data never reaches the application.

## 4. Explicitly out of scope

- Full CRM or required lead-stage administration.
- Client-facing request records, lead stages, notes, values, or inbox workflows.
- Automatic repair estimates or pricing advice.
- Two-way customer email/SMS inboxes, automated SMS, or calling.
- AI chatbots, autonomous sales conversations, or AI-generated business claims.
- Drag-and-drop page building, automated advertising, accounting, invoicing, or appointment scheduling.
- More than one business membership per client identity in the MVP.
- Public self-service signup.
- A website builder, guided content questionnaire, design-approval system, or provider-readiness checklist inside Accelerator OS.

## 5. Core workflows

### Connect a business

1. An admin adds the business name and any known client contact/location details.
2. The admin saves the finished live website URL.
3. Accelerator OS generates a publishable, revocable tracking snippet restricted to that website hostname.
4. The snippet is installed in the separate website project and confirms after its first accepted event.
5. The admin activates the business and can open the same analytics dashboard the client receives.

### Understand website performance

1. The client signs in with the account issued for one business.
2. The server resolves that user's authorized business; the browser does not choose a tenant.
3. The client lands directly on a dashboard with clearly defined website metrics.
4. The client can change the date range without entering a request-management workflow.

### Capture a website request

1. A visitor submits the public estimate-request form.
2. The server resolves the tenant from the trusted route/host and validates the request, consent, spam evidence, and rate limit.
3. The request and one-way business-notification job are committed atomically.
4. The dashboard count updates from the accepted request record.
5. The worker safely captures the business email in development or sends it through the configured provider; no estimate is generated automatically.

## 6. Metric definitions

- **Website page views:** recorded loads/navigation of the business's public pages. Agency preview mode is excluded.
- **Unique visitors:** distinct one-way anonymous visitor identifiers recorded during the selected period. No raw IP address or cross-business identifier is stored.
- **Estimate requests:** accepted estimate-request forms created during the selected period.
- **Phone-button clicks:** presses on tracked telephone links. This does not prove that a call connected or was answered.
- **Directions clicks:** presses on a tracked directions link. This does not prove that the visitor arrived at the business.
- **Contact clicks:** presses on a tracked email/contact link. This does not prove that a message was sent.
- **Visitor action rate:** identified visitors who recorded at least one phone, directions, contact, or accepted estimate-request action divided by all identified visitors in the selected period.
- **Traffic source:** a normalized source such as Direct, Google, Facebook, or a referral hostname; full referring URLs are not stored.
- **Device type:** a mobile, tablet, or desktop category derived from the browser viewport when a page view is recorded.
- **Performance comparison:** the selected period compared with the immediately preceding period of the same length.
- **Recorded values:** optional operator-entered values; they are not accounting-verified revenue.

## 7. Success measures

- No cross-tenant data access in automated authorization tests.
- A normal client account lands directly on one business dashboard.
- Every dashboard metric has a visible, precise definition and reconciles with fixture data.
- Public page-view and phone-click events derive their tenant on the server.
- Estimate requests are visible as an aggregate metric without exposing a client CRM workflow.
- Client-facing flows pass mobile, desktop, accessibility, and visual review.
- The agency can explain every reported metric and its source without overstating what it proves.

## 8. Approved defaults

1. Product name: **Personal Business Accelerator OS**.
2. First niche: **general automotive repair shops**.
3. Data/auth/storage: **Supabase**.
4. Email provider: **Resend**.
5. Hosting/domains: **Vercel**.
6. Client-account model: **one business per account/email**.
7. Client home: **website analytics dashboard**.
8. Website requests: **aggregate dashboard count; one-way business notification with development capture by default**.
9. Billing enforcement: **notify and manually suspend**.

Approval of this document authorizes the listed MVP work, not production deployment or use of live credentials.
