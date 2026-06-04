import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import GenericCardRenderer from '../GenericCardRenderer'
import type { TemplateDefinition } from '@/blocks/types'

/** テキストを含むブロックを持つテンプレート定義を組み立てるヘルパー */
function makeBlockDefinition(blockProps: Partial<{
  label: string; labelColor: string; labelInset: boolean; subLabel: string
}>): TemplateDefinition {
  return {
    id: 'test',
    label: 'test',
    theme: { accent: '#00AADB', text: '#1f2937', subText: '#9ca3af', bg: '#fff' },
    fontFamily: 'sans-serif',
    borderRadius: 0,
    card: {
      cardWidth: 900,
      cardHeight: 500,
      grid: { cellSize: 10, gap: 4 },
      layout: {
        type: 'block',
        componentKey: 'text',
        dataKey: 'name',
        ...blockProps,
      },
    },
  }
}

const DEFAULT_WEB: TemplateDefinition['web'] = {
  cardWidth: 630,
  autoHeight: true,
  grid: { cellSize: 10, gap: 4 },
  layout: { type: 'col', children: [] },
}

/** 最小限のテンプレート定義を組み立てるヘルパー */
function makeDefinition(layout: TemplateDefinition['card']['layout']): TemplateDefinition {
  return {
    id: 'test',
    label: 'test',
    theme: { accent: '#00AADB', text: '#1f2937', subText: '#9ca3af', bg: '#fff' },
    fontFamily: 'sans-serif',
    borderRadius: 0,
    card: {
      cardWidth: 900,
      cardHeight: 500,
      grid: { cellSize: 10, gap: 4 },
      layout,
    },
    web: DEFAULT_WEB,
  }
}

describe('GenericCardRenderer – labelIcon（アイコンプレフィックス）', () => {
  it('col: labelIcon を指定するとラベル行に svg が描画される', () => {
    const def = makeDefinition({
      type: 'col',
      label: 'SECTION',
      labelIcon: 'TbMicrophone',
      children: [],
    })
    const { container } = render(
      <GenericCardRenderer definition={def} values={{}} transparentBackground />
    )
    // アイコンは svg として描画される
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('col: labelIcon 未指定のとき svg が描画されない', () => {
    const def = makeDefinition({
      type: 'col',
      label: 'SECTION',
      children: [],
    })
    const { container } = render(
      <GenericCardRenderer definition={def} values={{}} transparentBackground />
    )
    expect(container.querySelector('svg')).toBeNull()
  })

  it('block(labelInset:false): labelIcon を指定するとラベル行に svg が描画される', () => {
    const def = makeBlockDefinition({ label: 'NAME', labelIcon: 'TbMicrophone', labelInset: false })
    const { container } = render(
      <GenericCardRenderer definition={def} values={{ name: 'テスト' }} transparentBackground />
    )
    expect(container.querySelector('svg')).not.toBeNull()
  })
})

describe('GenericCardRenderer – block labelInset:false のラベル色', () => {
  it('labelColor を指定するとラベル span にその色が反映される', () => {
    const def = makeBlockDefinition({ label: 'NAME', labelColor: '#ff0000', labelInset: false })
    const { container } = render(
      <GenericCardRenderer definition={def} values={{ name: 'テスト' }} transparentBackground />
    )
    const labelSpan = container.querySelector('span') as HTMLElement
    expect(labelSpan).not.toBeNull()
    expect(labelSpan.textContent).toBe('NAME')
    expect(labelSpan.style.color).toBe('#ff0000')
  })

  it('labelColor 未指定のとき theme.text 色が使われる', () => {
    const def = makeBlockDefinition({ label: 'NAME', labelInset: false })
    const { container } = render(
      <GenericCardRenderer definition={def} values={{ name: 'テスト' }} transparentBackground />
    )
    const labelSpan = container.querySelector('span') as HTMLElement
    expect(labelSpan.style.color).toBe('#1f2937')
  })
})

describe('GenericCardRenderer – col / row ラベル色', () => {
  it('col: labelColor を指定するとラベル span にその色が反映される', () => {
    const def = makeDefinition({
      type: 'col',
      label: 'SECTION',
      labelColor: '#ff0000',
      children: [],
    })
    const { container } = render(
      <GenericCardRenderer definition={def} values={{}} transparentBackground />
    )
    const labelSpan = container.querySelector('span') as HTMLElement
    expect(labelSpan).not.toBeNull()
    expect(labelSpan.textContent).toBe('SECTION')
    expect(labelSpan.style.color).toBe('#ff0000')
  })

  it('col: labelColor 未指定のとき theme.text 色が使われる', () => {
    const def = makeDefinition({
      type: 'col',
      label: 'SECTION',
      children: [],
    })
    const { container } = render(
      <GenericCardRenderer definition={def} values={{}} transparentBackground />
    )
    const labelSpan = container.querySelector('span') as HTMLElement
    expect(labelSpan.style.color).toBe('#1f2937')
  })

  it('row: labelColor を指定するとラベル span にその色が反映される', () => {
    const def = makeDefinition({
      type: 'row',
      label: 'ROW LABEL',
      labelColor: '#0000ff',
      children: [],
    })
    const { container } = render(
      <GenericCardRenderer definition={def} values={{}} transparentBackground />
    )
    const labelSpan = container.querySelector('span') as HTMLElement
    expect(labelSpan).not.toBeNull()
    expect(labelSpan.textContent).toBe('ROW LABEL')
    expect(labelSpan.style.color).toBe('#0000ff')
  })

  it('row: labelColor 未指定のとき theme.text 色が使われる', () => {
    const def = makeDefinition({
      type: 'row',
      label: 'ROW LABEL',
      children: [],
    })
    const { container } = render(
      <GenericCardRenderer definition={def} values={{}} transparentBackground />
    )
    const labelSpan = container.querySelector('span') as HTMLElement
    expect(labelSpan.style.color).toBe('#1f2937')
  })
})
