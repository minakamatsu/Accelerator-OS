-- Milestone 3: guided onboarding fields, private assets, activation gates, and audit coverage.

alter table public.business_profiles
  add column website_url text,
  add column contact_preference text,
  add column facts_source_notes text;

alter table public.business_profiles
  add constraint business_profiles_phone_length
    check (public_phone is null or char_length(public_phone) <= 40),
  add constraint business_profiles_url_protocols
    check (
      (website_url is null or website_url ~ '^https://')
      and (map_url is null or map_url ~ '^https://')
      and (review_url is null or review_url ~ '^https://')
    ),
  add constraint business_profiles_contact_preference
    check (contact_preference is null or contact_preference in ('phone', 'email', 'either'));

alter table public.brand_settings
  add column logo_treatment text,
  add column signature_feature text,
  add column design_notes text;

create or replace function private.create_business_draft(
  business_name text,
  business_slug text,
  business_timezone text default 'America/New_York'
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  new_business_id uuid;
begin
  if not (select private.current_user_is_platform_admin()) then
    raise exception 'Only a platform administrator can create a business.'
      using errcode = '42501';
  end if;

  insert into public.businesses (name, slug, timezone, created_by)
  values (business_name, business_slug, business_timezone, (select auth.uid()))
  returning id into new_business_id;

  insert into public.business_profiles (business_id)
  values (new_business_id);

  insert into public.brand_settings (business_id)
  values (new_business_id);

  return new_business_id;
end;
$$;

revoke all on function private.create_business_draft(text, text, text) from public;
grant execute on function private.create_business_draft(text, text, text) to authenticated;

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
    select 1 from public.services
    where business_id = new.id and is_active
  ) then
    missing_requirements := array_append(missing_requirements, 'active service');
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

create trigger require_complete_onboarding_before_activation
before insert or update of status on public.businesses
for each row execute function private.assert_business_activation_ready();

create or replace function private.audit_onboarding_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  before_row jsonb := case when tg_op = 'INSERT' then '{}'::jsonb else to_jsonb(old) end;
  after_row jsonb := case when tg_op = 'DELETE' then '{}'::jsonb else to_jsonb(new) end;
  tenant_id uuid;
  target_id uuid;
  changed_fields jsonb;
begin
  tenant_id := coalesce(
    nullif(after_row ->> 'business_id', '')::uuid,
    nullif(before_row ->> 'business_id', '')::uuid,
    nullif(after_row ->> 'id', '')::uuid,
    nullif(before_row ->> 'id', '')::uuid
  );

  target_id := coalesce(
    nullif(after_row ->> 'id', '')::uuid,
    nullif(before_row ->> 'id', '')::uuid,
    tenant_id
  );

  select coalesce(jsonb_agg(field_name order by field_name), '[]'::jsonb)
  into changed_fields
  from (
    select field_name
    from jsonb_object_keys(before_row || after_row) as fields(field_name)
    where before_row -> field_name is distinct from after_row -> field_name
      and field_name not in ('created_at', 'updated_at')
  ) as changes;

  insert into public.audit_log (
    business_id,
    actor_type,
    actor_user_id,
    action,
    resource_type,
    resource_id,
    safe_before,
    safe_after
  )
  values (
    tenant_id,
    case when (select auth.uid()) is null then 'system'::public.actor_type else 'user'::public.actor_type end,
    (select auth.uid()),
    'onboarding.' || tg_table_name || '.' || lower(tg_op),
    tg_table_name,
    target_id,
    jsonb_build_object(
      'changed_fields', changed_fields,
      'status', before_row -> 'status',
      'facts_approved', coalesce(before_row ->> 'facts_approved_at', '') <> '',
      'design_approved', coalesce(before_row ->> 'design_approved_at', '') <> ''
    ),
    jsonb_build_object(
      'changed_fields', changed_fields,
      'status', after_row -> 'status',
      'facts_approved', coalesce(after_row ->> 'facts_approved_at', '') <> '',
      'design_approved', coalesce(after_row ->> 'design_approved_at', '') <> ''
    )
  );

  return coalesce(new, old);
end;
$$;

do $$
declare
  audited_table text;
begin
  foreach audited_table in array array[
    'businesses', 'business_profiles', 'brand_settings', 'services',
    'business_assets', 'notification_recipients'
  ]
  loop
    execute format(
      'create trigger audit_onboarding_change after insert or update or delete on public.%I '
      'for each row execute function private.audit_onboarding_change()',
      audited_table
    );
  end loop;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-assets',
  'business-assets',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy business_assets_storage_select
on storage.objects for select to authenticated
using (
  bucket_id = 'business-assets'
  and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/'
  and (select private.has_business_access(split_part(name, '/', 1)::uuid))
);

create policy business_assets_storage_insert
on storage.objects for insert to authenticated
with check (
  bucket_id = 'business-assets'
  and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/'
  and (select private.has_business_role(
    split_part(name, '/', 1)::uuid,
    array['owner'::public.business_member_role, 'manager'::public.business_member_role]
  ))
);

create policy business_assets_storage_update
on storage.objects for update to authenticated
using (
  bucket_id = 'business-assets'
  and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/'
  and (select private.has_business_role(
    split_part(name, '/', 1)::uuid,
    array['owner'::public.business_member_role, 'manager'::public.business_member_role]
  ))
)
with check (
  bucket_id = 'business-assets'
  and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/'
  and (select private.has_business_role(
    split_part(name, '/', 1)::uuid,
    array['owner'::public.business_member_role, 'manager'::public.business_member_role]
  ))
);

create policy business_assets_storage_delete
on storage.objects for delete to authenticated
using (
  bucket_id = 'business-assets'
  and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/'
  and (select private.has_business_role(
    split_part(name, '/', 1)::uuid,
    array['owner'::public.business_member_role, 'manager'::public.business_member_role]
  ))
);

comment on function private.create_business_draft(text, text, text)
is 'Creates the tenant root and one-to-one onboarding records atomically for a platform admin.';
comment on function private.assert_business_activation_ready()
is 'Database backstop preventing activation until required facts, design inputs, services, recipients, and approvals exist.';
