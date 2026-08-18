begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(9);

select results_eq(
  $$
    select public::text || ':' || file_size_limit::text
    from storage.buckets
    where id = 'profile-avatars'
  $$,
  $$ values ('false:2097152'::text) $$,
  'the profile-avatar bucket is private and limited to two megabytes'
);

select ok(
  has_column_privilege('authenticated', 'public.profiles', 'display_name', 'update')
  and has_column_privilege('authenticated', 'public.profiles', 'avatar_path', 'update')
  and not has_column_privilege('authenticated', 'public.profiles', 'platform_role', 'update'),
  'users can change profile presentation but never their authorization role'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);

select results_eq(
  $$
    update public.profiles
    set display_name = 'Updated Owner',
        avatar_path = '00000000-0000-4000-8000-000000000002/avatar.webp'
    where id = '00000000-0000-4000-8000-000000000002'
    returning display_name || ':' || avatar_path
  $$,
  $$ values ('Updated Owner:00000000-0000-4000-8000-000000000002/avatar.webp'::text) $$,
  'a user can update their own display name and avatar path'
);

select is_empty(
  $$
    update public.profiles
    set display_name = 'Cross-user change'
    where id = '00000000-0000-4000-8000-000000000003'
    returning id
  $$,
  'a user cannot update another profile'
);

reset role;

select throws_ok(
  $$
    update public.profiles
    set avatar_path = '00000000-0000-4000-8000-000000000003/avatar.png'
    where id = '00000000-0000-4000-8000-000000000002'
  $$,
  '23514',
  'new row for relation "profiles" violates check constraint "profiles_avatar_path_owner"',
  'a profile cannot reference another user namespace'
);

select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'profile_avatars_select_own'
  ),
  'private profile pictures have an owner-scoped read policy'
);

select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'profile_avatars_insert_own'
  ),
  'private profile pictures have an owner-scoped insert policy'
);

select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'profile_avatars_update_own'
  ),
  'private profile pictures have an owner-scoped update policy'
);

select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'profile_avatars_delete_own'
  ),
  'private profile pictures have an owner-scoped delete policy'
);

select * from finish();
rollback;
