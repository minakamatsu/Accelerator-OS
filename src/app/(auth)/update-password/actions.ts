'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'

const strongPassword = z
  .string()
  .min(12, 'Use at least 12 characters.')
  .max(1024)
  .regex(/[a-z]/, 'Add a lowercase letter.')
  .regex(/[A-Z]/, 'Add an uppercase letter.')
  .regex(/[0-9]/, 'Add a number.')
  .regex(/[^A-Za-z0-9]/, 'Add a symbol.')

const updatePasswordSchema = z
  .object({
    password: strongPassword,
    confirmation: z.string(),
  })
  .refine((values) => values.password === values.confirmation, {
    path: ['confirmation'],
    message: 'The passwords do not match.',
  })

export type UpdatePasswordState = {
  message: string | null
  errors?: {
    password?: string[]
    confirmation?: string[]
  }
}

export async function updatePassword(
  _previousState: UpdatePasswordState,
  formData: FormData,
): Promise<UpdatePasswordState> {
  if (!isSupabaseConfigured()) {
    return {
      message: 'Password changes are not connected in this environment.',
    }
  }

  const validated = updatePasswordSchema.safeParse({
    password: formData.get('password'),
    confirmation: formData.get('confirmation'),
  })

  if (!validated.success) {
    return {
      message: 'Use a stronger password and make sure both entries match.',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return {
      message: 'This secure link is no longer valid. Request a new reset link.',
    }
  }

  const { error } = await supabase.auth.updateUser({
    password: validated.data.password,
  })

  if (error) {
    return {
      message:
        'The password could not be changed. Request a new reset link and try again.',
    }
  }

  await supabase.auth.signOut({ scope: 'global' })
  redirect('/sign-in?notice=password-updated')
}
