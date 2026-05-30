/**
 * glass 統一仕様テスト
 *
 * glass スタイル（variant: "glass" または bgVariant: "glass"）を持つ全コンポーネントが
 * 以下の固定値スタイルを持つことを保証する:
 *   background : rgba(255,255,255,0.55)
 *   border     : 1px solid rgba(255,255,255,0.75)
 *   boxShadow  : 0 0 12px rgba(0,0,0,0.08)
 *
 * variant: "glass" 対象: profileImage / gallery / simpleSns / snsWithFriendPolicy
 * bgVariant: "glass" 対象: gender / age / language / gauge / multiSelect / text / select
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { profileImageComponent } from '../profileImage'
import { galleryComponent } from '../gallery'
import { simpleSnsComponent } from '../simpleSns'
import { snsWithFriendPolicyComponent } from '../snsWithFriendPolicy'
import { genderComponent } from '../gender'
import { ageComponent } from '../age'
import { languageComponent } from '../language'
import { gaugeComponent } from '../gauge'
import { multiSelectComponent } from '../multiSelect'
import { textComponent } from '../text'
import { selectComponent } from '../select'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

const CTX = DEFAULT_CARD_RENDER_CONTEXT

const GLASS_BG     = 'rgba(255, 255, 255, 0.55)'
const GLASS_BORDER = '1px solid rgba(255, 255, 255, 0.75)'
const GLASS_SHADOW = '0 0 12px rgba(0,0,0,0.08)'

function findGlassEl(container: HTMLElement): HTMLElement | null {
  return Array.from(container.querySelectorAll<HTMLElement>('div')).find(
    el => el.style.border?.includes('rgba(255, 255, 255, 0.75)')
  ) ?? null
}

// ─── profileImage ─────────────────────────────────────────────────────────────

describe('glass variant 仕様 – profileImage', () => {
  it('glass variant の border は 1px solid rgba(255,255,255,0.75)', () => {
    const { container } = render(
      profileImageComponent.CardItem!({
        value: { base64: null, url: null },
        ctx: CTX,
        variant: 'glass',
      })
    )
    const el = findGlassEl(container)
    expect(el).not.toBeNull()
    expect(el!.style.border).toBe(GLASS_BORDER)
  })

  it('glass variant の boxShadow は 0 0 12px rgba(0,0,0,0.08)（固定値）', () => {
    const { container } = render(
      profileImageComponent.CardItem!({
        value: { base64: null, url: null },
        ctx: CTX,
        variant: 'glass',
      })
    )
    const el = findGlassEl(container)
    expect(el!.style.boxShadow).toBe(GLASS_SHADOW)
  })

  it('default variant には glass border がない', () => {
    const { container } = render(
      profileImageComponent.CardItem!({
        value: { base64: null, url: null },
        ctx: CTX,
        variant: 'default',
      })
    )
    expect(findGlassEl(container)).toBeNull()
  })
})

// ─── gallery ──────────────────────────────────────────────────────────────────

describe('glass variant 仕様 – gallery', () => {
  it('glass variant のサムネイルに 1px solid rgba(255,255,255,0.75) が設定される', () => {
    const { container } = render(
      galleryComponent.CardItem!({
        value: { enabled: true, images: [null, null, null], base64: ['data:image/png;base64,a', null, null] },
        ctx: CTX,
        variant: 'glass',
      })
    )
    const el = findGlassEl(container)
    expect(el).not.toBeNull()
    expect(el!.style.border).toBe(GLASS_BORDER)
  })

  it('glass variant のサムネイルに boxShadow が設定される', () => {
    const { container } = render(
      galleryComponent.CardItem!({
        value: { enabled: true, images: [null, null, null], base64: ['data:image/png;base64,a', null, null] },
        ctx: CTX,
        variant: 'glass',
      })
    )
    const el = findGlassEl(container)
    expect(el!.style.boxShadow).toBe(GLASS_SHADOW)
  })

  it('default variant には glass border がない', () => {
    const { container } = render(
      galleryComponent.CardItem!({
        value: { enabled: true, images: [null, null, null], base64: ['data:image/png;base64,a', null, null] },
        ctx: CTX,
        variant: 'default',
      })
    )
    expect(findGlassEl(container)).toBeNull()
  })
})

// ─── simpleSns ────────────────────────────────────────────────────────────────

describe('glass variant 仕様 – simpleSns', () => {
  it('glass variant のルート div に background rgba(255,255,255,0.55) が設定される', () => {
    const { container } = render(
      simpleSnsComponent.CardItem!({
        value: 'testuser',
        ctx: CTX,
        variant: 'glass',
        blockConfig: { platform: 'vrchat' },
      })
    )
    const el = Array.from(container.querySelectorAll<HTMLElement>('div')).find(
      d => d.style.background?.includes('rgba(255, 255, 255, 0.55)')
    )
    expect(el).not.toBeNull()
  })

  it('glass variant のルート div に 1px border が設定される', () => {
    const { container } = render(
      simpleSnsComponent.CardItem!({
        value: 'testuser',
        ctx: CTX,
        variant: 'glass',
        blockConfig: { platform: 'vrchat' },
      })
    )
    const el = findGlassEl(container)
    expect(el).not.toBeNull()
    expect(el!.style.border).toBe(GLASS_BORDER)
  })

  it('glass variant のルート div に boxShadow が設定される', () => {
    const { container } = render(
      simpleSnsComponent.CardItem!({
        value: 'testuser',
        ctx: CTX,
        variant: 'glass',
        blockConfig: { platform: 'vrchat' },
      })
    )
    const el = findGlassEl(container)
    expect(el!.style.boxShadow).toBe(GLASS_SHADOW)
  })
})

// ─── snsWithFriendPolicy ──────────────────────────────────────────────────────

describe('glass variant 仕様 – snsWithFriendPolicy', () => {
  const VALUE = { id: 'testuser', friendPolicy: 'frPolicyAnyone' }
  const BLOCK_CONFIG = {
    platform: 'vrchat',
    policies: [{ value: 'frPolicyAnyone', label: 'だれでもOK', icon: 'TbHeart' }],
  }

  it('glass variant のルート div に background rgba(255,255,255,0.55) が設定される', () => {
    const { container } = render(
      snsWithFriendPolicyComponent.CardItem!({
        value: VALUE,
        ctx: CTX,
        variant: 'glass',
        blockConfig: BLOCK_CONFIG,
      })
    )
    const el = Array.from(container.querySelectorAll<HTMLElement>('div')).find(
      d => d.style.background?.includes('rgba(255, 255, 255, 0.55)')
    )
    expect(el).not.toBeNull()
  })

  it('glass variant のルート div に 1px border が設定される', () => {
    const { container } = render(
      snsWithFriendPolicyComponent.CardItem!({
        value: VALUE,
        ctx: CTX,
        variant: 'glass',
        blockConfig: BLOCK_CONFIG,
      })
    )
    const el = findGlassEl(container)
    expect(el).not.toBeNull()
    expect(el!.style.border).toBe(GLASS_BORDER)
  })

  it('glass variant のルート div に boxShadow が設定される', () => {
    const { container } = render(
      snsWithFriendPolicyComponent.CardItem!({
        value: VALUE,
        ctx: CTX,
        variant: 'glass',
        blockConfig: BLOCK_CONFIG,
      })
    )
    const el = findGlassEl(container)
    expect(el!.style.boxShadow).toBe(GLASS_SHADOW)
  })
})

// ─── bgVariant: "glass" を使うコンポーネント群 ────────────────────────────────
//
// BG_VARIANT_STYLE.glass を経由して background / border / boxShadow を適用するコンポーネント。
// これらは variant ではなく bgVariant で glass スタイルを受け取る。

function findBgGlassEl(container: HTMLElement): HTMLElement | null {
  return Array.from(container.querySelectorAll<HTMLElement>('div')).find(
    el => el.style.background?.includes('rgba(255, 255, 255, 0.55)')
  ) ?? null
}

function expectGlassStyle(el: HTMLElement | null) {
  expect(el).not.toBeNull()
  expect(el!.style.background).toContain('rgba(255, 255, 255, 0.55)')
  expect(el!.style.border).toBe(GLASS_BORDER)
  expect(el!.style.boxShadow).toBe(GLASS_SHADOW)
}

// ─── gender ───────────────────────────────────────────────────────────────────

describe('bgVariant: glass 仕様 – gender', () => {
  it('bgVariant glass で background / border / boxShadow が設定される', () => {
    const { container } = render(
      genderComponent.CardItem!({ value: 'female', ctx: CTX, bgVariant: 'glass' })
    )
    expectGlassStyle(findBgGlassEl(container))
  })
  it('bgVariant transparent では glass スタイルがつかない', () => {
    const { container } = render(
      genderComponent.CardItem!({ value: 'female', ctx: CTX, bgVariant: 'transparent' })
    )
    expect(findBgGlassEl(container)).toBeNull()
  })
})

// ─── age ──────────────────────────────────────────────────────────────────────

describe('bgVariant: glass 仕様 – age', () => {
  it('bgVariant glass で background / border / boxShadow が設定される', () => {
    const { container } = render(
      ageComponent.CardItem!({
        value: { searchTag: '18+', display: '20代' },
        ctx: CTX,
        bgVariant: 'glass',
        label: { text: '年齢', dir: 'row' },
      })
    )
    expectGlassStyle(findBgGlassEl(container))
  })
})

// ─── language ─────────────────────────────────────────────────────────────────

describe('bgVariant: glass 仕様 – language', () => {
  it('variant slash + bgVariant glass で background / border / boxShadow が設定される', () => {
    const { container } = render(
      languageComponent.CardItem!({
        value: { preset: ['ja'], custom: [] },
        ctx: CTX,
        variant: 'slash',
        bgVariant: 'glass',
        label: { text: '言語', dir: 'row' },
      })
    )
    expectGlassStyle(findBgGlassEl(container))
  })
})

// ─── gauge ────────────────────────────────────────────────────────────────────

describe('bgVariant: glass 仕様 – gauge', () => {
  it('bgVariant glass で background / border / boxShadow が設定される', () => {
    const { container } = render(
      gaugeComponent.CardItem!({
        value: 70,
        ctx: CTX,
        bgVariant: 'glass',
        label: { text: 'ON', dir: 'row' },
        blockConfig: { unit: '%' },
      })
    )
    expectGlassStyle(findBgGlassEl(container))
  })
})

// ─── multiSelect ──────────────────────────────────────────────────────────────

describe('bgVariant: glass 仕様 – multiSelect', () => {
  it('variant icon-slash + bgVariant glass で background / border / boxShadow が設定される', () => {
    const { container } = render(
      multiSelectComponent.CardItem!({
        value: ['pcvr'],
        ctx: CTX,
        variant: 'icon-slash',
        bgVariant: 'glass',
        label: { text: '環境', dir: 'row' },
        blockConfig: { options: [{ value: 'pcvr', label: 'PCVR', icon: 'TbBadgeVr' }] },
      })
    )
    expectGlassStyle(findBgGlassEl(container))
  })
})

// ─── text ─────────────────────────────────────────────────────────────────────

describe('bgVariant: glass 仕様 – text', () => {
  it('bgVariant glass で background / border / boxShadow が設定される', () => {
    const { container } = render(
      textComponent.CardItem!({
        value: 'テスト',
        ctx: CTX,
        bgVariant: 'glass',
      })
    )
    expectGlassStyle(findBgGlassEl(container))
  })
})

// ─── select ───────────────────────────────────────────────────────────────────

describe('bgVariant: glass 仕様 – select', () => {
  it('bgVariant glass で background / border / boxShadow が設定される', () => {
    const { container } = render(
      selectComponent.CardItem!({
        value: 'user',
        ctx: CTX,
        bgVariant: 'glass',
        label: { text: 'ランク', dir: 'row' },
        blockConfig: { options: [{ value: 'user', label: 'User', icon: 'TbShield' }] },
      })
    )
    expectGlassStyle(findBgGlassEl(container))
  })
})
