/**
 * カード背景の CSS 値を統一的に生成するユーティリティ。
 *
 * 以前は CardV1, CardV2, CardEditor, ProfilePage の4箇所にほぼ同じロジックが
 * 散在していた（グラデーション方向の不統一・画像フォールバックの差異）を統合。
 *
 * @param type        背景種別: 'color' | 'gradient' | 'image'
 * @param value       色コード、グラデーション配列、または画像パス
 * @param base64      base64 エンコードされた画像データ（image type のとき優先）
 * @param fallback    どの条件にも一致しない場合に返す値（省略時は null）
 */
export function getBackgroundStyle(
  type?: string,
  value?: string | [string, string],
  base64?: string | null,
  fallback?: string,
  url?: string | null,
): string | null {
  if (type === 'color' && typeof value === 'string') {
    return value
  }

  if (type === 'gradient' && Array.isArray(value)) {
    return `linear-gradient(135deg, ${value[0]}, ${value[1]})`
  }

  if (type === 'image') {
    // base64 を最優先（html-to-image でクロスオリジンを回避）、なければ Storage URL、なければ value（プリセットパス）
    const src = base64 ?? url ?? (typeof value === 'string' ? value : null)
    if (src) return `url(${src}) center/cover no-repeat`
  }

  return fallback ?? null
}

/** カード描画用のデフォルトフォールバック背景 */
export const CARD_BG_FALLBACK = 'linear-gradient(135deg, #c7d2fe, #fbcfe8, #fde68a)'
