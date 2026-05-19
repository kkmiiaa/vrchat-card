import { describe, it, expect } from 'vitest'
import { isPro } from '../plan'

describe('isPro（仕様書 Section 5: Pro 判定ロジック）', () => {
  // ─── free プラン ───────────────────────────────────────────────────────────

  it('plan が "free" なら false', () => {
    expect(isPro('free', null)).toBe(false)
  })

  it('plan が null なら false', () => {
    expect(isPro(null, null)).toBe(false)
  })

  it('plan が undefined なら false', () => {
    expect(isPro(undefined, null)).toBe(false)
  })

  // ─── pro プラン・期限なし ──────────────────────────────────────────────────

  it('plan が "pro" で plan_expires_at が null なら true（無期限）', () => {
    expect(isPro('pro', null)).toBe(true)
  })

  it('plan が "pro" で plan_expires_at が undefined なら true', () => {
    expect(isPro('pro', undefined)).toBe(true)
  })

  // ─── pro プラン・期限あり ──────────────────────────────────────────────────

  it('plan が "pro" で期限が未来なら true', () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
    expect(isPro('pro', future)).toBe(true)
  })

  it('plan が "pro" で期限が過去なら false（期限切れ）', () => {
    const past = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    expect(isPro('pro', past)).toBe(false)
  })

  it('plan が "pro" で期限がちょうど現在時刻なら false（境界値）', () => {
    // すでに過ぎているとみなす
    const now = new Date(Date.now() - 1).toISOString()
    expect(isPro('pro', now)).toBe(false)
  })
})
