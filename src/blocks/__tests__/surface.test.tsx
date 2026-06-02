/**
 * surface 仕様テスト
 *
 * surface prop によるコンテナスタイルの仕様を確認する。
 *
 * surface 値ごとのスタイル定義（SURFACE_STYLE）:
 *   contained  : background rgba(255,255,255,0.85) / border なし
 *   glass      : background rgba(255,255,255,0.55) / border 1px solid rgba(255,255,255,0.75) / boxShadow あり
 *   flat       : background rgba(255,255,255,0.95) / border 1.5px solid rgba(0,0,0,0.18)
 *   transparent: background transparent / border なし
 *   outline    : background transparent / border 1px solid rgba(255,255,255,0.6)
 *
 * テスト観点:
 *   1. SURFACE_STYLE 定数の仕様確認
 *   2. supportsSurface: true な各コンポーネントで surface スタイルが正しく描画される
 *   3. isSurfaceApplicable 関数の動作確認（surfaceFor 制限）
 *   4. 後方互換: 'simple' / 'default' は 'contained' と同じスタイルを描画する
 *
 * ─── supportsSurface コンポーネント一覧 ──────────────────────────────
 *   text               surfaceFor: ['simple']
 *   select             surfaceFor: ['simple', 'chips']     ※ label があるときのみ適用
 *   multiSelect        surfaceFor: ['slash']
 *   gauge              surfaceFor: ['simple']
 *   expressiveSelect   surfaceFor: ['simple']
 *   booleanFlag        surfaceFor: ['simple']
 *   rating             surfaceFor: ['simple']
 *   linkItem           surfaceFor: ['simple']
 *   dateItem           surfaceFor: ['simple']
 *   colorStatus        surfaceFor: ['simple', 'cards']
 *   gender             surfaceFor: ['simple']
 *   language           surfaceFor: ['slash']
 *   age                surfaceFor: ['simple']
 *   activity           surfaceFor: ['v2']
 *   simpleSns          surfaceFor: ['contained']
 *   snsWithFriendPolicy surfaceFor: ['contained']
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { textComponent } from '../text'
import { selectComponent } from '../select'
import { multiSelectComponent } from '../multiSelect'
import { gaugeComponent } from '../gauge'
import { expressiveSelectComponent } from '../expressiveSelect'
import { booleanFlagComponent } from '../booleanFlag'
import { ratingComponent } from '../rating'
import { linkItemComponent } from '../linkItem'
import { dateItemComponent } from '../dateItem'
import { colorStatusComponent } from '../colorStatus'
import { genderComponent } from '../gender'
import { languageComponent } from '../language'
import { ageComponent } from '../age'
import { activityComponent } from '../activity'
import { simpleSnsComponent } from '../simpleSns'
import { snsWithFriendPolicyComponent } from '../snsWithFriendPolicy'
import { SURFACE_STYLE, DEFAULT_CARD_RENDER_CONTEXT } from '../types'
import type { SurfaceVariant, LabelDef } from '../types'
import { isSurfaceApplicable } from '@/app/admin/BlockPropertyEditor'

const CTX = DEFAULT_CARD_RENDER_CONTEXT
const LABEL: LabelDef = { text: 'ラベル', dir: 'col' }

// ─── DOM ユーティリティ ──────────────────────────────────────────────────────
//
// jsdom はインラインスタイルの shorthand を個別プロパティに展開する。
//   background: 'rgba(255,255,255,0.85)' → backgroundColor: 'rgba(255, 255, 255, 0.85)'
//   border: '1px solid rgba(...)' → borderTopWidth/Style/Color に分解
//   rgba のカンマ後の空白も自動挿入される

/** rgba(r,g,b,a) → rgba(r, g, b, a) （jsdom 正規化に合わせる） */
function normColor(c: string): string {
  return c.replace(/rgba\((\d+),(\d+),(\d+),([\d.]+)\)/g, 'rgba($1, $2, $3, $4)')
}

function hasBg(container: HTMLElement, bg: string): boolean {
  const norm = normColor(bg)
  return Array.from(container.querySelectorAll<HTMLElement>('[style]'))
    .some(el => el.style.backgroundColor === norm || el.style.backgroundColor === bg)
}

/** border shorthand を borderTop* に分解して検索 */
function hasBorder(container: HTMLElement, border: string): boolean {
  const match = border.match(/^([\d.]+px)\s+(solid)\s+(.+)$/)
  if (!match) return false
  const [, width, style, color] = match
  const normC = normColor(color)
  return Array.from(container.querySelectorAll<HTMLElement>('[style]'))
    .some(el =>
      el.style.borderTopWidth === width &&
      el.style.borderTopStyle === style &&
      (el.style.borderTopColor === normC || el.style.borderTopColor === color)
    )
}

function hasShadow(container: HTMLElement, shadow: string): boolean {
  return Array.from(container.querySelectorAll<HTMLElement>('[style]'))
    .some(el => el.style.boxShadow === shadow)
}

function findBg(container: HTMLElement, bg: string): HTMLElement | null {
  const norm = normColor(bg)
  return Array.from(container.querySelectorAll<HTMLElement>('[style]'))
    .find(el => el.style.backgroundColor === norm || el.style.backgroundColor === bg) ?? null
}

// ─── surface テストヘルパー ──────────────────────────────────────────────────
//
// renderFn (label あり) と renderFnNoLabel (label なし) を受け取り、
// 全 surface 値のスタイル検証を it() として登録する。
//
// transparent の仕様:
//   surface='transparent' は label の有無に関わらず透明であること。
//   undefined のときのみスマートデフォルト（label あり → contained、なし → transparent）が使われる。

type RenderFn = (surface: SurfaceVariant) => HTMLElement

function surfaceCases(renderFn: RenderFn, renderFnNoLabel: RenderFn) {
  it("surface='contained' → background rgba(255,255,255,0.85)", () => {
    expect(hasBg(renderFn('contained'), 'rgba(255,255,255,0.85)')).toBe(true)
  })

  it("surface='glass' → background rgba(255,255,255,0.55)", () => {
    expect(hasBg(renderFn('glass'), 'rgba(255,255,255,0.55)')).toBe(true)
  })

  it("surface='glass' → border 1px solid rgba(255,255,255,0.75)", () => {
    expect(hasBorder(renderFn('glass'), '1px solid rgba(255,255,255,0.75)')).toBe(true)
  })

  it("surface='glass' → boxShadow あり", () => {
    expect(hasShadow(renderFn('glass'), '0 0 12px rgba(0,0,0,0.08)')).toBe(true)
  })

  it("surface='flat' → background rgba(255,255,255,0.95)", () => {
    expect(hasBg(renderFn('flat'), 'rgba(255,255,255,0.95)')).toBe(true)
  })

  it("surface='flat' → border 1.5px solid rgba(0,0,0,0.18)", () => {
    expect(hasBorder(renderFn('flat'), '1.5px solid rgba(0,0,0,0.18)')).toBe(true)
  })

  // transparent は label あり・なし両方で透明であること
  it("surface='transparent' → 白背景のコンテナが描画されない（label あり）", () => {
    const container = renderFn('transparent')
    expect(hasBg(container, 'rgba(255,255,255,0.85)')).toBe(false)
    expect(hasBg(container, 'rgba(255,255,255,0.55)')).toBe(false)
    expect(hasBg(container, 'rgba(255,255,255,0.95)')).toBe(false)
  })

  it("surface='transparent' → 白背景のコンテナが描画されない（label なし）", () => {
    const container = renderFnNoLabel('transparent')
    expect(hasBg(container, 'rgba(255,255,255,0.85)')).toBe(false)
    expect(hasBg(container, 'rgba(255,255,255,0.55)')).toBe(false)
    expect(hasBg(container, 'rgba(255,255,255,0.95)')).toBe(false)
  })

  it("surface='outline' → background transparent", () => {
    expect(hasBg(renderFn('outline'), 'transparent')).toBe(true)
  })

  it("surface='outline' → border 1px solid rgba(255,255,255,0.6)", () => {
    expect(hasBorder(renderFn('outline'), '1px solid rgba(255,255,255,0.6)')).toBe(true)
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. SURFACE_STYLE 定数
// ═══════════════════════════════════════════════════════════════════════════════

describe('SURFACE_STYLE 定数', () => {
  it("contained: background rgba(255,255,255,0.85)", () => {
    expect(SURFACE_STYLE.contained.background).toBe('rgba(255,255,255,0.85)')
  })
  it("contained: border なし", () => {
    expect(SURFACE_STYLE.contained.border).toBe('none')
  })
  it("glass: background rgba(255,255,255,0.55)", () => {
    expect(SURFACE_STYLE.glass.background).toBe('rgba(255,255,255,0.55)')
  })
  it("glass: border 1px solid rgba(255,255,255,0.75)", () => {
    expect(SURFACE_STYLE.glass.border).toBe('1px solid rgba(255,255,255,0.75)')
  })
  it("glass: boxShadow 0 0 12px rgba(0,0,0,0.08)", () => {
    expect(SURFACE_STYLE.glass.boxShadow).toBe('0 0 12px rgba(0,0,0,0.08)')
  })
  it("flat: background rgba(255,255,255,0.95)", () => {
    expect(SURFACE_STYLE.flat.background).toBe('rgba(255,255,255,0.95)')
  })
  it("flat: border 1.5px solid rgba(0,0,0,0.18)", () => {
    expect(SURFACE_STYLE.flat.border).toBe('1.5px solid rgba(0,0,0,0.18)')
  })
  it("transparent: background transparent", () => {
    expect(SURFACE_STYLE.transparent.background).toBe('transparent')
  })
  it("transparent: border なし", () => {
    expect(SURFACE_STYLE.transparent.border).toBe('none')
  })
  it("outline: background transparent", () => {
    expect(SURFACE_STYLE.outline.background).toBe('transparent')
  })
  it("outline: border 1px solid rgba(255,255,255,0.6)", () => {
    expect(SURFACE_STYLE.outline.border).toBe('1px solid rgba(255,255,255,0.6)')
  })
  it("後方互換 simple: contained と同一スタイル", () => {
    expect(SURFACE_STYLE.simple.background).toBe(SURFACE_STYLE.contained.background)
    expect(SURFACE_STYLE.simple.border).toBe(SURFACE_STYLE.contained.border)
  })
  it("後方互換 default: contained と同一スタイル", () => {
    expect(SURFACE_STYLE.default.background).toBe(SURFACE_STYLE.contained.background)
    expect(SURFACE_STYLE.default.border).toBe(SURFACE_STYLE.contained.border)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 2. isSurfaceApplicable 関数
// ═══════════════════════════════════════════════════════════════════════════════

describe('isSurfaceApplicable', () => {
  it('supportsSurface: false → false', () => {
    expect(isSurfaceApplicable({ supportsSurface: false }, 'simple')).toBe(false)
  })

  it('supportsSurface: undefined → false', () => {
    expect(isSurfaceApplicable({ supportsSurface: undefined }, 'simple')).toBe(false)
  })

  it('surfaceFor に含まれる variant → true', () => {
    expect(isSurfaceApplicable(
      { supportsSurface: true, surfaceFor: ['simple', 'chips'] },
      'simple'
    )).toBe(true)
  })

  it('surfaceFor に含まれない variant → false', () => {
    expect(isSurfaceApplicable(
      { supportsSurface: true, surfaceFor: ['simple'] },
      'compact'
    )).toBe(false)
  })

  it('select: simple variant → true', () => {
    expect(isSurfaceApplicable(selectComponent, 'simple')).toBe(true)
  })

  it('select: badge variant → false', () => {
    expect(isSurfaceApplicable(selectComponent, 'badge')).toBe(false)
  })

  it('select: compact variant → false', () => {
    expect(isSurfaceApplicable(selectComponent, 'compact')).toBe(false)
  })

  it('select: chips variant → true', () => {
    expect(isSurfaceApplicable(selectComponent, 'chips')).toBe(true)
  })

  it('booleanFlag: simple variant → true', () => {
    expect(isSurfaceApplicable(booleanFlagComponent, 'simple')).toBe(true)
  })

  it('booleanFlag: badge variant → false', () => {
    expect(isSurfaceApplicable(booleanFlagComponent, 'badge')).toBe(false)
  })

  it('rating: simple variant → true', () => {
    expect(isSurfaceApplicable(ratingComponent, 'simple')).toBe(true)
  })

  it('rating: compact variant → false', () => {
    expect(isSurfaceApplicable(ratingComponent, 'compact')).toBe(false)
  })

  it('dateItem: simple → true', () => {
    expect(isSurfaceApplicable(dateItemComponent, 'simple')).toBe(true)
  })

  it('dateItem: compact → false', () => {
    expect(isSurfaceApplicable(dateItemComponent, 'compact')).toBe(false)
  })

  it('dateItem: badge → false', () => {
    expect(isSurfaceApplicable(dateItemComponent, 'badge')).toBe(false)
  })

  it('colorStatus: simple → true', () => {
    expect(isSurfaceApplicable(colorStatusComponent, 'simple')).toBe(true)
  })

  it('colorStatus: cards → true', () => {
    expect(isSurfaceApplicable(colorStatusComponent, 'cards')).toBe(true)
  })

  it('colorStatus: compact → false', () => {
    expect(isSurfaceApplicable(colorStatusComponent, 'compact')).toBe(false)
  })

  it('gender: simple → true', () => {
    expect(isSurfaceApplicable(genderComponent, 'simple')).toBe(true)
  })

  it('gender: compact → false', () => {
    expect(isSurfaceApplicable(genderComponent, 'compact')).toBe(false)
  })

  it('language: slash → true', () => {
    expect(isSurfaceApplicable(languageComponent, 'slash')).toBe(true)
  })

  it('language: simple → false（simple variant はサーフェスコンテナを描画しない）', () => {
    expect(isSurfaceApplicable(languageComponent, 'simple')).toBe(false)
  })

  it('multiSelect: slash → true', () => {
    expect(isSurfaceApplicable(multiSelectComponent, 'slash')).toBe(true)
  })

  it('multiSelect: simple → false', () => {
    expect(isSurfaceApplicable(multiSelectComponent, 'simple')).toBe(false)
  })

  it('activity: v2 → true', () => {
    expect(isSurfaceApplicable(activityComponent, 'v2')).toBe(true)
  })

  it('activity: simple → false', () => {
    expect(isSurfaceApplicable(activityComponent, 'simple')).toBe(false)
  })

  it('simpleSns: contained → true', () => {
    expect(isSurfaceApplicable(simpleSnsComponent, 'contained')).toBe(true)
  })

  it('simpleSns: simple → false', () => {
    expect(isSurfaceApplicable(simpleSnsComponent, 'simple')).toBe(false)
  })

  it('snsWithFriendPolicy: contained → true', () => {
    expect(isSurfaceApplicable(snsWithFriendPolicyComponent, 'contained')).toBe(true)
  })

  it('snsWithFriendPolicy: simple → false', () => {
    expect(isSurfaceApplicable(snsWithFriendPolicyComponent, 'simple')).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 3. コンポーネント別 surface 描画テスト
// ═══════════════════════════════════════════════════════════════════════════════

// ─── text ────────────────────────────────────────────────────────────────────
describe('text surface (variant: simple)', () => {
  surfaceCases(
    s => render(textComponent.CardItem!({ value: 'テスト', ctx: CTX, variant: 'simple', surface: s, label: LABEL })).container,
    s => render(textComponent.CardItem!({ value: 'テスト', ctx: CTX, variant: 'simple', surface: s })).container,
  )
})

// ─── select ──────────────────────────────────────────────────────────────────
// select は label があるときのみ surface コンテナを描画する

const SELECT_CONFIG = { options: [{ value: 'A', label: 'A' }] }

describe('select surface (variant: simple, label あり)', () => {
  surfaceCases(
    s => render(selectComponent.CardItem!({ value: 'A', ctx: CTX, variant: 'simple', surface: s, label: LABEL, blockConfig: SELECT_CONFIG })).container,
    s => render(selectComponent.CardItem!({ value: 'A', ctx: CTX, variant: 'simple', surface: s, blockConfig: SELECT_CONFIG })).container,
  )
})

// ─── multiSelect ─────────────────────────────────────────────────────────────
const MULTI_CONFIG = { options: [{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }] }

describe('multiSelect surface (variant: slash)', () => {
  surfaceCases(
    s => render(multiSelectComponent.CardItem!({ value: ['A', 'B'], ctx: CTX, variant: 'slash', surface: s, label: LABEL, blockConfig: MULTI_CONFIG })).container,
    s => render(multiSelectComponent.CardItem!({ value: ['A', 'B'], ctx: CTX, variant: 'slash', surface: s, blockConfig: MULTI_CONFIG })).container,
  )
})

// ─── gauge ───────────────────────────────────────────────────────────────────
describe('gauge surface (variant: simple)', () => {
  surfaceCases(
    s => render(gaugeComponent.CardItem!({ value: 75, ctx: CTX, variant: 'simple', surface: s, label: LABEL })).container,
    s => render(gaugeComponent.CardItem!({ value: 75, ctx: CTX, variant: 'simple', surface: s })).container,
  )
})

// ─── expressiveSelect ────────────────────────────────────────────────────────
const EXPRESSIVE_CONFIG = { options: [{ value: 'female', label: '女性' }] }

describe('expressiveSelect surface (variant: simple)', () => {
  surfaceCases(
    s => render(expressiveSelectComponent.CardItem!({ value: { tag: 'female', display: '女性' }, ctx: CTX, variant: 'simple', surface: s, label: LABEL, blockConfig: EXPRESSIVE_CONFIG })).container,
    s => render(expressiveSelectComponent.CardItem!({ value: { tag: 'female', display: '女性' }, ctx: CTX, variant: 'simple', surface: s, blockConfig: EXPRESSIVE_CONFIG })).container,
  )
})

// ─── booleanFlag ─────────────────────────────────────────────────────────────
describe('booleanFlag surface (variant: simple)', () => {
  surfaceCases(
    s => render(booleanFlagComponent.CardItem!({ value: true, ctx: CTX, variant: 'simple', surface: s, label: LABEL })).container,
    s => render(booleanFlagComponent.CardItem!({ value: true, ctx: CTX, variant: 'simple', surface: s })).container,
  )
})

// ─── rating ──────────────────────────────────────────────────────────────────
describe('rating surface (variant: simple)', () => {
  surfaceCases(
    s => render(ratingComponent.CardItem!({ value: 4, ctx: CTX, variant: 'simple', surface: s, label: LABEL })).container,
    s => render(ratingComponent.CardItem!({ value: 4, ctx: CTX, variant: 'simple', surface: s })).container,
  )
})

// ─── linkItem ────────────────────────────────────────────────────────────────
describe('linkItem surface (variant: simple)', () => {
  surfaceCases(
    s => render(linkItemComponent.CardItem!({ value: { label: 'Link', url: 'https://example.com' }, ctx: CTX, variant: 'simple', surface: s, label: LABEL })).container,
    s => render(linkItemComponent.CardItem!({ value: { label: 'Link', url: 'https://example.com' }, ctx: CTX, variant: 'simple', surface: s })).container,
  )
})

// ─── dateItem ────────────────────────────────────────────────────────────────
describe('dateItem surface (variant: simple)', () => {
  surfaceCases(
    s => render(dateItemComponent.CardItem!({ value: { display: '2021年4月', iso: '2021-04' }, ctx: CTX, variant: 'simple', surface: s, label: LABEL })).container,
    s => render(dateItemComponent.CardItem!({ value: { display: '2021年4月', iso: '2021-04' }, ctx: CTX, variant: 'simple', surface: s })).container,
  )
})

// ─── colorStatus ─────────────────────────────────────────────────────────────
const COLOR_STATUS_CONFIG = { fields: [{ key: 'a', label: 'A', color: '#60a5fa' }] }

describe('colorStatus surface (variant: simple)', () => {
  surfaceCases(
    s => render(colorStatusComponent.CardItem!({ value: { a: 'test' }, ctx: CTX, variant: 'simple', surface: s, label: LABEL, blockConfig: COLOR_STATUS_CONFIG })).container,
    s => render(colorStatusComponent.CardItem!({ value: { a: 'test' }, ctx: CTX, variant: 'simple', surface: s, blockConfig: COLOR_STATUS_CONFIG })).container,
  )
})

// ─── gender ──────────────────────────────────────────────────────────────────
describe('gender surface (variant: simple)', () => {
  surfaceCases(
    s => render(genderComponent.CardItem!({ value: { tag: 'female', display: '女の子' }, ctx: CTX, variant: 'simple', surface: s, label: LABEL })).container,
    s => render(genderComponent.CardItem!({ value: { tag: 'female', display: '女の子' }, ctx: CTX, variant: 'simple', surface: s })).container,
  )
})

// ─── language ────────────────────────────────────────────────────────────────
// language は slash variant のみ surface を描画する（simple は chip 表示でコンテナなし）

describe('language surface (variant: slash)', () => {
  surfaceCases(
    s => render(languageComponent.CardItem!({ value: { preset: ['日本語', 'English'], custom: [] }, ctx: CTX, variant: 'slash', surface: s, label: LABEL })).container,
    s => render(languageComponent.CardItem!({ value: { preset: ['日本語', 'English'], custom: [] }, ctx: CTX, variant: 'slash', surface: s })).container,
  )
})

// ─── age ─────────────────────────────────────────────────────────────────────
describe('age surface (variant: simple)', () => {
  surfaceCases(
    s => render(ageComponent.CardItem!({ value: { searchTag: '18+', display: '20代' }, ctx: CTX, variant: 'simple', surface: s, label: LABEL })).container,
    s => render(ageComponent.CardItem!({ value: { searchTag: '18+', display: '20代' }, ctx: CTX, variant: 'simple', surface: s })).container,
  )
})

// ─── activity ────────────────────────────────────────────────────────────────
// activity は v2 variant のみ surface を描画する

const ACTIVITY_VALUE = {
  days: [true, true, false, false, false, true, true],
  weekdayStart: '20:00',
  weekdayEnd: '23:00',
  holidayStart: '12:00',
  holidayEnd: '24:00',
}

describe('activity surface (variant: v2)', () => {
  surfaceCases(
    s => render(activityComponent.CardItem!({ value: ACTIVITY_VALUE, ctx: CTX, variant: 'v2', surface: s })).container,
    s => render(activityComponent.CardItem!({ value: ACTIVITY_VALUE, ctx: CTX, variant: 'v2', surface: s })).container,
  )
})

// ─── simpleSns ───────────────────────────────────────────────────────────────
// simpleSns は contained variant のみ surface を描画する

describe('simpleSns surface (variant: contained)', () => {
  surfaceCases(
    s => render(simpleSnsComponent.CardItem!({ value: '@user', ctx: CTX, variant: 'contained', surface: s, blockConfig: { platform: 'x' } })).container,
    s => render(simpleSnsComponent.CardItem!({ value: '@user', ctx: CTX, variant: 'contained', surface: s, blockConfig: { platform: 'x' } })).container,
  )
})

// ─── snsWithFriendPolicy ─────────────────────────────────────────────────────
// snsWithFriendPolicy は contained variant のみ surface を描画する

describe('snsWithFriendPolicy surface (variant: contained)', () => {
  surfaceCases(
    s => render(snsWithFriendPolicyComponent.CardItem!({ value: { id: '@user', friendPolicy: 'frPolicyAnyone' }, ctx: CTX, variant: 'contained', surface: s, blockConfig: { platform: 'x' } })).container,
    s => render(snsWithFriendPolicyComponent.CardItem!({ value: { id: '@user', friendPolicy: 'frPolicyAnyone' }, ctx: CTX, variant: 'contained', surface: s, blockConfig: { platform: 'x' } })).container,
  )
})

// ═══════════════════════════════════════════════════════════════════════════════
// 4. 後方互換エイリアス（'simple' / 'default' は 'contained' と同じ描画）
// ═══════════════════════════════════════════════════════════════════════════════

describe('後方互換エイリアス', () => {
  // label なしで surface='contained' と 'simple'/'default' が同じ背景を描画することを確認
  it("surface='simple' は 'contained' と同じ background を描画する", () => {
    const { container: c1 } = render(
      gaugeComponent.CardItem!({ value: 50, ctx: CTX, surface: 'contained' })
    )
    const { container: c2 } = render(
      // @ts-expect-error 'simple' は後方互換のため型からは除外されているが実行時は動作する
      gaugeComponent.CardItem!({ value: 50, ctx: CTX, surface: 'simple' })
    )
    expect(findBg(c1, 'rgba(255,255,255,0.85)')).not.toBeNull()
    expect(findBg(c2, 'rgba(255,255,255,0.85)')).not.toBeNull()
  })

  it("surface='default' は 'contained' と同じ background を描画する", () => {
    const { container } = render(
      // @ts-expect-error 'default' は後方互換のため型からは除外されているが実行時は動作する
      gaugeComponent.CardItem!({ value: 50, ctx: CTX, surface: 'default' })
    )
    expect(hasBg(container, 'rgba(255,255,255,0.85)')).toBe(true)
  })
})
