import type { ReactNode } from 'react'
import { PlatformShell } from '@/components/platform-shell'

export const dynamic = 'force-dynamic'

export default function PlatformLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <PlatformShell>{children}</PlatformShell>
}
