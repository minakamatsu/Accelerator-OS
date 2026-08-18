import Link from 'next/link'
import { BrandMark } from '@/components/brand-mark'

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="w-full max-w-xl rounded-[2rem] border border-[var(--line)] bg-[var(--paper-strong)] p-8 shadow-[var(--shadow-soft)] sm:p-12">
        <BrandMark />
        <p className="mt-16 text-sm font-black tracking-[0.14em] text-[var(--brand-bright)] uppercase">
          Not found
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.045em]">
          This workspace address is not available.
        </h1>
        <p className="mt-4 leading-7 text-[var(--ink-muted)]">
          The link may be incorrect, or the business may not be active yet.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-[var(--action)] px-5 py-3 text-sm font-black text-[var(--action-text)] hover:bg-[var(--action-hover)]"
        >
          Return home
        </Link>
      </section>
    </main>
  )
}
