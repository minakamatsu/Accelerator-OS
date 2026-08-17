export const protectedAssetCacheControl = 'private, no-store, max-age=0'

export function getProtectedAssetHeaders(contentType: string) {
  return {
    'Cache-Control': protectedAssetCacheControl,
    'Content-Type': contentType || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  }
}
