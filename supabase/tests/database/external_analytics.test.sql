begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(14);

select has_table(
  'public',
  'analytics_connections',
  'external analytics connections are stored separately from website-building records'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.analytics_connections'::regclass),
  'analytics connections have RLS enabled'
);

select ok(
  not has_table_privilege('anon', 'public.analytics_connections', 'select'),
  'anonymous callers cannot read tracking connections'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.record_external_site_event(uuid,text,text,text,text,text,text,text,text)',
    'execute'
  ),
  'authenticated browser sessions cannot invoke the privileged event recorder directly'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.record_external_site_event(uuid,text,text,text,text,text,text,text,text)',
    'execute'
  ),
  'only the server role can invoke the external event recorder'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);

select is_empty(
  $$ select id from public.analytics_connections $$,
  'client accounts cannot read analytics installation keys'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}',
  true
);

select results_eq(
  $$ select count(*) from public.analytics_connections $$,
  $$ values (2::bigint) $$,
  'the agency administrator can manage every business connection'
);

set local role service_role;

select results_eq(
  $$
    select public.record_external_site_event(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'example.com',
      'page_view',
      '/services',
      'external_site_tracker',
      repeat('a', 64),
      'google.com',
      'mobile',
      'google'
    )
  $$,
  $$ values (true) $$,
  'a valid key and exact configured origin records an allow-listed event'
);

reset role;

select results_eq(
  $$
    select count(*)
    from public.site_events
    where business_id = '11111111-1111-4111-8111-111111111111'
      and source = 'external_site_tracker'
      and path = '/services'
  $$,
  $$ values (1::bigint) $$,
  'the external event is written to the resolved tenant only'
);

set local role service_role;

select results_eq(
  $$
    select public.record_external_site_event(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'attacker.example',
      'page_view',
      '/', null, null, null, null, null
    )
  $$,
  $$ values (false) $$,
  'a valid key from the wrong origin is rejected'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}',
  true
);

select ok(
  set_config(
    'app.rotated_site_key',
    public.rotate_analytics_site_key('11111111-1111-4111-8111-111111111111')::text,
    true
  ) ~ '^[0-9a-f-]{36}$',
  'the agency can rotate the publishable tracking key'
);

set local role service_role;

select results_eq(
  $$
    select public.record_external_site_event(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'example.com',
      'page_view',
      '/', null, null, null, null, null
    )
  $$,
  $$ values (false) $$,
  'the previous key stops recording immediately after rotation'
);

select results_eq(
  $$
    select public.record_external_site_event(
      current_setting('app.rotated_site_key')::uuid,
      'example.com',
      'page_view',
      '/', null, null, null, null, null
    )
  $$,
  $$ values (true) $$,
  'the rotated key records from the configured origin'
);

reset role;
update public.businesses
set status = 'suspended'
where id = '11111111-1111-4111-8111-111111111111';
set local role service_role;

select results_eq(
  $$
    select public.record_external_site_event(
      current_setting('app.rotated_site_key')::uuid,
      'example.com',
      'page_view',
      '/', null, null, null, null, null
    )
  $$,
  $$ values (false) $$,
  'a suspended business cannot record external events'
);

select * from finish();
rollback;
