import { createClient } from '@/lib/supabase/client'
import { createSampleImageUploadUrl, getTemplateSamplePublicUrl } from '@/lib/adminImageUpload'

const MAX_DIMENSION = 1200
const JPEG_QUALITY = 0.80
const BUCKET = 'template-samples'

/** base64 data URL を Canvas で圧縮して JPEG base64 に変換 */
async function compressBase64(base64DataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width >= height) { height = Math.round(height * MAX_DIMENSION / width); width = MAX_DIMENSION }
        else                 { width = Math.round(width * MAX_DIMENSION / height); height = MAX_DIMENSION }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
    }
    img.onerror = () => resolve(base64DataUrl)
    img.src = base64DataUrl
  })
}

/**
 * base64 data URL を template-samples バケットにアップロードし public URL を返す。
 * 署名付き URL をサーバーアクションで発行し、クライアントから直接 Storage に PUT する。
 * これにより base64 データがサーバーアクションの body size 制限に引っかからない。
 */
async function uploadSampleImage(base64DataUrl: string, slot: string): Promise<string | null> {
  const match = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return null
  const [, mimeType, data] = match
  const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg'
  const path = `${slot}-${Date.now()}.${ext}`

  const uploadInfo = await createSampleImageUploadUrl(path).catch(() => null)
  if (!uploadInfo) return null

  const buffer = Uint8Array.from(atob(data), c => c.charCodeAt(0))
  const supabase = createClient()
  const { error } = await supabase.storage
    .from(BUCKET)
    .uploadToSignedUrl(uploadInfo.path, uploadInfo.token, buffer, { contentType: mimeType })

  if (error) return null

  return getTemplateSamplePublicUrl(uploadInfo.path).catch(() => null)
}

/**
 * サンプルカードデータ保存前の前処理。
 * base64 画像を圧縮して Storage にアップロードし URL に変換する。
 * アップロード失敗時は null に置換して続行する。
 */
export async function compressSampleData(
  values: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  return (await replaceBase64WithUrl(values, 'sample')) as Record<string, unknown>
}

let counter = 0

async function replaceBase64WithUrl(val: unknown, slot: string): Promise<unknown> {
  if (val === null || val === undefined) return val
  if (typeof val !== 'object') return val

  if (Array.isArray(val)) {
    return Promise.all(val.map((item, i) => replaceBase64WithUrl(item, `${slot}-${i}`)))
  }

  const obj = val as Record<string, unknown>

  // base64 キーを持つオブジェクト（avatar/icon 等の単体画像、gallery）を処理
  if ('base64' in obj) {
    const base64 = obj.base64
    // 単体画像: { base64: string, url: string | null }
    if (typeof base64 === 'string' && base64.startsWith('data:')) {
      const compressed = await compressBase64(base64)
      const url = await uploadSampleImage(compressed, `${slot}-${++counter}`).catch(() => null)
      return { ...obj, base64: null, url: url ?? obj.url ?? null }
    }
    // Gallery: { enabled, images, base64: string[], urls: string[] }
    if (Array.isArray(base64)) {
      const uploaded = await Promise.all(
        base64.map(async (b64, i) => {
          if (typeof b64 === 'string' && b64.startsWith('data:')) {
            const compressed = await compressBase64(b64)
            return uploadSampleImage(compressed, `${slot}-${i}-${++counter}`).catch(() => null)
          }
          return null
        })
      )
      const existingUrls: unknown[] = Array.isArray(obj.urls) ? obj.urls : []
      const mergedUrls = uploaded.map((u, i) => u ?? (existingUrls[i] ?? null))
      // images は File オブジェクトを含む可能性があり Server Action に渡せないため null 化
      const nulledImages = Array.isArray(obj.images) ? obj.images.map(() => null) : obj.images
      return { ...obj, images: nulledImages, base64: base64.map(() => null), urls: mergedUrls }
    }
    return obj
  }

  // 再帰処理（imageFile は File オブジェクトを含む可能性があるため null 化）
  const result: Record<string, unknown> = {}
  for (const [key, v] of Object.entries(obj)) {
    result[key] = key === 'imageFile' ? null : await replaceBase64WithUrl(v, `${slot}-${key}`)
  }
  return result
}
