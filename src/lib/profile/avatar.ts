export const maxAvatarBytes = 2 * 1024 * 1024

export type AvatarDetails = {
  extension: 'jpg' | 'png' | 'webp'
  contentType: 'image/jpeg' | 'image/png' | 'image/webp'
}

export function detectAvatar(
  bytes: Uint8Array,
  declaredType: string,
): AvatarDetails | null {
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  const png =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  const webp =
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'

  if (jpeg && declaredType === 'image/jpeg') {
    return { extension: 'jpg', contentType: 'image/jpeg' }
  }
  if (png && declaredType === 'image/png') {
    return { extension: 'png', contentType: 'image/png' }
  }
  if (webp && declaredType === 'image/webp') {
    return { extension: 'webp', contentType: 'image/webp' }
  }

  return null
}
