-- Platform administrators must complete a second authentication factor before
-- tenant-wide administrator privileges are recognized by database policies.
-- The profile remains readable by its owner so the application can route an
-- AAL1 administrator to the MFA enrollment/challenge screen.

create or replace function private.current_user_is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    exists (
      select 1
      from public.profiles as profile
      where profile.id = (select auth.uid())
        and profile.platform_role = 'admin'
        and (select auth.jwt() ->> 'aal') = 'aal2'
    ),
    false
  );
$$;

revoke all on function private.current_user_is_platform_admin() from public;
grant execute on function private.current_user_is_platform_admin() to authenticated;

comment on function private.current_user_is_platform_admin()
is 'Returns true only for a platform administrator whose current session has completed MFA (AAL2).';
