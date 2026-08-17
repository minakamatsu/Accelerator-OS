import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('retired client request workspace', () => {
  it('returns old request URLs to the authorized business dashboard', () => {
    const layoutSource = readFileSync(
      resolve(
        process.cwd(),
        'src/app/(platform)/portal/businesses/[businessId]/leads/layout.tsx',
      ),
      'utf8',
    )

    expect(layoutSource).toContain('RetiredRequestWorkspaceLayout')
    expect(layoutSource).toContain(
      'redirect(`/portal/businesses/${businessId}` as Route)',
    )
  })
})
