begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(7);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);

select results_eq(
  $$ select distinct business_id from public.site_events $$,
  $$ values ('11111111-1111-4111-8111-111111111111'::uuid) $$,
  'Atlas owner sees only Atlas website analytics'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000005","role":"authenticated"}',
  true
);

select is_empty(
  $$ select id from public.site_events $$,
  'Beacon owner cannot see Atlas website analytics'
);

reset role;

select throws_ok(
  $$
    insert into public.business_memberships (business_id, user_id, role)
    values (
      '22222222-2222-4222-8222-222222222222',
      '00000000-0000-4000-8000-000000000002',
      'owner'
    )
  $$,
  '23505',
  'duplicate key value violates unique constraint "business_memberships_single_business_user_idx"',
  'one client identity cannot be assigned to a second business'
);

select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'site_events_business_type_created_idx'
  ),
  'website analytics has a business, event type, and timestamp index'
);

select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'site_events_business_visitor_created_idx'
  ),
  'unique-visitor analytics has a partial business and visitor index'
);

select has_column(
  'public',
  'site_events',
  'referrer_host',
  'website analytics stores a normalized referral hostname'
);

select has_column(
  'public',
  'site_events',
  'device_type',
  'website analytics stores a normalized device category'
);

select * from finish();
rollback;
