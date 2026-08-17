-- Milestone 2: tenant data model, integrity constraints, and authorization.
-- Public access is denied by default. Authenticated access is granted explicitly below.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public;

create type public.platform_role as enum ('admin', 'member');
create type public.business_status as enum ('draft', 'active', 'suspended', 'archived');
create type public.business_member_role as enum ('owner', 'manager', 'staff', 'viewer');
create type public.membership_status as enum ('active', 'suspended');
create type public.domain_status as enum ('pending', 'verified', 'failed', 'removed');
create type public.asset_kind as enum ('logo', 'photo', 'icon', 'document');
create type public.lead_status as enum ('new', 'contacted', 'estimate_sent', 'won', 'lost');
create type public.actor_type as enum ('user', 'system', 'visitor', 'provider');
create type public.job_status as enum ('pending', 'processing', 'sent', 'canceled', 'failed');
create type public.delivery_status as enum ('captured', 'queued', 'sent', 'delivered', 'failed', 'suppressed');
create type public.subscription_status as enum ('unknown', 'trialing', 'active', 'past_due', 'canceled', 'paused');
create type public.connection_status as enum ('disconnected', 'pending', 'connected', 'error');
create type public.webhook_status as enum ('received', 'processed', 'ignored', 'failed');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  platform_role public.platform_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (char_length(display_name) <= 120)
);

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null default 'general_automotive_repair',
  status public.business_status not null default 'draft',
  timezone text not null default 'America/New_York',
  currency text not null default 'USD',
  onboarding_state jsonb not null default '{}'::jsonb,
  facts_approved_at timestamptz,
  design_approved_at timestamptz,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint businesses_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint businesses_name_length check (char_length(name) between 1 and 160),
  constraint businesses_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint businesses_approval_order check (
    design_approved_at is null or facts_approved_at is not null
  )
);

create table public.business_memberships (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.business_member_role not null,
  status public.membership_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_memberships_business_user_key unique (business_id, user_id),
  constraint business_memberships_business_id_id_key unique (business_id, id)
);

create index business_memberships_user_business_idx
  on public.business_memberships (user_id, business_id)
  where status = 'active';

create table public.business_domains (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  hostname text not null unique,
  status public.domain_status not null default 'pending',
  verification_token_hash text,
  verified_at timestamptz,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_domains_business_id_id_key unique (business_id, id),
  constraint business_domains_hostname_normalized check (
    hostname = lower(hostname)
    and hostname !~ '[:/\\\\]'
    and char_length(hostname) between 1 and 253
  ),
  constraint business_domains_verified_state check (
    (status = 'verified' and verified_at is not null)
    or (status <> 'verified')
  )
);

create unique index business_domains_one_primary_idx
  on public.business_domains (business_id)
  where is_primary and status <> 'removed';

create table public.business_profiles (
  business_id uuid primary key references public.businesses (id) on delete cascade,
  public_phone text,
  public_email text,
  address_line_1 text,
  address_line_2 text,
  city text,
  region text,
  postal_code text,
  country_code text not null default 'US',
  service_area text,
  hours jsonb not null default '{}'::jsonb,
  map_url text,
  review_url text,
  primary_cta text,
  value_proposition text,
  approved_offer text,
  tone text,
  locale text not null default 'en-US',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_profiles_email_length check (
    public_email is null or char_length(public_email) <= 320
  ),
  constraint business_profiles_country_code check (country_code ~ '^[A-Z]{2}$')
);

create table public.brand_settings (
  business_id uuid primary key references public.businesses (id) on delete cascade,
  logo_asset_id uuid,
  color_direction jsonb not null default '{}'::jsonb,
  image_permission_notes text,
  typography_direction text,
  shape_preferences jsonb not null default '{}'::jsonb,
  motion_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  slug text not null,
  short_description text,
  display_order integer not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_business_slug_key unique (business_id, slug),
  constraint services_business_id_id_key unique (business_id, id),
  constraint services_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint services_name_length check (char_length(name) between 1 and 120)
);

create index services_business_order_idx
  on public.services (business_id, is_active, display_order);

create table public.business_assets (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  storage_path text not null,
  kind public.asset_kind not null,
  alt_text text,
  source text,
  permission_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_assets_business_path_key unique (business_id, storage_path),
  constraint business_assets_business_id_id_key unique (business_id, id),
  constraint business_assets_tenant_prefix check (
    storage_path like business_id::text || '/%'
  )
);

alter table public.brand_settings
  add constraint brand_settings_logo_asset_fkey
  foreign key (business_id, logo_asset_id)
  references public.business_assets (business_id, id)
  on delete set null;

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  status public.lead_status not null default 'new',
  full_name text not null,
  email text,
  phone text,
  service_id uuid,
  service_request text,
  vehicle_year smallint,
  vehicle_make text,
  vehicle_model text,
  message text,
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  consent_text text not null,
  consent_version text not null,
  consented_at timestamptz not null,
  estimated_value_minor bigint,
  won_value_minor bigint,
  currency text not null default 'USD',
  assigned_user_id uuid references public.profiles (id) on delete set null,
  contacted_at timestamptz,
  won_at timestamptz,
  lost_at timestamptz,
  loss_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_business_id_id_key unique (business_id, id),
  constraint leads_business_service_fkey foreign key (business_id, service_id)
    references public.services (business_id, id) on delete set null,
  constraint leads_contact_method check (
    nullif(trim(coalesce(email, '')), '') is not null
    or nullif(trim(coalesce(phone, '')), '') is not null
  ),
  constraint leads_name_length check (char_length(full_name) between 1 and 160),
  constraint leads_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint leads_estimated_value_nonnegative check (
    estimated_value_minor is null or estimated_value_minor >= 0
  ),
  constraint leads_won_value_nonnegative check (
    won_value_minor is null or won_value_minor >= 0
  ),
  constraint leads_vehicle_year_range check (
    vehicle_year is null or vehicle_year between 1886 and 2200
  )
);

create index leads_business_created_idx on public.leads (business_id, created_at desc);
create index leads_business_status_idx on public.leads (business_id, status, created_at desc);

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  lead_id uuid not null,
  author_user_id uuid not null references public.profiles (id),
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lead_notes_business_id_id_key unique (business_id, id),
  constraint lead_notes_business_lead_fkey foreign key (business_id, lead_id)
    references public.leads (business_id, id) on delete cascade,
  constraint lead_notes_body_length check (char_length(body) between 1 and 5000)
);

create index lead_notes_business_lead_idx
  on public.lead_notes (business_id, lead_id, created_at);

create table public.lead_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  lead_id uuid not null,
  event_type text not null,
  actor_type public.actor_type not null,
  actor_user_id uuid references public.profiles (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint lead_events_business_id_id_key unique (business_id, id),
  constraint lead_events_business_lead_fkey foreign key (business_id, lead_id)
    references public.leads (business_id, id) on delete cascade
);

create index lead_events_business_lead_idx
  on public.lead_events (business_id, lead_id, created_at);

create table public.site_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  event_type text not null,
  anonymous_session_hash text,
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  path text not null,
  created_at timestamptz not null default now(),
  constraint site_events_business_id_id_key unique (business_id, id)
);

create index site_events_business_created_idx
  on public.site_events (business_id, created_at desc);

create table public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  kind text not null,
  enabled boolean not null default false,
  delay_seconds integer not null default 0,
  template_version text not null,
  eligibility jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint automation_rules_business_kind_key unique (business_id, kind),
  constraint automation_rules_business_id_id_key unique (business_id, id),
  constraint automation_rules_delay_nonnegative check (delay_seconds >= 0)
);

create table public.notification_recipients (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  recipient_type text not null default 'email',
  recipient_address text not null,
  enabled_event_kinds text[] not null default '{}'::text[],
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_recipients_business_address_key
    unique (business_id, recipient_type, recipient_address),
  constraint notification_recipients_business_id_id_key unique (business_id, id)
);

create table public.outbox_jobs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  lead_id uuid,
  kind text not null,
  run_after timestamptz not null default now(),
  status public.job_status not null default 'pending',
  attempt_count integer not null default 0,
  lease_until timestamptz,
  idempotency_key text not null unique,
  payload jsonb not null default '{}'::jsonb,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint outbox_jobs_business_id_id_key unique (business_id, id),
  constraint outbox_jobs_business_lead_fkey foreign key (business_id, lead_id)
    references public.leads (business_id, id) on delete cascade,
  constraint outbox_jobs_attempt_count_nonnegative check (attempt_count >= 0)
);

create index outbox_jobs_claim_idx
  on public.outbox_jobs (status, run_after)
  where status = 'pending';

create table public.message_deliveries (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  lead_id uuid,
  outbox_job_id uuid not null,
  provider text not null,
  provider_message_id text,
  recipient_display text not null,
  template_key text not null,
  template_version text not null,
  status public.delivery_status not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint message_deliveries_business_id_id_key unique (business_id, id),
  constraint message_deliveries_business_lead_fkey foreign key (business_id, lead_id)
    references public.leads (business_id, id) on delete set null,
  constraint message_deliveries_business_job_fkey foreign key (business_id, outbox_job_id)
    references public.outbox_jobs (business_id, id) on delete cascade
);

create unique index message_deliveries_provider_message_idx
  on public.message_deliveries (provider, provider_message_id)
  where provider_message_id is not null;

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  provider text not null,
  external_customer_id text,
  external_subscription_id text,
  plan_code text not null,
  status public.subscription_status not null default 'unknown',
  current_period_end timestamptz,
  last_webhook_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_business_provider_key unique (business_id, provider),
  constraint subscriptions_business_id_id_key unique (business_id, id)
);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_event_id text not null,
  signature_verified boolean not null default false,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  status public.webhook_status not null default 'received',
  sanitized_error text,
  constraint webhook_events_provider_event_key unique (provider, external_event_id)
);

create table public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  provider text not null,
  external_account_reference text,
  status public.connection_status not null default 'disconnected',
  capabilities jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint integration_connections_business_provider_key unique (business_id, provider),
  constraint integration_connections_business_id_id_key unique (business_id, id)
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses (id) on delete cascade,
  actor_type public.actor_type not null,
  actor_user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  safe_before jsonb,
  safe_after jsonb,
  request_id text,
  created_at timestamptz not null default now()
);

create index audit_log_business_created_idx
  on public.audit_log (business_id, created_at desc);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'businesses', 'business_memberships', 'business_domains',
    'business_profiles', 'brand_settings', 'services', 'business_assets',
    'leads', 'lead_notes', 'automation_rules', 'notification_recipients',
    'outbox_jobs', 'message_deliveries', 'subscriptions', 'integration_connections'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I '
      'for each row execute function private.set_updated_at()',
      table_name
    );
  end loop;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 120)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.current_user_is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    exists (
      select 1
      from public.profiles as profile
      where profile.id = (select auth.uid())
        and profile.platform_role = 'admin'
    ),
    false
  );
$$;

create or replace function private.has_business_access(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select private.current_user_is_platform_admin())
    or exists (
      select 1
      from public.business_memberships as membership
      where membership.business_id = target_business_id
        and membership.user_id = (select auth.uid())
        and membership.status = 'active'
    );
$$;

create or replace function private.has_business_role(
  target_business_id uuid,
  allowed_roles public.business_member_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select private.current_user_is_platform_admin())
    or exists (
      select 1
      from public.business_memberships as membership
      where membership.business_id = target_business_id
        and membership.user_id = (select auth.uid())
        and membership.status = 'active'
        and membership.role = any(allowed_roles)
    );
$$;

revoke all on function private.current_user_is_platform_admin() from public;
revoke all on function private.has_business_access(uuid) from public;
revoke all on function private.has_business_role(uuid, public.business_member_role[]) from public;
grant usage on schema private to authenticated;
grant execute on function private.current_user_is_platform_admin() to authenticated;
grant execute on function private.has_business_access(uuid) to authenticated;
grant execute on function private.has_business_role(uuid, public.business_member_role[]) to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'businesses', 'business_memberships', 'business_domains',
    'business_profiles', 'brand_settings', 'services', 'business_assets',
    'leads', 'lead_notes', 'lead_events', 'site_events', 'automation_rules',
    'notification_recipients', 'outbox_jobs', 'message_deliveries',
    'subscriptions', 'webhook_events', 'integration_connections', 'audit_log'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I force row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
  end loop;
end;
$$;

grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

create policy profiles_select_self_or_admin
  on public.profiles for select to authenticated
  using (
    id = (select auth.uid())
    or (select private.current_user_is_platform_admin())
  );

create policy profiles_update_self
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

grant select, insert, update, delete on public.businesses to authenticated;

create policy businesses_select_members
  on public.businesses for select to authenticated
  using ((select private.has_business_access(id)));

create policy businesses_insert_platform_admin
  on public.businesses for insert to authenticated
  with check (
    (select private.current_user_is_platform_admin())
    and created_by = (select auth.uid())
  );

create policy businesses_update_platform_admin
  on public.businesses for update to authenticated
  using ((select private.current_user_is_platform_admin()))
  with check ((select private.current_user_is_platform_admin()));

create policy businesses_delete_platform_admin
  on public.businesses for delete to authenticated
  using ((select private.current_user_is_platform_admin()));

grant select, insert, update, delete on public.business_memberships to authenticated;

create policy memberships_select_members
  on public.business_memberships for select to authenticated
  using ((select private.has_business_access(business_id)));

create policy memberships_insert_platform_admin
  on public.business_memberships for insert to authenticated
  with check ((select private.current_user_is_platform_admin()));

create policy memberships_update_platform_admin
  on public.business_memberships for update to authenticated
  using ((select private.current_user_is_platform_admin()))
  with check ((select private.current_user_is_platform_admin()));

create policy memberships_delete_platform_admin
  on public.business_memberships for delete to authenticated
  using ((select private.current_user_is_platform_admin()));

grant select, insert, update, delete on public.business_domains to authenticated;

create policy business_domains_select_members
  on public.business_domains for select to authenticated
  using ((select private.has_business_access(business_id)));

create policy business_domains_write_platform_admin
  on public.business_domains for all to authenticated
  using ((select private.current_user_is_platform_admin()))
  with check ((select private.current_user_is_platform_admin()));

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'business_profiles', 'brand_settings', 'services', 'business_assets',
    'automation_rules', 'notification_recipients'
  ]
  loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated '
      'using ((select private.has_business_access(business_id)))',
      table_name || '_select_members',
      table_name
    );
    execute format(
      'create policy %I on public.%I for all to authenticated '
      'using ((select private.has_business_role(business_id, '
      'array[''owner''::public.business_member_role, ''manager''::public.business_member_role]))) '
      'with check ((select private.has_business_role(business_id, '
      'array[''owner''::public.business_member_role, ''manager''::public.business_member_role])))',
      table_name || '_write_managers',
      table_name
    );
  end loop;
end;
$$;

grant select, update on public.leads to authenticated;

create policy leads_select_members
  on public.leads for select to authenticated
  using ((select private.has_business_access(business_id)));

create policy leads_update_operators
  on public.leads for update to authenticated
  using (
    (select private.has_business_role(
      business_id,
      array[
        'owner'::public.business_member_role,
        'manager'::public.business_member_role,
        'staff'::public.business_member_role
      ]
    ))
  )
  with check (
    (select private.has_business_role(
      business_id,
      array[
        'owner'::public.business_member_role,
        'manager'::public.business_member_role,
        'staff'::public.business_member_role
      ]
    ))
  );

grant select, insert, update, delete on public.lead_notes to authenticated;

create policy lead_notes_select_members
  on public.lead_notes for select to authenticated
  using ((select private.has_business_access(business_id)));

create policy lead_notes_insert_operators
  on public.lead_notes for insert to authenticated
  with check (
    author_user_id = (select auth.uid())
    and (select private.has_business_role(
      business_id,
      array[
        'owner'::public.business_member_role,
        'manager'::public.business_member_role,
        'staff'::public.business_member_role
      ]
    ))
  );

create policy lead_notes_update_author
  on public.lead_notes for update to authenticated
  using (
    author_user_id = (select auth.uid())
    and (select private.has_business_role(
      business_id,
      array[
        'owner'::public.business_member_role,
        'manager'::public.business_member_role,
        'staff'::public.business_member_role
      ]
    ))
  )
  with check (
    author_user_id = (select auth.uid())
    and (select private.has_business_role(
      business_id,
      array[
        'owner'::public.business_member_role,
        'manager'::public.business_member_role,
        'staff'::public.business_member_role
      ]
    ))
  );

create policy lead_notes_delete_author_or_manager
  on public.lead_notes for delete to authenticated
  using (
    author_user_id = (select auth.uid())
    or (select private.has_business_role(
      business_id,
      array[
        'owner'::public.business_member_role,
        'manager'::public.business_member_role
      ]
    ))
  );

do $$
declare
  table_name text;
begin
  foreach table_name in array array['lead_events', 'site_events', 'subscriptions']
  loop
    execute format('grant select on public.%I to authenticated', table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated '
      'using ((select private.has_business_access(business_id)))',
      table_name || '_select_members',
      table_name
    );
  end loop;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['outbox_jobs', 'message_deliveries', 'integration_connections', 'audit_log']
  loop
    execute format('grant select on public.%I to authenticated', table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated '
      'using ((select private.has_business_role(business_id, '
      'array[''owner''::public.business_member_role, ''manager''::public.business_member_role])))',
      table_name || '_select_managers',
      table_name
    );
  end loop;
end;
$$;

-- webhook_events intentionally has no anon/authenticated grants or policies.
-- System writes for leads, events, jobs, deliveries, billing, integrations, and audit
-- use a narrowly scoped server-only service-role client.

comment on schema private is 'Security-definer authorization helpers; not exposed by the Data API.';
comment on table public.webhook_events is 'Provider events. Payloads are minimized and access is server-only.';
comment on column public.outbox_jobs.payload is 'Sanitized job data only; never store provider secrets.';
