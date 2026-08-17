-- Milestone 6: one-business client identities and narrowly scoped public analytics.

create unique index business_memberships_single_business_user_idx
  on public.business_memberships (user_id);

create index site_events_business_type_created_idx
  on public.site_events (business_id, event_type, created_at desc);

create or replace function public.record_public_site_event(
  requested_slug text,
  requested_event_type text,
  requested_path text,
  requested_source text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_business_id uuid;
begin
  if requested_event_type not in ('phone_click', 'page_view')
    or requested_path is null
    or requested_path !~ '^/'
    or char_length(requested_path) > 500
    or char_length(coalesce(requested_source, '')) > 120
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
    source,
    path
  )
  values (
    resolved_business_id,
    requested_event_type,
    nullif(trim(requested_source), ''),
    requested_path
  );

  return true;
end;
$$;

revoke all on function public.record_public_site_event(text, text, text, text)
  from public;
grant execute on function public.record_public_site_event(text, text, text, text)
  to service_role;

comment on index business_memberships_single_business_user_idx
is 'MVP account rule: one authenticated client identity belongs to one business.';

comment on function public.record_public_site_event(text, text, text, text)
is 'Server-only recorder that derives tenant context from an active slug and accepts page views or phone-link clicks only.';
