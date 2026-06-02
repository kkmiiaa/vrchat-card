/**
 * サンプルカードデータ保存前の前処理
 *
 * base64 画像は Server Action の 1MB 制限を超えるため除去し、
 * URL 参照のみ保持する。ネストされた構造も再帰的に処理する。
 */
export function compressSampleData(
  values: Record<string, unknown>,
): Record<string, unknown> {
  return stripBase64(values) as Record<string, unknown>
}

function stripBase64(val: unknown): unknown {
  if (val === null || val === undefined) return val
  if (typeof val !== 'object') return val

  if (Array.isArray(val)) {
    return val.map(stripBase64)
  }

  const obj = val as Record<string, unknown>

  // base64 フィールドを持つオブジェクト — null に置換
  if ('base64' in obj) {
    return { ...obj, base64: Array.isArray(obj.base64) ? obj.base64.map(() => null) : null }
  }

  // 再帰処理
  const result: Record<string, unknown> = {}
  for (const [key, v] of Object.entries(obj)) {
    result[key] = stripBase64(v)
  }
  return result
}
