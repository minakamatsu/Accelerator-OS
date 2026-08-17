'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { useDeferredValue, useState } from 'react'
import {
  agencyStatusClasses,
  agencyStatusLabels,
} from '@/lib/agency-business/status-presentation'

type BusinessDirectoryItem = {
  id: string
  name: string
  status: 'draft' | 'active' | 'suspended' | 'archived'
}

function businessInitial(name: string): string {
  return (
    name
      .replace(/^\[demo\]\s*/i, '')
      .trim()
      .charAt(0)
      .toUpperCase() || 'B'
  )
}

export function NotificationBusinessDirectory({
  businesses,
  range,
}: {
  businesses: BusinessDirectoryItem[]
  range: string
}) {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase())
  const visibleBusinesses = deferredSearch
    ? businesses.filter((business) =>
        business.name.toLocaleLowerCase().includes(deferredSearch),
      )
    : businesses

  return (
    <div className="grid gap-5">
      <label
        className="grid max-w-2xl gap-2 text-sm font-black"
        htmlFor="business-search"
      >
        Search businesses
        <input
          autoComplete="off"
          className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--control)] px-4 text-base font-medium transition outline-none focus:border-[var(--brand)] focus:ring-3 focus:ring-[var(--brand-bright)]/35"
          id="business-search"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by business name"
          type="search"
          value={search}
        />
      </label>

      <p
        aria-live="polite"
        className="text-sm font-bold text-[var(--ink-muted)]"
      >
        Showing {visibleBusinesses.length} of {businesses.length} businesses
      </p>

      {visibleBusinesses.length ? (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleBusinesses.map((business) => (
            <li key={business.id}>
              <Link
                className="group flex h-full min-h-32 flex-col justify-between rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--paper-strong)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-[0_14px_34px_rgba(13,45,38,0.08)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--brand-bright)] motion-reduce:hover:translate-y-0"
                href={
                  `/admin/notifications/${business.id}?range=${range}` as Route
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sky-400/15 text-lg font-black text-sky-200 ring-1 ring-sky-400/30">
                    {businessInitial(business.name)}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${agencyStatusClasses[business.status]}`}
                  >
                    {agencyStatusLabels[business.status]}
                  </span>
                </div>
                <div className="mt-5">
                  <h3 className="text-lg font-black tracking-[-0.02em]">
                    {business.name}
                  </h3>
                  <p className="mt-2 text-sm font-black text-sky-200">
                    Open email analytics{' '}
                    <span
                      aria-hidden="true"
                      className="inline-block transition group-hover:translate-x-1 motion-reduce:transition-none"
                    >
                      →
                    </span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--line)] bg-[var(--paper-strong)] p-6">
          <p className="font-black">No businesses match that search.</p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Check the spelling or clear the search to see every business.
          </p>
        </div>
      )}
    </div>
  )
}
