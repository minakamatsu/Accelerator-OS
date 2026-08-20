import type { ReactNode } from 'react'

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <main data-application-theme="dark" className="min-h-screen">
      {children}
    </main>
  )
}
