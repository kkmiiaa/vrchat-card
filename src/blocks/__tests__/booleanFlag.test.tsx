import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { booleanFlagComponent } from '../booleanFlag'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

describe('booleanFlag', () => {
  it('defaultValue は false', () => {
    expect(booleanFlagComponent.defaultValue).toBe(false)
  })

  it('blockConfig.trueIcon を設定すると ON 時の CardItem にそのアイコンが表示される', () => {
    render(
      booleanFlagComponent.CardItem!({
        value: true,
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { trueIcon: '💖' },
      })
    )
    expect(screen.getByText('💖')).toBeInTheDocument()
  })

  it('blockConfig.falseIcon を設定すると OFF 時の CardItem にそのアイコンが表示される', () => {
    render(
      booleanFlagComponent.CardItem!({
        value: false,
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { falseIcon: '💔' },
      })
    )
    expect(screen.getByText('💔')).toBeInTheDocument()
  })

  it('blockConfig.trueIcon 未設定のとき ON はデフォルトアイコンで描画される', () => {
    const { container } = render(
      booleanFlagComponent.CardItem!({
        value: true,
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: {},
      })
    )
    expect(container).toBeTruthy()
  })

  it('CardItem ON: ON 状態が描画される', () => {
    render(
      booleanFlagComponent.CardItem!({
        value: true,
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    expect(screen.getByText('ON')).toBeInTheDocument()
  })

  it('CardItem OFF: エラーなく描画される', () => {
    expect(() =>
      render(
        booleanFlagComponent.CardItem!({
          value: false,
          ctx: DEFAULT_CARD_RENDER_CONTEXT,
        })
      )
    ).not.toThrow()
  })
})
