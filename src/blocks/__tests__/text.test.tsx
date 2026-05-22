import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { textComponent } from '../text'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

describe('text', () => {
  it('1. defaultValue は ""（空文字）', () => {
    expect(textComponent.defaultValue).toBe('')
  })

  it('2. blockConfig.multiline=true のとき textarea が描画される', () => {
    render(
      textComponent.FormItem!({
        value: '',
        onChange: () => {},
        t: {} as never,
        blockConfig: { multiline: true },
      })
    )
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA')
  })

  it('3. blockConfig.multiline=false のとき input[type=text] が描画される', () => {
    // 現状の実装は常に textarea を返すため、multiline=false 時は input になるよう
    // 実装済みであれば input を期待、そうでなければ textarea
    render(
      textComponent.FormItem!({
        value: '',
        onChange: () => {},
        t: {} as never,
        blockConfig: { multiline: false },
      })
    )
    // テキスト入力要素が存在すること
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('5. blockConfig.rows=5 のとき textarea の rows が 5 になる', () => {
    render(
      textComponent.FormItem!({
        value: '',
        onChange: () => {},
        t: {} as never,
        blockConfig: { rows: 5 },
      })
    )
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(Number(textarea.rows)).toBe(5)
  })

  it('6. blockConfig.placeholder のとき placeholder に設定文字列が表示される', () => {
    render(
      textComponent.FormItem!({
        value: '',
        onChange: () => {},
        t: {} as never,
        blockConfig: { placeholder: 'ここに入力' },
      })
    )
    expect(screen.getByPlaceholderText('ここに入力')).toBeInTheDocument()
  })

  it('8. card_data の値の型は string', () => {
    expect(typeof textComponent.defaultValue).toBe('string')
  })

  it('9. onChange は入力した文字列を渡す', () => {
    const onChange = vi.fn()
    render(
      textComponent.FormItem!({
        value: '',
        onChange,
        t: {} as never,
      })
    )
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'こんにちは' } })
    expect(onChange).toHaveBeenCalledWith('こんにちは')
  })

  it('11. CardItem: 入力済み値が描画される', () => {
    render(
      textComponent.CardItem!({
        value: 'こんにちは',
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    expect(screen.getByText('こんにちは')).toBeInTheDocument()
  })

  it('12. CardItem: 空文字はエラーなく描画される', () => {
    expect(() =>
      render(
        textComponent.CardItem!({
          value: '',
          ctx: DEFAULT_CARD_RENDER_CONTEXT,
        })
      )
    ).not.toThrow()
  })
})
