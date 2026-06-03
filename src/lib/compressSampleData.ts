import { uploadAdminBase64Image } from '@/lib/adminImageUpload'

const MAX_DIMENSION = 1200
const JPEG_QUALITY = 0.80

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

  // { base64: string | null, url: string | null } 形式の画像オブジェクト
  if ('base64' in obj) {
    const base64 = obj.base64
    if (typeof base64 === 'string' && base64.startsWith('data:')) {
      const compressed = await compressBase64(base64)
      const url = await uploadAdminBase64Image(compressed, `${slot}-${++counter}`).catch(() => null)
      return { ...obj, base64: null, url: url ?? obj.url ?? null }
    }
    // base64 が配列（gallery 旧形式）
    if (Array.isArray(base64)) {
      const uploaded = await Promise.all(
        base64.map(async (b64, i) => {
          if (typeof b64 === 'string' && b64.startsWith('data:')) {
            const compressed = await compressBase64(b64)
            return uploadAdminBase64Image(compressed, `${slot}-${i}-${++counter}`).catch(() => null)
          }
          return null
        })
      )
      const existingUrls: unknown[] = Array.isArray(obj.urls) ? obj.urls : []
      const mergedUrls = uploaded.map((u, i) => u ?? (existingUrls[i] ?? null))
      return { ...obj, base64: base64.map(() => null), urls: mergedUrls }
    }
    return obj
  }

  // 再帰処理
  const result: Record<string, unknown> = {}
  for (const [key, v] of Object.entries(obj)) {
    result[key] = await replaceBase64WithUrl(v, `${slot}-${key}`)
  }
  return result
}
