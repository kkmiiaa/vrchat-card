/**
 * hideWhenEmpty オプションのテスト
 *
 * blockConfig.hideWhenEmpty: true のとき、値が空なら CardItem が null を返す（ブロック非表示）。
 * hideWhenEmpty が false/未指定のとき、値が空なら "-" を表示する（デフォルト）。
 *
 * 対象コンポーネント: select, multiSelect, language, badgeList, markList, colorLabeledList,
 *                    selfIntro, trustRank, activity, interactions, playEnv, status, sns
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { selectComponent } from '../select'
import { multiSelectComponent } from '../multiSelect'
import { languageComponent } from '../language'
import { badgeListComponent } from '../badgeList'
import { markListComponent } from '../markList'
import { colorLabeledListComponent } from '../colorLabeledList'
import { selfIntroBlock } from '../selfIntro'
import { trustRankBlock } from '../trustRank'
import { activityComponent } from '../activity'
import { interactionsBlock } from '../interactions'
import { playEnvBlock } from '../playEnv'
import { statusBlock } from '../status'
import { snsBlock } from '../sns'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

const CTX = DEFAULT_CARD_RENDER_CONTEXT

// ─── select ───────────────────────────────────────────────────────────────────

describe('select – hideWhenEmpty', () => {
  const CONFIG = { options: [{ value: 'a', label: 'A' }] }

  it('空値 + hideWhenEmpty:false（デフォルト）→ "-" を表示する', () => {
    const { container } = render(
      selectComponent.CardItem!({ value: '', ctx: CTX, blockConfig: CONFIG })
    )
    expect(container.textContent).toContain('-')
    expect(container.firstChild).not.toBeNull()
  })

  it('空値 + hideWhenEmpty:true → null を返す（非表示）', () => {
    const result = selectComponent.CardItem!({ value: '', ctx: CTX, blockConfig: { ...CONFIG, hideWhenEmpty: true } })
    expect(result).toBeNull()
  })

  it('値あり + hideWhenEmpty:true → 通常表示する', () => {
    const result = selectComponent.CardItem!({ value: 'a', ctx: CTX, blockConfig: { ...CONFIG, hideWhenEmpty: true } })
    expect(result).not.toBeNull()
  })
})

// ─── multiSelect ──────────────────────────────────────────────────────────────

describe('multiSelect – hideWhenEmpty', () => {
  const CONFIG = { options: [{ value: 'a', label: 'A' }] }

  it('空配列 + hideWhenEmpty:false → "-" を表示する', () => {
    const { container } = render(
      multiSelectComponent.CardItem!({ value: [], ctx: CTX, variant: 'default', blockConfig: CONFIG })
    )
    expect(container.textContent).toContain('-')
  })

  it('空配列 + hideWhenEmpty:true → null を返す', () => {
    const result = multiSelectComponent.CardItem!({ value: [], ctx: CTX, variant: 'default', blockConfig: { ...CONFIG, hideWhenEmpty: true } })
    expect(result).toBeNull()
  })

  it('値あり + hideWhenEmpty:true → 通常表示する', () => {
    const result = multiSelectComponent.CardItem!({ value: ['a'], ctx: CTX, variant: 'default', blockConfig: { ...CONFIG, hideWhenEmpty: true } })
    expect(result).not.toBeNull()
  })
})

// ─── language ─────────────────────────────────────────────────────────────────

describe('language – hideWhenEmpty', () => {
  it('空配列 + hideWhenEmpty:false → "-" を表示する', () => {
    const { container } = render(
      languageComponent.CardItem!({ value: { preset: [], custom: [] }, ctx: CTX, blockConfig: {} })
    )
    expect(container.textContent).toContain('-')
  })

  it('空配列 + hideWhenEmpty:true → null を返す', () => {
    const result = languageComponent.CardItem!({ value: { preset: [], custom: [] }, ctx: CTX, blockConfig: { hideWhenEmpty: true } })
    expect(result).toBeNull()
  })

  it('値あり + hideWhenEmpty:true → 通常表示する', () => {
    const result = languageComponent.CardItem!({ value: { preset: ['日本語'], custom: [] }, ctx: CTX, blockConfig: { hideWhenEmpty: true } })
    expect(result).not.toBeNull()
  })
})

// ─── badgeList ────────────────────────────────────────────────────────────────

describe('badgeList – hideWhenEmpty', () => {
  it('空配列 + hideWhenEmpty:false → "-" を表示する', () => {
    const { container } = render(
      badgeListComponent.CardItem!({ value: [], ctx: CTX, blockConfig: {} })
    )
    expect(container.textContent).toContain('-')
  })

  it('空配列 + hideWhenEmpty:true → null を返す', () => {
    const result = badgeListComponent.CardItem!({ value: [], ctx: CTX, blockConfig: { hideWhenEmpty: true } })
    expect(result).toBeNull()
  })

  it('値あり + hideWhenEmpty:true → 通常表示する', () => {
    const result = badgeListComponent.CardItem!({
      value: [{ label: 'テスト', color: '#00AADB' }],
      ctx: CTX,
      blockConfig: { hideWhenEmpty: true },
    })
    expect(result).not.toBeNull()
  })
})

// ─── markList ─────────────────────────────────────────────────────────────────

describe('markList – hideWhenEmpty', () => {
  // markList の value は { marks: Record<number, string>, custom: [] }
  // configItems は blockConfig.items で定義する
  const EMPTY_VALUE = { marks: {}, custom: [] }  // 全て '-'（未選択）
  const CONFIG = { marks: [], items: [{ label: 'ボイス' }, { label: 'ハグ' }] }

  it('全項目未選択 + hideWhenEmpty:false → "-" を表示する', () => {
    const { container } = render(
      markListComponent.CardItem!({ value: EMPTY_VALUE, ctx: CTX, blockConfig: CONFIG })
    )
    expect(container.textContent).toContain('-')
  })

  it('全項目未選択 + hideWhenEmpty:true → null を返す', () => {
    const result = markListComponent.CardItem!({ value: EMPTY_VALUE, ctx: CTX, blockConfig: { ...CONFIG, hideWhenEmpty: true } })
    expect(result).toBeNull()
  })

  it('マーク済み項目あり + hideWhenEmpty:true → 通常表示する', () => {
    // marks: { 0: '◎' } でインデックス0番目に◎をセット
    const valueWithMark = { marks: { 0: '◎' }, custom: [] }
    const result = markListComponent.CardItem!({ value: valueWithMark, ctx: CTX, blockConfig: { ...CONFIG, hideWhenEmpty: true } })
    expect(result).not.toBeNull()
  })
})

// ─── colorLabeledList ─────────────────────────────────────────────────────────

describe('colorLabeledList – hideWhenEmpty', () => {
  const EMPTY_VALUE = { items: [] }

  it('空リスト + hideWhenEmpty:false → "-" を表示する', () => {
    const { container } = render(
      colorLabeledListComponent.CardItem!({ value: EMPTY_VALUE, ctx: CTX, blockConfig: {} })
    )
    expect(container.textContent).toContain('-')
  })

  it('空リスト + hideWhenEmpty:true → null を返す', () => {
    const result = colorLabeledListComponent.CardItem!({ value: EMPTY_VALUE, ctx: CTX, blockConfig: { hideWhenEmpty: true } })
    expect(result).toBeNull()
  })

  it('値あり + hideWhenEmpty:true → 通常表示する', () => {
    const valueWithItem = { items: [{ label: 'テスト', color: '#00AADB' }] }
    const result = colorLabeledListComponent.CardItem!({ value: valueWithItem, ctx: CTX, blockConfig: { hideWhenEmpty: true } })
    expect(result).not.toBeNull()
  })
})

// ─── selfIntro ────────────────────────────────────────────────────────────────

describe('selfIntro – hideWhenEmpty', () => {
  it('空文字 + hideWhenEmpty:false → "-" を表示する', () => {
    const { container } = render(selfIntroBlock.CardItem!({ value: '', ctx: CTX, blockConfig: {} }))
    expect(container.textContent).toContain('–')
  })

  it('空文字 + hideWhenEmpty:true → null を返す', () => {
    const result = selfIntroBlock.CardItem!({ value: '', ctx: CTX, blockConfig: { hideWhenEmpty: true } })
    expect(result).toBeNull()
  })

  it('値あり + hideWhenEmpty:true → 通常表示する', () => {
    const result = selfIntroBlock.CardItem!({ value: '自己紹介', ctx: CTX, blockConfig: { hideWhenEmpty: true } })
    expect(result).not.toBeNull()
  })
})

// ─── trustRank ────────────────────────────────────────────────────────────────

describe('trustRank – hideWhenEmpty', () => {
  it('空文字 + hideWhenEmpty:false → "-" を表示する', () => {
    const { container } = render(trustRankBlock.CardItem!({ value: '', ctx: CTX, blockConfig: {} }))
    expect(container.textContent).toContain('–')
  })

  it('空文字 + hideWhenEmpty:true → null を返す', () => {
    const result = trustRankBlock.CardItem!({ value: '', ctx: CTX, blockConfig: { hideWhenEmpty: true } })
    expect(result).toBeNull()
  })

  it('値あり + hideWhenEmpty:true → 通常表示する', () => {
    const result = trustRankBlock.CardItem!({ value: 'Trusted User', ctx: CTX, blockConfig: { hideWhenEmpty: true } })
    expect(result).not.toBeNull()
  })
})

// ─── activity ─────────────────────────────────────────────────────────────────

describe('activity – hideWhenEmpty', () => {
  // activity の「空」= daysMode: 'irregular'（曜日グリッドなし）かつ時間も未設定
  // 通常モード（daysMode 未指定）は曜日グリッドを常に描画するため hideWhenEmpty 対象外
  const EMPTY_IRREGULAR = { days: [], weekdayStart: '', weekdayEnd: '', holidayStart: '', holidayEnd: '', daysMode: 'irregular' as const }

  it('irregular + 時間なし + hideWhenEmpty:false → "-" を表示する', () => {
    const { container } = render(activityComponent.CardItem!({ value: EMPTY_IRREGULAR, ctx: CTX, blockConfig: {} }))
    expect(container.textContent).toContain('–')
  })

  it('irregular + 時間なし + hideWhenEmpty:true → null を返す', () => {
    const result = activityComponent.CardItem!({ value: EMPTY_IRREGULAR, ctx: CTX, blockConfig: { hideWhenEmpty: true } })
    expect(result).toBeNull()
  })

  it('通常モード（曜日グリッドあり）は空でも描画される', () => {
    const value = { days: [], weekdayStart: '', weekdayEnd: '', holidayStart: '', holidayEnd: '' }
    const result = activityComponent.CardItem!({ value, ctx: CTX, blockConfig: { hideWhenEmpty: true } })
    expect(result).not.toBeNull()
  })
})

// ─── interactions ─────────────────────────────────────────────────────────────

describe('interactions – hideWhenEmpty', () => {
  const EMPTY = [{ label: 'ボイス', mark: '-' }]

  it('全項目 "-" + hideWhenEmpty:false → "-" を表示する', () => {
    const { container } = render(interactionsBlock.CardItem!({ value: EMPTY, ctx: CTX, blockConfig: {} }))
    expect(container.textContent).toContain('–')
  })

  it('全項目 "-" + hideWhenEmpty:true → null を返す', () => {
    const result = interactionsBlock.CardItem!({ value: EMPTY, ctx: CTX, blockConfig: { hideWhenEmpty: true } })
    expect(result).toBeNull()
  })

  it('マーク済み項目あり + hideWhenEmpty:true → 通常表示する', () => {
    const result = interactionsBlock.CardItem!({ value: [{ label: 'ボイス', mark: '◎' }], ctx: CTX, blockConfig: { hideWhenEmpty: true } })
    expect(result).not.toBeNull()
  })
})

// ─── playEnv ──────────────────────────────────────────────────────────────────

describe('playEnv – hideWhenEmpty', () => {
  it('空配列 + hideWhenEmpty:false → "-" を表示する', () => {
    const { container } = render(playEnvBlock.CardItem!({ value: [], ctx: CTX, blockConfig: {} }))
    expect(container.textContent).toContain('–')
  })

  it('空配列 + hideWhenEmpty:true → null を返す', () => {
    const result = playEnvBlock.CardItem!({ value: [], ctx: CTX, blockConfig: { hideWhenEmpty: true } })
    expect(result).toBeNull()
  })

  it('値あり + hideWhenEmpty:true → 通常表示する', () => {
    const result = playEnvBlock.CardItem!({ value: ['PCVR'], ctx: CTX, blockConfig: { hideWhenEmpty: true } })
    expect(result).not.toBeNull()
  })
})

// ─── status ───────────────────────────────────────────────────────────────────

describe('status – hideWhenEmpty', () => {
  const EMPTY = { blue: '', green: '', yellow: '', red: '' }

  it('全空 + hideWhenEmpty:false → "-" を表示する', () => {
    const { container } = render(statusBlock.CardItem!({ value: EMPTY, ctx: CTX, blockConfig: {} }))
    expect(container.textContent).toContain('–')
  })

  it('全空 + hideWhenEmpty:true → null を返す', () => {
    const result = statusBlock.CardItem!({ value: EMPTY, ctx: CTX, blockConfig: { hideWhenEmpty: true } })
    expect(result).toBeNull()
  })

  it('値あり + hideWhenEmpty:true → 通常表示する', () => {
    const result = statusBlock.CardItem!({ value: { blue: 'インスタンス募集中', green: '', yellow: '', red: '' }, ctx: CTX, blockConfig: { hideWhenEmpty: true } })
    expect(result).not.toBeNull()
  })
})

// ─── sns ──────────────────────────────────────────────────────────────────────

describe('sns – hideWhenEmpty', () => {
  const EMPTY = { vrchatId: '', twitterId: '', discordId: '' }

  it('全空 + hideWhenEmpty:false → "-" を表示する', () => {
    const { container } = render(snsBlock.CardItem!({ value: EMPTY, ctx: CTX, blockConfig: {} }))
    expect(container.textContent).toContain('–')
  })

  it('全空 + hideWhenEmpty:true → null を返す', () => {
    const result = snsBlock.CardItem!({ value: EMPTY, ctx: CTX, blockConfig: { hideWhenEmpty: true } })
    expect(result).toBeNull()
  })

  it('値あり + hideWhenEmpty:true → 通常表示する', () => {
    const result = snsBlock.CardItem!({ value: { vrchatId: 'user123', twitterId: '', discordId: '' }, ctx: CTX, blockConfig: { hideWhenEmpty: true } })
    expect(result).not.toBeNull()
  })
})
