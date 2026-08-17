import 'server-only'
import { cache } from 'react'
import { requireAuthenticatedUser } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'

export type AccessibleBusiness = {
  id: string
  slug: string
  name: string
  category: string
  status: 'draft' | 'active' | 'suspended' | 'archived'
}

export const listAccessibleBusinesses = cache(
  async (): Promise<AccessibleBusiness[]> => {
    const access = await requireAuthenticatedUser()

    if (access.mode === 'development') return []

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('businesses')
      .select('id, slug, name, category, status')
      .order('name')

    if (error) {
      throw new Error('Unable to load accessible businesses.')
    }

    return data
  },
)
