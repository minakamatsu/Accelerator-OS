'use client'

export default function WebsiteLeadReportError({
  reset,
}: {
  reset: () => void
}) {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center">
      <section className="rounded-[2rem] border border-[var(--line)] bg-[var(--paper-strong)] p-8 text-center shadow-sm sm:p-12">
        <p className="text-xs font-black tracking-[0.14em] text-[var(--brand-bright)] uppercase">
          Lead report unavailable
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.05em]">
          Website leads did not load.
        </h1>
        <p className="mt-4 leading-7 text-[var(--ink-muted)]">
          Nothing was changed. Retry this secure business report.
        </p>
        <button
          className="mt-7 rounded-full bg-[var(--action)] px-6 py-3 font-black text-[var(--action-text)] hover:bg-[var(--action-hover)]"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </section>
    </div>
  )
}
