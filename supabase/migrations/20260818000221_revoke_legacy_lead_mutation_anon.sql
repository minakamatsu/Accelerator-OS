-- These legacy lead-workspace mutations are authenticated tools. Hosted
-- projects can grant new public-schema functions to anon through default
-- privileges, so revoke anon explicitly in addition to PUBLIC.

revoke execute on function public.set_lead_status(
  uuid,
  uuid,
  public.lead_status,
  text
) from anon;

revoke execute on function public.set_lead_values(
  uuid,
  uuid,
  bigint,
  bigint
) from anon;

revoke execute on function public.add_lead_note(
  uuid,
  uuid,
  text
) from anon;

grant execute on function public.set_lead_status(
  uuid,
  uuid,
  public.lead_status,
  text
) to authenticated;

grant execute on function public.set_lead_values(
  uuid,
  uuid,
  bigint,
  bigint
) to authenticated;

grant execute on function public.add_lead_note(
  uuid,
  uuid,
  text
) to authenticated;
