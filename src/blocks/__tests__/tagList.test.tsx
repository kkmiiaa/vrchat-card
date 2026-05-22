import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { tagListComponent } from '../tagList'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

describe('tagList', () => {
  it('defaultValue は [] (空配列)', () => {
    expect(tagListComponent.defaultValue).toEqual([])
  })

  it('CardItem: タグが描画される', () => {
    render(
      tagListComponent.CardItem!({
        value: ['VRC', 'ゲーム', '音楽'],
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    expect(screen.getByText('VRC')).toBeInTheDocument()
    expect(screen.getByText('ゲーム')).toBeInTheDocument()
  })

  it('blockConfig.prefix="#" のとき CardItem のタグに # が付与される', () => {
    render(
      tagListComponent.CardItem!({
        value: ['VRC', 'ゲーム'],
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { prefix: '#' },
      })
    )
    expect(screen.getByText('#VRC')).toBeInTheDocument()
    expect(screen.getByText('#ゲーム')).toBeInTheDocument()
  })

  it('blockConfig.prefix が未設定のときタグにプレフィックスは付かない', () => {
    render(
      tagListComponent.CardItem!({
        value: ['VRC'],
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: {},
      })
    )
    expect(screen.getByText('VRC')).toBeInTheDocument()
    expect(screen.queryByText('#VRC')).toBeNull()
  })

  it('CardItem: 空配列はエラーなく描画される', () => {
    expect(() =>
      render(
        tagListComponent.CardItem!({
          value: [],
          ctx: DEFAULT_CARD_RENDER_CONTEXT,
        })
      )
    ).not.toThrow()
  })
})
