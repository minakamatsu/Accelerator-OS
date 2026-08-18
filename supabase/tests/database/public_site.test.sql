begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(20);

select ok(
  has_function_privilege('anon', 'public.get_public_site(text)', 'execute'),
  'anonymous visitors can execute the allow-listed public-site reader'
);

select ok(
  has_function_privilege('anon', 'public.resolve_public_site_slug(text)', 'execute'),
  'anonymous routing can execute verified-host resolution'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.record_public_site_event(text,text,text,text,text,text,text,text)',
    'execute'
  ),
  'anonymous callers cannot bypass the same-origin route handler to record events'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.record_public_site_event(text,text,text,text,text,text,text,text)',
    'execute'
  ),
  'signed-in callers cannot bypass the same-origin route handler to record events'
);

select ok(
  coalesce(
    not has_function_privilege(
      'anon',
      to_regprocedure('public.rls_auto_enable()'),
      'execute'
    ),
    true
  )
    and coalesce(
      not has_function_privilege(
        'authenticated',
        to_regprocedure('public.rls_auto_enable()'),
        'execute'
      ),
      true
    ),
  'the internal RLS event-trigger function is not exposed through the Data API'
);

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select results_eq(
  $$ select public.resolve_public_site_slug('DEMO-ATLAS-AUTO.LOCALHOST.:3000') $$,
  $$ values ('demo-atlas-auto'::text) $$,
  'verified host lookup normalizes case, port, and a trailing dot'
);

select is(
  public.resolve_public_site_slug('unknown.localhost'),
  null,
  'unknown hosts fail closed'
);

select results_eq(
  $$ select public.get_public_site('demo-atlas-auto') ->> 'name' $$,
  $$ values ('[DEMO] Atlas Auto Repair'::text) $$,
  'active approved slug returns the public site snapshot'
);

select is(
  public.get_public_site('demo-beacon-motor-works'),
  null,
  'draft businesses cannot render through the public reader'
);

select ok(
  not (public.get_public_site('demo-atlas-auto') ?| array[
    'id', 'business_id', 'status', 'factsApprovedAt', 'designApprovedAt',
    'onboardingState', 'factsSourceNotes', 'designNotes'
  ]),
  'public snapshot excludes identifiers, approvals, state, and source notes'
);

select results_eq(
  $$ select jsonb_array_length(public.get_public_site('demo-atlas-auto') -> 'services') $$,
  $$ values (4) $$,
  'public snapshot includes only the active pilot services'
);

reset role;
set local role service_role;

select ok(
  public.record_public_site_event(
    'demo-atlas-auto',
    'phone_click',
    '/site/demo-atlas-auto',
    'public_phone_link'
  ),
  'allow-listed phone click is recorded for an active server-resolved slug'
);

select ok(
  public.record_public_site_event(
    'demo-atlas-auto',
    'page_view',
    '/site/demo-atlas-auto/services',
    'public_page_view',
    repeat('a', 64),
    'google.com',
    'mobile',
    'google'
  ),
  'allow-listed page view is recorded for an active server-resolved slug'
);

select is(
  public.record_public_site_event(
    'demo-atlas-auto',
    'arbitrary_event',
    '/site/demo-atlas-auto',
    'public_phone_link'
  ),
  false,
  'arbitrary public event types are rejected'
);

select ok(
  public.record_public_site_event(
    'demo-atlas-auto',
    'directions_click',
    '/site/demo-atlas-auto/visit',
    'public_directions_link',
    repeat('b', 64)
  ),
  'allow-listed directions clicks are recorded'
);

select ok(
  public.record_public_site_event(
    'demo-atlas-auto',
    'contact_click',
    '/site/demo-atlas-auto',
    'public_contact_link',
    repeat('c', 64)
  ),
  'allow-listed contact clicks are recorded'
);

select is(
  public.record_public_site_event(
    'demo-atlas-auto',
    'page_view',
    '/site/demo-atlas-auto',
    'public_page_view',
    repeat('d', 64),
    null,
    'television'
  ),
  false,
  'unknown device categories are rejected'
);

reset role;

select results_eq(
  $$
    select count(*)
    from public.site_events
    where business_id = '11111111-1111-4111-8111-111111111111'
      and event_type = 'phone_click'
      and source = 'public_phone_link'
  $$,
  $$ values (1::bigint) $$,
  'click capture derives and stores the correct tenant exactly once'
);

select results_eq(
  $$
    select count(*)
    from public.site_events
    where business_id = '11111111-1111-4111-8111-111111111111'
      and event_type = 'page_view'
      and source = 'public_page_view'
      and anonymous_session_hash = repeat('a', 64)
      and referrer_host = 'google.com'
      and device_type = 'mobile'
      and utm_source = 'google'
  $$,
  $$ values (1::bigint) $$,
  'page-view capture derives and stores the correct tenant exactly once'
);

update public.businesses
set status = 'suspended'
where id = '11111111-1111-4111-8111-111111111111';

set local role anon;

select is(
  public.resolve_public_site_slug('demo-atlas-auto.localhost'),
  null,
  'suspended businesses fail closed during verified-host resolution'
);

select * from finish();
rollback;
