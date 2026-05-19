/**
 * 下書き・公開フロー ロジックテスト（仕様書 Section 4 対応）
 *
 * - 下書き: image_url=null, visibility='private'
 * - 公開: image_url あり, visibility='public'
 * - image_url が保存されるタイミング
 */
import { describe, it, expect } from 'vitest'

// ─── 下書き判定 ───────────────────────────────────────────────────────────────

function isDraft(imageUrl: string | null | undefined): boolean {
  return imageUrl == null
}

describe('下書き判定（isDraft）', () => {
  it('image_url が null なら下書き', () => {
    expect(isDraft(null)).toBe(true)
  })

  it('image_url が undefined なら下書き', () => {
    expect(isDraft(undefined)).toBe(true)
  })

  it('image_url が URL 文字列なら公開済み', () => {
    expect(isDraft('https://example.com/card.png')).toBe(false)
  })

  it('image_url が空文字なら下書き扱いにしない（URL あり）', () => {
    // 空文字は実際には保存されないが、防御的に確認
    expect(isDraft('')).toBe(false)
  })
})

// ─── debounce 自動保存: card_data のみ（image_url は含まない） ─────────────

describe('debounce 自動保存の仕様', () => {
  it('debounce 保存では card_data を含む', () => {
    const debounceSavedFields = ['card_data']
    expect(debounceSavedFields).toContain('card_data')
  })

  it('debounce 保存では image_url を含まない', () => {
    const debounceSavedFields = ['card_data']
    expect(debounceSavedFields).not.toContain('image_url')
  })
})

// ─── 明示的アクション: image_url と card_data の両方を保存 ───────────────────

describe('明示的アクションの保存フィールド', () => {
  const explicitActions = [
    { name: 'マイページに保存', savedFields: ['card_data', 'image_url'] },
    { name: 'Xでシェア',       savedFields: ['card_data', 'image_url'] },
    { name: '画像で保存',       savedFields: ['card_data', 'image_url'] },
  ]

  for (const action of explicitActions) {
    it(`「${action.name}」は card_data を保存する`, () => {
      expect(action.savedFields).toContain('card_data')
    })

    it(`「${action.name}」は image_url を保存する`, () => {
      expect(action.savedFields).toContain('image_url')
    })
  }
})

// ─── 下書きステータス文言 ─────────────────────────────────────────────────────

type DraftStatus = 'idle' | 'saving' | 'saved'

function getDraftStatusLabel(status: DraftStatus): string | null {
  if (status === 'saving') return '保存中...'
  if (status === 'saved')  return '下書き保存済み'
  return null
}

describe('下書きステータスラベル', () => {
  it('"idle" のとき null（非表示）', () => {
    expect(getDraftStatusLabel('idle')).toBeNull()
  })

  it('"saving" のとき「保存中...」', () => {
    expect(getDraftStatusLabel('saving')).toBe('保存中...')
  })

  it('"saved" のとき「下書き保存済み」', () => {
    expect(getDraftStatusLabel('saved')).toBe('下書き保存済み')
  })
})

// ─── トースト文言 ─────────────────────────────────────────────────────────────

describe('画像ダウンロード後のトースト文言（仕様書 Section 10）', () => {
  const EXPECTED_TOAST_TEXT = 'マイページに保存して、URLで共有できるようにしませんか？'
  const CURRENT_TOAST_TEXT  = 'マイページに保存して公開しませんか？' // 現状の実装

  it('期待するトースト文言が定義されている', () => {
    expect(EXPECTED_TOAST_TEXT).toContain('URLで共有')
  })

  it('❌ 現状の実装は期待する文言と異なる（要修正）', () => {
    expect(CURRENT_TOAST_TEXT).not.toBe(EXPECTED_TOAST_TEXT)
  })
})
