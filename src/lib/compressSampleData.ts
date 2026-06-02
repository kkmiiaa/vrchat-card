/**
 * サンプルカードデータ保存前の前処理
 *
 * base64 画像は Server Action の 1MB 制限を超えるため除去し、
 * URL 参照のみ保持する。
 */
export function compressSampleData(
  values: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, val] of Object.entries(values)) {
    if (val === null || val === undefined) {
      result[key] = val
      continue
    }

    // profileImage: { base64, url } — base64 は除去、url のみ保持
    if (
      typeof val === 'object' &&
      'base64' in (val as object) &&
      'url' in (val as object)
    ) {
      result[key] = { ...(val as object), base64: null }
      continue
    }

    // gallery: { enabled, images, base64: (string | null)[] } — base64 は除去
    if (
      typeof val === 'object' &&
      'base64' in (val as object) &&
      Array.isArray((val as { base64: unknown }).base64)
    ) {
      const v = val as { base64: (string | null)[]; [k: string]: unknown }
      result[key] = { ...v, base64: v.base64.map(() => null) }
      continue
    }

    result[key] = val
  }

  return result
}
