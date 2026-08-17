import {
  weekDays,
  type BusinessHours,
  type HoursEntry,
  type WeekDay,
} from '@/lib/onboarding/types'

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/

export function emptyBusinessHours(): BusinessHours {
  return Object.fromEntries(weekDays.map((day) => [day, null])) as BusinessHours
}

export function normalizeBusinessHours(value: unknown): BusinessHours {
  const normalized = emptyBusinessHours()
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return normalized

  for (const day of weekDays) {
    const candidate = (value as Record<string, unknown>)[day]
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate))
      continue

    const open = (candidate as Record<string, unknown>).open
    const close = (candidate as Record<string, unknown>).close
    if (
      typeof open === 'string' &&
      typeof close === 'string' &&
      timePattern.test(open) &&
      timePattern.test(close)
    ) {
      normalized[day] = { open, close }
    }
  }

  return normalized
}

export function parseHoursForm(formData: FormData): BusinessHours {
  return Object.fromEntries(
    weekDays.map((day) => {
      if (formData.get(`${day}_closed`) === 'on') return [day, null]
      const open = String(formData.get(`${day}_open`) ?? '')
      const close = String(formData.get(`${day}_close`) ?? '')
      return [day, open && close ? { open, close } : null]
    }),
  ) as BusinessHours
}

export function validateBusinessHours(hours: BusinessHours): string | null {
  const openDays = Object.values(hours).filter(
    (entry): entry is Exclude<HoursEntry, null> => entry !== null,
  )
  if (openDays.length === 0) return null

  for (const [day, entry] of Object.entries(hours) as [WeekDay, HoursEntry][]) {
    if (!entry) continue
    if (!timePattern.test(entry.open) || !timePattern.test(entry.close)) {
      return `Enter valid opening and closing times for ${day}.`
    }
    if (entry.open >= entry.close) {
      return `${day[0].toUpperCase()}${day.slice(1)} closing time must be later than opening time.`
    }
  }

  return null
}
