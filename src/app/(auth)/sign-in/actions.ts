'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { safeNextPath } from '@/lib/auth/safe-next-path'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'

const signInSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.').max(1024),
  next: z.string().optional(),
})

export type SignInState = {
  message: string | null
  errors?: {
    email?: string[]
    password?: string[]
  }
}

export async function signIn(
  _previousState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  if (!isSupabaseConfigured()) {
    return { message: 'Authentication is not configured in this environment.' }
  }

  const validated = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    next: formData.get('next') || undefined,
  })

  if (!validated.success) {
    return {
      message: 'Check the highlighted fields.',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  })

  if (error) {
    return { message: 'The email or password was not accepted.' }
  }

  redirect(safeNextPath(validated.data.next, '/portal'))
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  redirect('/sign-in')
}
