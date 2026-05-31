/**
 * サンプルカードデータ保存前の画像圧縮
 *
 * localValues に含まれる base64 画像を低解像度化して返す。
 * - 最大幅 400px・JPEG 品質 70% に圧縮
 * - URL 参照はそのまま保持
 * - base64 を持たないフィールドは変更なし
 */

const MAX_WIDTH = 400
const JPEG_QUALITY = 0.7

async function compressBase64(base64: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, MAX_WIDTH / img.width)
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(base64); return }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
    }
    img.onerror = () => resolve(base64)
    img.src = base64
  })
}

function isBase64(s: unknown): s is string {
  return typeof s === 'string' && s.startsWith('data:')
}

export async function compressSampleData(
  values: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const result: Record<string, unknown> = {}

  for (const [key, val] of Object.entries(values)) {
    if (val === null || val === undefined) {
      result[key] = val
      continue
    }

    // profileImage: { base64, url }
    if (
      typeof val === 'object' &&
      'base64' in (val as object) &&
      'url' in (val as object)
    ) {
      const v = val as { base64: string | null; url: string | null }
      result[key] = {
        ...v,
        base64: isBase64(v.base64) ? await compressBase64(v.base64) : v.base64,
      }
      continue
    }

    // gallery: { enabled, images, base64: (string | null)[] }
    if (
      typeof val === 'object' &&
      'base64' in (val as object) &&
      Array.isArray((val as { base64: unknown }).base64)
    ) {
      const v = val as { base64: (string | null)[]; [k: string]: unknown }
      result[key] = {
        ...v,
        base64: await Promise.all(
          v.base64.map(b => (isBase64(b) ? compressBase64(b) : Promise.resolve(b)))
        ),
      }
      continue
    }

    result[key] = val
  }

  return result
}
