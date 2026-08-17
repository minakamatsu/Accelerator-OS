-- Milestone 10: compact agency records and origin-bound external analytics.

alter table public.businesses
  add column client_contact_name text,
  add column client_contact_email text,
  add column client_contact_phone text,
  add constraint businesses_client_contact_name_length check (
    char_length(coalesce(client_contact_name, '')) <= 160
  ),
  add constraint businesses_client_contact_email_length check (
    char_length(coalesce(client_contact_email, '')) <= 320
  ),
  add constraint businesses_client_contact_phone_length check (
    char_length(coalesce(client_contact_phone, '')) <= 40
  );

-- Site-building approvals no longer control agency records or analytics access.
drop trigger if exists invalidate_identity_approvals on public.businesses;
drop trigger if exists invalidate_profile_approval on public.business_profiles;
drop trigger if exists invalidate_service_approval on public.services;
drop trigger if exists invalidate_brand_approval on public.brand_settings;
drop trigger if exists invalidate_asset_approval on public.business_assets;
drop trigger if exists demote_after_last_recipient on public.notification_recipients;

create table public.analytics_connections (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.businesses (id) on delete cascade,
  site_key uuid not null unique default gen_random_uuid(),
  allowed_hostname text,
  status public.connection_status not null default 'disconnected',
  last_event_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint analytics_connections_business_id_id_key unique (business_id, id),
  constraint analytics_connections_hostname_normalized check (
    allowed_hostname is null
    or (
      allowed_hostname = lower(allowed_hostname)
      and allowed_hostname ~ '^[a-z0-9.-]+$'
      and char_length(allowed_hostname) between 1 and 253
    )
  ),
  constraint analytics_connections_ready_state check (
    status = 'disconnected'
    or (status in ('pending', 'connected', 'error') and allowed_hostname is not null)
  )
);

create index analytics_connections_business_status_idx
  on public.analytics_connections (business_id, status);

alter table public.analytics_connections enable row level security;
alter table public.analytics_connections force row level security;
revoke all on public.analytics_connections from anon, authenticated;
grant select, insert, update, delete on public.analytics_connections to authenticated;
grant select, update on public.analytics_connections to service_role;

create policy analytics_connections_select_platform_admin
  on public.analytics_connections for select to authenticated
  using ((select private.current_user_is_platform_admin()));

create policy analytics_connections_write_platform_admin
  on public.analytics_connections for all to authenticated
  using ((select private.current_user_is_platform_admin()))
  with check ((select private.current_user_is_platform_admin()));

create or replace function public.create_agency_business(
  business_name text,
  business_slug text,
  business_timezone text,
  contact_name text default null,
  contact_email text default null,
  contact_phone text default null,
  website_url text default null,
  website_hostname text default null,
  address_line_1 text default null,
  city text default null,
  region text default null,
  postal_code text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_business_id uuid;
begin
  if not (select private.current_user_is_platform_admin()) then
    raise exception 'Only a platform administrator can create a business.'
      using errcode = '42501';
  end if;

  insert into public.businesses (
    name,
    slug,
    timezone,
    client_contact_name,
    client_contact_email,
    client_contact_phone,
    created_by
  )
  values (
    business_name,
    business_slug,
    business_timezone,
    nullif(trim(contact_name), ''),
    nullif(lower(trim(contact_email)), ''),
    nullif(trim(contact_phone), ''),
    (select auth.uid())
  )
  returning id into new_business_id;

  insert into public.business_profiles (
    business_id,
    website_url,
    address_line_1,
    city,
    region,
    postal_code
  )
  values (
    new_business_id,
    nullif(trim(website_url), ''),
    nullif(trim(address_line_1), ''),
    nullif(trim(city), ''),
    nullif(trim(region), ''),
    nullif(trim(postal_code), '')
  );

  insert into public.analytics_connections (
    business_id,
    allowed_hostname,
    status
  )
  values (
    new_business_id,
    nullif(lower(trim(website_hostname)), ''),
    case
      when nullif(trim(website_hostname), '') is null
        then 'disconnected'::public.connection_status
      else 'pending'::public.connection_status
    end
  );

  return new_business_id;
end;
$$;

revoke all on function public.create_agency_business(
  text, text, text, text, text, text, text, text, text, text, text, text
) from public, anon;
grant execute on function public.create_agency_business(
  text, text, text, text, text, text, text, text, text, text, text, text
) to authenticated;

create or replace function public.update_agency_business(
  target_business_id uuid,
  business_name text,
  business_timezone text,
  contact_name text default null,
  contact_email text default null,
  contact_phone text default null,
  website_url text default null,
  website_hostname text default null,
  address_line_1 text default null,
  city text default null,
  region text default null,
  postal_code text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not (select private.current_user_is_platform_admin()) then
    raise exception 'Only a platform administrator can update a business.'
      using errcode = '42501';
  end if;

  update public.businesses
  set name = business_name,
      timezone = business_timezone,
      client_contact_name = nullif(trim(contact_name), ''),
      client_contact_email = nullif(lower(trim(contact_email)), ''),
      client_contact_phone = nullif(trim(contact_phone), ''),
      updated_at = now()
  where id = target_business_id;

  if not found then
    return false;
  end if;

  insert into public.business_profiles (
    business_id,
    website_url,
    address_line_1,
    city,
    region,
    postal_code
  )
  values (
    target_business_id,
    nullif(trim(website_url), ''),
    nullif(trim(address_line_1), ''),
    nullif(trim(city), ''),
    nullif(trim(region), ''),
    nullif(trim(postal_code), '')
  )
  on conflict (business_id) do update
  set website_url = excluded.website_url,
      address_line_1 = excluded.address_line_1,
      city = excluded.city,
      region = excluded.region,
      postal_code = excluded.postal_code,
      updated_at = now();

  insert into public.analytics_connections (
    business_id,
    allowed_hostname,
    status
  )
  values (
    target_business_id,
    nullif(lower(trim(website_hostname)), ''),
    case
      when nullif(trim(website_hostname), '') is null
        then 'disconnected'::public.connection_status
      else 'pending'::public.connection_status
    end
  )
  on conflict (business_id) do update
  set allowed_hostname = excluded.allowed_hostname,
      status = case
        when excluded.allowed_hostname is null
          then 'disconnected'::public.connection_status
        when public.analytics_connections.allowed_hostname is distinct from excluded.allowed_hostname
          then 'pending'::public.connection_status
        else public.analytics_connections.status
      end,
      last_event_at = case
        when public.analytics_connections.allowed_hostname is distinct from excluded.allowed_hostname
          then null
        else public.analytics_connections.last_event_at
      end,
      updated_at = now();

  return true;
end;
$$;

revoke all on function public.update_agency_business(
  uuid, text, text, text, text, text, text, text, text, text, text, text
) from public, anon;
grant execute on function public.update_agency_business(
  uuid, text, text, text, text, text, text, text, text, text, text, text
) to authenticated;

create or replace function public.set_agency_business_status(
  target_business_id uuid,
  requested_status public.business_status
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not (select private.current_user_is_platform_admin()) then
    raise exception 'Only a platform administrator can change business status.'
      using errcode = '42501';
  end if;

  if requested_status not in ('draft', 'active', 'suspended', 'archived') then
    return false;
  end if;

  update public.businesses
  set status = requested_status,
      updated_at = now()
  where id = target_business_id;

  if not found then
    return false;
  end if;

  if requested_status in ('suspended', 'archived') then
    update public.analytics_connections
    set status = 'disconnected',
        updated_at = now()
    where business_id = target_business_id;
  elsif requested_status = 'draft' then
    update public.analytics_connections
    set status = case
          when allowed_hostname is null then 'disconnected'::public.connection_status
          else 'pending'::public.connection_status
        end,
        updated_at = now()
    where business_id = target_business_id;
  end if;

  return true;
end;
$$;

revoke all on function public.set_agency_business_status(uuid, public.business_status)
from public, anon;
grant execute on function public.set_agency_business_status(uuid, public.business_status)
to authenticated;

create or replace function public.set_analytics_connection_enabled(
  target_business_id uuid,
  requested_enabled boolean
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not (select private.current_user_is_platform_admin()) then
    raise exception 'Only a platform administrator can change analytics connections.'
      using errcode = '42501';
  end if;

  update public.analytics_connections
  set status = case
        when requested_enabled and allowed_hostname is not null
          then 'pending'::public.connection_status
        else 'disconnected'::public.connection_status
      end,
      updated_at = now()
  where business_id = target_business_id
    and (not requested_enabled or allowed_hostname is not null);

  return found;
end;
$$;

revoke all on function public.set_analytics_connection_enabled(uuid, boolean)
from public, anon;
grant execute on function public.set_analytics_connection_enabled(uuid, boolean)
to authenticated;

create or replace function public.rotate_analytics_site_key(target_business_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  next_site_key uuid;
begin
  if not (select private.current_user_is_platform_admin()) then
    raise exception 'Only a platform administrator can rotate analytics keys.'
      using errcode = '42501';
  end if;

  update public.analytics_connections
  set site_key = gen_random_uuid(),
      status = case
        when allowed_hostname is null then 'disconnected'::public.connection_status
        else 'pending'::public.connection_status
      end,
      last_event_at = null,
      updated_at = now()
  where business_id = target_business_id
  returning site_key into next_site_key;

  return next_site_key;
end;
$$;

revoke all on function public.rotate_analytics_site_key(uuid) from public, anon;
grant execute on function public.rotate_analytics_site_key(uuid) to authenticated;

create or replace function private.assert_business_activation_ready()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status <> 'active' or (tg_op = 'UPDATE' and old.status = 'active') then
    return new;
  end if;

  if not exists (
    select 1
    from public.business_profiles as profile
    join public.analytics_connections as connection
      on connection.business_id = profile.business_id
    where profile.business_id = new.id
      and nullif(trim(profile.website_url), '') is not null
      and connection.allowed_hostname is not null
      and connection.status in ('pending', 'connected')
  ) then
    raise exception 'Connect the business website before activation.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

comment on function private.assert_business_activation_ready()
is 'Blocks activation until an external website and analytics hostname are configured; site-building approvals are intentionally outside Accelerator OS.';

create or replace function public.record_external_site_event(
  requested_site_key uuid,
  requested_origin_hostname text,
  requested_event_type text,
  requested_path text,
  requested_source text default null,
  requested_anonymous_session_hash text default null,
  requested_referrer_host text default null,
  requested_device_type text default null,
  requested_utm_source text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_business_id uuid;
  resolved_connection_id uuid;
begin
  if requested_event_type not in (
      'page_view',
      'phone_click',
      'directions_click',
      'contact_click',
      'estimate_request'
    )
    or requested_origin_hostname is null
    or requested_origin_hostname <> lower(requested_origin_hostname)
    or requested_origin_hostname !~ '^[a-z0-9.-]+$'
    or requested_path is null
    or requested_path !~ '^/'
    or char_length(requested_path) > 500
    or char_length(coalesce(requested_source, '')) > 120
    or (
      requested_anonymous_session_hash is not null
      and requested_anonymous_session_hash !~ '^[0-9a-f]{64}$'
    )
    or char_length(coalesce(requested_referrer_host, '')) > 253
    or (
      requested_referrer_host is not null
      and requested_referrer_host !~ '^[a-z0-9.-]+$'
    )
    or (
      requested_device_type is not null
      and requested_device_type not in ('mobile', 'tablet', 'desktop')
    )
    or char_length(coalesce(requested_utm_source, '')) > 120
  then
    return false;
  end if;

  select business.id, connection.id
  into resolved_business_id, resolved_connection_id
  from public.analytics_connections as connection
  join public.businesses as business on business.id = connection.business_id
  where connection.site_key = requested_site_key
    and connection.allowed_hostname = requested_origin_hostname
    and connection.status in ('pending', 'connected')
    and business.status in ('draft', 'active');

  if resolved_business_id is null then
    return false;
  end if;

  insert into public.site_events (
    business_id,
    event_type,
    anonymous_session_hash,
    source,
    utm_source,
    referrer_host,
    device_type,
    path
  )
  values (
    resolved_business_id,
    requested_event_type,
    nullif(trim(requested_anonymous_session_hash), ''),
    nullif(trim(requested_source), ''),
    nullif(lower(trim(requested_utm_source)), ''),
    nullif(lower(trim(requested_referrer_host)), ''),
    requested_device_type,
    requested_path
  );

  update public.analytics_connections
  set status = 'connected',
      last_event_at = now(),
      updated_at = now()
  where id = resolved_connection_id;

  return true;
end;
$$;

revoke all on function public.record_external_site_event(
  uuid, text, text, text, text, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.record_external_site_event(
  uuid, text, text, text, text, text, text, text, text
) to service_role;

comment on table public.analytics_connections
is 'One revocable, publishable analytics connection per business. Tenant resolution is bound to both its random site key and configured origin hostname.';

comment on function public.record_external_site_event(
  uuid, text, text, text, text, text, text, text, text
) is 'Server-only origin-bound recorder for allow-listed events from separately hosted business websites.';
