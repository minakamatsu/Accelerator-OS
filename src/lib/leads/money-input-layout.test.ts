import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('public estimate-request wording', () => {
  it('does not promise a client lead pipeline or an automatic estimate', () => {
    const form = readFileSync(
      resolve(process.cwd(), 'src/components/public-site/quote-form.tsx'),
      'utf8',
    )

    expect(form).not.toContain('lead pipeline')
    expect(form).toContain('No estimate is created automatically.')
  })
})
