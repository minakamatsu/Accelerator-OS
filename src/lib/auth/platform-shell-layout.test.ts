import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('platform shell layout', () => {
  it('keeps the brand on one line and the collapsed toggle inside the rail', () => {
    const brandSource = readFileSync(
      resolve(process.cwd(), 'src/components/brand-mark.tsx'),
      'utf8',
    )
    const shellSource = readFileSync(
      resolve(process.cwd(), 'src/components/platform-shell-client.tsx'),
      'utf8',
    )

    expect(brandSource).toContain('whitespace-nowrap')
    expect(shellSource).toContain('lg:grid-cols-[5rem_minmax(0,1fr)]')
    expect(shellSource).not.toMatch(/lg:-right-/)
  })

  it('scopes the dark visual system to agency access instead of route names', () => {
    const serverShellSource = readFileSync(
      resolve(process.cwd(), 'src/components/platform-shell.tsx'),
      'utf8',
    )
    const clientShellSource = readFileSync(
      resolve(process.cwd(), 'src/components/platform-shell-client.tsx'),
      'utf8',
    )
    const stylesSource = readFileSync(
      resolve(process.cwd(), 'src/app/globals.css'),
      'utf8',
    )

    expect(serverShellSource).toContain(
      "theme={accessLevel === 'member' ? 'client' : 'agency'}",
    )
    expect(clientShellSource).toContain('data-platform-theme={theme}')
    expect(stylesSource).toContain("[data-platform-theme='agency']")
    expect(stylesSource).not.toContain("[href^='/admin']")
  })

  it('keeps agency form values readable and the add-business action compact', () => {
    const stylesSource = readFileSync(
      resolve(process.cwd(), 'src/app/globals.css'),
      'utf8',
    )
    const adminPageSource = readFileSync(
      resolve(process.cwd(), 'src/app/(platform)/admin/page.tsx'),
      'utf8',
    )

    expect(stylesSource).toContain("[data-platform-theme='agency']")
    expect(stylesSource).toContain('background-color: var(--control)')
    expect(stylesSource).toContain('-webkit-text-fill-color: var(--ink)')
    expect(stylesSource).toContain('input:-webkit-autofill')
    expect(adminPageSource).toContain('whitespace-nowrap')
    expect(adminPageSource).toContain('Add business')
  })
})
