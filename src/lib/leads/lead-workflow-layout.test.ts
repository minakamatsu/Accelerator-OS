import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('simple website lead reporting', () => {
  it('exposes lead reporting without restoring workflow stages', () => {
    const navigation = readFileSync(
      resolve(process.cwd(), 'src/lib/auth/platform-navigation.ts'),
      'utf8',
    )

    expect(navigation).toContain('Website leads')
    expect(navigation).toContain('/leads')
    expect(navigation).not.toContain('Estimate sent')
    expect(navigation).not.toContain('Won')
  })
})
