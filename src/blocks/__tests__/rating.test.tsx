import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ratingComponent } from '../rating'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

describe('rating', () => {
  it('defaultValue は 0', () => {
    expect(ratingComponent.defaultValue).toBe(0)
  })

  it('blockConfig.color を設定すると CardItem のアイコンにそのカラーが使われる', () => {
    const { container } = render(
      ratingComponent.CardItem!({
        value: 4,
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { color: '#ff0000' },
      })
    )
    // 選択済みアイコンに blockConfig.color が使われている
    const icons = container.querySelectorAll('[style]')
    const hasColor = Array.from(icons).some(el => el.getAttribute('style')?.includes('#ff0000'))
    expect(hasColor).toBe(true)
  })

  it('blockConfig.color を設定すると FormItem のアイコンにも同じカラーが使われる', () => {
    const { container } = render(
      ratingComponent.FormItem!({
        value: 3,
        onChange: () => {},
        t: {} as never,
        blockConfig: { color: '#ff0000' },
      })
    )
    const icons = container.querySelectorAll('[style]')
    const hasColor = Array.from(icons).some(el => el.getAttribute('style')?.includes('#ff0000'))
    expect(hasColor).toBe(true)
  })

  it('blockConfig.icon を設定すると CardItem にそのアイコンが使われる', () => {
    render(
      ratingComponent.CardItem!({
        value: 3,
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { icon: '♥' },
      })
    )
    // ♥ が描画されている
    const hearts = screen.getAllByText('♥')
    expect(hearts.length).toBeGreaterThan(0)
  })

  it('blockConfig.icon を設定すると FormItem にもそのアイコンが使われる', () => {
    render(
      ratingComponent.FormItem!({
        value: 2,
        onChange: () => {},
        t: {} as never,
        blockConfig: { icon: '♥' },
      })
    )
    const hearts = screen.getAllByText('♥')
    expect(hearts.length).toBeGreaterThan(0)
  })

  it('CardItem: 4つ分が選択状態で描画される', () => {
    const { container } = render(
      ratingComponent.CardItem!({
        value: 4,
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    // デフォルトアイコン ★ が5個ある
    const stars = container.querySelectorAll('span')
    expect(stars.length).toBe(5)
  })

  it('CardItem: 未評価はエラーなく描画される', () => {
    expect(() =>
      render(
        ratingComponent.CardItem!({
          value: 0,
          ctx: DEFAULT_CARD_RENDER_CONTEXT,
        })
      )
    ).not.toThrow()
  })
})
