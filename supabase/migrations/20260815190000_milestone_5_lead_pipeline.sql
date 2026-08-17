-- Tenant-safe public lead capture and authenticated pipeline mutations.

alter table public.leads
  add column submission_idempotency_key text,
  add column request_fingerprint_hash text;

-- Removing a service may clear only the optional service reference. The
-- tenant key must remain intact on the lead.
alter table public.leads
  drop constraint leads_business_service_fkey,
  add constraint leads_business_service_fkey foreign key (business_id, service_id)
    references public.services (business_id, id) on delete set null (service_id);

alter table public.leads
  add constraint leads_submission_idempotency_length check (
    submission_idempotency_key is null
    or char_length(submission_idempotency_key) between 16 and 200
  ),
  add constraint leads_request_fingerprint_length check (
    request_fingerprint_hash is null
    or char_length(request_fingerprint_hash) between 32 and 128
  );

create unique index leads_business_submission_idempotency_idx
  on public.leads (business_id, submission_idempotency_key)
  where submission_idempotency_key is not null;

create index leads_business_fingerprint_created_idx
  on public.leads (business_id, request_fingerprint_hash, created_at desc)
  where request_fingerprint_hash is not null;

create unique index message_deliveries_outbox_job_idx
  on public.message_deliveries (outbox_job_id);

-- The server-only delivery worker uses direct Data API reads and writes after
-- the capture RPC commits. Table privileges are still required even though
-- the service role bypasses tenant RLS.
grant select on public.businesses, public.leads, public.notification_recipients,
  public.outbox_jobs to service_role;
grant update on public.outbox_jobs to service_role;
grant select, insert, update on public.message_deliveries to service_role;

-- Active sites remain publishable while their exact service inventory is being
-- verified. The public snapshot returns an empty service array rather than
-- inventing services or hiding the entire site.
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
    and business.design_approved_at is not null;
$$;

create or replace function private.assert_business_activation_ready()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  missing_requirements text[] := '{}'::text[];
begin
  if new.status <> 'active' or (tg_op = 'UPDATE' and old.status = 'active') then
    return new;
  end if;

  if new.facts_approved_at is null then
    missing_requirements := array_append(missing_requirements, 'facts approval');
  end if;

  if new.design_approved_at is null then
    missing_requirements := array_append(missing_requirements, 'design approval');
  end if;

  if not exists (
    select 1
    from public.business_profiles as profile
    where profile.business_id = new.id
      and nullif(trim(profile.public_phone), '') is not null
      and nullif(trim(profile.address_line_1), '') is not null
      and nullif(trim(profile.city), '') is not null
      and nullif(trim(profile.region), '') is not null
      and nullif(trim(profile.postal_code), '') is not null
      and profile.hours <> '{}'::jsonb
      and nullif(trim(profile.primary_cta), '') is not null
      and nullif(trim(profile.value_proposition), '') is not null
      and nullif(trim(profile.tone), '') is not null
      and nullif(trim(profile.facts_source_notes), '') is not null
  ) then
    missing_requirements := array_append(missing_requirements, 'required verified facts');
  end if;

  if not exists (
    select 1
    from public.brand_settings as brand
    where brand.business_id = new.id
      and nullif(trim(brand.logo_treatment), '') is not null
      and brand.color_direction <> '{}'::jsonb
      and nullif(trim(brand.image_permission_notes), '') is not null
      and nullif(trim(brand.typography_direction), '') is not null
  ) then
    missing_requirements := array_append(missing_requirements, 'brand direction');
  end if;

  if not exists (
    select 1 from public.notification_recipients
    where business_id = new.id
  ) then
    missing_requirements := array_append(missing_requirements, 'notification recipient');
  end if;

  if cardinality(missing_requirements) > 0 then
    raise exception 'Business onboarding is incomplete: %', array_to_string(missing_requirements, ', ')
      using errcode = '23514';
  end if;

  return new;
end;
$$;

comment on function private.assert_business_activation_ready()
is 'Prevents activation until verified facts, brand direction, notification recipients, and approvals exist. A service inventory may remain unpublished until verified.';

create or replace function public.capture_public_lead(
  requested_slug text,
  requested_idempotency_key text,
  requested_fingerprint_hash text,
  requested_full_name text,
  requested_email text,
  requested_phone text,
  requested_service_slug text,
  requested_service_request text,
  requested_vehicle_year smallint,
  requested_vehicle_make text,
  requested_vehicle_model text,
  requested_message text,
  requested_source text,
  requested_utm_source text,
  requested_utm_medium text,
  requested_utm_campaign text,
  requested_consent_text text,
  requested_consent_version text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_business_id uuid;
  resolved_service_id uuid;
  resolved_service_name text;
  existing_lead_id uuid;
  created_lead_id uuid;
  recipient record;
begin
  if requested_slug is null
    or requested_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    or char_length(coalesce(requested_idempotency_key, '')) not between 16 and 200
    or char_length(coalesce(requested_fingerprint_hash, '')) not between 32 and 128
    or char_length(trim(coalesce(requested_full_name, ''))) not between 1 and 160
    or char_length(coalesce(requested_email, '')) > 320
    or char_length(coalesce(requested_phone, '')) > 40
    or char_length(trim(coalesce(requested_service_request, ''))) not between 3 and 2000
    or char_length(coalesce(requested_vehicle_make, '')) > 80
    or char_length(coalesce(requested_vehicle_model, '')) > 80
    or char_length(coalesce(requested_message, '')) > 5000
    or char_length(coalesce(requested_source, '')) > 120
    or char_length(coalesce(requested_utm_source, '')) > 200
    or char_length(coalesce(requested_utm_medium, '')) > 200
    or char_length(coalesce(requested_utm_campaign, '')) > 200
    or char_length(trim(coalesce(requested_consent_text, ''))) not between 10 and 2000
    or char_length(trim(coalesce(requested_consent_version, ''))) not between 1 and 120
    or (
      nullif(trim(coalesce(requested_email, '')), '') is null
      and nullif(trim(coalesce(requested_phone, '')), '') is null
    )
  then
    raise exception using errcode = '22023', message = 'invalid_lead_submission';
  end if;

  select business.id
  into resolved_business_id
  from public.businesses as business
  where business.slug = requested_slug
    and business.status = 'active'
    and business.facts_approved_at is not null
    and business.design_approved_at is not null;

  if resolved_business_id is null then
    return jsonb_build_object('accepted', false, 'duplicate', false);
  end if;

  select lead.id
  into existing_lead_id
  from public.leads as lead
  where lead.business_id = resolved_business_id
    and lead.submission_idempotency_key = requested_idempotency_key;

  if existing_lead_id is not null then
    return jsonb_build_object(
      'accepted', true,
      'duplicate', true,
      'leadId', existing_lead_id
    );
  end if;

  if (
    select count(*)
    from public.leads as lead
    where lead.business_id = resolved_business_id
      and lead.request_fingerprint_hash = requested_fingerprint_hash
      and lead.created_at >= now() - interval '15 minutes'
  ) >= 5 then
    raise exception using errcode = 'P0001', message = 'lead_rate_limited';
  end if;

  if nullif(trim(coalesce(requested_service_slug, '')), '') is not null then
    select service.id, service.name
    into resolved_service_id, resolved_service_name
    from public.services as service
    where service.business_id = resolved_business_id
      and service.slug = requested_service_slug
      and service.is_active;

    if resolved_service_id is null then
      raise exception using errcode = '22023', message = 'invalid_service_selection';
    end if;
  end if;

  insert into public.leads (
    business_id,
    full_name,
    email,
    phone,
    service_id,
    service_request,
    vehicle_year,
    vehicle_make,
    vehicle_model,
    message,
    source,
    utm_source,
    utm_medium,
    utm_campaign,
    consent_text,
    consent_version,
    consented_at,
    submission_idempotency_key,
    request_fingerprint_hash
  )
  values (
    resolved_business_id,
    trim(requested_full_name),
    nullif(lower(trim(requested_email)), ''),
    nullif(trim(requested_phone), ''),
    resolved_service_id,
    trim(requested_service_request),
    requested_vehicle_year,
    nullif(trim(requested_vehicle_make), ''),
    nullif(trim(requested_vehicle_model), ''),
    nullif(trim(requested_message), ''),
    nullif(trim(requested_source), ''),
    nullif(trim(requested_utm_source), ''),
    nullif(trim(requested_utm_medium), ''),
    nullif(trim(requested_utm_campaign), ''),
    trim(requested_consent_text),
    trim(requested_consent_version),
    now(),
    requested_idempotency_key,
    requested_fingerprint_hash
  )
  returning id into created_lead_id;

  insert into public.lead_events (
    business_id,
    lead_id,
    event_type,
    actor_type,
    metadata
  )
  values (
    resolved_business_id,
    created_lead_id,
    'lead.created',
    'visitor',
    jsonb_strip_nulls(jsonb_build_object(
      'source', nullif(trim(requested_source), ''),
      'service', resolved_service_name
    ))
  );

  if nullif(trim(coalesce(requested_email, '')), '') is not null then
    insert into public.outbox_jobs (
      business_id,
      lead_id,
      kind,
      idempotency_key,
      payload
    )
    values (
      resolved_business_id,
      created_lead_id,
      'lead_confirmation',
      requested_idempotency_key || ':lead-confirmation',
      jsonb_build_object('recipientKind', 'lead')
    );
  end if;

  for recipient in
    select notification.id
    from public.notification_recipients as notification
    where notification.business_id = resolved_business_id
      and notification.recipient_type = 'email'
      and 'lead.created' = any(notification.enabled_event_kinds)
  loop
    insert into public.outbox_jobs (
      business_id,
      lead_id,
      kind,
      idempotency_key,
      payload
    )
    values (
      resolved_business_id,
      created_lead_id,
      'business_lead_notification',
      requested_idempotency_key || ':business:' || recipient.id::text,
      jsonb_build_object('recipientId', recipient.id)
    );
  end loop;

  return jsonb_build_object(
    'accepted', true,
    'duplicate', false,
    'leadId', created_lead_id
  );
exception
  when unique_violation then
    select lead.id
    into existing_lead_id
    from public.leads as lead
    where lead.business_id = resolved_business_id
      and lead.submission_idempotency_key = requested_idempotency_key;

    if existing_lead_id is not null then
      return jsonb_build_object(
        'accepted', true,
        'duplicate', true,
        'leadId', existing_lead_id
      );
    end if;
    raise;
end;
$$;

create or replace function public.set_lead_status(
  requested_business_id uuid,
  requested_lead_id uuid,
  requested_status public.lead_status,
  requested_loss_reason text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.has_business_role(
    requested_business_id,
    array[
      'owner'::public.business_member_role,
      'manager'::public.business_member_role,
      'staff'::public.business_member_role
    ]
  ) then
    raise exception using errcode = '42501', message = 'lead_access_denied';
  end if;

  if requested_status = 'lost'
    and char_length(trim(coalesce(requested_loss_reason, ''))) not between 1 and 500
  then
    raise exception using errcode = '22023', message = 'loss_reason_required';
  end if;

  update public.leads
  set status = requested_status,
      contacted_at = case
        when requested_status in ('contacted', 'estimate_sent', 'won', 'lost')
          then coalesce(contacted_at, now())
        else contacted_at
      end,
      won_at = case when requested_status = 'won' then now() else null end,
      lost_at = case when requested_status = 'lost' then now() else null end,
      loss_reason = case
        when requested_status = 'lost' then trim(requested_loss_reason)
        else null
      end
  where business_id = requested_business_id
    and id = requested_lead_id;

  if not found then
    return false;
  end if;

  insert into public.lead_events (
    business_id,
    lead_id,
    event_type,
    actor_type,
    actor_user_id,
    metadata
  )
  values (
    requested_business_id,
    requested_lead_id,
    'lead.status_changed',
    'user',
    auth.uid(),
    jsonb_build_object(
      'status', requested_status,
      'lossReasonRecorded', requested_status = 'lost'
    )
  );

  return true;
end;
$$;

create or replace function public.set_lead_values(
  requested_business_id uuid,
  requested_lead_id uuid,
  requested_estimated_value_minor bigint,
  requested_won_value_minor bigint
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.has_business_role(
    requested_business_id,
    array[
      'owner'::public.business_member_role,
      'manager'::public.business_member_role,
      'staff'::public.business_member_role
    ]
  ) then
    raise exception using errcode = '42501', message = 'lead_access_denied';
  end if;

  if coalesce(requested_estimated_value_minor, 0) < 0
    or coalesce(requested_won_value_minor, 0) < 0
  then
    raise exception using errcode = '22023', message = 'invalid_lead_value';
  end if;

  update public.leads
  set estimated_value_minor = requested_estimated_value_minor,
      won_value_minor = requested_won_value_minor
  where business_id = requested_business_id
    and id = requested_lead_id;

  if not found then
    return false;
  end if;

  insert into public.lead_events (
    business_id,
    lead_id,
    event_type,
    actor_type,
    actor_user_id,
    metadata
  )
  values (
    requested_business_id,
    requested_lead_id,
    'lead.value_changed',
    'user',
    auth.uid(),
    jsonb_build_object(
      'estimatedValueRecorded', requested_estimated_value_minor is not null,
      'wonValueRecorded', requested_won_value_minor is not null,
      'currency', 'USD'
    )
  );

  return true;
end;
$$;

create or replace function public.add_lead_note(
  requested_business_id uuid,
  requested_lead_id uuid,
  requested_body text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_note_id uuid;
begin
  if not private.has_business_role(
    requested_business_id,
    array[
      'owner'::public.business_member_role,
      'manager'::public.business_member_role,
      'staff'::public.business_member_role
    ]
  ) then
    raise exception using errcode = '42501', message = 'lead_access_denied';
  end if;

  if char_length(trim(coalesce(requested_body, ''))) not between 1 and 5000 then
    raise exception using errcode = '22023', message = 'invalid_note';
  end if;

  if not exists (
    select 1
    from public.leads as lead
    where lead.business_id = requested_business_id
      and lead.id = requested_lead_id
  ) then
    return null;
  end if;

  insert into public.lead_notes (
    business_id,
    lead_id,
    author_user_id,
    body
  )
  values (
    requested_business_id,
    requested_lead_id,
    auth.uid(),
    trim(requested_body)
  )
  returning id into created_note_id;

  insert into public.lead_events (
    business_id,
    lead_id,
    event_type,
    actor_type,
    actor_user_id,
    metadata
  )
  values (
    requested_business_id,
    requested_lead_id,
    'lead.note_added',
    'user',
    auth.uid(),
    '{}'::jsonb
  );

  return created_note_id;
end;
$$;

revoke all on function public.capture_public_lead(
  text, text, text, text, text, text, text, text, smallint, text, text,
  text, text, text, text, text, text, text
) from public;
revoke all on function public.set_lead_status(uuid, uuid, public.lead_status, text) from public;
revoke all on function public.set_lead_values(uuid, uuid, bigint, bigint) from public;
revoke all on function public.add_lead_note(uuid, uuid, text) from public;

grant execute on function public.capture_public_lead(
  text, text, text, text, text, text, text, text, smallint, text, text,
  text, text, text, text, text, text, text
) to service_role;
grant execute on function public.set_lead_status(uuid, uuid, public.lead_status, text) to authenticated;
grant execute on function public.set_lead_values(uuid, uuid, bigint, bigint) to authenticated;
grant execute on function public.add_lead_note(uuid, uuid, text) to authenticated;

comment on function public.capture_public_lead(
  text, text, text, text, text, text, text, text, smallint, text, text,
  text, text, text, text, text, text, text
) is 'Server-only idempotent lead capture. Resolves the tenant from an active slug and commits the lead, event, and initial outbox jobs atomically.';
comment on column public.leads.request_fingerprint_hash
is 'One-way request fingerprint used only for short-window abuse controls; raw IP addresses are not stored.';
