import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { snsWithFriendPolicyComponent } from '../snsWithFriendPolicy'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

describe('snsWithFriendPolicy', () => {
  it('1. defaultValue は { platforms: {}, friendPolicy: "" }', () => {
    expect(snsWithFriendPolicyComponent.defaultValue).toEqual({ platforms: {}, friendPolicy: '' })
  })

  it('2. blockConfig.platforms で入力欄が描画される', () => {
    render(
      snsWithFriendPolicyComponent.FormItem!({
        value: { platforms: {}, friendPolicy: '' },
        onChange: () => {},
        t: {} as never,
        blockConfig: { platforms: ['x', 'discord'] },
      })
    )
    expect(screen.getByText('x')).toBeInTheDocument()
    expect(screen.getByText('discord')).toBeInTheDocument()
  })

  it('3. blockConfig.allowedPolicies で指定した選択肢のみ表示される', () => {
    render(
      snsWithFriendPolicyComponent.FormItem!({
        value: { platforms: {}, friendPolicy: '' },
        onChange: () => {},
        t: {} as never,
        blockConfig: { platforms: [], allowedPolicies: ['anyone', 'mutual'] },
      })
    )
    expect(screen.getByText('誰でも')).toBeInTheDocument()
    expect(screen.getByText('相互のみ')).toBeInTheDocument()
    expect(screen.queryByText('申請しない')).toBeNull()
  })

  it('4. フレンドポリシーを選択すると friendPolicy が更新される', () => {
    const onChange = vi.fn()
    render(
      snsWithFriendPolicyComponent.FormItem!({
        value: { platforms: {}, friendPolicy: '' },
        onChange,
        t: {} as never,
        blockConfig: { platforms: [] },
      })
    )
    fireEvent.click(screen.getByText('誰でも'))
    expect(onChange).toHaveBeenCalledWith({ platforms: {}, friendPolicy: 'anyone' })
  })

  it('5. SNS ID を入力すると platforms が更新される', () => {
    const onChange = vi.fn()
    render(
      snsWithFriendPolicyComponent.FormItem!({
        value: { platforms: {}, friendPolicy: '' },
        onChange,
        t: {} as never,
        blockConfig: { platforms: ['x'] },
      })
    )
    const input = screen.getByPlaceholderText('x ID')
    fireEvent.change(input, { target: { value: '@foo' } })
    expect(onChange).toHaveBeenCalledWith({ platforms: { x: '@foo' }, friendPolicy: '' })
  })

  it('7. card_data の値の型は { platforms: Record<string, string>, friendPolicy: string }', () => {
    expect(snsWithFriendPolicyComponent.defaultValue).toHaveProperty('platforms')
    expect(snsWithFriendPolicyComponent.defaultValue).toHaveProperty('friendPolicy')
  })

  it('10. CardItem: プラットフォームIDとフレンドポリシーが描画される', () => {
    render(
      snsWithFriendPolicyComponent.CardItem!({
        value: { platforms: { x: '@foo' }, friendPolicy: 'mutual' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    expect(screen.getByText(/x: @foo/)).toBeInTheDocument()
    expect(screen.getByText(/相互のみ/)).toBeInTheDocument()
  })

  it('11. CardItem: 空値はエラーなく描画される', () => {
    expect(() =>
      render(
        snsWithFriendPolicyComponent.CardItem!({
          value: { platforms: {}, friendPolicy: '' },
          ctx: DEFAULT_CARD_RENDER_CONTEXT,
        })
      )
    ).not.toThrow()
  })
})
