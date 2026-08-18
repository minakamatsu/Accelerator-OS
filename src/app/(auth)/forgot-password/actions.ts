'use server'

import { z } from 'zod'
import { serverEnv } from '@/lib/env/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
})

export type ForgotPasswordState = {
  status: 'idle' | 'success' | 'error'
  message: string | null
  errors?: { email?: string[] }
}

export async function requestPasswordReset(
  _previousState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  if (!isSupabaseConfigured()) {
    return {
      status: 'error',
      message: 'Password recovery is not connected in this environment.',
    }
  }

  const validated = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  })

  if (!validated.success) {
    return {
      status: 'error',
      message: 'Check the highlighted field.',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const redirectUrl = new URL('/auth/confirm', serverEnv.APP_URL)
  redirectUrl.searchParams.set('next', '/update-password')

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(validated.data.email, {
    redirectTo: redirectUrl.toString(),
  })

  return {
    status: 'success',
    message:
      'If an account uses that email, a secure reset link is on its way. Check the inbox and spam folder.',
  }
}
