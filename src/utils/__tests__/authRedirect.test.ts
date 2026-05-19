/**
 * 認証後リダイレクト先ロジックテスト（仕様書 Section 1・3 対応）
 *
 * 認証コールバック後のリダイレクト先を ユーザー種別で分岐する仕様。
 */
import { describe, it, expect } from 'vitest'

type UserOrigin = 'card_new' | 'card_vrchat' | 'other'

function getRedirectPath(origin: UserOrigin, slug: string): string {
  if (origin === 'card_new')    return '/card/new'
  if (origin === 'card_vrchat') return '/card/vrchat'
  return `/u/${slug}`
}

describe('認証後リダイレクト先の分岐（仕様書 Section 1）', () => {
  it('card_new から来たユーザーは /card/new へ', () => {
    expect(getRedirectPath('card_new', 'testuser')).toBe('/card/new')
  })

  it('/card/vrchat から来たユーザーは /card/vrchat へ', () => {
    expect(getRedirectPath('card_vrchat', 'testuser')).toBe('/card/vrchat')
  })

  it('その他のユーザーはマイページへ', () => {
    expect(getRedirectPath('other', 'testuser')).toBe('/u/testuser')
  })

  it('slug が含まれたマイページ URL が生成される', () => {
    expect(getRedirectPath('other', 'myslug123')).toBe('/u/myslug123')
  })
})

// ─── slug 生成ルール ──────────────────────────────────────────────────────────

describe('username_slug 生成ルール（仕様書 Section 3）', () => {
  function isValidSlug(slug: string): boolean {
    return /^[a-z0-9]{8}$/.test(slug)
  }

  it('8文字の英数字小文字のみ有効', () => {
    expect(isValidSlug('abc12345')).toBe(true)
  })

  it('7文字は無効', () => {
    expect(isValidSlug('abc1234')).toBe(false)
  })

  it('9文字は無効', () => {
    expect(isValidSlug('abc123456')).toBe(false)
  })

  it('大文字を含む場合は無効', () => {
    expect(isValidSlug('Abc12345')).toBe(false)
  })

  it('ハイフンを含む場合は無効', () => {
    expect(isValidSlug('abc-1234')).toBe(false)
  })
})
