export const reportingTimezones = [
  { value: 'America/New_York', label: 'Eastern Time — New York' },
  { value: 'America/Detroit', label: 'Eastern Time — Detroit' },
  {
    value: 'America/Indiana/Indianapolis',
    label: 'Eastern Time — Indianapolis',
  },
  { value: 'America/Chicago', label: 'Central Time — Chicago' },
  { value: 'America/Winnipeg', label: 'Central Time — Winnipeg' },
  { value: 'America/Denver', label: 'Mountain Time — Denver' },
  { value: 'America/Boise', label: 'Mountain Time — Boise' },
  { value: 'America/Phoenix', label: 'Arizona — Phoenix (no daylight time)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time — Los Angeles' },
  { value: 'America/Vancouver', label: 'Pacific Time — Vancouver' },
  { value: 'America/Anchorage', label: 'Alaska Time — Anchorage' },
  { value: 'America/Juneau', label: 'Alaska Time — Juneau' },
  { value: 'America/Adak', label: 'Hawaii–Aleutian Time — Adak' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time — Honolulu' },
  { value: 'America/Puerto_Rico', label: 'Atlantic Time — Puerto Rico' },
  { value: 'America/Halifax', label: 'Atlantic Time — Halifax' },
  { value: 'America/St_Johns', label: 'Newfoundland Time — St. John’s' },
  { value: 'America/Toronto', label: 'Eastern Time — Toronto' },
  { value: 'America/Edmonton', label: 'Mountain Time — Edmonton' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
] as const

export const reportingTimezoneHint =
  'Start typing a city or choose from the list. Common choices include New York, Chicago, Denver, Phoenix, and Los Angeles.'
