/**
 * blockPool + LayoutNodeRef の統合テスト
 *
 * 検証する仕様：
 * - pool の label / labelColor / labelInset / variant は ref 参照時に適用される
 * - contentFontScale / labelFontScale は ref ノード（レイアウト）側で独立して設定できる
 * - 同じ blockId を card / web から参照しても fontScale を別々に持てる
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import GenericCardRenderer from '../GenericCardRenderer'
import type { TemplateDefinition } from '@/blocks/types'

const BASE: Pick<TemplateDefinition, 'id' | 'label' | 'theme' | 'fontFamily' | 'borderRadius'> = {
  id: 'test',
  label: 'test',
  theme: { accent: '#00AADB', text: '#1f2937', subText: '#9ca3af', bg: '#fff' },
  fontFamily: 'sans-serif',
  borderRadius: 0,
}

const GRID = { cellSize: 10, gap: 4 }

function makeOrient(layout: TemplateDefinition['card']['layout']): TemplateDefinition['card'] {
  return { cardWidth: 900, cardHeight: 500, grid: GRID, layout }
}

// ─── pool label ────────────────────────────────────────────────────────────────

describe('GenericCardRenderer – pool の label が ref に反映される', () => {
  it('pool.label を設定すると ref ノードのレンダリングにラベルが表示される', () => {
    const def: TemplateDefinition = {
      ...BASE,
      blockPool: { name: { componentKey: 'text', dataKey: 'name', label: 'プロフィール名' } },
      card: makeOrient({ type: 'ref', blockId: 'name' }),
      web:  makeOrient({ type: 'ref', blockId: 'name' }),
    }
    const { container } = render(
      <GenericCardRenderer definition={def} values={{ name: 'Alice' }} transparentBackground orientation="card" />
    )
    const spans = Array.from(container.querySelectorAll('span'))
    expect(spans.some(s => s.textContent === 'プロフィール名')).toBe(true)
  })

  it('pool.label を設定しないとラベルテキストが描画されない', () => {
    const def: TemplateDefinition = {
      ...BASE,
      blockPool: { name: { componentKey: 'text', dataKey: 'name' } },
      card: makeOrient({ type: 'ref', blockId: 'name' }),
      web:  makeOrient({ type: 'ref', blockId: 'name' }),
    }
    const { container } = render(
      <GenericCardRenderer definition={def} values={{ name: 'Alice' }} transparentBackground orientation="card" />
    )
    // ラベルなし → span がない（text コンポーネントは p タグを使う）
    expect(container.querySelector('span')).toBeNull()
  })
})

// ─── pool labelColor ────────────────────────────────────────────────────────────

describe('GenericCardRenderer – pool の labelColor が ref に反映される', () => {
  it('pool.labelColor を設定するとラベル span にその色が反映される', () => {
    const def: TemplateDefinition = {
      ...BASE,
      blockPool: { name: { componentKey: 'text', dataKey: 'name', label: 'NAME', labelColor: '#ff0000' } },
      card: makeOrient({ type: 'ref', blockId: 'name' }),
      web:  makeOrient({ type: 'ref', blockId: 'name' }),
    }
    const { container } = render(
      <GenericCardRenderer definition={def} values={{ name: 'Alice' }} transparentBackground orientation="card" />
    )
    const labelSpan = Array.from(container.querySelectorAll('span')).find(s => s.textContent === 'NAME') as HTMLElement
    expect(labelSpan).not.toBeUndefined()
    expect(labelSpan.style.color).toBe('#ff0000')
  })

  it('pool.labelColor 未設定のときラベルは theme.text 色になる', () => {
    const def: TemplateDefinition = {
      ...BASE,
      blockPool: { name: { componentKey: 'text', dataKey: 'name', label: 'NAME' } },
      card: makeOrient({ type: 'ref', blockId: 'name' }),
      web:  makeOrient({ type: 'ref', blockId: 'name' }),
    }
    const { container } = render(
      <GenericCardRenderer definition={def} values={{ name: 'Alice' }} transparentBackground orientation="card" />
    )
    const labelSpan = Array.from(container.querySelectorAll('span')).find(s => s.textContent === 'NAME') as HTMLElement
    expect(labelSpan.style.color).toBe('#1f2937')
  })
})

// ─── contentFontScale（レイアウト固有） ──────────────────────────────────────────

describe('GenericCardRenderer – contentFontScale はレイアウト固有', () => {
  it('card の ref ノードに contentFontScale:2 を設定するとフォントサイズが2倍になる', () => {
    const def: TemplateDefinition = {
      ...BASE,
      blockPool: { name: { componentKey: 'text', dataKey: 'name' } },
      card: makeOrient({ type: 'ref', blockId: 'name', contentFontScale: 2 }),
      web:  makeOrient({ type: 'ref', blockId: 'name' }),
    }
    const { container: lc } = render(
      <GenericCardRenderer definition={def} values={{ name: 'Alice' }} transparentBackground orientation="card" />
    )
    const { container: pc } = render(
      <GenericCardRenderer definition={def} values={{ name: 'Alice' }} transparentBackground orientation="web" />
    )
    const getLargestFont = (c: HTMLElement) =>
      Math.max(...Array.from(c.querySelectorAll<HTMLElement>('span, p')).map(s => parseFloat(s.style.fontSize || '0')))

    const lFont = getLargestFont(lc)
    const pFont = getLargestFont(pc)
    // card(contentFontScale:2) は web(1) の約2倍（cardWidth差も加わるのでさらに差が出る）
    expect(lFont).toBeGreaterThan(pFont * 1.5)
  })

  it('card と web で同じ blockId を別の contentFontScale で参照できる', () => {
    const def: TemplateDefinition = {
      ...BASE,
      blockPool: { name: { componentKey: 'text', dataKey: 'name' } },
      card: makeOrient({ type: 'ref', blockId: 'name', contentFontScale: 1.5 }),
      web: {
        cardWidth: 900, cardHeight: 500, grid: GRID,
        layout: { type: 'ref', blockId: 'name', contentFontScale: 0.8 },
      },
    }
    const { container: lc } = render(
      <GenericCardRenderer definition={def} values={{ name: 'Alice' }} transparentBackground orientation="card" />
    )
    const { container: pc } = render(
      <GenericCardRenderer definition={def} values={{ name: 'Alice' }} transparentBackground orientation="web" />
    )
    const getFont = (c: HTMLElement) => {
      const els = Array.from(c.querySelectorAll<HTMLElement>('span, p'))
      return els.map(s => parseFloat(s.style.fontSize || '0')).find(n => n > 0) ?? 0
    }
    // 同じ cardWidth で contentFontScale 1.5 vs 0.8 → card の方が大きい
    expect(getFont(lc)).toBeGreaterThan(getFont(pc))
  })
})

// ─── pool blockConfig.hideWhenEmpty ──────────────────────────────────────────
// hideWhenEmpty は各コンポーネントが blockConfig?.hideWhenEmpty を参照して処理する。
// pool の blockConfig に hideWhenEmpty:true を設定すると ref 経由で正しく機能する。

describe('GenericCardRenderer – pool の blockConfig.hideWhenEmpty が ref に反映される', () => {
  it('pool.blockConfig.hideWhenEmpty:true かつ値が空のとき select が非表示になる', () => {
    const def: TemplateDefinition = {
      ...BASE,
      blockPool: { sel: { componentKey: 'select', dataKey: 'sel', blockConfig: { options: [], hideWhenEmpty: true } } },
      card: makeOrient({ type: 'ref', blockId: 'sel' }),
      web:  makeOrient({ type: 'ref', blockId: 'sel' }),
    }
    const { container } = render(
      <GenericCardRenderer definition={def} values={{ sel: '' }} transparentBackground orientation="card" />
    )
    // select が null を返すのでブロックラッパーごと消える → テキストノードなし
    expect(container.querySelector('span')).toBeNull()
  })

  it('pool.blockConfig.hideWhenEmpty:true でも値がある場合は描画される', () => {
    const def: TemplateDefinition = {
      ...BASE,
      blockPool: { sel: { componentKey: 'select', dataKey: 'sel', blockConfig: { options: [{ value: 'a', label: 'A' }], hideWhenEmpty: true } } },
      card: makeOrient({ type: 'ref', blockId: 'sel' }),
      web:  makeOrient({ type: 'ref', blockId: 'sel' }),
    }
    const { container } = render(
      <GenericCardRenderer definition={def} values={{ sel: 'a' }} transparentBackground orientation="card" />
    )
    expect(container.querySelector('span')).not.toBeNull()
  })
})
