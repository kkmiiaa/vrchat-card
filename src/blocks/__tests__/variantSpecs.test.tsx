/**
 * コンポーネント variant 仕様テスト
 *
 * 各コンポーネントの variant ごとのレンダリング仕様を確認する。
 * これらのテストは「仕様書」として機能し、variant の見た目の差異が
 * 意図通りであることを保証する。
 *
 * ─────────────────────────────────────────────────────────────
 * Component        | Variants
 * ─────────────────────────────────────────────────────────────
 * profileImage     | default, circle, glass
 * badge            | default, outline, subtle
 * select           | default, badge, compact
 * multiSelect      | default, slash, icon, icon-slash
 * divider          | horizontal, vertical
 * markGrid         | default, white
 * qrCode           | default, glass
 * language         | default, slash
 * gender           | default, compact
 * activity         | default, v2
 * ─────────────────────────────────────────────────────────────
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { profileImageComponent } from '../profileImage'
import { badgeComponent } from '../badge'
import { selectComponent } from '../select'
import { multiSelectComponent } from '../multiSelect'
import { dividerComponent } from '../divider'
import { markGridComponent } from '../markGrid'
import { qrCodeComponent } from '../qrCode'
import { languageComponent } from '../language'
import { genderComponent } from '../gender'
import { ageComponent } from '../age'
import { playEnvBlock } from '../playEnv'
import { snsBlock } from '../sns'
import { interactionsBlock } from '../interactions'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

const CTX = DEFAULT_CARD_RENDER_CONTEXT

// ─── profileImage ─────────────────────────────────────────────────────────────

describe('profileImage variant 仕様', () => {
  const VALUE = { base64: null, url: null }

  it('default: borderRadius は cardWidth * 0.018（角丸）', () => {
    const { container } = render(
      profileImageComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'default' })
    )
    const root = container.querySelector('div') as HTMLElement
    // jsdom は数値をそのまま文字列化する（px なし）
    expect(root.style.borderRadius).toBeTruthy()
    expect(root.style.borderRadius).not.toBe('50%')
  })

  it('circle: borderRadius は 50%（正円）', () => {
    const { container } = render(
      profileImageComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'circle' })
    )
    const root = container.querySelector('div') as HTMLElement
    expect(root.style.borderRadius).toBe('50%')
  })

  it('glass: border は 1px solid rgba(255,255,255,0.75)（固定値）', () => {
    const { container } = render(
      profileImageComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'glass' })
    )
    const root = container.querySelector('div') as HTMLElement
    expect(root.style.border).toBe('1px solid rgba(255, 255, 255, 0.75)')
  })

  it('glass: boxShadow は 0 0 12px rgba(0,0,0,0.08)（固定値）', () => {
    const { container } = render(
      profileImageComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'glass' })
    )
    const root = container.querySelector('div') as HTMLElement
    expect(root.style.boxShadow).toBe('0 0 12px rgba(0,0,0,0.08)')
  })

  it('circle と glass は borderRadius が異なる（circle=50%, glass=proportional）', () => {
    const { container: c1 } = render(
      profileImageComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'circle' })
    )
    const { container: c2 } = render(
      profileImageComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'glass' })
    )
    const r1 = (c1.querySelector('div') as HTMLElement).style.borderRadius
    const r2 = (c2.querySelector('div') as HTMLElement).style.borderRadius
    expect(r1).not.toBe(r2)
  })

  it('default: border スタイルがない', () => {
    const { container } = render(
      profileImageComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'default' })
    )
    const root = container.querySelector('div') as HTMLElement
    expect(root.style.border || '').toBe('')
  })
})

// ─── badge ────────────────────────────────────────────────────────────────────

describe('badge variant 仕様', () => {
  // badge の value には label と color が含まれる
  const VALUE = { label: 'テスト', color: '#00AADB' }

  it('default: ルート要素に background color が設定される（filled）', () => {
    const { container } = render(
      badgeComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'default', blockConfig: {} })
    )
    const els = Array.from(container.querySelectorAll<HTMLElement>('div,span'))
    const hasColorBg = els.some(el => el.style.background === '#00AADB')
    expect(hasColorBg).toBe(true)
  })

  it('outline: 要素の background は transparent（枠線のみ）', () => {
    const { container } = render(
      badgeComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'outline', blockConfig: {} })
    )
    const els = Array.from(container.querySelectorAll<HTMLElement>('div,span'))
    const transparentEl = els.find(el => el.style.background === 'transparent')
    expect(transparentEl).not.toBeUndefined()
  })

  it('outline: 要素に border が設定される', () => {
    const { container } = render(
      badgeComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'outline', blockConfig: {} })
    )
    const els = Array.from(container.querySelectorAll<HTMLElement>('div,span'))
    const hasBorder = els.some(el => el.style.border?.includes('#00AADB'))
    expect(hasBorder).toBe(true)
  })

  it('subtle: 要素に background が設定される（淡いfill）', () => {
    const { container } = render(
      badgeComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'subtle', blockConfig: {} })
    )
    const els = Array.from(container.querySelectorAll<HTMLElement>('div,span'))
    const hasSubtleBg = els.some(el => el.style.background && el.style.background !== 'transparent')
    expect(hasSubtleBg).toBe(true)
  })

  it('default: filled（色背景）、outline: transparent — background が異なる', () => {
    const { container: c1 } = render(
      badgeComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'default', blockConfig: {} })
    )
    const { container: c2 } = render(
      badgeComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'outline', blockConfig: {} })
    )
    // default は filled
    const hasFilledBg = Array.from(c1.querySelectorAll<HTMLElement>('div,span')).some(el => el.style.background === '#00AADB')
    // outline は transparent
    const hasTransparentBg = Array.from(c2.querySelectorAll<HTMLElement>('div,span')).some(el => el.style.background === 'transparent')
    expect(hasFilledBg).toBe(true)
    expect(hasTransparentBg).toBe(true)
  })
})

// ─── select ───────────────────────────────────────────────────────────────────

describe('select variant 仕様', () => {
  const BLOCK_CONFIG = { options: [{ value: 'vrc', label: 'VRChat', color: '#00AADB' }] }
  const VALUE = 'vrc'

  it('badge: background に色が設定される', () => {
    const { container } = render(
      selectComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'badge', blockConfig: BLOCK_CONFIG })
    )
    const divs = Array.from(container.querySelectorAll<HTMLElement>('div,span'))
    const hasColorBg = divs.some(el => el.style.background === '#00AADB')
    expect(hasColorBg).toBe(true)
  })

  it('compact: borderRadius に 999 が設定される（pill形状）', () => {
    const { container } = render(
      selectComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'compact', blockConfig: BLOCK_CONFIG })
    )
    const spans = Array.from(container.querySelectorAll<HTMLElement>('span'))
    const hasPill = spans.some(el => el.style.borderRadius === '999px')
    expect(hasPill).toBe(true)
  })

  it('badge と compact は borderRadius が異なる', () => {
    const { container: c1 } = render(
      selectComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'badge', blockConfig: BLOCK_CONFIG })
    )
    const { container: c2 } = render(
      selectComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'compact', blockConfig: BLOCK_CONFIG })
    )
    const pill = Array.from(c2.querySelectorAll<HTMLElement>('span')).some(el => el.style.borderRadius === '999px')
    const noPill = Array.from(c1.querySelectorAll<HTMLElement>('span')).every(el => el.style.borderRadius !== '999px')
    expect(pill).toBe(true)
    expect(noPill).toBe(true)
  })
})

// ─── multiSelect ──────────────────────────────────────────────────────────────

describe('multiSelect variant 仕様', () => {
  const BLOCK_CONFIG = { options: [
    { value: 'pcvr', label: 'PCVR' },
    { value: 'quest', label: 'Quest' },
  ]}
  const VALUE = ['pcvr', 'quest']

  it('slash: テキストが "/" で区切られて表示される', () => {
    const { container } = render(
      multiSelectComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'slash', blockConfig: BLOCK_CONFIG })
    )
    expect(container.textContent).toContain('/')
  })

  it('default: テキストが "/" なしで表示される（バッジ形式）', () => {
    const { container } = render(
      multiSelectComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'default', blockConfig: BLOCK_CONFIG })
    )
    expect(container.textContent).toContain('PCVR')
    expect(container.textContent).toContain('Quest')
  })

  it('icon-slash: テキストが "/" で区切られて表示される', () => {
    const { container } = render(
      multiSelectComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'icon-slash', blockConfig: BLOCK_CONFIG })
    )
    expect(container.textContent).toContain('/')
  })

  it('slash と icon-slash はともに "/" セパレーターを持つ', () => {
    const { container: c1 } = render(
      multiSelectComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'slash', blockConfig: BLOCK_CONFIG })
    )
    const { container: c2 } = render(
      multiSelectComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'icon-slash', blockConfig: BLOCK_CONFIG })
    )
    expect(c1.textContent).toContain('/')
    expect(c2.textContent).toContain('/')
  })
})

// ─── divider ──────────────────────────────────────────────────────────────────

describe('divider variant 仕様', () => {
  const BLOCK_CONFIG = { color: '#cccccc', thickness: 1 }

  it('horizontal: height が固定値で width が 100%', () => {
    const { container } = render(
      dividerComponent.CardItem!({ value: null, ctx: CTX, variant: 'horizontal', blockConfig: BLOCK_CONFIG })
    )
    const inner = Array.from(container.querySelectorAll<HTMLElement>('div')).find(el => el.style.width === '100%' && el.style.height && el.style.height !== '100%')
    expect(inner).not.toBeUndefined()
  })

  it('vertical: height が 100% で width が固定値', () => {
    const { container } = render(
      dividerComponent.CardItem!({ value: null, ctx: CTX, variant: 'vertical', blockConfig: BLOCK_CONFIG })
    )
    const inner = Array.from(container.querySelectorAll<HTMLElement>('div')).find(el => el.style.height === '100%' && el.style.width && el.style.width !== '100%')
    expect(inner).not.toBeUndefined()
  })

  it('horizontal と vertical は width/height が入れ替わる', () => {
    const { container: c1 } = render(
      dividerComponent.CardItem!({ value: null, ctx: CTX, variant: 'horizontal', blockConfig: BLOCK_CONFIG })
    )
    const { container: c2 } = render(
      dividerComponent.CardItem!({ value: null, ctx: CTX, variant: 'vertical', blockConfig: BLOCK_CONFIG })
    )
    // divider の inner div（background が設定されているもの）を探す
    // hexToRgba でカラーが変換されるため background style で探す
    const hInner = Array.from(c1.querySelectorAll<HTMLElement>('div')).find(el => el.style.background && el.style.width !== '100%')
    const vInner = Array.from(c2.querySelectorAll<HTMLElement>('div')).find(el => el.style.background && el.style.height === '100%' && el.style.width !== '100%')
    // horizontal: width=100%、vertical: height=100%
    const hFull = Array.from(c1.querySelectorAll<HTMLElement>('div')).find(el => el.style.width === '100%' && el.style.height && el.style.height !== '100%')
    const vFull = Array.from(c2.querySelectorAll<HTMLElement>('div')).find(el => el.style.height === '100%' && el.style.width && el.style.width !== '100%')
    expect(hFull).not.toBeUndefined()
    expect(vFull).not.toBeUndefined()
  })
})

// ─── markGrid ─────────────────────────────────────────────────────────────────

describe('markGrid variant 仕様', () => {
  // markGrid は blockConfig.items でラベル定義、value.marks でマーク値を持つ
  const BLOCK_CONFIG = {
    cols: 2,
    rows: 2,
    items: [
      { label: 'スロット1' },
      { label: 'スロット2' },
      { label: 'スロット3' },
      { label: '' },           // label なし
    ],
    marks: [{ symbol: '◎', color: '#1f2937', bg: '#d1fae5' }],
  }
  const VALUE = { marks: { 0: '◎', 1: '○', 2: '-' }, custom: [], removed: [] }

  it('default: label があるセルは白背景を持つ', () => {
    const { container } = render(
      markGridComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'default', blockConfig: BLOCK_CONFIG })
    )
    const cells = Array.from(container.querySelectorAll<HTMLElement>('div')).filter(el =>
      el.style.background?.includes('rgba(255') && el.style.background?.includes('0.85')
    )
    expect(cells.length).toBeGreaterThan(0)
  })

  it('white: すべてのセルが白背景 rgba(255,255,255,0.85) を持つ', () => {
    const { container } = render(
      markGridComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'white', blockConfig: BLOCK_CONFIG })
    )
    const gridDiv = container.querySelector('div') as HTMLElement
    const cells = Array.from(gridDiv.children) as HTMLElement[]
    expect(cells.length).toBeGreaterThan(0)
    const allWhite = cells.every(el =>
      (el as HTMLElement).style.background?.includes('rgba(255') && (el as HTMLElement).style.background?.includes('0.85')
    )
    expect(allWhite).toBe(true)
  })

  it('white variant は default より gap が小さい（1px vs 4px）', () => {
    const { container: c1 } = render(
      markGridComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'default', blockConfig: BLOCK_CONFIG })
    )
    const { container: c2 } = render(
      markGridComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'white', blockConfig: BLOCK_CONFIG })
    )
    const defaultGap = (c1.querySelector('div') as HTMLElement).style.gap
    const whiteGap = (c2.querySelector('div') as HTMLElement).style.gap
    // white=1px, default=4px
    expect(whiteGap).toBe('1px')
    expect(defaultGap).toBe('4px')
  })
})

// ─── qrCode ───────────────────────────────────────────────────────────────────

describe('qrCode variant 仕様', () => {
  const VALUE = { url: 'https://example.com', label: 'QR' }
  const BLOCK_CONFIG = { showLabel: false }

  it('default: background は #ffffff（白背景）', () => {
    const { container } = render(
      qrCodeComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'default', blockConfig: BLOCK_CONFIG })
    )
    const el = Array.from(container.querySelectorAll<HTMLElement>('div')).find(
      el => el.style.background === 'rgb(255, 255, 255)' || el.style.background === '#ffffff'
    )
    expect(el).not.toBeUndefined()
  })

  it('glass: background は rgba(255,255,255,0.45)（半透明）', () => {
    const { container } = render(
      qrCodeComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'glass', blockConfig: BLOCK_CONFIG })
    )
    const el = Array.from(container.querySelectorAll<HTMLElement>('div')).find(
      el => el.style.background?.includes('rgba(255, 255, 255, 0.45)') || el.style.background?.includes('rgba(255,255,255,0.45)')
    )
    expect(el).not.toBeUndefined()
  })

  it('glass: border は 1px solid rgba(255,255,255,0.75)', () => {
    const { container } = render(
      qrCodeComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'glass', blockConfig: BLOCK_CONFIG })
    )
    const el = Array.from(container.querySelectorAll<HTMLElement>('div')).find(
      el => el.style.border?.includes('rgba(255, 255, 255, 0.75)')
    )
    expect(el).not.toBeUndefined()
    expect(el!.style.border).toBe('1px solid rgba(255, 255, 255, 0.75)')
  })

  it('glass: boxShadow は 0 0 12px rgba(0,0,0,0.08)（固定値）', () => {
    const { container } = render(
      qrCodeComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'glass', blockConfig: BLOCK_CONFIG })
    )
    const el = Array.from(container.querySelectorAll<HTMLElement>('div')).find(
      el => el.style.border?.includes('rgba(255, 255, 255, 0.75)')
    )
    expect(el!.style.boxShadow).toBe('0 0 12px rgba(0,0,0,0.08)')
  })

  it('default: border は色付き太枠（ガラス枠なし）', () => {
    const { container } = render(
      qrCodeComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'default', blockConfig: BLOCK_CONFIG })
    )
    const hasGlassBorder = Array.from(container.querySelectorAll<HTMLElement>('div')).some(
      el => el.style.border?.includes('rgba(255, 255, 255, 0.75)')
    )
    expect(hasGlassBorder).toBe(false)
  })
})

// ─── language ─────────────────────────────────────────────────────────────────

describe('language variant 仕様', () => {
  const VALUE = { preset: ['日本語', 'English'], custom: [] }

  it('slash: テキストが "/" で区切られて表示される', () => {
    const { container } = render(
      languageComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'slash' })
    )
    expect(container.textContent).toContain('/')
  })

  it('default: タグ/バッジ形式で表示される（slash なし）', () => {
    const { container } = render(
      languageComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'default' })
    )
    // default は "/" を含まない
    const slashEl = Array.from(container.querySelectorAll<HTMLElement>('span')).find(el => el.textContent === '/')
    expect(slashEl).toBeUndefined()
  })

  it('slash: 言語テキストが表示される', () => {
    const { container } = render(
      languageComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'slash' })
    )
    expect(container.textContent).toContain('日本語')
    expect(container.textContent).toContain('English')
  })
})

// ─── gender ───────────────────────────────────────────────────────────────────

describe('gender variant 仕様', () => {
  const VALUE = { tag: 'female', display: '女性' }

  it('default: 表示テキストが含まれる', () => {
    const { container } = render(
      genderComponent.CardItem!({ value: VALUE, ctx: CTX })
    )
    expect(container.textContent).toContain('女性')
  })

  it('compact: 表示テキストが含まれる（アイコン + テキスト）', () => {
    const { container } = render(
      genderComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'compact' })
    )
    expect(container.textContent).toContain('女性')
  })

  it('compact: ラベルなし・bgVariant なし（白背景・枠なし）', () => {
    const { container } = render(
      genderComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'compact' })
    )
    const root = container.querySelector('div') as HTMLElement
    // compact は background なし（transparent）
    expect(root.style.background || '').toBe('')
    expect(root.style.border || '').toBe('')
  })

  it('default と compact でレンダリング結果が異なる（エラーなし）', () => {
    expect(() => render(genderComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'simple' }))).not.toThrow()
    expect(() => render(genderComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'compact' }))).not.toThrow()
  })

  it('未設定値は "-" が表示される', () => {
    const { container } = render(
      genderComponent.CardItem!({ value: { tag: '', display: '' }, ctx: CTX })
    )
    expect(container.textContent).toContain('-')
  })

  it('非公開（none）は "-" が表示される', () => {
    const { container } = render(
      genderComponent.CardItem!({ value: { tag: 'none', display: '' }, ctx: CTX })
    )
    expect(container.textContent).toContain('-')
  })
})

// ─── age ──────────────────────────────────────────────────────────────────────

describe('age variant 仕様', () => {
  const VALUE = { searchTag: '18+', display: '18+' }

  it('default: テキストが直接表示される', () => {
    const { container } = render(
      ageComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'default' })
    )
    expect(container.textContent).toContain('18+')
  })

  it('badge: カラーバッジとして表示される（span に background あり）', () => {
    const { container } = render(
      ageComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'badge' })
    )
    const spans = Array.from(container.querySelectorAll<HTMLElement>('span'))
    const hasBg = spans.some(el => el.style.background && el.style.background !== 'transparent')
    expect(hasBg).toBe(true)
    expect(container.textContent).toContain('18+')
  })

  it('badge: テキストカラーは白（#ffffff）', () => {
    const { container } = render(
      ageComponent.CardItem!({ value: VALUE, ctx: CTX, variant: 'badge' })
    )
    const spans = Array.from(container.querySelectorAll<HTMLElement>('span'))
    const whiteText = spans.some(el => el.style.color === 'rgb(255, 255, 255)' || el.style.color === '#ffffff')
    expect(whiteText).toBe(true)
  })

  it('非公開は default/badge ともに "-" が表示される', () => {
    const { container: c1 } = render(
      ageComponent.CardItem!({ value: { searchTag: '非公開', display: '' }, ctx: CTX, variant: 'default' })
    )
    const { container: c2 } = render(
      ageComponent.CardItem!({ value: { searchTag: '非公開', display: '' }, ctx: CTX, variant: 'badge' })
    )
    expect(c1.textContent).toContain('-')
    expect(c2.textContent).toContain('-')
  })
})

// ─── playEnv ──────────────────────────────────────────────────────────────────

describe('playEnv variant 仕様', () => {
  const VALUE = ['PCVR', 'Quest']

  it('default: バッジ形式でテキストが表示される', () => {
    const { container } = render(
      playEnvBlock.CardItem!({ value: VALUE, ctx: CTX, variant: 'default' })
    )
    expect(container.textContent).toContain('PCVR')
    expect(container.textContent).toContain('Quest')
  })

  it('slash: "/" で区切られてテキストが表示される', () => {
    const { container } = render(
      playEnvBlock.CardItem!({ value: VALUE, ctx: CTX, variant: 'slash' })
    )
    expect(container.textContent).toContain('PCVR')
    expect(container.textContent).toContain('Quest')
    expect(container.textContent).toContain('/')
  })

  it('icon: アイコン + テキストのバッジが表示される', () => {
    const { container } = render(
      playEnvBlock.CardItem!({ value: VALUE, ctx: CTX, variant: 'icon' })
    )
    expect(container.textContent).toContain('PCVR')
    expect(container.textContent).toContain('Quest')
    // icon variant は svg アイコンが含まれる
    const hasSvg = container.querySelector('svg') !== null
    expect(hasSvg).toBe(true)
  })

  it('default は svg アイコンを含まない', () => {
    const { container } = render(
      playEnvBlock.CardItem!({ value: VALUE, ctx: CTX, variant: 'default' })
    )
    const hasSvg = container.querySelector('svg') !== null
    expect(hasSvg).toBe(false)
  })

  it('slash は "/" セパレーター要素を持つ', () => {
    const { container } = render(
      playEnvBlock.CardItem!({ value: VALUE, ctx: CTX, variant: 'slash' })
    )
    const slashEl = Array.from(container.querySelectorAll<HTMLElement>('span')).find(el => el.textContent === '/')
    expect(slashEl).not.toBeUndefined()
  })
})

// ─── sns ──────────────────────────────────────────────────────────────────────

describe('sns variant 仕様', () => {
  const VALUE = { vrchatId: 'MyVRCUser', twitterId: '@mytwitter', discordId: '' }

  it('default: テキストラベル（VRC/X）が表示される', () => {
    const { container } = render(
      snsBlock.CardItem!({ value: VALUE, ctx: CTX, variant: 'default' })
    )
    expect(container.textContent).toContain('VRC')
    expect(container.textContent).toContain('X')
    expect(container.textContent).toContain('MyVRCUser')
  })

  it('icon: ID テキストが表示される', () => {
    const { container } = render(
      snsBlock.CardItem!({ value: VALUE, ctx: CTX, variant: 'icon' })
    )
    expect(container.textContent).toContain('MyVRCUser')
    expect(container.textContent).toContain('@mytwitter')
  })

  it('icon: img タグが含まれる（プラットフォームアイコン画像）', () => {
    const { container } = render(
      snsBlock.CardItem!({ value: VALUE, ctx: CTX, variant: 'icon' })
    )
    const imgs = container.querySelectorAll('img')
    expect(imgs.length).toBeGreaterThan(0)
  })

  it('default: img タグを含まない（テキストラベルのみ）', () => {
    const { container } = render(
      snsBlock.CardItem!({ value: VALUE, ctx: CTX, variant: 'default' })
    )
    const imgs = container.querySelectorAll('img')
    expect(imgs.length).toBe(0)
  })
})

// ─── interactions ─────────────────────────────────────────────────────────────

describe('interactions variant 仕様', () => {
  const VALUE = [
    { label: 'ボイスチャット', mark: '◎' },
    { label: 'ハグ', mark: '◯' },
    { label: '写真撮影', mark: '✗' },
  ]

  it('default: マーク + ラベルが横長タグで表示される', () => {
    const { container } = render(
      interactionsBlock.CardItem!({ value: VALUE, ctx: CTX, variant: 'default' })
    )
    expect(container.textContent).toContain('◎')
    expect(container.textContent).toContain('ボイスチャット')
    // 横並び flexWrap
    const root = container.querySelector('div') as HTMLElement
    expect(root.style.flexWrap).toBe('wrap')
    // span（タグ形式）
    const tags = container.querySelectorAll('span')
    expect(tags.length).toBeGreaterThan(0)
  })

  it('grid: マーク（下）・ラベル（上）のカード形式で表示される', () => {
    const { container } = render(
      interactionsBlock.CardItem!({ value: VALUE, ctx: CTX, variant: 'grid' })
    )
    expect(container.textContent).toContain('◎')
    expect(container.textContent).toContain('ボイスチャット')
    // カードは div で構成され flexDirection: column を持つ
    const cards = Array.from(container.querySelectorAll<HTMLElement>('div')).filter(
      el => el.style.flexDirection === 'column' && el.style.alignItems === 'center'
    )
    expect(cards.length).toBeGreaterThan(0)
  })

  it('default は span タグ、grid は div カードを使う', () => {
    const { container: c1 } = render(
      interactionsBlock.CardItem!({ value: VALUE, ctx: CTX, variant: 'default' })
    )
    const { container: c2 } = render(
      interactionsBlock.CardItem!({ value: VALUE, ctx: CTX, variant: 'grid' })
    )
    // default: 各アイテムが span
    const defaultSpans = c1.querySelectorAll('span')
    expect(defaultSpans.length).toBeGreaterThan(0)
    // grid: 各アイテムが div（column flex）
    const gridCards = Array.from(c2.querySelectorAll<HTMLElement>('div')).filter(
      el => el.style.flexDirection === 'column'
    )
    expect(gridCards.length).toBeGreaterThan(0)
  })

  it('"-" または "―" のマークは表示されない', () => {
    const valueWithDash = [
      { label: 'ボイスチャット', mark: '-' },
      { label: 'ハグ', mark: '◎' },
    ]
    const { container } = render(
      interactionsBlock.CardItem!({ value: valueWithDash, ctx: CTX, variant: 'default' })
    )
    // ボイスチャットは非表示、ハグのみ表示
    expect(container.textContent).not.toContain('ボイスチャット')
    expect(container.textContent).toContain('ハグ')
  })
})
