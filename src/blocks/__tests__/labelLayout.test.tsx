import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'
import type { LabelDef } from '../types'
import { languageComponent } from '../language'
import { ageComponent } from '../age'
import { genderComponent } from '../gender'
import { ratingComponent } from '../rating'
import { gaugeComponent } from '../gauge'
import { selectComponent } from '../select'
import { textComponent } from '../text'
import { multiSelectComponent } from '../multiSelect'
import { colorStatusComponent } from '../colorStatus'

const ctx = DEFAULT_CARD_RENDER_CONTEXT

const colLabel: LabelDef = { text: 'テスト', dir: 'col' }
const rowLabel: LabelDef = { text: 'テスト', dir: 'row' }

/** コンポーネントのルートコンテナの style を返す */
function getRootStyle(container: HTMLElement): CSSStyleDeclaration {
  return (container.firstChild as HTMLElement).style
}

describe('labelInset dir: col（デフォルト）', () => {
  it('language(slash): dir=col → flex-direction: column', () => {
    const { container } = render(
      languageComponent.CardItem!({
        value: { preset: ['日本語'], custom: [] },
        ctx,
        variant: 'slash',
        label: colLabel,
      })
    )
    expect(getRootStyle(container).flexDirection).toBe('column')
  })

  it('age: dir=col → flex-direction: column', () => {
    const { container } = render(
      ageComponent.CardItem!({
        value: { searchTag: '18+', display: '20代' },
        ctx,
        label: colLabel,
      })
    )
    expect(getRootStyle(container).flexDirection).toBe('column')
  })

  it('rating: dir=col → flex-direction: column, alignItems: stretch', () => {
    const { container } = render(
      ratingComponent.CardItem!({
        value: 60,
        ctx,
        label: colLabel,
      })
    )
    const style = getRootStyle(container)
    expect(style.flexDirection).toBe('column')
    expect(style.alignItems).toBe('stretch')
  })
})

describe('labelInset dir: row（横並び）', () => {
  it('language(slash): dir=row → flex-direction: row', () => {
    const { container } = render(
      languageComponent.CardItem!({
        value: { preset: ['日本語'], custom: [] },
        ctx,
        variant: 'slash',
        label: rowLabel,
      })
    )
    expect(getRootStyle(container).flexDirection).toBe('row')
  })

  it('age: dir=row → flex-direction: row', () => {
    const { container } = render(
      ageComponent.CardItem!({
        value: { searchTag: '18+', display: '20代' },
        ctx,
        label: rowLabel,
      })
    )
    expect(getRootStyle(container).flexDirection).toBe('row')
  })

  it('gender: dir=row → flex-direction: row', () => {
    const { container } = render(
      genderComponent.CardItem!({
        value: { tag: 'female', display: '女性' },
        ctx,
        label: rowLabel,
      })
    )
    expect(getRootStyle(container).flexDirection).toBe('row')
  })

  it('rating: dir=row → flex-direction: row', () => {
    const { container } = render(
      ratingComponent.CardItem!({
        value: 60,
        ctx,
        label: rowLabel,
      })
    )
    expect(getRootStyle(container).flexDirection).toBe('row')
  })

  it('gauge: dir=row → flex-direction: row', () => {
    const { container } = render(
      gaugeComponent.CardItem!({
        value: 80,
        ctx,
        label: rowLabel,
      })
    )
    expect(getRootStyle(container).flexDirection).toBe('row')
  })

  it('select: dir=row → flex-direction: row', () => {
    const { container } = render(
      selectComponent.CardItem!({
        value: 'a',
        ctx,
        label: rowLabel,
        blockConfig: { options: [{ value: 'a', label: 'アイテムA' }] },
      })
    )
    expect(getRootStyle(container).flexDirection).toBe('row')
  })

  it('text: dir=row → flex-direction: row', () => {
    const { container } = render(
      textComponent.CardItem!({
        value: 'サンプルテキスト',
        ctx,
        label: rowLabel,
      })
    )
    expect(getRootStyle(container).flexDirection).toBe('row')
  })

  it('multiSelect(slash): dir=row → flex-direction: row', () => {
    const { container } = render(
      multiSelectComponent.CardItem!({
        value: ['a', 'b'],
        ctx,
        variant: 'slash',
        label: rowLabel,
      })
    )
    expect(getRootStyle(container).flexDirection).toBe('row')
  })

  it('colorStatus: dir=row → flex-direction: row', () => {
    const { container } = render(
      colorStatusComponent.CardItem!({
        value: { blue: 'OK', green: '', yellow: '', red: '' },
        ctx,
        label: rowLabel,
        blockConfig: { fields: [{ key: 'blue', label: 'A', color: '#60a5fa' }] },
      })
    )
    expect(getRootStyle(container).flexDirection).toBe('row')
  })
})

describe('labelInset dir: row – 単行コンポーネントは縦方向センタリング', () => {
  const singleLineComponents: Array<{ name: string; node: React.ReactNode }> = [
    {
      name: 'age',
      node: ageComponent.CardItem!({ value: { searchTag: '18+', display: '20代' }, ctx, label: rowLabel }),
    },
    {
      name: 'gender',
      node: genderComponent.CardItem!({ value: { tag: 'female', display: '女性' }, ctx, label: rowLabel }),
    },
    {
      name: 'rating',
      node: ratingComponent.CardItem!({ value: 60, ctx, label: rowLabel }),
    },
    {
      name: 'gauge',
      node: gaugeComponent.CardItem!({ value: 80, ctx, label: rowLabel }),
    },
    {
      name: 'language(slash)',
      node: languageComponent.CardItem!({ value: { preset: ['日本語'], custom: [] }, ctx, variant: 'slash', label: rowLabel }),
    },
  ]

  for (const { name, node } of singleLineComponents) {
    it(`${name}: dir=row → alignItems: center`, () => {
      const { container } = render(node)
      expect(getRootStyle(container).alignItems).toBe('center')
    })
  }
})
