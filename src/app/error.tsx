'use client'

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="w-full max-w-xl rounded-[2rem] border border-[var(--line)] bg-[var(--paper-strong)] p-8 shadow-[var(--shadow-soft)] sm:p-12">
        <p className="text-sm font-black tracking-[0.14em] text-[var(--warning)] uppercase">
          Workspace error
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.045em]">
          Something interrupted this view.
        </h1>
        <p className="mt-4 leading-7 text-[var(--ink-muted)]">
          No changes were reported as complete. Try loading the view again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-black text-white"
        >
          Try again
        </button>
      </section>
    </main>
  )
}
