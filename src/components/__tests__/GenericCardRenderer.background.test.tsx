/**
 * 背景リファクタの不変条件テスト
 *
 * 変更前の挙動（今は通らない）を先に記述し、
 * 実装後にすべて green になることを確認する。
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import GenericCardRenderer from '../GenericCardRenderer'
import type { TemplateDefinition, BackgroundValue } from '@/blocks/types'

const BASE_DEFINITION: TemplateDefinition = {
  id: 'test',
  label: 'test',
  theme: { accent: '#00AADB', text: '#1f2937', subText: '#9ca3af', bg: '#fff' },
  fontFamily: 'sans-serif',
  borderRadius: 0,
  backgroundKey: 'background',
  card: {
    cardWidth: 900,
    cardHeight: 500,
    grid: { cellSize: 10, gap: 4 },
    layout: { type: 'col', children: [] },
  },
  web: {
    cardWidth: 630,
    autoHeight: true,
    grid: { cellSize: 10, gap: 4 },
    layout: { type: 'col', children: [] },
  },
}

const RED_BG: BackgroundValue = { type: 'color', value: '#ff0000' }
const BLUE_BG: BackgroundValue = { type: 'color', value: '#0000ff' }

describe('GenericCardRenderer — background prop のみ有効（backgroundKey は無視）', () => {
  it('background prop を渡した場合、その色がカードに適用される', () => {
    const { container } = render(
      <GenericCardRenderer
        definition={BASE_DEFINITION}
        orientation="card"
        values={{}}
        background={RED_BG}
      />
    )
    const card = container.firstElementChild as HTMLElement
    expect(card?.style.background).toContain('#ff0000')
  })

  it('background prop がなければカードは transparent', () => {
    const { container } = render(
      <GenericCardRenderer
        definition={BASE_DEFINITION}
        orientation="card"
        values={{}}
      />
    )
    const card = container.firstElementChild as HTMLElement
    // background prop なし → transparent（bgValueなし）
    expect(card?.style.background).not.toContain('#ff0000')
    expect(card?.style.background).not.toContain('#0000ff')
  })

  it('values に backgroundKey のデータが入っていても無視する', () => {
    const { container } = render(
      <GenericCardRenderer
        definition={BASE_DEFINITION}
        orientation="card"
        // backgroundKey = 'background' のデータを values に渡す
        values={{ background: BLUE_BG }}
      />
    )
    const card = container.firstElementChild as HTMLElement
    // values から読まないので青は適用されない
    expect(card?.style.background).not.toContain('#0000ff')
  })

  it('background prop が values の backgroundKey より優先される', () => {
    const { container } = render(
      <GenericCardRenderer
        definition={BASE_DEFINITION}
        orientation="card"
        values={{ background: BLUE_BG }}
        background={RED_BG}
      />
    )
    const card = container.firstElementChild as HTMLElement
    expect(card?.style.background).toContain('#ff0000')
    expect(card?.style.background).not.toContain('#0000ff')
  })
})
