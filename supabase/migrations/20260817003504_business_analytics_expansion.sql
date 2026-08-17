-- Milestone 8: privacy-conscious business analytics expansion.

alter table public.site_events
  add column referrer_host text,
  add column device_type text,
  add constraint site_events_anonymous_hash_format check (
    anonymous_session_hash is null
    or anonymous_session_hash ~ '^[0-9a-f]{64}$'
  ),
  add constraint site_events_referrer_host_length check (
    char_length(coalesce(referrer_host, '')) <= 253
  ),
  add constraint site_events_device_type_check check (
    device_type is null or device_type in ('mobile', 'tablet', 'desktop')
  );

create index site_events_business_visitor_created_idx
  on public.site_events (business_id, anonymous_session_hash, created_at desc)
  where anonymous_session_hash is not null;

drop function if exists public.record_public_site_event(text, text, text, text);

create function public.record_public_site_event(
  requested_slug text,
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
begin
  if requested_event_type not in (
      'page_view',
      'phone_click',
      'directions_click',
      'contact_click',
      'estimate_request'
    )
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

  select business.id
  into resolved_business_id
  from public.businesses as business
  where business.slug = requested_slug
    and business.status = 'active'
    and business.facts_approved_at is not null
    and business.design_approved_at is not null;

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

  return true;
end;
$$;

revoke all on function public.record_public_site_event(
  text, text, text, text, text, text, text, text
) from public;
grant execute on function public.record_public_site_event(
  text, text, text, text, text, text, text, text
) to service_role;

comment on column public.site_events.anonymous_session_hash
is 'One-way business-scoped anonymous browser identifier used for aggregate visitor counts; no raw identifier or IP address is stored.';
comment on column public.site_events.referrer_host
is 'Normalized external referral hostname only; full referring URLs are not stored.';
comment on column public.site_events.device_type
is 'Mobile, tablet, or desktop category derived from viewport width at event time.';
comment on function public.record_public_site_event(
  text, text, text, text, text, text, text, text
) is 'Server-only tenant-derived recorder for allow-listed public page and high-intent analytics events.';
