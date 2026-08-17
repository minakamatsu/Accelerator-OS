-- Material onboarding edits invalidate stale approvals and fail closed to draft.

create or replace function private.invalidate_business_identity_approvals()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.name is distinct from old.name
    or new.slug is distinct from old.slug
    or new.category is distinct from old.category
    or new.timezone is distinct from old.timezone
  then
    new.facts_approved_at := null;
    new.design_approved_at := null;
    if new.status = 'active' then
      new.status := 'draft';
    end if;
  end if;
  return new;
end;
$$;

create trigger invalidate_identity_approvals
before update on public.businesses
for each row execute function private.invalidate_business_identity_approvals();

create or replace function private.invalidate_onboarding_approval()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  tenant_id uuid;
begin
  tenant_id := coalesce(
    nullif(to_jsonb(new) ->> 'business_id', '')::uuid,
    nullif(to_jsonb(old) ->> 'business_id', '')::uuid
  );

  if tg_argv[0] = 'facts' then
    update public.businesses
    set facts_approved_at = null,
        design_approved_at = null,
        status = case when status = 'active' then 'draft'::public.business_status else status end
    where id = tenant_id
      and (facts_approved_at is not null or design_approved_at is not null or status = 'active');
  else
    update public.businesses
    set design_approved_at = null,
        status = case when status = 'active' then 'draft'::public.business_status else status end
    where id = tenant_id
      and (design_approved_at is not null or status = 'active');
  end if;

  return coalesce(new, old);
end;
$$;

create trigger invalidate_profile_approval
after insert or update or delete on public.business_profiles
for each row execute function private.invalidate_onboarding_approval('facts');

create trigger invalidate_service_approval
after insert or update or delete on public.services
for each row execute function private.invalidate_onboarding_approval('facts');

create trigger invalidate_brand_approval
after insert or update or delete on public.brand_settings
for each row execute function private.invalidate_onboarding_approval('design');

create trigger invalidate_asset_approval
after insert or update or delete on public.business_assets
for each row execute function private.invalidate_onboarding_approval('design');

create or replace function private.demote_business_without_recipient()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.notification_recipients
    where business_id = old.business_id
  ) then
    update public.businesses
    set status = 'draft'
    where id = old.business_id and status = 'active';
  end if;
  return old;
end;
$$;

create trigger demote_after_last_recipient
after delete on public.notification_recipients
for each row execute function private.demote_business_without_recipient();
