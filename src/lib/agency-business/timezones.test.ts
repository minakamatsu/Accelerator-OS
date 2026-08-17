import { describe, expect, it } from 'vitest'
import { reportingTimezones } from './timezones'

describe('reporting timezone choices', () => {
  it('contains the common US reporting zones', () => {
    expect(reportingTimezones.map((timezone) => timezone.value)).toEqual(
      expect.arrayContaining([
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Phoenix',
        'America/Los_Angeles',
        'America/Anchorage',
        'Pacific/Honolulu',
      ]),
    )
  })

  it('only offers values accepted by Intl reporting', () => {
    for (const timezone of reportingTimezones) {
      expect(() =>
        new Intl.DateTimeFormat('en-US', { timeZone: timezone.value }).format(),
      ).not.toThrow()
    }
  })
})
