import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import GenericCardRenderer from '../GenericCardRenderer'
import type { TemplateDefinition } from '@/blocks/types'

function makeDefinition(layout: TemplateDefinition['card']['layout']): TemplateDefinition {
  return {
    id: 'test',
    label: 'test',
    theme: { accent: '#00AADB', text: '#1f2937', subText: '#9ca3af', bg: '#fff' },
    fontFamily: 'sans-serif',
    borderRadius: 0,
    card: { cardWidth: 900, cardHeight: 500, grid: { cellSize: 10, gap: 4 }, layout },
    web:  { cardWidth: 630, cardHeight: 900, grid: { cellSize: 10, gap: 4 }, layout },
  }
}

describe('GenericCardRenderer – dataKey なし Block', () => {
  it('dataKey を省略した block ノードがクラッシュせずレンダリングされる', () => {
    const def = makeDefinition({
      type: 'col',
      children: [
        { type: 'block', componentKey: 'text', dataKey: 'name', variant: 'simple' },
        { type: 'block', componentKey: 'divider', variant: 'horizontal' },
        { type: 'block', componentKey: 'text', dataKey: 'bio', variant: 'simple' },
      ],
    })
    expect(() =>
      render(
        <GenericCardRenderer
          definition={def}
          values={{ name: 'テスト', bio: '自己紹介' }}
          noBackground
          orientation="card"
        />
      )
    ).not.toThrow()
  })

  it('dataKey なし block は values を参照せずデフォルト値で描画される', () => {
    const def = makeDefinition({
      type: 'block',
      componentKey: 'divider',
      variant: 'horizontal',
      // dataKey 省略
    })
    const { container } = render(
      <GenericCardRenderer
        definition={def}
        values={{}}
        noBackground
        orientation="card"
      />
    )
    expect(container.firstChild).not.toBeNull()
  })

  it('dataKey なし block が混在しても他のブロックのデータは正常に描画される', () => {
    const def = makeDefinition({
      type: 'col',
      children: [
        { type: 'block', componentKey: 'text', dataKey: 'name', variant: 'simple' },
        { type: 'block', componentKey: 'divider', variant: 'horizontal' },
      ],
    })
    const { getByText } = render(
      <GenericCardRenderer
        definition={def}
        values={{ name: 'ユーザー名' }}
        noBackground
        orientation="card"
      />
    )
    expect(getByText('ユーザー名')).toBeTruthy()
  })
})
