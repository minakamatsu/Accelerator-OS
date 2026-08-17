import { describe, expect, it } from 'vitest'
import { agencyStatusClasses, agencyStatusLabels } from './status-presentation'

describe('agency business status presentation', () => {
  it('keeps every business state labeled and visually distinct', () => {
    expect(agencyStatusLabels).toEqual({
      draft: 'Inactive',
      active: 'Active',
      suspended: 'Paused',
      archived: 'Archived',
    })
    expect(new Set(Object.values(agencyStatusClasses))).toHaveLength(4)
  })
})
