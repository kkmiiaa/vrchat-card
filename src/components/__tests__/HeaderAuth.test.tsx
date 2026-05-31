import { describe, it, expect } from 'vitest'

/**
 * HeaderAuth の表示ロジックをテスト。
 * コンポーネントは Supabase に依存するため、状態ごとの表示ルールを純粋関数で検証する。
 */

type AuthState =
  | { status: 'loading' }
  | { status: 'guest' }
  | { status: 'loggedIn'; slug: string; avatarUrl: string | null; displayName: string | null }

function getDisplayMode(auth: AuthState, hideMyPage: boolean): 'loading' | 'login' | 'avatar' | 'bell-only' {
  if (auth.status === 'loading') return 'loading'
  if (auth.status === 'guest') return 'login'
  if (hideMyPage || !auth.slug) return 'bell-only'
  return 'avatar'
}

function getMyPageHref(slug: string): string | null {
  if (!slug) return null
  return `/u/${slug}`
}

describe('HeaderAuth 表示ロジック', () => {
  it('loading 中はローディング状態', () => {
    expect(getDisplayMode({ status: 'loading' }, false)).toBe('loading')
  })

  it('未ログインは「ログイン」リンクを表示', () => {
    expect(getDisplayMode({ status: 'guest' }, false)).toBe('login')
  })

  it('ログイン済み・slug あり → アバターアイコン表示', () => {
    expect(getDisplayMode({ status: 'loggedIn', slug: 'yota3d', avatarUrl: null, displayName: null }, false)).toBe('avatar')
  })

  it('ログイン済み・slug なし → ベルのみ（ログインボタンは出さない）', () => {
    expect(getDisplayMode({ status: 'loggedIn', slug: '', avatarUrl: null, displayName: null }, false)).toBe('bell-only')
  })

  it('hideMyPage=true のときはベルのみ', () => {
    expect(getDisplayMode({ status: 'loggedIn', slug: 'yota3d', avatarUrl: null, displayName: null }, true)).toBe('bell-only')
  })
})

describe('HeaderAuth マイページリンク', () => {
  it('slug が有効なら /u/[slug]', () => {
    expect(getMyPageHref('yota3d')).toBe('/u/yota3d')
  })

  it('slug が空文字なら null（/u/ に飛ばさない）', () => {
    expect(getMyPageHref('')).toBeNull()
  })
})
