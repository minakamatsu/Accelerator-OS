-- Development fixtures only. These are fictional records and must never be used as client facts.
-- Local password for every seeded user: LocalOnly!ChangeMe2026

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  fixture.id,
  'authenticated',
  'authenticated',
  fixture.email,
  extensions.crypt('LocalOnly!ChangeMe2026', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('display_name', fixture.display_name),
  now(),
  now(),
  '',
  '',
  '',
  ''
from (
  values
    ('00000000-0000-4000-8000-000000000001'::uuid, 'admin@accelerator.test', 'Demo Platform Admin'),
    ('00000000-0000-4000-8000-000000000002'::uuid, 'owner-a@accelerator.test', 'Demo Owner A'),
    ('00000000-0000-4000-8000-000000000003'::uuid, 'staff-a@accelerator.test', 'Demo Staff A'),
    ('00000000-0000-4000-8000-000000000004'::uuid, 'viewer-a@accelerator.test', 'Demo Viewer A'),
    ('00000000-0000-4000-8000-000000000005'::uuid, 'owner-b@accelerator.test', 'Demo Owner B')
) as fixture(id, email, display_name);

insert into auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  fixture.id,
  fixture.id::text,
  fixture.id,
  jsonb_build_object(
    'sub', fixture.id::text,
    'email', fixture.email,
    'email_verified', true
  ),
  'email',
  now(),
  now(),
  now()
from (
  values
    ('00000000-0000-4000-8000-000000000001'::uuid, 'admin@accelerator.test'),
    ('00000000-0000-4000-8000-000000000002'::uuid, 'owner-a@accelerator.test'),
    ('00000000-0000-4000-8000-000000000003'::uuid, 'staff-a@accelerator.test'),
    ('00000000-0000-4000-8000-000000000004'::uuid, 'viewer-a@accelerator.test'),
    ('00000000-0000-4000-8000-000000000005'::uuid, 'owner-b@accelerator.test')
) as fixture(id, email);

update public.profiles
set platform_role = 'admin'
where id = '00000000-0000-4000-8000-000000000001';

insert into public.businesses (
  id,
  slug,
  name,
  category,
  status,
  created_by
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'demo-atlas-auto',
    '[DEMO] Atlas Auto Repair',
    'general_automotive_repair',
    'draft',
    '00000000-0000-4000-8000-000000000001'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'demo-beacon-motor-works',
    '[DEMO] Beacon Motor Works',
    'general_automotive_repair',
    'draft',
    '00000000-0000-4000-8000-000000000001'
  );

update public.businesses
set client_contact_name = '[DEMO] Atlas owner',
    client_contact_email = 'owner@atlas.example',
    client_contact_phone = '+1 555 010 1000'
where id = '11111111-1111-4111-8111-111111111111';

insert into public.business_domains (
  business_id,
  hostname,
  status,
  verified_at,
  is_primary
)
values (
  '11111111-1111-4111-8111-111111111111',
  'demo-atlas-auto.localhost',
  'verified',
  now(),
  true
);

insert into public.analytics_connections (
  business_id,
  site_key,
  allowed_hostname,
  status
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'example.com',
    'pending'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    null,
    'disconnected'
  );

insert into public.business_memberships (business_id, user_id, role)
values
  ('11111111-1111-4111-8111-111111111111', '00000000-0000-4000-8000-000000000002', 'owner'),
  ('11111111-1111-4111-8111-111111111111', '00000000-0000-4000-8000-000000000003', 'staff'),
  ('11111111-1111-4111-8111-111111111111', '00000000-0000-4000-8000-000000000004', 'viewer'),
  ('22222222-2222-4222-8222-222222222222', '00000000-0000-4000-8000-000000000005', 'owner');

insert into public.business_profiles (
  business_id,
  public_phone,
  public_email,
  address_line_1,
  city,
  region,
  postal_code,
  service_area,
  hours,
  website_url,
  primary_cta,
  value_proposition,
  tone,
  contact_preference,
  facts_source_notes
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '+1 555 010 1000',
    'atlas@example.com',
    '100 Demo Lane',
    'Example City',
    'NY',
    '10001',
    '[DEMO] Fictional local service area',
    '{
      "monday":{"open":"08:00","close":"17:00"},
      "tuesday":{"open":"08:00","close":"17:00"},
      "wednesday":{"open":"08:00","close":"17:00"},
      "thursday":{"open":"08:00","close":"17:00"},
      "friday":{"open":"08:00","close":"17:00"},
      "saturday":null,
      "sunday":null
    }'::jsonb,
    'https://example.com/demo-atlas',
    'Request a demo quote',
    '[DEMO] Clear, practical automotive care using fictional development content.',
    'Clear and practical',
    'phone',
    '[DEMO] Fictional development facts entered only to exercise onboarding.'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    '{}'::jsonb,
    null,
    'Request a demo quote',
    null,
    'Warm and direct',
    null,
    '[DEMO] Incomplete fixture used to verify missing-information states.'
  );

update public.business_profiles
set map_url = 'https://www.google.com/maps/search/?api=1&query=100+Demo+Lane+Example+City+NY+10001'
where business_id = '11111111-1111-4111-8111-111111111111';

insert into public.brand_settings (
  business_id,
  color_direction,
  image_permission_notes,
  typography_direction,
  shape_preferences,
  motion_preferences,
  logo_treatment,
  signature_feature,
  design_notes
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '{"primary":"#123B35","accent":"#D8F23F","notes":"[DEMO] Grounded, high-contrast palette"}'::jsonb,
    '[DEMO] Use generated placeholders only; no real client imagery is approved.',
    '[DEMO] Sturdy editorial sans serif direction',
    '{"style":"soft-industrial"}'::jsonb,
    '{"level":"restrained"}'::jsonb,
    '[DEMO] Text wordmark until a real logo is supplied',
    '[DEMO] Service triage selector',
    '[DEMO] Fictional design direction for workflow testing.'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '{}'::jsonb,
    null,
    null,
    '{}'::jsonb,
    '{}'::jsonb,
    null,
    null,
    null
  );

insert into public.services (id, business_id, name, slug, short_description)
values
  (
    '11111111-1111-4111-8111-111111110001',
    '11111111-1111-4111-8111-111111111111',
    'Routine Maintenance',
    'routine-maintenance',
    '[DEMO] Oil, fluid, filter, and scheduled-maintenance conversations for everyday vehicles.'
  ),
  (
    '11111111-1111-4111-8111-111111110002',
    '11111111-1111-4111-8111-111111111111',
    'Brake & Safety Checks',
    'brake-safety-checks',
    '[DEMO] A starting point for brake noise, pedal changes, or routine safety concerns.'
  ),
  (
    '11111111-1111-4111-8111-111111110003',
    '11111111-1111-4111-8111-111111111111',
    'Check-engine Diagnostics',
    'check-engine-diagnostics',
    '[DEMO] A practical next step when a warning light or unfamiliar behavior appears.'
  ),
  (
    '11111111-1111-4111-8111-111111110004',
    '11111111-1111-4111-8111-111111111111',
    'Steering & Ride Concerns',
    'steering-ride-concerns',
    '[DEMO] Help describing changes in steering feel, vibration, or ride comfort.'
  ),
  (
    '22222222-2222-4222-8222-222222220001',
    '22222222-2222-4222-8222-222222222222',
    'Demo Diagnostics',
    'demo-diagnostics',
    'Fictional development fixture.'
  );

insert into public.notification_recipients (
  business_id,
  recipient_address,
  enabled_event_kinds
)
values (
  '11111111-1111-4111-8111-111111111111',
  'notifications@example.com',
  array['lead.created']
);

insert into public.leads (
  id,
  business_id,
  full_name,
  email,
  service_id,
  service_request,
  consent_text,
  consent_version,
  consented_at
)
values
  (
    '11111111-1111-4111-8111-111111119001',
    '11111111-1111-4111-8111-111111111111',
    'Demo Lead A',
    'lead-a@example.com',
    '11111111-1111-4111-8111-111111110001',
    'Fictional development request.',
    '[DEMO] Development fixture consent; not for production.',
    'demo-v1',
    now()
  ),
  (
    '22222222-2222-4222-8222-222222229001',
    '22222222-2222-4222-8222-222222222222',
    'Demo Lead B',
    'lead-b@example.com',
    '22222222-2222-4222-8222-222222220001',
    'Fictional development request.',
    '[DEMO] Development fixture consent; not for production.',
    'demo-v1',
    now()
  );

-- Development-only evidence for the agency notification operations screen.
-- "captured" explicitly means no real email was sent.
insert into public.outbox_jobs (
  id,
  business_id,
  lead_id,
  kind,
  status,
  attempt_count,
  idempotency_key,
  payload
)
values (
  '11111111-1111-4111-8111-111111118001',
  '11111111-1111-4111-8111-111111111111',
  '11111111-1111-4111-8111-111111119001',
  'business_estimate_request_notification',
  'sent',
  1,
  'development-fixture-business-notification',
  jsonb_build_object(
    'recipientId', (
      select id
      from public.notification_recipients
      where business_id = '11111111-1111-4111-8111-111111111111'
      limit 1
    ),
    'templateKey', 'business_estimate_request',
    'templateVersion', 'v1'
  )
);

insert into public.message_deliveries (
  business_id,
  lead_id,
  outbox_job_id,
  provider,
  recipient_display,
  template_key,
  template_version,
  status
)
values (
  '11111111-1111-4111-8111-111111111111',
  '11111111-1111-4111-8111-111111119001',
  '11111111-1111-4111-8111-111111118001',
  'development',
  'n***@example.com',
  'business_estimate_request',
  'v1',
  'captured'
);

update public.businesses
set facts_approved_at = now(),
    design_approved_at = now(),
    status = 'active'
where id = '11111111-1111-4111-8111-111111111111';

-- Fictional first-party activity makes the local analytics dashboard useful to review.
insert into public.site_events (
  business_id,
  event_type,
  anonymous_session_hash,
  source,
  utm_source,
  referrer_host,
  device_type,
  path,
  created_at
)
select
  '11111111-1111-4111-8111-111111111111',
  'page_view',
  repeat(to_hex(event_number), 64),
  'development_fixture',
  case when event_number = 1 then 'google' else null end,
  case
    when event_number = 1 then 'google.com'
    when event_number = 2 then 'facebook.com'
    else null
  end,
  case
    when event_number = 1 then 'mobile'
    when event_number = 2 then 'desktop'
    else 'tablet'
  end,
  case (offset_day + event_number) % 5
    when 0 then '/site/demo-atlas-auto'
    when 1 then '/site/demo-atlas-auto/services'
    when 2 then '/site/demo-atlas-auto/visit'
    when 3 then '/site/demo-atlas-auto/vehicle-concerns'
    else '/site/demo-atlas-auto/services/brakes'
  end,
  now() - make_interval(days => offset_day) + make_interval(hours => event_number)
from generate_series(0, 8) as offset_day
cross join generate_series(1, case when offset_day < 3 then 3 else 2 end) as event_number;

-- Prior-period fixtures make comparisons visible without inflating the current period.
insert into public.site_events (
  business_id,
  event_type,
  anonymous_session_hash,
  source,
  utm_source,
  referrer_host,
  device_type,
  path,
  created_at
)
select
  '11111111-1111-4111-8111-111111111111',
  'page_view',
  repeat(to_hex(event_number + 3), 64),
  'development_fixture',
  case when event_number = 1 then 'google' else null end,
  case when event_number = 1 then 'google.com' else null end,
  case when event_number = 1 then 'mobile' else 'desktop' end,
  case when offset_day % 2 = 0 then '/site/demo-atlas-auto' else '/site/demo-atlas-auto/services' end,
  now() - make_interval(days => offset_day) + make_interval(hours => event_number)
from generate_series(31, 38) as offset_day
cross join generate_series(1, 2) as event_number;

insert into public.site_events (
  business_id,
  event_type,
  anonymous_session_hash,
  source,
  path,
  created_at
)
values
  ('11111111-1111-4111-8111-111111111111', 'phone_click', repeat('1', 64), 'development_fixture', '/site/demo-atlas-auto', now() - interval '1 day'),
  ('11111111-1111-4111-8111-111111111111', 'phone_click', repeat('2', 64), 'development_fixture', '/site/demo-atlas-auto/services', now() - interval '3 days'),
  ('11111111-1111-4111-8111-111111111111', 'phone_click', repeat('1', 64), 'development_fixture', '/site/demo-atlas-auto', now() - interval '7 days'),
  ('11111111-1111-4111-8111-111111111111', 'directions_click', repeat('2', 64), 'development_fixture', '/site/demo-atlas-auto/visit', now() - interval '2 days'),
  ('11111111-1111-4111-8111-111111111111', 'contact_click', repeat('1', 64), 'development_fixture', '/site/demo-atlas-auto', now() - interval '4 days'),
  ('11111111-1111-4111-8111-111111111111', 'estimate_request', repeat('3', 64), 'development_fixture', '/site/demo-atlas-auto/quote', now() - interval '2 days');
