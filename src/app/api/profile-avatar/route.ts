import { createClient } from '@/lib/supabase/server'
import {
  getProtectedAssetHeaders,
  protectedAssetCacheControl,
} from '@/lib/http/private-asset-headers'

export async function GET() {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims()
  const userId = claimsError ? null : claimsData?.claims?.sub

  if (typeof userId !== 'string') {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'Cache-Control': protectedAssetCacheControl },
    })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('avatar_path')
    .eq('id', userId)
    .single()

  if (profileError || !profile?.avatar_path) {
    return new Response('Not found', {
      status: 404,
      headers: { 'Cache-Control': protectedAssetCacheControl },
    })
  }

  const { data, error } = await supabase.storage
    .from('profile-avatars')
    .download(profile.avatar_path)

  if (error || !data) {
    return new Response('Not found', {
      status: 404,
      headers: { 'Cache-Control': protectedAssetCacheControl },
    })
  }

  return new Response(data, {
    headers: getProtectedAssetHeaders(data.type),
  })
}
