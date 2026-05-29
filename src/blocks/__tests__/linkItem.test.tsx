import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { linkItemComponent } from '../linkItem'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

describe('linkItem', () => {
  it('1. defaultValue は { label: "", url: "" }', () => {
    expect(linkItemComponent.defaultValue).toEqual({ label: '', url: '' })
  })

  it('2. label 入力欄が存在する', () => {
    render(
      linkItemComponent.FormItem!({
        value: { label: '', url: '' },
        onChange: () => {},
        t: {} as never,
      })
    )
    const inputs = screen.getAllByRole('textbox')
    expect(inputs.length).toBeGreaterThanOrEqual(2)
  })

  it('3. url 入力欄が存在する', () => {
    const { container } = render(
      linkItemComponent.FormItem!({
        value: { label: '', url: '' },
        onChange: () => {},
        t: {} as never,
      })
    )
    const urlInput = container.querySelector('input[type="url"]')
    expect(urlInput).not.toBeNull()
  })

  it('4. label に入力すると { label: 入力値, url: "" } が onChange に渡される', () => {
    const onChange = vi.fn()
    render(
      linkItemComponent.FormItem!({
        value: { label: '', url: '' },
        onChange,
        t: {} as never,
      })
    )
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'Portfolio' } })
    expect(onChange).toHaveBeenCalledWith({ label: 'Portfolio', url: '' })
  })

  it('5. blockConfig.icon のとき FormItem にアイコンが表示される', () => {
    render(
      linkItemComponent.FormItem!({
        value: { label: '', url: '' },
        onChange: () => {},
        t: {} as never,
        blockConfig: { icon: '⭐' },
      })
    )
    expect(screen.getByText('⭐')).toBeInTheDocument()
  })

  it('5b. blockConfig.icon のとき CardItem にアイコンが表示される', () => {
    render(
      linkItemComponent.CardItem!({
        value: { label: 'Portfolio', url: 'https://example.com' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { icon: '⭐' },
      })
    )
    expect(screen.getByText('⭐')).toBeInTheDocument()
  })

  it('10. CardItem: label と url が描画される', () => {
    render(
      linkItemComponent.CardItem!({
        value: { label: 'Portfolio', url: 'https://example.com' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    expect(screen.getByText('Portfolio')).toBeInTheDocument()
  })

  it('11. CardItem: 空値はエラーなく描画される', () => {
    expect(() =>
      render(
        linkItemComponent.CardItem!({
          value: { label: '', url: '' },
          ctx: DEFAULT_CARD_RENDER_CONTEXT,
        })
      )
    ).not.toThrow()
  })
})
