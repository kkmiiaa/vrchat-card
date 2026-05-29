import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { expressiveSelectComponent, DEFAULT_EXPRESSIVE_SELECT_VALUE } from '../expressiveSelect'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

const OPTIONS = [
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
]

describe('expressiveSelect', () => {
  it('defaultValue は { tag: "", display: "" }', () => {
    expect(expressiveSelectComponent.defaultValue).toEqual({ tag: '', display: '' })
  })

  it('blockConfig.options の選択肢ボタンが描画される', () => {
    render(
      expressiveSelectComponent.FormItem!({
        value: DEFAULT_EXPRESSIVE_SELECT_VALUE,
        onChange: () => {},
        t: {} as never,
        blockConfig: { options: OPTIONS },
      })
    )
    expect(screen.getByText('男性')).toBeInTheDocument()
    expect(screen.getByText('女性')).toBeInTheDocument()
  })

  it('blockConfig.allowNone=true のとき「回答なし」選択肢が表示される', () => {
    render(
      expressiveSelectComponent.FormItem!({
        value: DEFAULT_EXPRESSIVE_SELECT_VALUE,
        onChange: () => {},
        t: {} as never,
        blockConfig: { options: OPTIONS, allowNone: true },
      })
    )
    expect(screen.getByText('回答なし')).toBeInTheDocument()
  })

  it('blockConfig.allowNone が未設定のとき「回答なし」は表示されない', () => {
    render(
      expressiveSelectComponent.FormItem!({
        value: DEFAULT_EXPRESSIVE_SELECT_VALUE,
        onChange: () => {},
        t: {} as never,
        blockConfig: { options: OPTIONS },
      })
    )
    expect(screen.queryByText('回答なし')).toBeNull()
  })

  it('「回答なし」を選択すると { tag: "", display: "" } が onChange に渡される', () => {
    const onChange = vi.fn()
    render(
      expressiveSelectComponent.FormItem!({
        value: { tag: 'male', display: '' },
        onChange,
        t: {} as never,
        blockConfig: { options: OPTIONS, allowNone: true },
      })
    )
    fireEvent.click(screen.getByText('回答なし'))
    expect(onChange).toHaveBeenCalledWith({ tag: '', display: '' })
  })

  it('選択肢をクリックすると { tag: value, display: "" } が onChange に渡される', () => {
    const onChange = vi.fn()
    render(
      expressiveSelectComponent.FormItem!({
        value: DEFAULT_EXPRESSIVE_SELECT_VALUE,
        onChange,
        t: {} as never,
        blockConfig: { options: OPTIONS },
      })
    )
    fireEvent.click(screen.getByText('女性'))
    expect(onChange).toHaveBeenCalledWith({ tag: 'female', display: '' })
  })

  it('CardItem: tag と display が描画される', () => {
    render(
      expressiveSelectComponent.CardItem!({
        value: { tag: 'female', display: 'ふわふわ系' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { options: OPTIONS },
      })
    )
    expect(screen.getByText('ふわふわ系')).toBeInTheDocument()
  })

  it('CardItem: 未入力値はエラーなく描画される', () => {
    expect(() =>
      render(
        expressiveSelectComponent.CardItem!({
          value: { tag: '', display: '' },
          ctx: DEFAULT_CARD_RENDER_CONTEXT,
          blockConfig: { options: OPTIONS },
        })
      )
    ).not.toThrow()
  })
})
