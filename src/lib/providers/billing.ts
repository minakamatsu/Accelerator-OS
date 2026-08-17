import 'server-only'

export type CheckoutRequest = {
  businessId: string
  planCode: string
  returnUrl: string
}

export type CheckoutResult =
  | { outcome: 'unavailable'; detail: string }
  | { outcome: 'created'; url: string; externalId: string }

export interface BillingProvider {
  readonly name: 'development' | 'square'
  createHostedCheckout(request: CheckoutRequest): Promise<CheckoutResult>
}

export const developmentBillingProvider: BillingProvider = {
  name: 'development',
  async createHostedCheckout() {
    return {
      outcome: 'unavailable',
      detail:
        'Development mode. No checkout was created and no payment was processed.',
    }
  },
}
