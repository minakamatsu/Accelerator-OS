import { readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

function readSourceTree(path: string): string {
  return readdirSync(path)
    .flatMap((entry) => {
      const entryPath = resolve(path, entry)
      return statSync(entryPath).isDirectory()
        ? readSourceTree(entryPath)
        : entryPath.endsWith('.tsx')
          ? readFileSync(entryPath, 'utf8')
          : ''
    })
    .join('\n')
}

function themeVariables(styles: string, selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const block = styles.match(
    new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\n\\}`),
  )?.[1]

  expect(block).toBeDefined()

  return Object.fromEntries(
    Array.from(block?.matchAll(/--([\w-]+):\s*(#[\da-f]{6});/gi) ?? []).map(
      ([, name, value]) => [name, value],
    ),
  )
}

function contrastRatio(foreground: string, background: string) {
  function luminance(hex: string) {
    const channels = hex
      .slice(1)
      .match(/.{2}/g)
      ?.map((channel) => Number.parseInt(channel, 16) / 255)
      .map((channel) =>
        channel <= 0.04045
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4,
      )

    if (!channels) throw new Error(`Invalid color: ${hex}`)
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
  }

  const foregroundLuminance = luminance(foreground)
  const backgroundLuminance = luminance(background)
  const lighter = Math.max(foregroundLuminance, backgroundLuminance)
  const darker = Math.min(foregroundLuminance, backgroundLuminance)
  return (lighter + 0.05) / (darker + 0.05)
}

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

  it('keeps semantic foregrounds readable on every platform theme surface', () => {
    const stylesSource = readFileSync(
      resolve(process.cwd(), 'src/app/globals.css'),
      'utf8',
    )
    const themes = [
      themeVariables(stylesSource, ':root'),
      themeVariables(stylesSource, "[data-platform-theme='agency']"),
    ]
    const pairs = [
      ['ink', 'paper'],
      ['ink', 'paper-strong'],
      ['ink', 'control'],
      ['ink-muted', 'surface-hover'],
      ['action-text', 'action'],
      ['nav-active-text', 'nav-active'],
      ['brand-bright', 'paper'],
    ] as const

    for (const theme of themes) {
      for (const [foreground, background] of pairs) {
        expect(
          contrastRatio(theme[foreground], theme[background]),
          `${foreground} on ${background}`,
        ).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  it('does not bypass platform theme colors with light-only surfaces', () => {
    const platformSource = readSourceTree(
      resolve(process.cwd(), 'src/app/(platform)'),
    )
    const onboardingSource = readSourceTree(
      resolve(process.cwd(), 'src/components/onboarding'),
    )
    const sharedPlatformSource = readFileSync(
      resolve(process.cwd(), 'src/components/business-roster.tsx'),
      'utf8',
    )
    const themedSource = [
      platformSource,
      onboardingSource,
      sharedPlatformSource,
    ].join('\n')

    expect(themedSource).not.toMatch(/bg-white(?:\b|\/)/)
    expect(themedSource).not.toMatch(
      /bg-\[#(?:fff|ffffff|faf9f4|edf4f0|e8ede8)\]/i,
    )
    expect(themedSource).not.toContain('bg-[var(--ink)]')
  })
})
