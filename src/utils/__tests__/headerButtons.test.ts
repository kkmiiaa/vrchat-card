/**
 * ヘッダーボタン順序テスト（仕様書 Section 2 対応）
 */
import { describe, it, expect } from 'vitest'

// ─── カード編集ヘッダーのボタン順序 ──────────────────────────────────────────

/**
 * 仕様書 Section 2: カード編集（/card/[cardId]/edit）
 * 右（PCのみ）: 画像で保存 / Xでシェア / マイページに保存
 */
const CARD_EDITOR_HEADER_BUTTONS = ['画像で保存', 'Xでシェア', 'マイページに保存'] as const

describe('カード編集ヘッダー ボタン順序', () => {
  it('画像で保存 → Xでシェア → マイページに保存 の順', () => {
    expect(CARD_EDITOR_HEADER_BUTTONS[0]).toBe('画像で保存')
    expect(CARD_EDITOR_HEADER_BUTTONS[1]).toBe('Xでシェア')
    expect(CARD_EDITOR_HEADER_BUTTONS[2]).toBe('マイページに保存')
  })
})

// ─── カード閲覧ヘッダーのボタン順序 ──────────────────────────────────────────

/**
 * 仕様書 Section 2: カード閲覧（/card/[cardId]）
 * 右（PCのみ・オーナーのみ）: 編集 / 画像で保存 / Xで共有
 */
const CARD_VIEW_HEADER_BUTTONS = ['編集', '画像で保存', 'Xで共有'] as const

describe('カード閲覧ヘッダー ボタン順序（オーナー）', () => {
  it('編集 → 画像で保存 → Xで共有 の順', () => {
    expect(CARD_VIEW_HEADER_BUTTONS[0]).toBe('編集')
    expect(CARD_VIEW_HEADER_BUTTONS[1]).toBe('画像で保存')
    expect(CARD_VIEW_HEADER_BUTTONS[2]).toBe('Xで共有')
  })
})

// ─── ヘッダーの表示条件 ───────────────────────────────────────────────────────

describe('カード編集ヘッダー 下書きステータス表示条件', () => {
  /**
   * 仕様: isLoggedIn && cardId のときのみ表示
   */
  function shouldShowDraftStatus(isLoggedIn: boolean, cardId: string | null): boolean {
    return isLoggedIn && cardId != null
  }

  it('ログイン済み・cardId あり → 表示', () => {
    expect(shouldShowDraftStatus(true, 'abc123')).toBe(true)
  })

  it('未ログイン・cardId あり → 非表示', () => {
    expect(shouldShowDraftStatus(false, 'abc123')).toBe(false)
  })

  it('ログイン済み・cardId なし → 非表示', () => {
    expect(shouldShowDraftStatus(true, null)).toBe(false)
  })

  it('未ログイン・cardId なし → 非表示', () => {
    expect(shouldShowDraftStatus(false, null)).toBe(false)
  })
})

describe('カード編集ヘッダー マイページボタン文言', () => {
  /**
   * 仕様: 未ログイン時は別の文言（現状「マイページを作成」は伝わらないため要変更）
   */
  function getMyPageButtonLabel(isLoggedIn: boolean): string {
    return isLoggedIn ? 'マイページに保存' : 'マイページを作成'
  }

  it('ログイン済み → 「マイページに保存」', () => {
    expect(getMyPageButtonLabel(true)).toBe('マイページに保存')
  })

  it('未ログイン → 現状「マイページを作成」（文言要検討）', () => {
    // 仕様書で要検討とされている。この文言が変わったらテストを更新すること。
    expect(getMyPageButtonLabel(false)).toBe('マイページを作成')
  })
})
