'use server'

import { createAdminClient } from '@/lib/supabase/server'

const BUCKET = 'template-samples'

/**
 * テンプレートサンプル画像用の署名付きアップロード URL を発行する。
 * admin 専用（サービスロールキー使用）。
 * クライアントはこの URL に直接 PUT してアップロードするため、
 * base64 データがサーバーアクションの body を通過しない。
 */
export async function createSampleImageUploadUrl(
  path: string,
): Promise<{ signedUrl: string; token: string; path: string } | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path)

  if (error || !data) return null
  return data
}

/**
 * template-samples バケット内のパスから公開 URL を返す。
 */
export async function getTemplateSamplePublicUrl(path: string): Promise<string> {
  const supabase = createAdminClient()
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
