const PLACEHOLDERS = ['pk_test_', 'sk_test_', 'whsec_', 'pk_live_', 'sk_live_']

function isReal(value?: string | null): boolean {
  const trimmed = value?.trim()
  if (!trimmed) return false
  if (PLACEHOLDERS.includes(trimmed)) return false
  if (trimmed.includes('TU_CLAVE') || trimmed.includes('REEMPLAZA')) return false
  return trimmed.length > 20
}

export const isStripeEnabled = (): boolean =>
  isReal(process.env.STRIPE_SECRET_KEY) && isReal(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export const isStripeClientEnabled = (): boolean =>
  isReal(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
