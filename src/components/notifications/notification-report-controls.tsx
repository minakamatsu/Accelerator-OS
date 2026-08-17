'use client'

import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'

function businessReportUrl(
  businessId: string,
  values: Record<string, string>,
): Route {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    if (value.trim()) params.set(key, value.trim())
  }
  const query = params.toString()
  return `/admin/notifications/${businessId}${query ? `?${query}` : ''}#delivery-log` as Route
}

export function NotificationLogFilters({
  businessId,
  range,
  customerName,
  date,
}: {
  businessId: string
  range: string
  customerName?: string
  date?: string
}) {
  const router = useRouter()

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    router.push(
      businessReportUrl(businessId, {
        range,
        q: String(form.get('q') ?? ''),
        date: String(form.get('date') ?? ''),
      }),
      { scroll: false },
    )
  }

  function clearFilters() {
    router.push(businessReportUrl(businessId, { range }), { scroll: false })
  }

  return (
    <form
      className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,0.55fr)_auto_auto] lg:items-end"
      onSubmit={applyFilters}
    >
      <label className="grid gap-2 text-sm font-black" htmlFor="customer-name">
        Customer name
        <input
          className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--control)] px-4 text-base font-medium transition outline-none focus:border-[var(--brand)] focus:ring-3 focus:ring-[var(--brand-bright)]/35"
          defaultValue={customerName}
          id="customer-name"
          name="q"
          placeholder="Search a customer"
          type="search"
        />
      </label>
      <label
        className="grid gap-2 text-sm font-black"
        htmlFor="notification-date"
      >
        Exact submitted date
        <input
          className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--control)] px-4 text-base font-medium transition outline-none focus:border-[var(--brand)] focus:ring-3 focus:ring-[var(--brand-bright)]/35"
          defaultValue={date}
          id="notification-date"
          name="date"
          type="date"
        />
      </label>
      <button
        className="min-h-12 rounded-xl bg-[var(--action)] px-6 py-3 text-sm font-black text-[var(--action-text)] transition hover:bg-[var(--action-hover)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--brand-bright)]"
        type="submit"
      >
        Search log
      </button>
      <button
        className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--control)] px-5 py-3 text-sm font-black transition hover:border-[var(--brand)] hover:bg-[var(--control-hover)]"
        onClick={clearFilters}
        type="button"
      >
        Clear filters
      </button>
    </form>
  )
}
