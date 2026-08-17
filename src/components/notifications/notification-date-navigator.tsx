'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { NotificationCalendarDate } from '@/lib/notifications/reporting'

function datedReportHref({
  businessId,
  range,
  customerName,
  date,
}: {
  businessId: string
  range: string
  customerName?: string
  date?: string
}): Route {
  const params = new URLSearchParams({ range })
  if (customerName) params.set('q', customerName)
  if (date) params.set('date', date)
  return `/admin/notifications/${businessId}?${params.toString()}#delivery-log` as Route
}

export function NotificationDateNavigator({
  businessId,
  range,
  dates,
  selectedDate,
  customerName,
}: {
  businessId: string
  range: string
  dates: NotificationCalendarDate[]
  selectedDate?: string
  customerName?: string
}) {
  const scroller = useRef<HTMLDivElement>(null)
  const [canScrollNewer, setCanScrollNewer] = useState(false)
  const [canScrollOlder, setCanScrollOlder] = useState(false)

  const updateScrollControls = useCallback(() => {
    const element = scroller.current
    if (!element) return
    setCanScrollNewer(element.scrollLeft > 2)
    setCanScrollOlder(
      element.scrollLeft + element.clientWidth < element.scrollWidth - 2,
    )
  }, [])

  useEffect(() => {
    const element = scroller.current
    if (!element) return
    const selected = scroller.current?.querySelector<HTMLElement>(
      '[aria-current="date"]',
    )
    selected?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'nearest',
      inline: 'center',
    })
    updateScrollControls()
    element.addEventListener('scroll', updateScrollControls, { passive: true })
    window.addEventListener('resize', updateScrollControls, { passive: true })
    return () => {
      element.removeEventListener('scroll', updateScrollControls)
      window.removeEventListener('resize', updateScrollControls)
    }
  }, [range, selectedDate, updateScrollControls])

  function moveDates(direction: -1 | 1) {
    scroller.current?.scrollBy({
      left: direction * Math.max(220, scroller.current.clientWidth * 0.7),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black">Browse submitted dates</p>
          <p className="mt-1 text-xs leading-5 text-[var(--ink-muted)]">
            Swipe the dates or use the arrow buttons.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            aria-label="Scroll to newer dates"
            className="grid size-11 place-items-center rounded-full border border-[var(--line)] bg-[var(--control)] text-xl font-black transition hover:border-[var(--brand)] hover:bg-[var(--control-hover)] disabled:opacity-40"
            disabled={!canScrollNewer}
            onClick={() => moveDates(-1)}
            type="button"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            aria-label="Scroll to older dates"
            className="grid size-11 place-items-center rounded-full border border-[var(--line)] bg-[var(--control)] text-xl font-black transition hover:border-[var(--brand)] hover:bg-[var(--control-hover)] disabled:opacity-40"
            disabled={!canScrollOlder}
            onClick={() => moveDates(1)}
            type="button"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <div
        className="flex snap-x snap-mandatory [scrollbar-width:thin] gap-2 overflow-x-auto pb-2"
        ref={scroller}
      >
        <Link
          aria-current={!selectedDate ? 'date' : undefined}
          className={`min-h-12 shrink-0 snap-start rounded-xl border px-4 py-3 text-center text-sm font-black transition ${
            !selectedDate
              ? 'border-[var(--action)] bg-[var(--action)] text-[var(--action-text)]'
              : 'border-[var(--line)] bg-[var(--control)] hover:border-[var(--brand)] hover:bg-[var(--control-hover)]'
          }`}
          href={datedReportHref({ businessId, range, customerName })}
          scroll={false}
        >
          All dates
        </Link>
        {dates.map((date) => (
          <Link
            aria-current={selectedDate === date.value ? 'date' : undefined}
            aria-label={`Show notifications submitted ${date.accessibleLabel}`}
            className={`min-h-12 min-w-24 shrink-0 snap-start rounded-xl border px-4 py-2 text-center transition ${
              selectedDate === date.value
                ? 'border-[var(--action)] bg-[var(--action)] text-[var(--action-text)]'
                : 'border-[var(--line)] bg-[var(--control)] hover:border-[var(--brand)] hover:bg-[var(--control-hover)]'
            }`}
            href={datedReportHref({
              businessId,
              range,
              customerName,
              date: date.value,
            })}
            key={date.value}
            scroll={false}
          >
            <span className="block text-xs font-bold opacity-75">
              {date.weekdayLabel}
            </span>
            <span className="mt-0.5 block text-sm font-black">
              {date.dateLabel}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
