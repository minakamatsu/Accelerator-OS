import type { Route } from 'next'
import Link from 'next/link'

export function BrandMark({
  compact = false,
  href = '/',
  inverse = false,
}: {
  compact?: boolean
  href?: Route
  inverse?: boolean
}) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit shrink-0 items-center gap-3 whitespace-nowrap"
      aria-label="Accelerator OS home"
    >
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-[0.65rem] bg-[var(--signal)] text-sm font-black text-[var(--signal-ink)] shadow-[inset_0_0_0_1px_rgb(16_35_31/0.18)]"
      >
        A
      </span>
      <span
        className={`${compact ? 'lg:sr-only' : ''} ${
          inverse ? 'font-black text-white' : 'font-black text-[var(--ink)]'
        }`}
      >
        Accelerator OS
      </span>
    </Link>
  )
}
