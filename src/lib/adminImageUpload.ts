'use server'

import { createAdminClient } from '@/lib/supabase/server'

/**
 * base64 データ URL を Supabase Storage にアップロードし public URL を返す。
 * admin 専用（サービスロールキー使用）。
 */
export async function uploadAdminBase64Image(
  base64DataUrl: string,
  slot: string,
): Promise<string | null> {
  const match = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return null
  const [, mimeType, data] = match
  const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg'
  const path = `admin-samples/${slot}-${Date.now()}.${ext}`
  const buffer = Buffer.from(data, 'base64')

  const supabase = createAdminClient()
  const { error } = await supabase.storage
    .from('card-images')
    .upload(path, buffer, { contentType: mimeType, upsert: true })

  if (error) return null

  const { data: urlData } = supabase.storage.from('card-images').getPublicUrl(path)
  return urlData.publicUrl
}
