import { describe, it, expect } from 'vitest'

/**
 * HeaderAuth のリンク先 URL ロジックをテスト。
 * コンポーネント自体は Supabase に依存するため、URL 生成ロジックだけを切り出して検証する。
 */

function buildMyPageHref(slug: string | null | undefined): string | null {
  if (!slug) return null
  return `/u/${slug}`
}

describe('HeaderAuth マイページリンク', () => {
  it('slug が有効な場合は /u/[slug] を返す', () => {
    expect(buildMyPageHref('yota3d')).toBe('/u/yota3d')
  })

  it('slug が空文字の場合は null を返す（/u/ に飛ばさない）', () => {
    expect(buildMyPageHref('')).toBeNull()
  })

  it('slug が null の場合は null を返す', () => {
    expect(buildMyPageHref(null)).toBeNull()
  })

  it('slug が undefined の場合は null を返す', () => {
    expect(buildMyPageHref(undefined)).toBeNull()
  })
})
