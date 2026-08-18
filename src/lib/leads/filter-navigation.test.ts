import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('website lead report routing', () => {
  it('renders the report route and retires individual workflow pages', () => {
    const layoutSource = readFileSync(
      resolve(
        process.cwd(),
        'src/app/(platform)/portal/businesses/[businessId]/leads/layout.tsx',
      ),
      'utf8',
    )

    expect(layoutSource).toContain('WebsiteLeadReportLayout')
    expect(layoutSource).not.toContain('redirect(')

    const detailSource = readFileSync(
      resolve(
        process.cwd(),
        'src/app/(platform)/portal/businesses/[businessId]/leads/[leadId]/page.tsx',
      ),
      'utf8',
    )
    expect(detailSource).toContain(
      'redirect(`/portal/businesses/${businessId}/leads` as Route)',
    )
  })
})
