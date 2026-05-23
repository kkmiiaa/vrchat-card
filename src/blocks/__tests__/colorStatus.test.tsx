import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { colorStatusComponent } from '../colorStatus'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

const FIELDS = [
  { key: 'blue', label: '募集中', color: '#60a5fa' },
  { key: 'green', label: 'イベント中', color: '#4ade80' },
]

describe('colorStatus', () => {
  it('1. defaultValue は {} (空オブジェクト)', () => {
    expect(colorStatusComponent.defaultValue).toEqual({})
  })

  it('2. blockConfig.fields でラベルと色が表示される', () => {
    render(
      colorStatusComponent.FormItem!({
        value: {},
        onChange: () => {},
        t: {} as never,
        blockConfig: { fields: FIELDS },
      })
    )
    expect(screen.getByText('募集中')).toBeInTheDocument()
    expect(screen.getByText('イベント中')).toBeInTheDocument()
  })

  it('4. テキストを入力すると { [key]: 入力値 } が onChange に渡される', () => {
    const onChange = vi.fn()
    render(
      colorStatusComponent.FormItem!({
        value: {},
        onChange,
        t: {} as never,
        blockConfig: { fields: FIELDS },
      })
    )
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: '募集中' } })
    expect(onChange).toHaveBeenCalledWith({ blue: '募集中' })
  })

  it('7. card_data の値の型は Record<string, string>', () => {
    expect(typeof colorStatusComponent.defaultValue).toBe('object')
  })

  it('10. CardItem: 選択済み値が描画される', () => {
    render(
      colorStatusComponent.CardItem!({
        value: { blue: '募集中' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { fields: FIELDS },
      })
    )
    expect(screen.getByText('募集中')).toBeInTheDocument()
  })

  it('11. CardItem: 空オブジェクトはエラーなく描画される', () => {
    expect(() =>
      render(
        colorStatusComponent.CardItem!({
          value: {},
          ctx: DEFAULT_CARD_RENDER_CONTEXT,
          blockConfig: { fields: FIELDS },
        })
      )
    ).not.toThrow()
  })

  it('12. cards variant でコンテンツが描画される', () => {
    render(
      colorStatusComponent.CardItem!({
        value: { blue: '募集中テキスト' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        variant: 'cards',
        blockConfig: { fields: FIELDS },
      })
    )
    expect(screen.getByText('募集中テキスト')).toBeInTheDocument()
  })

  it('13. cards variant の各アイテムに白背景が設定されている', () => {
    const { container } = render(
      colorStatusComponent.CardItem!({
        value: { blue: '募集中' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        variant: 'cards',
        blockConfig: { fields: FIELDS },
      })
    )
    // cards variant のアイテム自体が白背景を持つ（外側の glass ラッパーは不要）
    const itemDivs = container.querySelectorAll('div > div')
    const hasWhiteBg = Array.from(itemDivs).some(div =>
      (div as HTMLElement).style.background.includes('rgba(255')
    )
    expect(hasWhiteBg).toBe(true)
  })

  it('14. cards variant は variants 配列に含まれる', () => {
    expect(colorStatusComponent.variants).toContain('cards')
  })
})
