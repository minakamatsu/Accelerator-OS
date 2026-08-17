'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/(auth)/sign-in/actions'
import { BrandMark } from '@/components/brand-mark'
import {
  ChevronLeftIcon,
  GridIcon,
  HomeIcon,
  MenuIcon,
  SettingsIcon,
  SignOutIcon,
  UserIcon,
} from '@/components/icons'
import type { PlatformNavigationItem } from '@/lib/auth/platform-navigation'

const sidebarStorageKey = 'accelerator-os-sidebar-collapsed'

export function PlatformShellClient({
  children,
  homeHref,
  navigation,
  roleLabel,
  theme,
}: Readonly<{
  children: ReactNode
  homeHref: Route
  navigation: PlatformNavigationItem[]
  roleLabel: string
  theme: 'agency' | 'client'
}>) {
  const pathname = usePathname()
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSidebarCollapsed(
        window.localStorage.getItem(sidebarStorageKey) === 'true',
      )
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMobileNavigationOpen(false)
      setProfileMenuOpen(false)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [pathname])

  useEffect(() => {
    function closeMenus(event: KeyboardEvent | MouseEvent) {
      if (event instanceof KeyboardEvent && event.key === 'Escape') {
        setMobileNavigationOpen(false)
        setProfileMenuOpen(false)
        return
      }

      if (
        event instanceof MouseEvent &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', closeMenus)
    document.addEventListener('mousedown', closeMenus)

    return () => {
      document.removeEventListener('keydown', closeMenus)
      document.removeEventListener('mousedown', closeMenus)
    }
  }, [])

  function toggleSidebar() {
    const nextValue = !sidebarCollapsed
    setSidebarCollapsed(nextValue)
    window.localStorage.setItem(sidebarStorageKey, String(nextValue))
  }

  return (
    <div
      data-platform-theme={theme}
      className={`min-h-screen lg:grid lg:transition-[grid-template-columns] lg:duration-200 ${
        sidebarCollapsed
          ? 'lg:grid-cols-[5rem_minmax(0,1fr)]'
          : 'lg:grid-cols-[19rem_minmax(0,1fr)]'
      }`}
    >
      {mobileNavigationOpen ? (
        <button
          type="button"
          aria-label="Close workspace navigation"
          className="fixed inset-0 z-40 bg-[rgb(16_35_31/0.38)] backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileNavigationOpen(false)}
        />
      ) : null}

      <aside
        id="workspace-navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(19rem,calc(100vw-2.5rem))] flex-col overflow-x-hidden overflow-y-auto border-r border-[var(--line)] bg-[var(--paper-strong)] p-5 shadow-[var(--shadow-soft)] transition-[transform,visibility] duration-200 lg:visible lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0 lg:shadow-none ${
          sidebarCollapsed ? 'lg:px-4 lg:py-7' : 'lg:p-7'
        } ${
          mobileNavigationOpen
            ? 'visible translate-x-0'
            : 'invisible -translate-x-full'
        }`}
      >
        <div
          className={`flex items-center ${
            sidebarCollapsed
              ? 'lg:flex-col lg:justify-start lg:gap-3'
              : 'justify-between gap-4'
          }`}
        >
          <BrandMark href={homeHref} compact={sidebarCollapsed} />
          <button
            type="button"
            aria-label={
              sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
            }
            aria-pressed={sidebarCollapsed}
            className="hidden size-9 shrink-0 place-items-center rounded-xl border border-[var(--line)] text-[var(--ink-muted)] transition hover:border-[var(--ink-muted)] hover:text-[var(--ink)] lg:grid"
            onClick={toggleSidebar}
          >
            <ChevronLeftIcon
              className={`size-4 transition-transform ${
                sidebarCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
          <button
            type="button"
            aria-label="Close workspace navigation"
            className="ml-auto grid size-10 place-items-center rounded-xl border border-[var(--line)] text-[var(--ink-muted)] lg:hidden"
            onClick={() => setMobileNavigationOpen(false)}
          >
            <ChevronLeftIcon className="size-5" />
          </button>
        </div>

        <nav
          aria-label="Workspace"
          className={`mt-10 grid gap-1 ${
            sidebarCollapsed ? 'lg:mt-8' : 'lg:mt-12'
          }`}
        >
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (!item.exact && pathname.startsWith(`${item.href}/`))

            return (
              <Link
                key={item.href}
                href={item.href}
                title={sidebarCollapsed ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
                className={`inline-flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition-colors ${
                  sidebarCollapsed ? 'lg:justify-center' : ''
                } ${
                  isActive
                    ? 'bg-[var(--nav-active)] text-[var(--nav-active-text)]'
                    : 'text-[var(--ink-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]'
                }`}
              >
                <GridIcon className="size-4 shrink-0" />
                <span className={sidebarCollapsed ? 'lg:sr-only' : undefined}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        <div
          className={`mt-auto border-t border-[var(--line)] pt-6 ${
            sidebarCollapsed ? 'lg:hidden' : ''
          }`}
        >
          <p className="text-xs font-black tracking-[0.14em] text-[var(--brand-bright)] uppercase">
            Environment
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
            Development shell. No live providers connected.
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--line)] bg-[var(--header)] px-5 backdrop-blur-xl sm:px-8 lg:px-12">
          <button
            type="button"
            aria-label="Open workspace navigation"
            aria-controls="workspace-navigation"
            aria-expanded={mobileNavigationOpen}
            className="grid size-10 place-items-center rounded-xl border border-[var(--line)] bg-[var(--paper-strong)] text-[var(--ink)] lg:hidden"
            onClick={() => setMobileNavigationOpen(true)}
          >
            <MenuIcon className="size-5" />
          </button>

          <p className="hidden text-xs font-black tracking-[0.14em] text-[var(--ink-muted)] uppercase lg:block">
            {roleLabel}
          </p>

          <div ref={profileMenuRef} className="relative ml-auto">
            <button
              type="button"
              aria-label="Open profile menu"
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              className="grid size-11 place-items-center rounded-full border border-[var(--line)] bg-[var(--paper-strong)] text-[var(--ink)] shadow-[var(--shadow-control)] transition hover:border-[var(--brand-bright)] hover:bg-[var(--surface-hover)]"
              onClick={() => setProfileMenuOpen((isOpen) => !isOpen)}
            >
              <UserIcon className="size-5" />
            </button>

            {profileMenuOpen ? (
              <div
                role="menu"
                aria-label="Profile"
                className="absolute top-[calc(100%+0.75rem)] right-0 w-64 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper-strong)] p-2 shadow-[var(--shadow-soft)]"
              >
                <div className="border-b border-[var(--line)] px-3 py-3">
                  <p className="text-xs font-black tracking-[0.12em] text-[var(--brand-bright)] uppercase">
                    Signed in as
                  </p>
                  <p className="mt-1 text-sm font-bold">{roleLabel}</p>
                </div>
                <Link
                  href={homeHref}
                  role="menuitem"
                  className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[var(--ink-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
                >
                  <HomeIcon className="size-4" />
                  Home
                </Link>
                <Link
                  href={'/settings' as Route}
                  role="menuitem"
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[var(--ink-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
                >
                  <SettingsIcon className="size-4" />
                  Profile & settings
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    role="menuitem"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-[var(--ink-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
                  >
                    <SignOutIcon className="size-4" />
                    Sign out
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </header>

        <main className="p-5 sm:p-8 lg:p-12">{children}</main>
      </div>
    </div>
  )
}
