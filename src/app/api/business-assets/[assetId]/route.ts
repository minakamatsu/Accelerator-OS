import { createClient } from '@/lib/supabase/server'
import {
  getProtectedAssetHeaders,
  protectedAssetCacheControl,
} from '@/lib/http/private-asset-headers'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ assetId: string }> },
) {
  const { assetId } = await params
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims()
  if (claimsError || typeof claimsData?.claims?.sub !== 'string') {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'Cache-Control': protectedAssetCacheControl },
    })
  }

  const { data: asset, error: assetError } = await supabase
    .from('business_assets')
    .select('storage_path')
    .eq('id', assetId)
    .maybeSingle()
  if (assetError || !asset)
    return new Response('Not found', {
      status: 404,
      headers: { 'Cache-Control': protectedAssetCacheControl },
    })

  const { data, error } = await supabase.storage
    .from('business-assets')
    .download(asset.storage_path)
  if (error || !data)
    return new Response('Not found', {
      status: 404,
      headers: { 'Cache-Control': protectedAssetCacheControl },
    })

  return new Response(data, {
    headers: getProtectedAssetHeaders(data.type),
  })
}
