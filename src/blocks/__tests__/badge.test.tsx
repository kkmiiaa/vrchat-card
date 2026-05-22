import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { badgeComponent, DEFAULT_BADGE_VALUE } from '../badge'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

describe('badge', () => {
  it('defaultValue は { label: "", color: "" }', () => {
    expect(badgeComponent.defaultValue).toEqual({ label: '', color: '' })
  })

  it('blockConfig.allowColorPicker=true のとき FormItem にカラーピッカーが表示される', () => {
    const { container } = render(
      badgeComponent.FormItem!({
        value: DEFAULT_BADGE_VALUE,
        onChange: () => {},
        t: {} as never,
        blockConfig: { allowColorPicker: true },
      })
    )
    expect(container.querySelector('input[type="color"]')).not.toBeNull()
  })

  it('blockConfig.allowColorPicker=false のとき FormItem にカラーピッカーが表示されない', () => {
    const { container } = render(
      badgeComponent.FormItem!({
        value: DEFAULT_BADGE_VALUE,
        onChange: () => {},
        t: {} as never,
        blockConfig: { allowColorPicker: false },
      })
    )
    expect(container.querySelector('input[type="color"]')).toBeNull()
  })

  it('blockConfig.allowColorPicker 未設定のときカラーピッカーが表示される（デフォルト true）', () => {
    const { container } = render(
      badgeComponent.FormItem!({
        value: DEFAULT_BADGE_VALUE,
        onChange: () => {},
        t: {} as never,
        blockConfig: {},
      })
    )
    expect(container.querySelector('input[type="color"]')).not.toBeNull()
  })

  it('blockConfig.defaultColor を設定すると allowColorPicker=false 時の CardItem にそのカラーが使われる', () => {
    const { container } = render(
      badgeComponent.CardItem!({
        value: { label: 'テスト', color: '' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { allowColorPicker: false, defaultColor: '#6366f1' },
      })
    )
    // ラベルが描画される
    expect(screen.getByText('テスト')).toBeInTheDocument()
    // defaultColor がどこかのスタイルに使われている
    const el = container.querySelector('[style]')
    expect(el?.getAttribute('style')).toContain('#6366f1')
  })

  it('CardItem: 入力済み値が描画される', () => {
    render(
      badgeComponent.CardItem!({
        value: { label: 'VR廃人', color: '#6366f1' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    expect(screen.getByText('VR廃人')).toBeInTheDocument()
  })

  it('CardItem: 未入力値はエラーなく描画される', () => {
    expect(() =>
      render(
        badgeComponent.CardItem!({
          value: { label: '', color: '' },
          ctx: DEFAULT_CARD_RENDER_CONTEXT,
        })
      )
    ).not.toThrow()
  })
})
