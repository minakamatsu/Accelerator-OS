begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(21);

select ok(
  not has_function_privilege(
    'anon',
    'public.capture_public_lead(text,text,text,text,text,text,text,text,smallint,text,text,text,text,text,text,text,text,text)',
    'execute'
  ),
  'anonymous callers cannot invoke the server-only lead capture function'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.capture_public_lead(text,text,text,text,text,text,text,text,smallint,text,text,text,text,text,text,text,text,text)',
    'execute'
  ),
  'signed-in callers cannot bypass the server-only lead capture path'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.capture_public_lead(text,text,text,text,text,text,text,text,smallint,text,text,text,text,text,text,text,text,text)',
    'execute'
  ),
  'the server-only role can invoke lead capture'
);

select ok(
  has_table_privilege('service_role', 'public.businesses', 'select')
    and has_table_privilege('service_role', 'public.leads', 'select')
    and has_table_privilege('service_role', 'public.notification_recipients', 'select')
    and has_table_privilege('service_role', 'public.outbox_jobs', 'select,update'),
  'the server-only worker can read lead context and complete outbox jobs'
);

select ok(
  has_table_privilege(
    'service_role',
    'public.message_deliveries',
    'select,insert,update'
  ),
  'the server-only worker can record idempotent delivery outcomes'
);

set local role service_role;

select results_eq(
  $$
    select (public.capture_public_lead(
      'demo-atlas-auto',
      '55555555-5555-4555-8555-555555555555',
      repeat('a', 64),
      'Test Visitor',
      'visitor@example.com',
      '+1 555 010 1212',
      'brake-safety-checks',
      'Brake pedal feels different this week.',
      2020::smallint,
      'Demo Make',
      'Demo Model',
      null,
      'website_quote',
      'local-test',
      'organic',
      'milestone-five',
      'I agree that the shop may contact me about this request.',
      'lead-contact-v1'
    ) ->> 'accepted')::boolean
  $$,
  $$ values (true) $$,
  'a valid server-resolved public submission is accepted'
);

reset role;

select results_eq(
  $$
    select count(*)
    from public.leads
    where business_id = '11111111-1111-4111-8111-111111111111'
      and submission_idempotency_key = '55555555-5555-4555-8555-555555555555'
  $$,
  $$ values (1::bigint) $$,
  'capture creates exactly one tenant-scoped lead'
);

select results_eq(
  $$
    select count(*)
    from public.lead_events
    where business_id = '11111111-1111-4111-8111-111111111111'
      and event_type = 'lead.created'
      and lead_id = (
        select id from public.leads
        where submission_idempotency_key = '55555555-5555-4555-8555-555555555555'
      )
  $$,
  $$ values (1::bigint) $$,
  'capture writes the initial lead event in the same transaction'
);

select results_eq(
  $$
    select count(*)
    from public.outbox_jobs
    where business_id = '11111111-1111-4111-8111-111111111111'
      and lead_id = (
        select id from public.leads
        where submission_idempotency_key = '55555555-5555-4555-8555-555555555555'
      )
  $$,
  $$ values (1::bigint) $$,
  'one business notification job commits with the estimate request'
);

set local role service_role;

select results_eq(
  $$
    select (public.capture_public_lead(
      'demo-atlas-auto',
      '55555555-5555-4555-8555-555555555555',
      repeat('a', 64),
      'Test Visitor',
      'visitor@example.com',
      '+1 555 010 1212',
      'brake-safety-checks',
      'Brake pedal feels different this week.',
      2020::smallint,
      'Demo Make',
      'Demo Model',
      null,
      'website_quote',
      'local-test',
      'organic',
      'milestone-five',
      'I agree that the shop may contact me about this request.',
      'lead-contact-v1'
    ) ->> 'duplicate')::boolean
  $$,
  $$ values (true) $$,
  'replaying the same idempotency key is reported as a duplicate success'
);

reset role;

select results_eq(
  $$
    select count(*)
    from public.outbox_jobs
    where idempotency_key like '55555555-5555-4555-8555-555555555555:%'
  $$,
  $$ values (1::bigint) $$,
  'a duplicate submission does not create duplicate outbox work'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);

select ok(
  public.set_lead_status(
    '11111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111119001',
    'contacted',
    null
  ),
  'a tenant operator can update a lead in its own business'
);

select results_eq(
  $$
    select status::text
    from public.leads
    where id = '11111111-1111-4111-8111-111111119001'
  $$,
  $$ values ('contacted'::text) $$,
  'the status mutation persists the requested state'
);

select isnt(
  public.add_lead_note(
    '11111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111119001',
    'Called and left a development-only note.'
  ),
  null,
  'a tenant operator can add an internal note'
);

select results_eq(
  $$
    select count(*)
    from public.lead_events
    where lead_id = '11111111-1111-4111-8111-111111119001'
      and event_type in ('lead.status_changed', 'lead.note_added')
  $$,
  $$ values (2::bigint) $$,
  'pipeline mutations create an auditable event trail'
);

select ok(
  public.set_lead_values(
    '11111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111119001',
    47500,
    42500
  ),
  'a tenant operator can record estimated and won values'
);

select results_eq(
  $$
    select estimated_value_minor, won_value_minor
    from public.leads
    where id = '11111111-1111-4111-8111-111111119001'
  $$,
  $$ values (47500::bigint, 42500::bigint) $$,
  'pipeline value mutations persist currency amounts in minor units'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);

select throws_ok(
  $$
    select public.set_lead_status(
      '11111111-1111-4111-8111-111111111111',
      '11111111-1111-4111-8111-111111119001',
      'won',
      null
    )
  $$,
  '42501',
  'lead_access_denied',
  'a viewer cannot mutate the tenant pipeline'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);

select throws_ok(
  $$
    select public.set_lead_status(
      '22222222-2222-4222-8222-222222222222',
      '22222222-2222-4222-8222-222222229001',
      'contacted',
      null
    )
  $$,
  '42501',
  'lead_access_denied',
  'an operator cannot mutate another tenant lead through the RPC'
);

reset role;

delete from public.services
where business_id = '11111111-1111-4111-8111-111111111111';

update public.businesses
set facts_approved_at = now(),
    design_approved_at = now(),
    status = 'active'
where id = '11111111-1111-4111-8111-111111111111';

set local role anon;

select results_eq(
  $$ select jsonb_array_length(public.get_public_site('demo-atlas-auto') -> 'services') $$,
  $$ values (0) $$,
  'an approved site stays available with an honest empty service inventory'
);

reset role;

select results_eq(
  $$
    select count(*)
    from public.leads
    where submission_idempotency_key = '55555555-5555-4555-8555-555555555555'
  $$,
  $$ values (1::bigint) $$,
  'the full capture and mutation test remains tenant-contained'
);

select * from finish();
rollback;
