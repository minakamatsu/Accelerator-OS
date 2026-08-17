begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(13);

select ok(
  not has_function_privilege('anon', 'public.create_business_draft(text,text,text)', 'execute'),
  'anonymous callers cannot execute draft creation'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);

select throws_ok(
  $$ select public.create_business_draft('Unauthorized Auto', 'unauthorized-auto', 'America/New_York') $$,
  '42501',
  'Only a platform administrator can create a business.',
  'tenant owners cannot create a new business through the onboarding RPC'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);

select is_empty(
  $$
    update public.business_profiles
    set public_phone = '+1 555 010 9999'
    where business_id = '11111111-1111-4111-8111-111111111111'
    returning business_id
  $$,
  'viewer cannot edit onboarding facts'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);

select lives_ok(
  $$ select public.create_business_draft('[DEMO] New Draft Auto', 'demo-new-draft-auto', 'America/New_York') $$,
  'platform admin can create an atomic business draft'
);

select results_eq(
  $$
    select count(*)
    from public.business_profiles
    where business_id = (select id from public.businesses where slug = 'demo-new-draft-auto')
  $$,
  $$ values (1::bigint) $$,
  'draft creation includes its profile record'
);

select results_eq(
  $$
    select count(*)
    from public.brand_settings
    where business_id = (select id from public.businesses where slug = 'demo-new-draft-auto')
  $$,
  $$ values (1::bigint) $$,
  'draft creation includes its brand record'
);

select throws_ok(
  $$
    update public.businesses
    set status = 'active'
    where slug = 'demo-new-draft-auto'
  $$,
  '23514',
  'Connect the business website before activation.',
  'database activation gate now requires only the external website connection'
);

select throws_ok(
  $$
    update public.business_profiles
    set website_url = 'http://insecure.example.com'
    where business_id = '11111111-1111-4111-8111-111111111111'
  $$,
  '23514',
  'new row for relation "business_profiles" violates check constraint "business_profiles_url_protocols"',
  'database rejects insecure public URLs'
);

update public.businesses
set facts_approved_at = now(), design_approved_at = now()
where id = '11111111-1111-4111-8111-111111111111';

select results_eq(
  $$
    update public.businesses
    set status = 'active'
    where id = '11111111-1111-4111-8111-111111111111'
    returning status::text
  $$,
  $$ values ('active'::text) $$,
  'complete approved fixture can activate'
);

select ok(
  exists (
    select 1 from public.audit_log
    where business_id = '11111111-1111-4111-8111-111111111111'
      and action = 'onboarding.businesses.update'
  ),
  'activation is covered by the audit log'
);

update public.business_profiles
set value_proposition = '[DEMO] Revised fictional wording.'
where business_id = '11111111-1111-4111-8111-111111111111';

select results_eq(
  $$
    select status::text, facts_approved_at is null, design_approved_at is null
    from public.businesses
    where id = '11111111-1111-4111-8111-111111111111'
  $$,
  $$ values ('active'::text, false, false) $$,
  'retired website-building fields no longer demote the analytics account'
);

select ok(
  exists (
    select 1 from public.audit_log
    where business_id = '11111111-1111-4111-8111-111111111111'
      and action = 'onboarding.business_profiles.update'
  ),
  'material fact edits are covered by the audit log'
);

update public.businesses
set facts_approved_at = now(), design_approved_at = now(), status = 'active'
where id = '11111111-1111-4111-8111-111111111111';

delete from public.notification_recipients
where business_id = '11111111-1111-4111-8111-111111111111';

select results_eq(
  $$
    select status::text from public.businesses
    where id = '11111111-1111-4111-8111-111111111111'
  $$,
  $$ values ('active'::text) $$,
  'notification recipients no longer control analytics account activation'
);

select * from finish();
rollback;
