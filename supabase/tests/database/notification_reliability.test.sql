begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(19);

select ok(
  not has_function_privilege(
    'anon',
    'public.claim_business_notification_jobs(integer,uuid,uuid)',
    'execute'
  ),
  'anonymous callers cannot claim notification jobs'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.claim_business_notification_jobs(integer,uuid,uuid)',
    'execute'
  ),
  'authenticated clients cannot claim notification jobs'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.claim_business_notification_jobs(integer,uuid,uuid)',
    'execute'
  ),
  'the server-only worker can claim notification jobs'
);

select ok(
  not has_table_privilege('authenticated', 'public.outbox_jobs', 'select'),
  'client accounts cannot read internal notification jobs'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'public.message_deliveries',
    'select'
  ),
  'client accounts cannot read internal provider delivery records'
);

select is_empty(
  $$
    insert into public.outbox_jobs (
      id, business_id, lead_id, kind, idempotency_key
    ) values (
      '99999999-9999-4999-8999-999999999990',
      '11111111-1111-4111-8111-111111111111',
      '11111111-1111-4111-8111-111111119001',
      'lead_confirmation',
      'milestone-nine-customer-confirmation'
    ) returning id
  $$,
  'customer confirmation automation is not created'
);

insert into public.outbox_jobs (
  id, business_id, lead_id, kind, idempotency_key, payload
) values (
  '99999999-9999-4999-8999-999999999991',
  '11111111-1111-4111-8111-111111111111',
  '11111111-1111-4111-8111-111111119001',
  'business_lead_notification',
  'milestone-nine-business-notification',
  jsonb_build_object(
    'recipientId', (
      select id from public.notification_recipients
      where business_id = '11111111-1111-4111-8111-111111111111'
      limit 1
    )
  )
);

select results_eq(
  $$
    select kind from public.outbox_jobs
    where id = '99999999-9999-4999-8999-999999999991'
  $$,
  $$ values ('business_estimate_request_notification'::text) $$,
  'business jobs are normalized to the versioned estimate-request notification kind'
);

set local role service_role;

select results_eq(
  $$
    select id from public.claim_business_notification_jobs(
      1,
      null,
      '99999999-9999-4999-8999-999999999991'
    )
  $$,
  $$ values ('99999999-9999-4999-8999-999999999991'::uuid) $$,
  'a due job is atomically claimed'
);

select results_eq(
  $$
    select status::text, attempt_count, (lease_token is not null)
    from public.outbox_jobs
    where id = '99999999-9999-4999-8999-999999999991'
  $$,
  $$ values ('processing'::text, 1::integer, true) $$,
  'claiming creates a lease token and records the attempt'
);

select is_empty(
  $$
    select id from public.claim_business_notification_jobs(
      1,
      null,
      '99999999-9999-4999-8999-999999999991'
    )
  $$,
  'an overlapping worker cannot claim the active lease'
);

select results_eq(
  $$
    select public.fail_business_notification_job(
      '99999999-9999-4999-8999-999999999991',
      lease_token,
      'provider_request_failed'
    )
    from public.outbox_jobs
    where id = '99999999-9999-4999-8999-999999999991'
  $$,
  $$ values ('pending'::text) $$,
  'a transient first failure returns the job to pending'
);

select results_eq(
  $$
    select status::text, (run_after > now()), last_error_code
    from public.outbox_jobs
    where id = '99999999-9999-4999-8999-999999999991'
  $$,
  $$ values ('pending'::text, true, 'provider_request_failed'::text) $$,
  'the failed attempt receives a future retry time and safe error code'
);

update public.outbox_jobs
set run_after = now()
where id = '99999999-9999-4999-8999-999999999991';

select results_eq(
  $$
    select attempt_count from public.claim_business_notification_jobs(
      1,
      null,
      '99999999-9999-4999-8999-999999999991'
    )
  $$,
  $$ values (2::integer) $$,
  'the scheduled retry can be claimed as the second attempt'
);

update public.outbox_jobs
set lease_until = now() - interval '1 second'
where id = '99999999-9999-4999-8999-999999999991';

select results_eq(
  $$
    select attempt_count from public.claim_business_notification_jobs(
      1,
      null,
      '99999999-9999-4999-8999-999999999991'
    )
  $$,
  $$ values (3::integer) $$,
  'an expired lease is reclaimed safely'
);

select results_eq(
  $$
    select public.complete_business_notification_job(
      '99999999-9999-4999-8999-999999999991',
      lease_token,
      'development',
      '',
      'n***@example.com',
      'business_estimate_request',
      'v1',
      'captured'
    )
    from public.outbox_jobs
    where id = '99999999-9999-4999-8999-999999999991'
  $$,
  $$ values (true) $$,
  'the current lease completes the job and records its delivery atomically'
);

select results_eq(
  $$
    select job.status::text, delivery.status::text, delivery.template_version
    from public.outbox_jobs as job
    join public.message_deliveries as delivery on delivery.outbox_job_id = job.id
    where job.id = '99999999-9999-4999-8999-999999999991'
  $$,
  $$ values ('sent'::text, 'captured'::text, 'v1'::text) $$,
  'development capture is stored without being labeled as a sent email'
);

select results_eq(
  $$
    select count(*) from public.message_deliveries
    where outbox_job_id = '99999999-9999-4999-8999-999999999991'
  $$,
  $$ values (1::bigint) $$,
  'one job can have only one recorded delivery outcome'
);

reset role;

insert into public.outbox_jobs (
  id, business_id, lead_id, kind, idempotency_key, payload, attempt_count
) values (
  '99999999-9999-4999-8999-999999999992',
  '11111111-1111-4111-8111-111111111111',
  '11111111-1111-4111-8111-111111119001',
  'business_estimate_request_notification',
  'milestone-nine-terminal-failure',
  jsonb_build_object('recipientId', gen_random_uuid()),
  3
);

set local role service_role;

select results_eq(
  $$
    with claimed as (
      select * from public.claim_business_notification_jobs(
        1,
        null,
        '99999999-9999-4999-8999-999999999992'
      )
    )
    select public.fail_business_notification_job(
      id,
      lease_token,
      'provider_request_failed'
    ) from claimed
  $$,
  $$ values ('failed'::text) $$,
  'the fourth failed attempt stops in the terminal failure state'
);

select results_eq(
  $$
    select public.cancel_business_notification_job(
      '99999999-9999-4999-8999-999999999992',
      gen_random_uuid(),
      'notification_recipient_unavailable'
    )
  $$,
  $$ values (false) $$,
  'a stale lease token cannot change a terminal job'
);

select * from finish();
rollback;
