import type { NotificationReportCounts } from '@/lib/notifications/reporting'

export function NotificationAnalyticsSummary({
  counts,
  label,
}: {
  counts: NotificationReportCounts
  label: string
}) {
  const metrics = [
    {
      label: 'Notifications created',
      value: counts.total,
      help: 'Website requests that created an email job',
      tone: 'border-sky-400/30 bg-sky-400/8 before:bg-sky-400 text-sky-200',
    },
    {
      label: 'Processed',
      value: counts.processed,
      help: 'Handled by the configured email adapter',
      tone: 'border-emerald-400/30 bg-emerald-400/8 before:bg-emerald-400 text-emerald-200',
    },
    {
      label: 'Waiting',
      value: counts.waiting,
      help: 'Queued, retrying, or processing now',
      tone: 'border-amber-400/30 bg-amber-400/8 before:bg-amber-400 text-amber-200',
    },
    {
      label: 'Needs attention',
      value: counts.needsAttention,
      help: 'Stopped after automatic attempts',
      tone: 'border-rose-400/30 bg-rose-400/8 before:bg-rose-400 text-rose-200',
    },
  ]

  return (
    <div>
      <dl aria-label={label} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            className={`relative overflow-hidden rounded-[var(--radius-md)] border p-5 before:absolute before:inset-y-0 before:left-0 before:w-1 sm:p-6 ${metric.tone}`}
            key={metric.label}
          >
            <dt className="text-sm font-bold">{metric.label}</dt>
            <dd className="mt-3 text-3xl font-black tracking-[-0.04em] text-[var(--ink)] tabular-nums">
              {metric.value}
            </dd>
            <p className="mt-2 text-xs leading-5 text-[var(--ink-muted)]">
              {metric.help}
            </p>
          </div>
        ))}
      </dl>
      {counts.canceled ? (
        <p className="mt-3 text-sm text-[var(--ink-muted)]">
          {counts.canceled} notification
          {counts.canceled === 1 ? ' was' : 's were'}
          {' canceled safely and will not be sent.'}
        </p>
      ) : null}
    </div>
  )
}
