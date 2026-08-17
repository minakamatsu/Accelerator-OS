import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('analytics-only client experience', () => {
  it('does not expose request stages or records in client navigation', () => {
    const navigation = readFileSync(
      resolve(process.cwd(), 'src/lib/auth/platform-navigation.ts'),
      'utf8',
    )

    expect(navigation).not.toContain('Website requests')
    expect(navigation).not.toContain('/leads')
  })
})
