-- Hosted projects may grant new public-schema functions directly to anon and
-- authenticated through default privileges. These mutation functions are
-- invoked only by trusted server code using the service role.

revoke execute on function public.capture_public_lead(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  smallint,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) from anon, authenticated;

grant execute on function public.capture_public_lead(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  smallint,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) to service_role;

revoke execute on function public.record_public_site_event(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) from anon, authenticated;

grant execute on function public.record_public_site_event(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) to service_role;

-- This function is an internal event-trigger implementation installed by the
-- platform. It should never be reachable through PostgREST.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;
