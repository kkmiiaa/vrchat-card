import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import GenericCardRenderer from '../GenericCardRenderer'
import type { TemplateDefinition } from '@/blocks/types'

function makeDefinition(overrides: Partial<TemplateDefinition> = {}): TemplateDefinition {
  return {
    id: 'test',
    label: 'test',
    theme: { accent: '#00AADB', text: '#1f2937', subText: '#9ca3af', bg: '#fff' },
    fontFamily: 'sans-serif',
    borderRadius: 0,
    landscape: {
      cardWidth: 900,
      cardHeight: 500,
      grid: { cellSize: 10, gap: 4 },
      layout: {
        type: 'block',
        componentKey: 'profileImage',
        dataKey: 'profileImage',
      },
    },
    portrait: {
      cardWidth: 630,
      cardHeight: 900,
      grid: { cellSize: 10, gap: 4 },
      layout: {
        type: 'block',
        componentKey: 'profileImage',
        dataKey: 'profileImage',
      },
    },
    ...overrides,
  }
}

// ─── pool variant ──────────────────────────────────────────────────────────────

describe('GenericCardRenderer – pool variant', () => {
  it('pool エントリの variant が ref ノードに適用される', () => {
    const def = makeDefinition({
      blockPool: { img: { componentKey: 'profileImage', dataKey: 'profileImage', variant: 'glass' } },
      landscape: {
        cardWidth: 900, cardHeight: 500, grid: { cellSize: 10, gap: 4 },
        layout: { type: 'ref', blockId: 'img' },
      },
    })
    const { container } = render(
      <GenericCardRenderer definition={def} values={{ profileImage: { base64: null, url: null } }} noBackground orientation="landscape" />
    )
    const hasBorder = Array.from(container.querySelectorAll('div')).some(d => d.style.border?.includes('rgba(255, 255, 255, 0.75)'))
    expect(hasBorder).toBe(true)
  })

  it('variant は pool で固定され、2つのレイアウトで同じ ref を参照しても同じ variant が適用される', () => {
    const def = makeDefinition({
      blockPool: { img: { componentKey: 'profileImage', dataKey: 'profileImage', variant: 'glass' } },
      landscape: {
        cardWidth: 900, cardHeight: 500, grid: { cellSize: 10, gap: 4 },
        layout: { type: 'ref', blockId: 'img' },
      },
      portrait: {
        cardWidth: 630, cardHeight: 900, grid: { cellSize: 10, gap: 4 },
        layout: { type: 'ref', blockId: 'img' },
      },
    })
    const { container: lc } = render(
      <GenericCardRenderer definition={def} values={{ profileImage: { base64: null, url: null } }} noBackground orientation="landscape" />
    )
    const { container: pc } = render(
      <GenericCardRenderer definition={def} values={{ profileImage: { base64: null, url: null } }} noBackground orientation="portrait" />
    )
    const hasGlassL = Array.from(lc.querySelectorAll('div')).some(d => d.style.border?.includes('rgba(255, 255, 255, 0.75)'))
    const hasGlassP = Array.from(pc.querySelectorAll('div')).some(d => d.style.border?.includes('rgba(255, 255, 255, 0.75)'))
    expect(hasGlassL).toBe(true)
    expect(hasGlassP).toBe(true)
  })
})

// ─── glass プロパティ削除の確認 ──────────────────────────────────────────────

describe('GenericCardRenderer – glass プロパティは無効化済み', () => {
  it('ノードに glass: true があっても GenericCardRenderer はガラス枠を追加しない', () => {
    const def: TemplateDefinition = {
      ...makeDefinition(),
      landscape: {
        cardWidth: 900,
        cardHeight: 500,
        grid: { cellSize: 10, gap: 4 },
        layout: {
          type: 'block',
          componentKey: 'text',
          dataKey: 'name',
          // @ts-expect-error - 削除済みプロパティのテスト
          glass: true,
        },
      },
    }
    const { container } = render(
      <GenericCardRenderer definition={def} values={{ name: 'テスト' }} noBackground />
    )
    // GenericCardRenderer 由来のガラス枠スタイルが付いていないことを確認
    // （rgba(255,255,255,0.55) の background がない）
    const hasGlassBg = Array.from(container.querySelectorAll('div')).some(
      d => d.style.background?.includes('rgba(255, 255, 255, 0.55)')
    )
    expect(hasGlassBg).toBe(false)
  })
})
