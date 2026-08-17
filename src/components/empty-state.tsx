type EmptyStateProps = {
  eyebrow: string
  title: string
  description: string
}

export function EmptyState({ eyebrow, title, description }: EmptyStateProps) {
  return (
    <section className="surface-grid min-h-80 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--paper-strong)] p-7 sm:p-10">
      <div className="flex h-full max-w-xl flex-col justify-between gap-20">
        <p className="text-xs font-black tracking-[0.16em] text-[var(--brand-bright)] uppercase">
          {eyebrow}
        </p>
        <div>
          <h2 className="text-3xl font-black tracking-[-0.04em]">{title}</h2>
          <p className="mt-4 leading-7 text-[var(--ink-muted)]">
            {description}
          </p>
        </div>
      </div>
    </section>
  )
}
