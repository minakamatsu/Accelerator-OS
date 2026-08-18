import type { Route } from 'next'

const internalOrigin = 'https://accelerator.invalid'

export function safeNextPath<TFallback extends Route>(
  value: string | null | undefined,
  fallback: TFallback,
): Route {
  if (!value || !value.startsWith('/') || value.includes('\\')) {
    return fallback
  }

  try {
    const resolved = new URL(value, internalOrigin)
    if (resolved.origin !== internalOrigin) return fallback

    return `${resolved.pathname}${resolved.search}${resolved.hash}` as Route
  } catch {
    return fallback
  }
}
