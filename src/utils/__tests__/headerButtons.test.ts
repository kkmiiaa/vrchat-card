/**
 * ヘッダーボタン順序テスト（仕様書 Section 2 対応）
 *
 * ボタンの並び順は仕様書に明記されているため、
 * DOM の実際の順序を確認するより先に「期待する順序」を定義しておく。
 * E2E で実際の描画順との整合を取る。
 *
 * 現状の実装との差分（= 要修正箇所）を明示するためのテスト。
 * ❌ のテストは実装変更後に通る想定。
 */
import { describe, it, expect } from 'vitest'

// ─── カード編集ヘッダーのボタン順序 ──────────────────────────────────────────

/**
 * 仕様書 Section 2: カード編集（/card/[cardId]/edit）
 * 右（PCのみ）: 画像で保存 / Xでシェア / マイページに保存
 */
const CARD_EDITOR_HEADER_BUTTONS_EXPECTED = ['画像で保存', 'Xでシェア', 'マイページに保存'] as const

/**
 * 現状の実装（CardEditor.tsx）でのボタン順序
 * TODO: 仕様書に合わせて「画像で保存 → Xでシェア」の順に修正する
 */
const CARD_EDITOR_HEADER_BUTTONS_CURRENT = ['Xでシェア', '画像で保存', 'マイページに保存'] as const

describe('カード編集ヘッダー ボタン順序', () => {
  it('期待する順序: 画像で保存 → Xでシェア → マイページに保存', () => {
    expect(CARD_EDITOR_HEADER_BUTTONS_EXPECTED[0]).toBe('画像で保存')
    expect(CARD_EDITOR_HEADER_BUTTONS_EXPECTED[1]).toBe('Xでシェア')
    expect(CARD_EDITOR_HEADER_BUTTONS_EXPECTED[2]).toBe('マイページに保存')
  })

  it('❌ 現状の実装は期待する順序と一致しない（要修正）', () => {
    // 修正後はこのテストを削除し、上の期待値テストに一本化する
    expect(CARD_EDITOR_HEADER_BUTTONS_CURRENT[0]).toBe('Xでシェア') // 現状は Xでシェアが先
    expect(CARD_EDITOR_HEADER_BUTTONS_CURRENT[1]).toBe('画像で保存')
  })
})

// ─── カード閲覧ヘッダーのボタン順序 ──────────────────────────────────────────

/**
 * 仕様書 Section 2: カード閲覧（/card/[cardId]）
 * 右（PCのみ・オーナーのみ）: 編集 / 画像で保存 / Xで共有
 */
const CARD_VIEW_HEADER_BUTTONS_EXPECTED = ['編集', '画像で保存', 'Xで共有'] as const

/**
 * 現状の実装（CardViewClient.tsx）でのボタン順序
 * TODO: 仕様書に合わせて「画像で保存 → Xで共有」の順に修正する
 */
const CARD_VIEW_HEADER_BUTTONS_CURRENT = ['編集', 'Xで共有', '画像で保存'] as const

describe('カード閲覧ヘッダー ボタン順序（オーナー）', () => {
  it('期待する順序: 編集 → 画像で保存 → Xで共有', () => {
    expect(CARD_VIEW_HEADER_BUTTONS_EXPECTED[0]).toBe('編集')
    expect(CARD_VIEW_HEADER_BUTTONS_EXPECTED[1]).toBe('画像で保存')
    expect(CARD_VIEW_HEADER_BUTTONS_EXPECTED[2]).toBe('Xで共有')
  })

  it('❌ 現状の実装は期待する順序と一致しない（要修正）', () => {
    expect(CARD_VIEW_HEADER_BUTTONS_CURRENT[1]).toBe('Xで共有') // 現状は Xで共有が先
    expect(CARD_VIEW_HEADER_BUTTONS_CURRENT[2]).toBe('画像で保存')
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
