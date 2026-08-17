alter table public.outbox_jobs
  add column lease_token uuid;

revoke select on public.outbox_jobs, public.message_deliveries from authenticated;
drop policy if exists outbox_jobs_select_managers on public.outbox_jobs;
drop policy if exists message_deliveries_select_managers on public.message_deliveries;

create or replace function private.normalize_estimate_request_notification_job()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Customer-facing automation is intentionally outside this milestone.
  if new.kind = 'lead_confirmation' then
    return null;
  end if;

  if new.kind = 'business_lead_notification' then
    new.kind := 'business_estimate_request_notification';
    new.payload := new.payload || jsonb_build_object(
      'templateKey', 'business_estimate_request',
      'templateVersion', 'v1'
    );
  end if;

  return new;
end;
$$;

revoke all on function private.normalize_estimate_request_notification_job() from public;

create trigger normalize_estimate_request_notification_job
before insert on public.outbox_jobs
for each row execute function private.normalize_estimate_request_notification_job();

update public.outbox_jobs
set status = 'canceled',
    lease_until = null,
    last_error_code = 'customer_automation_not_enabled'
where kind = 'lead_confirmation'
  and status in ('pending', 'processing', 'failed');

update public.outbox_jobs
set kind = 'business_estimate_request_notification',
    payload = payload || jsonb_build_object(
      'templateKey', 'business_estimate_request',
      'templateVersion', 'v1'
    )
where kind = 'business_lead_notification';

create or replace function public.claim_business_notification_jobs(
  requested_limit integer default 10,
  requested_lead_id uuid default null,
  requested_job_id uuid default null
)
returns table (
  id uuid,
  business_id uuid,
  lead_id uuid,
  payload jsonb,
  idempotency_key text,
  attempt_count integer,
  lease_token uuid
)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.outbox_jobs as expired
  set status = 'pending',
      lease_until = null,
      lease_token = null,
      last_error_code = 'worker_lease_expired'
  where expired.kind = 'business_estimate_request_notification'
    and expired.status = 'processing'
    and expired.lease_until <= now();

  return query
  with candidates as (
    select job.id
    from public.outbox_jobs as job
    where job.kind = 'business_estimate_request_notification'
      and job.status = 'pending'
      and job.run_after <= now()
      and job.attempt_count < 4
      and (requested_lead_id is null or job.lead_id = requested_lead_id)
      and (requested_job_id is null or job.id = requested_job_id)
    order by job.run_after, job.created_at
    for update skip locked
    limit least(greatest(coalesce(requested_limit, 10), 1), 25)
  ),
  claimed as (
    update public.outbox_jobs as job
    set status = 'processing',
        attempt_count = job.attempt_count + 1,
        lease_until = now() + interval '5 minutes',
        lease_token = gen_random_uuid(),
        last_error_code = null
    from candidates
    where job.id = candidates.id
    returning job.id, job.business_id, job.lead_id, job.payload,
      job.idempotency_key, job.attempt_count, job.lease_token
  )
  select claimed.id, claimed.business_id, claimed.lead_id, claimed.payload,
    claimed.idempotency_key, claimed.attempt_count, claimed.lease_token
  from claimed;
end;
$$;

create or replace function public.complete_business_notification_job(
  requested_job_id uuid,
  requested_lease_token uuid,
  requested_provider text,
  requested_provider_message_id text,
  requested_recipient_display text,
  requested_template_key text,
  requested_template_version text,
  requested_delivery_status public.delivery_status
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  completed_job record;
begin
  update public.outbox_jobs as job
  set status = 'sent',
      lease_until = null,
      lease_token = null,
      last_error_code = null
  where job.id = requested_job_id
    and job.status = 'processing'
    and job.lease_token = requested_lease_token
  returning job.business_id, job.lead_id into completed_job;

  if not found then
    return false;
  end if;

  insert into public.message_deliveries (
    business_id,
    lead_id,
    outbox_job_id,
    provider,
    provider_message_id,
    recipient_display,
    template_key,
    template_version,
    status
  )
  values (
    completed_job.business_id,
    completed_job.lead_id,
    requested_job_id,
    requested_provider,
    nullif(requested_provider_message_id, ''),
    requested_recipient_display,
    requested_template_key,
    requested_template_version,
    requested_delivery_status
  )
  on conflict (outbox_job_id) do nothing;

  return true;
end;
$$;

create or replace function public.fail_business_notification_job(
  requested_job_id uuid,
  requested_lease_token uuid,
  requested_error_code text
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  next_status public.job_status;
begin
  update public.outbox_jobs as job
  set status = case when job.attempt_count >= 4 then 'failed'::public.job_status
                    else 'pending'::public.job_status end,
      run_after = case job.attempt_count
        when 1 then now() + interval '1 minute'
        when 2 then now() + interval '5 minutes'
        else now() + interval '30 minutes'
      end,
      lease_until = null,
      lease_token = null,
      last_error_code = left(coalesce(requested_error_code, 'delivery_failed'), 120)
  where job.id = requested_job_id
    and job.status = 'processing'
    and job.lease_token = requested_lease_token
  returning job.status into next_status;

  return next_status::text;
end;
$$;

create or replace function public.cancel_business_notification_job(
  requested_job_id uuid,
  requested_lease_token uuid,
  requested_reason text
)
returns boolean
language sql
security invoker
set search_path = ''
as $$
  with canceled as (
    update public.outbox_jobs as job
    set status = 'canceled',
        lease_until = null,
        lease_token = null,
        last_error_code = left(coalesce(requested_reason, 'delivery_canceled'), 120)
    where job.id = requested_job_id
      and job.status = 'processing'
      and job.lease_token = requested_lease_token
    returning true
  )
  select coalesce((select true from canceled), false);
$$;

revoke all on function public.claim_business_notification_jobs(integer, uuid, uuid) from public;
revoke all on function public.complete_business_notification_job(uuid, uuid, text, text, text, text, text, public.delivery_status) from public;
revoke all on function public.fail_business_notification_job(uuid, uuid, text) from public;
revoke all on function public.cancel_business_notification_job(uuid, uuid, text) from public;

grant execute on function public.claim_business_notification_jobs(integer, uuid, uuid) to service_role;
grant execute on function public.complete_business_notification_job(uuid, uuid, text, text, text, text, text, public.delivery_status) to service_role;
grant execute on function public.fail_business_notification_job(uuid, uuid, text) to service_role;
grant execute on function public.cancel_business_notification_job(uuid, uuid, text) to service_role;

comment on function public.claim_business_notification_jobs(integer, uuid, uuid)
is 'Atomically leases due business estimate-request email jobs to a server-only worker.';
comment on column public.outbox_jobs.lease_token
is 'Unpredictable claim token required to complete, fail, or cancel the current worker lease.';
