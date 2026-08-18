begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(18);

select is_empty(
  $$
    select relname
    from pg_class
    join pg_namespace on pg_namespace.oid = pg_class.relnamespace
    where pg_namespace.nspname = 'public'
      and pg_class.relkind = 'r'
      and pg_class.relname in (
        'profiles', 'businesses', 'business_memberships', 'business_domains',
        'business_profiles', 'brand_settings', 'services', 'business_assets',
        'leads', 'lead_notes', 'lead_events', 'site_events', 'automation_rules',
        'notification_recipients', 'outbox_jobs', 'message_deliveries',
        'subscriptions', 'webhook_events', 'integration_connections', 'audit_log'
        , 'analytics_connections'
      )
      and not pg_class.relrowsecurity
  $$,
  'RLS is enabled on every application table'
);

select ok(
  not has_table_privilege('anon', 'public.leads', 'select'),
  'anonymous callers have no direct lead read grant'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.set_lead_status(uuid,uuid,public.lead_status,text)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.set_lead_values(uuid,uuid,bigint,bigint)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.add_lead_note(uuid,uuid,text)',
    'execute'
  ),
  'anonymous callers cannot invoke authenticated lead mutations'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);

select results_eq(
  $$ select id from public.businesses order by id $$,
  $$ values ('11111111-1111-4111-8111-111111111111'::uuid) $$,
  'business A owner sees only business A'
);

select results_eq(
  $$ select id from public.leads order by id $$,
  $$ values ('11111111-1111-4111-8111-111111119001'::uuid) $$,
  'business A owner sees only business A leads'
);

select is_empty(
  $$
    update public.leads
    set status = 'contacted'
    where id = '22222222-2222-4222-8222-222222229001'
    returning id
  $$,
  'business A owner cannot mutate business B leads'
);

select results_eq(
  $$
    update public.leads
    set status = 'contacted'
    where id = '11111111-1111-4111-8111-111111119001'
    returning status::text
  $$,
  $$ values ('contacted'::text) $$,
  'business A owner can update a business A lead'
);

select is_empty(
  $$
    update public.business_memberships
    set role = 'manager'
    where business_id = '11111111-1111-4111-8111-111111111111'
      and user_id = '00000000-0000-4000-8000-000000000003'
    returning id
  $$,
  'tenant owners cannot change membership roles'
);

select throws_ok(
  $$
    insert into public.businesses (slug, name, created_by)
    values (
      'unauthorized-business',
      'Unauthorized business',
      '00000000-0000-4000-8000-000000000002'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "businesses"',
  'tenant owners cannot create platform businesses'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);

select results_eq(
  $$ select count(*) from public.leads $$,
  $$ values (1::bigint) $$,
  'viewer can read only the assigned tenant leads'
);

select is_empty(
  $$
    update public.leads
    set status = 'lost'
    where id = '11111111-1111-4111-8111-111111119001'
    returning id
  $$,
  'viewer cannot update an assigned tenant lead'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}',
  true
);

select is_empty(
  $$ select id from public.businesses $$,
  'a platform administrator without MFA cannot read tenant data'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}',
  true
);

select results_eq(
  $$ select count(*) from public.businesses $$,
  $$ values (2::bigint) $$,
  'platform admin can see all businesses'
);

select results_eq(
  $$
    update public.business_memberships
    set role = 'manager'
    where business_id = '11111111-1111-4111-8111-111111111111'
      and user_id = '00000000-0000-4000-8000-000000000003'
    returning role::text
  $$,
  $$ values ('manager'::text) $$,
  'platform admin can change membership roles'
);

reset role;

select throws_ok(
  $$
    insert into public.lead_notes (business_id, lead_id, author_user_id, body)
    values (
      '22222222-2222-4222-8222-222222222222',
      '11111111-1111-4111-8111-111111119001',
      '00000000-0000-4000-8000-000000000005',
      'Cross-tenant note attempt'
    )
  $$,
  '23503',
  'insert or update on table "lead_notes" violates foreign key constraint "lead_notes_business_lead_fkey"',
  'cross-tenant lead notes are rejected by a database constraint'
);

select throws_ok(
  $$
    insert into public.outbox_jobs (business_id, lead_id, kind, idempotency_key)
    values (
      '22222222-2222-4222-8222-222222222222',
      '11111111-1111-4111-8111-111111119001',
      'cross_tenant_test',
      'cross-tenant-test-job'
    )
  $$,
  '23503',
  'insert or update on table "outbox_jobs" violates foreign key constraint "outbox_jobs_business_lead_fkey"',
  'cross-tenant jobs are rejected by a database constraint'
);

set local role anon;
select set_config('request.jwt.claims', '{}', true);

select throws_ok(
  $$ select count(*) from public.businesses $$,
  '42501',
  'permission denied for table businesses',
  'anonymous callers are denied direct business reads'
);

select throws_ok(
  $$
    insert into public.leads (
      business_id,
      full_name,
      email,
      consent_text,
      consent_version,
      consented_at
    )
    values (
      '11111111-1111-4111-8111-111111111111',
      'Anonymous bypass',
      'bypass@example.com',
      'Test',
      'test-v1',
      now()
    )
  $$,
  '42501',
  'permission denied for table leads',
  'anonymous callers cannot bypass the future public lead endpoint'
);

select * from finish();
rollback;
