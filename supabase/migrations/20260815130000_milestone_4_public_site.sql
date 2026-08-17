-- Narrow, fail-closed public-site access for active, approved businesses.

create or replace function private.normalize_public_hostname(requested_hostname text)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(
    regexp_replace(
      split_part(lower(trim(coalesce(requested_hostname, ''))), ':', 1),
      '\.$',
      ''
    ),
    ''
  );
$$;

create or replace function public.resolve_public_site_slug(requested_hostname text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select business.slug
  from public.business_domains as domain
  join public.businesses as business on business.id = domain.business_id
  where domain.hostname = private.normalize_public_hostname(requested_hostname)
    and domain.status = 'verified'
    and domain.verified_at is not null
    and business.status = 'active'
    and business.facts_approved_at is not null
    and business.design_approved_at is not null
  order by domain.is_primary desc, domain.created_at asc
  limit 1;
$$;

create or replace function public.get_public_site(requested_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'slug', business.slug,
    'name', business.name,
    'category', business.category,
    'timezone', business.timezone,
    'profile', jsonb_build_object(
      'publicPhone', profile.public_phone,
      'publicEmail', profile.public_email,
      'addressLine1', profile.address_line_1,
      'addressLine2', profile.address_line_2,
      'city', profile.city,
      'region', profile.region,
      'postalCode', profile.postal_code,
      'countryCode', profile.country_code,
      'serviceArea', profile.service_area,
      'hours', profile.hours,
      'mapUrl', profile.map_url,
      'primaryCta', profile.primary_cta,
      'valueProposition', profile.value_proposition,
      'approvedOffer', profile.approved_offer,
      'tone', profile.tone,
      'locale', profile.locale
    ),
    'brand', jsonb_build_object(
      'colorDirection', brand.color_direction,
      'typographyDirection', brand.typography_direction,
      'shapePreferences', brand.shape_preferences,
      'motionPreferences', brand.motion_preferences,
      'logoTreatment', brand.logo_treatment,
      'signatureFeature', brand.signature_feature
    ),
    'services', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'slug', service.slug,
          'name', service.name,
          'shortDescription', service.short_description,
          'isFeatured', service.is_featured
        )
        order by service.display_order, service.name
      )
      from public.services as service
      where service.business_id = business.id
        and service.is_active
    ), '[]'::jsonb),
    'primaryHostname', (
      select domain.hostname
      from public.business_domains as domain
      where domain.business_id = business.id
        and domain.status = 'verified'
        and domain.verified_at is not null
      order by domain.is_primary desc, domain.created_at asc
      limit 1
    )
  )
  from public.businesses as business
  join public.business_profiles as profile on profile.business_id = business.id
  join public.brand_settings as brand on brand.business_id = business.id
  where business.slug = requested_slug
    and business.status = 'active'
    and business.facts_approved_at is not null
    and business.design_approved_at is not null
    and exists (
      select 1
      from public.services as service
      where service.business_id = business.id
        and service.is_active
    );
$$;

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
  if requested_event_type <> 'phone_click'
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

revoke all on function public.resolve_public_site_slug(text) from public;
revoke all on function public.get_public_site(text) from public;
revoke all on function public.record_public_site_event(text, text, text, text) from public;

grant execute on function public.resolve_public_site_slug(text) to anon, authenticated;
grant execute on function public.get_public_site(text) to anon, authenticated;
grant execute on function public.record_public_site_event(text, text, text, text) to service_role;

comment on function public.resolve_public_site_slug(text)
is 'Returns only the slug for an active approved business on a verified hostname.';
comment on function public.get_public_site(text)
is 'Returns an allow-listed public content snapshot; internal identifiers and onboarding notes are excluded.';
comment on function public.record_public_site_event(text, text, text, text)
is 'Server-only event recorder that derives tenant context from an active slug lookup and accepts only allow-listed event types.';
