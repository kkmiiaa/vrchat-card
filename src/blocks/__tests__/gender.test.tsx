import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { genderComponent } from '../gender'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

describe('gender', () => {
  it('1. defaultValue は { tag: "", display: "" }', () => {
    expect(genderComponent.defaultValue).toEqual({ tag: '', display: '' })
  })

  it('2. global === true', () => {
    expect(genderComponent.global).toBe(true)
  })

  it('3. 固定の性別選択肢が表示される', () => {
    render(
      genderComponent.FormItem!({
        value: { tag: '', display: '' },
        onChange: () => {},
        t: {} as never,
      })
    )
    expect(screen.getByText('男性')).toBeInTheDocument()
    expect(screen.getByText('女性')).toBeInTheDocument()
    expect(screen.getByText('その他')).toBeInTheDocument()
  })

  it('4. blockConfig.allowedTags で選択肢を絞ると指定した選択肢のみ表示される', () => {
    render(
      genderComponent.FormItem!({
        value: { tag: '', display: '' },
        onChange: () => {},
        t: {} as never,
        blockConfig: { allowedTags: ['male', 'female'] },
      })
    )
    expect(screen.getByText('男性')).toBeInTheDocument()
    expect(screen.getByText('女性')).toBeInTheDocument()
    expect(screen.queryByText('その他')).toBeNull()
    expect(screen.queryByText('非公開')).toBeNull()
  })

  it('5. 選択肢をクリックすると { tag, display: "" } が onChange に渡される', () => {
    const onChange = vi.fn()
    render(
      genderComponent.FormItem!({
        value: { tag: '', display: '' },
        onChange,
        t: {} as never,
      })
    )
    fireEvent.click(screen.getByText('女性'))
    expect(onChange).toHaveBeenCalledWith({ tag: 'female', display: '' })
  })

  it('6. tag 選択後に display 入力欄が表示される', () => {
    render(
      genderComponent.FormItem!({
        value: { tag: 'female', display: '' },
        onChange: () => {},
        t: {} as never,
      })
    )
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('11. CardItem: tag と display が描画される', () => {
    render(
      genderComponent.CardItem!({
        value: { tag: 'female', display: 'ふわふわ系' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    expect(screen.getByText('ふわふわ系')).toBeInTheDocument()
  })

  it('12. CardItem: 空値はエラーなく描画される', () => {
    expect(() =>
      render(
        genderComponent.CardItem!({
          value: { tag: '', display: '' },
          ctx: DEFAULT_CARD_RENDER_CONTEXT,
        })
      )
    ).not.toThrow()
  })
})
