# Delivery Plan

Status: Milestones 1 through 10, notification reporting, account recovery, and mandatory administrator MFA are deployed. The whole-project maintenance and personal account-settings follow-ups are locally validated and await review before publication. Live Resend activation, the real-site analytics pilot, and Square billing follow later.

Scope changes are recorded here before implementation. Milestones are completed and reviewed one at a time.

## Milestone 1 — Foundation (complete 2026-08-13)

Delivered the Next.js App Router foundation, auth/platform/public route groups, responsive shells, server-only environment validation, safe development provider interfaces, and quality tooling.

Validation: formatting, lint, type-check, unit tests, production build, responsive/browser checks, and accessibility review passed.

## Milestone 2 — Multi-tenant data and authorization (complete 2026-08-13)

Delivered the tenant-owned PostgreSQL model, Supabase authentication, least-privilege grants, forced RLS, typed data access, fictional two-tenant fixtures, server-only privileged access, and pgTAP authorization coverage.

Validation proved anonymous denial, tenant isolation, role restrictions, platform-admin access, and cross-tenant relationship rejection.

## Milestone 3 — Guided business onboarding (complete 2026-08-15)

Delivered agency business creation, sourced facts, hours/services/contact/brand inputs, private asset handling, completion/readiness states, approval invalidation, activation/suspension controls, and audit records.

Validation covered approval sequencing, fail-closed activation, private assets, tenant safety, mobile/desktop presentation, and accessibility.

## Milestone 4 — Automotive public site and tenant routing (complete 2026-08-15)

Delivered the original multi-page Atlas automotive experience, mobile-first layout, verified content inventory, service detail/concern/visit routes, crawlable navigation, tenant-safe host/slug resolution, metadata, structured data, sitemap/robots rules, public preview controls, and phone-button tracking.

Validation covered public routes, verified-host routing, unavailable states, metadata, click tracking, responsive layouts, keyboard/reduced-motion behavior, and visual quality.

## Milestone 5 — Estimate-request capture (complete 2026-08-15)

Delivered the validated public estimate-request form, consent/source capture, spam adapters, rate limiting, idempotent tenant-safe request/outbox creation, development email capture, and authenticated request records with optional notes/status/value fields.

The request workspace is retained as supporting functionality. It is no longer the center of the client experience and clients are not required to maintain a CRM pipeline for analytics to work.

## Milestone 6 — Single-business client analytics dashboard (complete 2026-08-16)

Objective: return the product to its original analytics-first promise. A client signs in to one business and immediately sees clear evidence of website activity. Website requests live on a separate secondary page.

Deliverables:

- Enforce the one-business-per-client-identity MVP rule.
- Resolve `/portal` server-side and send a normal client directly to their authorized business dashboard.
- Add tenant-safe public page-view recording while excluding authenticated agency preview mode.
- Aggregate website page views, estimate requests, phone-button clicks, and request conversion rate for 7-, 30-, and 90-day ranges.
- Add an accessible performance trend and honest zero-data states.
- Use precise explanations: phone-button clicks are not completed calls; requests are not estimates or guaranteed jobs.
- Keep individual request records off the dashboard and link to a separate Website requests page.
- Simplify request-page wording and navigation so it is clearly supporting detail.
- Preserve agency multi-business administration separately from the client experience.
- Meet the permanent polished, restrained, mobile-first client UI standard.

Acceptance:

- An account with one membership lands directly on its business dashboard after sign-in.
- An account with zero memberships gets an access-setup state; multiple memberships fail closed with a configuration message.
- Every metric reconciles with fixture events/requests and shows its definition.
- Page-view and phone-click capture derive the tenant from a trusted server-side slug/host lookup.
- Agency preview mode does not inflate client analytics.
- Dashboard and request reads remain protected by server authorization and database RLS.
- Tenant-isolation and account-cardinality regression tests pass.
- Dashboard, date filters, navigation, empty/error states, and the separate requests page pass mobile, desktop, keyboard, reduced-motion, and accessibility review.

Completion record:

- Reframed the approved product specification, architecture, schema notes, security requirements, README, and roadmap around a one-business, analytics-first client experience; follow-up automation and deeper reporting now follow this milestone.
- Added a database-enforced one-business-per-client-identity rule while keeping platform-admin access separate.
- Added server-derived public page-view capture alongside existing phone-click capture, with a strict event allow-list, same-origin handling, preview exclusion, minimal event data, and a business/type/timestamp query index.
- Added server-side 7-, 30-, and 90-day aggregation for page views, accepted estimate requests, phone-button clicks, request conversion rate, and accessible trend buckets.
- Added a restrained, mobile-first Website performance dashboard with clear metric definitions, truthful empty states, direct website access, and no individual request rows.
- Changed `/portal` so a normal client goes directly to the one authorized business; zero or multiple memberships fail closed with clear setup guidance. Agency administrators remain in the separate agency surface.
- Moved Website requests into secondary navigation, removed the route loading screen, simplified request wording, and placed status/value/note tools inside a collapsed section explicitly labeled optional.
- Validation passed: formatting, lint, strict type-check, 50 application tests, production build, clean database reset, and all 68 pgTAP tests. Supabase security/performance advisors returned no error-level findings; the remaining warnings predate this milestone and concern overlapping permissive policies on unrelated foundation tables.
- Browser verification passed for direct client routing, agency/client separation, dashboard metric reconciliation, date-range structure, public page-view capture, preview exclusion, request filtering without a top reset, optional request tracking, desktop overflow, and the absence of the workspace loading screen. Mobile-first expansion rules have dedicated regression coverage.

Milestone 7 supersedes the client request-workspace portions of this completion record while preserving request capture as the source for aggregate analytics.

## Milestone 7 — Analytics-only client experience (complete 2026-08-16)

Objective: keep the client product focused on website diagnostics and analytics. A business owner sees performance metrics, the estimate-request count, and the public website—not individual request records or CRM stages.

Deliverables:

- Remove Website requests and lead-stage navigation from the client portal.
- Keep accepted estimate-request records as the tenant-safe source for aggregate counts.
- Retire client request-list/detail URLs by returning authorized users to their business dashboard.
- Remove client-facing pipeline, status, note, value, and request-detail language.
- Keep live business-email delivery explicitly deferred until approved provider configuration exists.
- Preserve the polished, restrained, mobile-first analytics dashboard and truthful metric definitions.

Acceptance:

- Client navigation contains Dashboard and View website only.
- Estimate requests remain visible as a clearly defined dashboard metric.
- No client route exposes request lists, individual request details, stages, notes, or recorded values.
- Old client request URLs resolve safely to the authorized business dashboard.
- Public estimate-request capture still validates, stores, and counts accepted submissions without claiming that an estimate was created or an email was delivered.
- Formatting, lint, type-check, application tests, production build, and mobile/desktop browser review pass.

Completion record:

- Reduced the client portal to two primary destinations: Dashboard and View website.
- Made estimate requests the first dashboard metric while retaining page views, phone-button clicks, conversion rate, and the activity trend.
- Retired every client request-list and request-detail URL through a server-side redirect to the authorized business dashboard; no lead stages, notes, values, or individual records remain exposed in the client experience.
- Preserved validated tenant-safe request storage solely as the source for aggregate counts and future approved email delivery. The public form explicitly states that it does not create an estimate automatically.
- Updated the product specification, architecture, repository agreement, README, and roadmap so the analytics-only scope is the maintained product boundary.
- Validation passed: formatting, lint, strict type-check, all 51 application tests, production build, and authenticated mobile/desktop browser review with no horizontal overflow or request-workspace links.

## Milestone 8 — Business analytics expansion (complete 2026-08-17)

Objective: give each business owner the useful, understandable parts of a modern web-analytics dashboard without exposing developer health, speed, deployment, or infrastructure metrics.

Deliverables:

- Add privacy-conscious unique-visitor measurement.
- Add top-page and traffic-source breakdowns.
- Track phone, directions, contact, and accepted estimate-request actions.
- Define action rate as the share of identified visitors who completed at least one tracked high-intent action.
- Add mobile, tablet, and desktop breakdowns.
- Compare the selected period with the immediately preceding period.
- Keep all collection and aggregation tenant-derived, server-side, and protected by existing RLS.
- Present the additions in a restrained, mobile-first business dashboard with plain-language definitions and honest empty states.

Acceptance:

- Unique visitors are deduplicated from a one-way anonymous identifier; no raw IP address or stable cross-business identifier is stored.
- Top pages, sources, devices, actions, and comparisons reconcile with fixture events for 7-, 30-, and 90-day ranges.
- Direct, search, social, and referral attribution is normalized without storing full external URLs.
- Agency preview mode remains excluded.
- The client portal contains no website-health, speed, Core Web Vitals, deployment, or infrastructure statistics.
- Tenant-isolation/database tests, application tests, production build, and mobile/desktop browser review pass.

Completion record:

- Added business-scoped anonymous visitor measurement without storing a raw browser identifier, raw IP address, full referring URL, or cross-business identifier.
- Added server-normalized traffic sources, top-page reporting, mobile/tablet/desktop visitor breakdowns, and equal-length previous-period visitor comparisons.
- Added allow-listed phone, directions, contact, and accepted estimate-request action attribution while keeping accepted request records authoritative for the request total.
- Replaced the request/page-view conversion metric with a visitor action rate that measures identified visitors with at least one tracked high-intent action.
- Expanded the restrained client dashboard with unique visitors, comparison copy, an action breakdown, activity trend, top pages, traffic sources, and device mix. Website health, speed, deployment, and infrastructure metrics remain excluded.
- Validation passed: formatting, lint, strict type-check, 56 application tests, production build, a clean local database rebuild, all 74 pgTAP tests, and authenticated mobile/desktop browser review with no overflow or runtime errors.

## Milestone 9 — Business notification email reliability (complete 2026-08-17)

Objective: reliably notify the business when its public website accepts an estimate request, while keeping the client product analytics-only and avoiding automated customer conversations.

Deliverables:

- Create one tenant-scoped business-notification job in the same transaction as each accepted estimate request.
- Replace request-time-only delivery with an atomic, lease-based worker that can safely recover interrupted work.
- Add bounded retries with a visible next-attempt time and a terminal-failure state.
- Version the plain-language business notification template and include the submitted request details the shop needs to follow up outside the portal.
- Add an agency-only delivery-status view with a safe manual retry for terminal failures.
- Keep the development adapter explicit: local delivery is captured for testing and is never presented as a sent email.
- Provide a secret-protected scheduled-worker route for later production scheduling.

Acceptance:

- Replayed submissions and overlapping workers cannot send duplicate business notifications.
- An expired lease can be reclaimed; transient failures retry on a bounded schedule and then stop.
- A removed notification recipient cancels unsent work instead of sending to a stale address.
- Agency operators can inspect pending, retrying, captured, sent, canceled, and terminal-failure states and safely retry a failure.
- Client users continue to see analytics only; no request inbox, lead stages, automated estimate, customer confirmation, reminders, SMS, or two-way messaging are added.
- Formatting, lint, type-check, application tests, production build, clean database reset, database tests, and agency mobile/desktop review pass.

Real email delivery remains disabled until Resend credentials and a verified sender domain are explicitly configured. Production scheduling remains part of Milestone 12.

Completion record:

- Narrowed the milestone to one-way business notifications only. Customer confirmations, reminders, lead stages, SMS, two-way messaging, and automated estimates remain disabled.
- Kept one tenant-scoped business job per configured notification recipient in the same transaction as the accepted website request, while suppressing the previously scaffolded customer-confirmation job.
- Replaced request-time-only delivery with an atomic server-only worker using five-minute leases, unpredictable lease tokens, four bounded attempts, visible retry times, stale-recipient cancellation, and deterministic provider idempotency keys.
- Added a versioned plain-text shop notification containing the submitted contact, vehicle, request, and optional detail fields without generating pricing or inventing missing information.
- Added a secret-protected scheduled-worker route for later production scheduling and a prompt post-response worker run that never makes accepted form submission depend on email availability.
- Added an agency-only Email notifications screen with clear queued, retrying, processed, canceled, development-capture, provider-accepted, and terminal-failure language plus safe terminal retry. Client accounts lost direct read grants to internal jobs and provider delivery records.
- Kept development behavior explicit: local messages are recorded as “Captured locally — no email sent.” No live provider, domain, schedule, or production service was connected.
- Validation passed: formatting, lint, strict type-check, 58 application tests, production build, clean database rebuild, and all 93 pgTAP tests. Database coverage proves claim exclusivity, expired-lease recovery, bounded retry timing, terminal failure, lease-token enforcement, client denial, and one delivery record per job.
- Browser review passed on mobile and desktop with no horizontal overflow. A fictional public form submission was accepted end to end and produced exactly one new captured shop notification in the agency delivery log.

## Milestone 10 — Simplified agency roster and external-site analytics (complete 2026-08-17)

Objective: make Accelerator OS the small agency operating layer the owner actually needs. Websites are built and maintained separately; the OS stores the client relationship, connects an approved external website to analytics, and lets the agency see the same reporting as the client.

Deliverables:

- Replace the guided onboarding/readiness workflow with a compact business record: business name, client contact, location, website URL, timezone, and lifecycle status.
- Give the agency a clear business roster with add, manage, archive/restore, website, and analytics actions.
- Let an agency administrator open the same tenant-scoped analytics dashboard a client sees without impersonating the client or creating another analytics implementation.
- Add one publishable, revocable analytics connection per business, restricted to the configured website hostname.
- Provide a copyable external-site tracking snippet that records the existing allow-listed page views and high-intent actions without accepting a browser-supplied business ID.
- Keep provider readiness, site-building facts, offers, verification notes, brand approvals, and service drafting outside the core agency workflow.
- Preserve one-business-per-client access, analytics-only client navigation, and the existing fictional development preview separately.

Acceptance:

- A platform administrator can add a business without completing a website-building questionnaire.
- Active and inactive businesses are obvious in the roster; archived businesses leave the active list and can be restored without data loss.
- Business contact/location information and website connection settings can be edited from one focused management screen.
- Agency and client analytics use the same aggregation and metric definitions and remain protected by server authorization plus database RLS.
- External events resolve the tenant from a server-side connection lookup and a matching configured origin; the event endpoint never trusts a browser-supplied tenant ID.
- The tracking key can be rotated or disabled, and archived/suspended businesses cannot continue recording external events.
- No client request inbox, CRM stages, website-health/speed metrics, builder, AI chat, SMS, billing, live provider, DNS, or production deployment is added.
- Formatting, lint, type-check, application tests, production build, clean database reset, database tests, and agency/client mobile and desktop browser review pass.

Completion record:

- Replaced the agency homepage's guided onboarding and provider-readiness presentation with a focused client-business roster, plain active/inactive/paused/archive states, direct analytics access, real website links, and a compact add-business form.
- Added one management screen per business for private client contact details, location, reporting timezone, live website URL, lifecycle controls, and analytics installation. The old onboarding URL now safely redirects to this screen.
- Added reversible archival that preserves analytics and account data, explicit pause/activation states, and a separately revocable analytics connection. Site-building facts, offer approval, service drafting, brand direction, asset review, and readiness terminology no longer control the agency flow or business activation.
- Reused the exact client dashboard route and aggregation for agency reporting instead of creating a second dashboard. Client navigation remains one-business and analytics-only; configured website links now open the real external website.
- Added a copyable external tracker, a publishable random site key, exact configured-origin enforcement, server-side tenant resolution, first-event connection confirmation, disable and rotation controls, SPA page-view handling, and allow-listed phone/contact/directions/accepted-request actions.
- Added RLS and least-privilege grants for connection records. The browser never supplies `business_id`; the service-role database function re-resolves the tenant from both the site key and origin hostname, and rejects wrong origins, old keys, disabled connections, and suspended businesses.
- Updated the product specification, architecture, schema, security requirements, repository agreement, README, and roadmap around the separate website-production workflow.
- Validation passed: formatting, lint, strict type-check, 60 application tests, production build, clean local database rebuild, and all 107 pgTAP tests. Mobile and desktop browser review passed for the agency roster, management screen, and shared dashboard with no horizontal overflow or console errors.
- End-to-end local event verification returned `204` for the configured origin, `403` for the wrong origin, updated the dashboard from 21 to 22 page views, and changed the connection from pending to connected.

## Milestone 10 follow-up — Notification reporting (complete 2026-08-17)

Objective: make the agency email-notification screen useful as a reporting tool without exposing one business's delivery details before the agency deliberately selects it.

Deliverables:

- Add agency-wide email notification totals for rolling 24-hour, 7-day, and 30-day periods.
- Add an explicit business selector; keep all per-business metrics and delivery rows hidden until a valid business is selected.
- Show selected-business totals using the same period and precise processed, waiting, canceled, and failure language.
- Add selected-business delivery-log filtering by customer name and calendar date.
- Preserve development-adapter wording so a local capture is never presented as a delivered email.

Acceptance:

- The initial screen contains only agency-wide totals and business choices, with no tenant-specific delivery details.
- Selecting a valid business reveals only that business's summary and delivery records.
- Invalid or stale business identifiers fail closed and reveal no delivery details.
- Name and date filtering work within the selected rolling period and business reporting timezone.
- Range and filter controls remain usable on mobile and do not force an unwanted scroll reset.
- Formatting, lint, type-check, application tests, production build, database tests, and agency mobile/desktop browser review pass.

Completion record:

- Rebuilt Email notifications around an agency-wide reporting overview with rolling 24-hour, 7-day, and 30-day periods and plain definitions for created, processed, waiting, canceled, and terminal-failure states.
- Added an explicit business selector. The initial state contains no per-business totals or delivery rows; invalid and stale business identifiers fail closed with no tenant detail disclosed.
- Added selected-business totals and a delivery log scoped by both `business_id` and the chosen rolling period, with separate customer-name and calendar-date filters using the business reporting timezone.
- Kept development delivery truth explicit: processed local messages remain labeled as captured test evidence and are never represented as sent email.
- Preserved URL-based report state and scroll-safe client navigation while keeping database reads and authorization on the server.
- Validation passed: formatting, lint, strict type-check, 66 application tests, production build, a fully migrated local database, and all 107 pgTAP tests.
- Mobile and desktop browser review passed for the unselected, selected, filtered, period-change, and invalid-business states with no horizontal overflow or runtime errors.

## Milestone 10 follow-up revision — Business directory and dated reports (complete 2026-08-17)

Objective: replace the in-page business dropdown with a searchable business directory and give every business its own email-notification analytics page with easier date navigation.

Deliverables:

- Keep agency-wide notification analytics on `/admin/notifications`.
- Present every business as a searchable, clickable directory item rather than a select field.
- Open selected-business analytics on a dedicated `/admin/notifications/[businessId]` page.
- Add a horizontally scrollable calendar-date rail with previous/next controls and an all-dates option.
- Keep customer-name and direct date search available beside the date rail.
- Preserve rolling 24-hour, 7-day, and 30-day periods, precise provider wording, and fail-closed tenant detail access.

Acceptance:

- The directory can be searched by business name and never displays per-business delivery analytics.
- Clicking a business opens a distinct URL containing only that business's totals and delivery records.
- Invalid business routes reveal no tenant details.
- The date rail is keyboard-accessible, touch-scrollable, and covers every calendar date that can overlap the selected rolling period.
- Selecting a date filters the log while preserving the reporting period and optional customer-name search.
- Formatting, lint, type-check, application tests, production build, database tests, and mobile/desktop browser review pass.

Completion record:

- Replaced the business dropdown and same-page detail expansion with a searchable card directory that presents every business without exposing its analytics.
- Added a dedicated, fail-closed `/admin/notifications/[businessId]` route for each business's notification totals and delivery history; legacy dropdown URLs redirect to the new route.
- Added a touch-scrollable date rail with accessible newer/older buttons, reduced-motion support, an all-dates option, and every calendar date that can overlap the selected rolling period.
- Kept customer-name and exact-date search below the date rail. Date selection and name search can be combined, and both remain scoped to the selected business and reporting timezone.
- Validation passed: formatting, lint, strict type-check, 69 application tests, production build, and all 107 database tests.
- Mobile and desktop browser review passed for directory search, business navigation, 24-hour/7-day/30-day reporting, 31-date scrolling, combined filters, empty states, and invalid business routes with no current runtime errors or horizontal page overflow.

## Milestone 10 UI follow-up — Agency administrator visual system (complete 2026-08-17)

Objective: give the agency administrator a clearly distinct dark workspace with purposeful color roles, while preserving the existing light client portal and public business experiences.

Deliverables:

- Apply the dark theme from the authenticated agency access level rather than the browser URL.
- Introduce distinct colors for primary actions, navigation, active/inactive/paused business states, analytics connection states, processed/waiting/failure notification metrics, and destructive actions.
- Restyle agency forms, controls, cards, menus, and date filters for readable dark surfaces and strong focus states.
- Keep the theme restrained and operational: color communicates meaning rather than decorating every surface.

Acceptance:

- Agency admin routes use the dark visual system on mobile and desktop.
- Client portal and public website colors remain unchanged.
- Business and notification states can be distinguished without relying on wording alone, while labels remain present for accessibility.
- Text, controls, focus indicators, empty states, and hover states remain readable and keyboard accessible.
- Formatting, lint, type-check, application tests, production build, and mobile/desktop browser review pass.

Completion record:

- Added an authenticated access-level theme boundary: agency administrators and the local agency-development role receive the dark operating workspace, while client members keep the existing light portal regardless of which authorized route they open.
- Reworked the agency shell, navigation, profile menu, cards, forms, inputs, date controls, and primary/secondary/destructive actions around dark, high-contrast semantic tokens.
- Added consistent operational color roles: lime for current navigation and primary actions, green for active/processed, blue for setup and inactive states, amber for paused/waiting, rose for failures, and violet for archived/canceled states. Every color-coded state retains a text label.
- Added regression coverage for role-derived theme scoping, distinct business statuses, and notification metric/status tones.
- Validation passed: formatting, lint, strict type-check, 72 application tests, production build, a clean local database rebuild, and all 107 database tests.
- Desktop and phone browser review passed for the client-business roster and email-notification reporting with no horizontal page overflow; computed styles confirmed the agency theme boundary, dark surfaces, and distinct metric colors.

## Milestone 10 UI correction — Agency form contrast and add action (implemented 2026-08-17; visual confirmation pending)

Objective: correct the agency form’s white-text-on-white-field regression and replace the oversized wrapping add-business action with a compact, deliberate control.

Acceptance:

- Agency text fields, textareas, selects, and browser-autofilled values use a dark control surface with readable light text.
- The correction is scoped to the agency theme and does not alter client or public forms.
- The add-business action stays on one line and has balanced proportions on desktop and mobile.
- A regression test and live computed-style review confirm the rendered field contrast.

Implementation record:

- Confirmed the rendered regression was an older `bg-white` field utility combined with the agency theme’s light text color.
- Added a higher-specificity agency-only field rule, including browser-autofill treatment, that forces dark control surfaces and readable light values without changing client or public forms.
- Replaced the wrapping neon add-business block with a compact one-line dark pill and a small lime plus marker.
- Formatting, lint, strict type-check, 73 application tests, and the production build pass. The production stylesheet contains the agency field override and the production server bundle contains the revised add-business action.
- A refreshed signed-in computed-style and responsive screenshot check remains because the required database reset expired the local browser session.

## Milestone 10 security follow-up — Account recovery and administrator MFA (complete and deployed 2026-08-17)

Objective: give every agency-issued account a safe password-recovery path and require a verified authenticator-app code before any platform administrator can access tenant data.

Deliverables:

- Add a non-enumerating forgot-password flow and a recovery-session-only password-update screen.
- Keep Supabase Auth as the single identity provider so existing user IDs, memberships, sessions, and RLS policies remain authoritative.
- Add authenticator-app enrollment and challenge screens using Supabase TOTP MFA.
- Require `aal2` for platform-administrator access in both server guards and database administrator authorization.
- Invite the requested agency-owner email only after the hosted schema is initialized, then assign the administrator role without storing the email or any credential in source control.

Acceptance:

- Password-reset requests return the same calm response whether or not an account exists.
- A valid recovery link can establish a session, accept a policy-compliant password, revoke existing sessions, and return the user to sign-in.
- An administrator at `aal1` is sent to MFA setup/challenge and cannot read or mutate tenant data through the application or database policies.
- A verified TOTP challenge upgrades the session to `aal2` and restores the intended administrator destination.
- Client accounts retain their existing analytics-only experience and are not forced into administrator MFA.
- Formatting, lint, type-check, application tests, production build, database tests, security advisors, and mobile/desktop authentication review pass.

Implementation record:

- Kept Supabase Auth as the single identity provider and added non-enumerating password-reset requests, PKCE recovery confirmation, policy-compliant password updates, and global session revocation after a successful change.
- Added administrator TOTP enrollment and challenge screens, including safe cleanup of interrupted unverified enrollments so a refresh cannot strand the account.
- Enforced administrator `aal2` in both server navigation guards and the database helper used by administrator RLS policies; an administrator password without the second factor no longer authorizes tenant-wide data access.
- Initialized the hosted schema, backfilled the existing confirmed agency-owner account, and assigned its profile the `admin` platform role without storing the email or credentials in source control.
- Enabled hosted authenticator-app MFA, limited AAL1 session duration to 15 minutes, set the production Site URL, and allowed the exact localhost and Vercel-preview redirect patterns needed for recovery testing and deployments.
- Revoked legacy anonymous execution grants on the three lead-mutation functions discovered during the hosted security review; a follow-up privilege query confirms all three are denied and the security advisor reports no related warning or error.
- Validation passed: formatting, lint, strict type-check, 80 application tests, production build, a clean local database rebuild, and all 109 pgTAP tests. Desktop browser review passed for recovery and password update, and the MFA enrollment UI was exercised through QR generation and interrupted-setup recovery.
- Reconciled the hosted import ledger with all 12 repository migration filenames after explicit approval and verified an exact version/name match, preventing a future migration-driven deployment from rerunning the initialized schema.

## Maintenance follow-up — Security boundaries and product accuracy (ready for review 2026-08-18)

Objective: audit the deployed application as a full-stack maintenance pass without expanding product scope or changing live services before review.

Implementation record:

- Centralized authentication return-path validation and rejected slash/backslash variants that browsers can interpret as an external origin.
- Prepared least-privilege database grants so public lead capture and analytics recording remain callable only through the verified server routes, not directly through anonymous Data API RPC calls.
- Removed the stale fictional-site homepage link and aligned the landing-page descriptions with the current analytics-first product.
- Reviewed application routing, authenticated mutations, tenancy checks, RLS coverage, hosted advisors, dependency health, runtime/build logs, and representative mobile/desktop public and authentication screens.
- Validation passed: formatting, lint, strict type-check, all 88 application tests, a clean database rebuild, all 112 pgTAP tests, and the production build. The migration and application changes remain unpublished until explicit approval.

## Account settings follow-up — Personal profile and password rotation (ready for review 2026-08-18)

Objective: let each authenticated user manage their own display name, private profile picture, and password from one clear settings surface without creating a second identity system or storing readable credentials in Accelerator OS.

Deliverables:

- Expose the existing self-owned profile display name with clear separation from the sign-in email.
- Store optional profile pictures in a private, two-megabyte, user-namespaced Supabase Storage bucket.
- Show the current picture in settings and the workspace profile control without exposing a public asset URL.
- Keep password changes in Supabase Auth, preserve the strong-password policy, and revoke refresh sessions globally after a successful change.
- Provide the existing non-enumerating reset-email path when a signed-in session is too old to authorize a direct password change.

Acceptance:

- Server actions derive the profile owner exclusively from verified authentication claims and cannot update another user or the authorization role.
- Avatar uploads accept only validated JPG, PNG, or WebP files no larger than two megabytes.
- Storage read, insert, update, and delete policies restrict every avatar object to its owning user namespace.
- Password values never enter an application database, log, URL, or client-readable response.
- Formatting, lint, type-check, application tests, production build, clean database reset, database tests, and authenticated mobile/desktop review pass.

Completion record:

- Added self-service display-name editing while keeping the sign-in email separate and unchanged.
- Added a private `profile-avatars` bucket with a two-megabyte limit, JPG/PNG/WebP signature validation, user-namespaced object paths, and owner-only read/write/delete policies.
- Added an authenticated, no-store avatar route and used it in both settings and the workspace profile control without exposing a public asset URL.
- Clarified the direct password-change experience, preserved the strong-password checks and global refresh-session revocation, and retained the reset-email fallback for expired secure sessions.
- Validation passed: formatting, lint, strict type-check, all 92 application tests, production build, clean database rebuild, all 121 pgTAP tests, and local database security/performance advisors with no new profile-related findings.
- Desktop and phone review passed for settings and password rotation with no horizontal overflow, framework overlay, or browser console warning. No real password was entered during verification.

## UI correction — Cross-theme surface contrast (complete 2026-08-18)

Objective: remove white-on-white and light-on-light regressions caused by using text-color tokens or hard-coded light surfaces as administrator-theme backgrounds.

Completion record:

- Replaced the affected settings/home action treatment and every remaining platform-only light surface with semantic action, control, paper, hover, success, and foreground tokens.
- Corrected the older business-roster, onboarding approval, brand, service, asset, recipient, and lead-error components so each remains readable in either the dark agency workspace or light client portal.
- Converted shared authentication and error actions from the foreground `--ink` token to the dedicated `--action` and `--action-text` pair, preventing the same failure if those controls are rendered inside another theme boundary.
- Added a regression test that checks WCAG AA contrast for both theme token sets and rejects hard-coded light surfaces or foreground-token backgrounds in platform UI source.
- Validation passed: formatting, lint, strict type-check, all 94 application tests, production build, a clean database rebuild, and all 121 pgTAP tests.
- Browser review passed for agency settings, sign-in, and password recovery at desktop and phone widths with zero detected text/background contrast failures and no horizontal page overflow. Data-backed agency screens remain protected by the same source-level semantic-surface guard.

## Milestone 11 — Square billing status

Deliverables: hosted-checkout adapter, subscription records, signature-verified idempotent webhooks, normalized states, agency notifications, and manual suspension flow.

Acceptance:

- No card data reaches application requests, logs, or database.
- Test webhook duplicates/reordering cannot corrupt status.
- Failed/canceled states notify the agency but do not automatically remove a live site.

Manual input: Square test account, plan decisions, and approved billing communications.

This milestone is intentionally deferred until after live Resend activation and the first real-site analytics pilot.

## Milestone 12 — Domains, production readiness, and pilot

Deliverables: domain onboarding, Vercel connection, SSL/domain status, backup/restore and rollback runbooks, retention/export procedure, security review, pilot checklist, and preview deployment.

Acceptance:

- Preview passes the complete site → analytics/request capture → client dashboard flow.
- Production environment, secrets, backups, and rollback are reviewed and exercised.
- Production deployment waits for explicit approval.

Manual input: authorized hosting/domain access, production credentials, approved legal materials, and the explicit command to deploy.

## Approved next execution order (updated 2026-08-17)

1. Complete account recovery, mandatory administrator MFA, and the agency-owner account invitation.
2. Activate the existing Resend business-notification adapter with a verified agency sender domain and server-only credentials.
3. Add and verify the real shop recipient email for each business, then send one controlled test request and reconcile it in the delivery log.
4. Run the first real-site analytics pilot using the existing external tracking connection.
5. Complete production readiness, domain, backup, rollback, and pilot checks.
6. Revisit Square billing only when the agency actually needs billing status inside Accelerator OS.

## Validation commands

```text
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm run validate:db
```
