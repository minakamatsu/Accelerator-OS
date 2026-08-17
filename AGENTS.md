# Repository Working Agreement

## Product boundaries

- This is an internal agency operating system, not public self-service SaaS.
- The first vertical is general automotive repair.
- Client websites are produced in a separate workflow. Accelerator OS keeps a compact client roster, connects the finished live website to analytics, and lets the agency view the same dashboard as the client; do not reintroduce guided website-building questionnaires, content approvals, or provider-readiness checklists into the core agency flow without a scope change.
- The client analytics product includes visitor volume, top pages, traffic sources, high-intent actions, device mix, and period comparisons. Keep developer website-health, speed, deployment, and infrastructure metrics out of the business-owner portal unless the scope is explicitly changed.
- The client portal is a website analytics and diagnostics product. Do not expose lead records, stages, notes, values, or a client inbox without an approved scope change.
- Estimate-request submissions may supply aggregate counts. Delivery of request details belongs in an approved business-email integration, not a client CRM workflow.
- Business request email is one-way to configured shop recipients. Do not add customer confirmations, reminders, follow-up sequences, or two-way messaging without an approved scope change.
- Do not add SMS, AI chat, ad management, a drag-and-drop builder, or additional verticals without an approved scope change.
- Never promise that the software itself generates sales. Use precise lead-capture, follow-up, and recorded-outcome language.

## Safety and tenancy

- Every tenant-owned record contains `business_id`.
- Derive public tenant context from a verified host, trusted server-side slug lookup, or an origin-bound server-side analytics-connection lookup; never trust a browser-supplied tenant ID.
- Enforce authorization in both server code and database RLS; UI visibility is not authorization.
- Never expose service-role keys or provider secrets to client bundles.
- Never store payment-card data.
- Webhooks and background jobs must be verified/idempotent.
- Notification workers must claim work atomically, use bounded retries and provider idempotency, re-check the current recipient before delivery, and keep operational status agency-only.
- Never invent business facts, testimonials, ratings, certifications, guarantees, hours, or claims.

## Next.js conventions

- Use the App Router and default Node.js runtime.
- Prefer Server Components for reads, Server Actions for authenticated UI mutations, and Route Handlers for public/external HTTP calls.
- Keep client components synchronous and pass only serializable props across server/client boundaries.
- Treat `params`, `searchParams`, `cookies()`, and `headers()` as asynchronous.
- Keep secrets in server-only modules.

## Quality gates

- Implement only the active milestone in `PLAN.md`.
- Add regression tests for meaningful bugs and tenant-isolation tests for tenant data.
- Before marking a milestone complete, run format check, lint, type-check, tests, and production build.
- Do not fabricate successful provider integration. Use explicitly labeled development adapters until real test credentials exist.
- Preserve accessibility, responsive behavior, error/empty/loading states, and reduced-motion behavior.

## Client-facing UI and UX

- Treat exceptional client-facing design as a permanent product requirement, with the client portal and public business experience receiving the highest level of visual and interaction craft.
- Do not ship generic dashboard styling, raw database-shaped forms, placeholder-looking client screens, or merely functional public pages as completed work.
- Give every client-facing screen a clear primary task, strong information hierarchy, concise plain-language copy, calm feedback, and an obvious next action.
- Design mobile-first for real business use: important actions remain easy to reach, dense information stays scannable, forms preserve progress, and layouts never depend on desktop width.
- Use polished empty, loading, success, validation, permission, and failure states. Prevent errors where possible and explain recovery without technical language.
- Meet keyboard, focus, contrast, target-size, reduced-motion, responsive, and performance expectations as part of the design—not as cleanup after implementation.
- Visually review every materially changed client-facing flow at representative mobile and desktop sizes. Automated tests alone do not establish design quality.
- Preserve a coherent Accelerator OS experience inside the portal while allowing each public business site to have its own approved, original brand system and signature interaction.
- Prefer trust, clarity, and conversion usefulness over decoration. Never use invented proof, urgency, ratings, testimonials, or claims to make a design feel more persuasive.

## Business-site originality

- Preserve approved content categories, not another site's presentation.
- Each client needs verified facts, approved brand direction, image rights, CTA, and domain/contact choices before site implementation.
- Every public client site must use rights-cleared imagery that makes its business vertical visually obvious above the fold, especially on mobile.
- Prefer verified client-owned photography. When none is available and stock use is approved, use relevant rights-cleared generic photography and record the source, creator, license, and retrieval date.
- Never imply that stock photography depicts the client's staff, property, customers, or completed work. Avoid recognizable third-party brands and logos unless their use is cleared.
- Default public client sites to a purposeful multi-page information architecture unless an approved brief specifically calls for a one-page experience.
- Create service detail pages only for verified services. When the service list is incomplete, use an honest unpublished-services state plus concern and contact pathways; never use plausible-sounding filler services.
- Treat SEO as useful page intent, crawlable internal links, unique metadata, canonical URLs, verified structured data, and a sitemap. Do not create thin, duplicate, keyword-stuffed, or unsupported location/service pages.
- Do not copy another site's code, layout, section order, visual tokens, assets, or component structure.

## External actions

- Do not push to GitHub, connect live services, change DNS, or deploy to production without explicit authorization.
- Do not commit `.env` files or credentials.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
