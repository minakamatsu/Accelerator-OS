export function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const nationalNumber =
    digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits

  if (nationalNumber.length !== 10) return phone.trim()

  return `${nationalNumber.slice(0, 3)}-${nationalNumber.slice(3, 6)}-${nationalNumber.slice(6)}`
}
