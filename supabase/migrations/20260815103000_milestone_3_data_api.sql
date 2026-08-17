-- Expose the narrow transactional draft-creation operation through the Data API.

create or replace function public.create_business_draft(
  business_name text,
  business_slug text,
  business_timezone text default 'America/New_York'
)
returns uuid
language sql
set search_path = ''
as $$
  select private.create_business_draft(business_name, business_slug, business_timezone);
$$;

revoke all on function public.create_business_draft(text, text, text) from public, anon;
grant execute on function public.create_business_draft(text, text, text) to authenticated;

comment on function public.create_business_draft(text, text, text)
is 'Authenticated Data API wrapper for atomic platform-admin draft creation.';
