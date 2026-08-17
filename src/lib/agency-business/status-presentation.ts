export type AgencyStatus = 'draft' | 'active' | 'suspended' | 'archived'

export const agencyStatusLabels: Record<AgencyStatus, string> = {
  draft: 'Inactive',
  active: 'Active',
  suspended: 'Paused',
  archived: 'Archived',
}

export const agencyStatusClasses: Record<AgencyStatus, string> = {
  active: 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200',
  draft: 'border-sky-400/35 bg-sky-400/10 text-sky-200',
  suspended: 'border-amber-400/35 bg-amber-400/10 text-amber-200',
  archived: 'border-violet-400/35 bg-violet-400/10 text-violet-200',
}

export const agencyStatusRowClasses: Record<AgencyStatus, string> = {
  active: 'border-l-3 border-l-emerald-400/70',
  draft: 'border-l-3 border-l-sky-400/70',
  suspended: 'border-l-3 border-l-amber-400/70',
  archived: 'border-l-3 border-l-violet-400/70',
}
