import 'server-only'
import { z } from 'zod'
import { serverEnv } from '@/lib/env/server'

export type EmailMessage = {
  to: string
  subject: string
  text: string
  idempotencyKey: string
}

export type EmailDeliveryResult =
  | { outcome: 'captured'; detail: string }
  | { outcome: 'sent'; providerMessageId: string }

export interface EmailProvider {
  readonly name: 'development' | 'resend'
  deliver(message: EmailMessage): Promise<EmailDeliveryResult>
}

export const developmentEmailProvider: EmailProvider = {
  name: 'development',
  async deliver() {
    return {
      outcome: 'captured',
      detail: 'Development capture only. No email was sent.',
    }
  },
}

const resendResponseSchema = z.object({ id: z.string().min(1) })

const resendEmailProvider: EmailProvider = {
  name: 'resend',
  async deliver(message) {
    if (!serverEnv.RESEND_API_KEY || !serverEnv.EMAIL_FROM) {
      throw new Error(
        'Resend is enabled but its server credentials are absent.',
      )
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serverEnv.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': message.idempotencyKey,
      },
      body: JSON.stringify({
        from: serverEnv.EMAIL_FROM,
        to: [message.to],
        subject: message.subject,
        text: message.text,
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Resend delivery failed with status ${response.status}.`)
    }

    const parsed = resendResponseSchema.safeParse(await response.json())
    if (!parsed.success) throw new Error('Resend returned an invalid response.')

    return { outcome: 'sent', providerMessageId: parsed.data.id }
  },
}

export function getEmailProvider(): EmailProvider {
  return serverEnv.EMAIL_PROVIDER === 'resend'
    ? resendEmailProvider
    : developmentEmailProvider
}
