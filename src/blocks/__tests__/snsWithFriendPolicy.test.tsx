import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { snsWithFriendPolicyComponent } from '../snsWithFriendPolicy'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

const t = {} as never
const defaultValue = { id: '', friendPolicy: '' }

describe('snsWithFriendPolicy', () => {
  it('1. defaultValue は { id: "", friendPolicy: "" }', () => {
    expect(snsWithFriendPolicyComponent.defaultValue).toEqual({ id: '', friendPolicy: '' })
  })

  it('2. FormItem: ID 入力欄が描画される', () => {
    render(
      snsWithFriendPolicyComponent.FormItem!({
        value: defaultValue,
        onChange: () => {},
        t,
        blockConfig: { platform: 'vrchat' },
      })
    )
    expect(screen.getByText('VRChat ID')).toBeInTheDocument()
  })

  it('3. blockConfig.policies で指定したポリシーのみ表示される', () => {
    render(
      snsWithFriendPolicyComponent.FormItem!({
        value: defaultValue,
        onChange: () => {},
        t,
        blockConfig: {
          platform: 'vrchat',
          policies: [
            { value: 'frPolicyAnyone', label: 'だれでもOK' },
            { value: 'frPolicyNo',     label: '送らないでください' },
          ],
        },
      })
    )
    expect(screen.getByText('だれでもOK')).toBeInTheDocument()
    expect(screen.getByText('送らないでください')).toBeInTheDocument()
    expect(screen.queryByText('仲良くなってから許可')).toBeNull()
  })

  it('4. ポリシーを選択すると friendPolicy が更新される', () => {
    const onChange = vi.fn()
    render(
      snsWithFriendPolicyComponent.FormItem!({
        value: defaultValue,
        onChange,
        t,
        blockConfig: { platform: 'vrchat' },
      })
    )
    fireEvent.click(screen.getByText('だれでもOK'))
    expect(onChange).toHaveBeenCalledWith({ id: '', friendPolicy: 'frPolicyAnyone' })
  })

  it('5. 同じポリシーを再選択すると解除される', () => {
    const onChange = vi.fn()
    render(
      snsWithFriendPolicyComponent.FormItem!({
        value: { id: '', friendPolicy: 'frPolicyAnyone' },
        onChange,
        t,
        blockConfig: { platform: 'vrchat' },
      })
    )
    fireEvent.click(screen.getByText('だれでもOK'))
    expect(onChange).toHaveBeenCalledWith({ id: '', friendPolicy: '' })
  })

  it('6. ID 入力で id が更新される', () => {
    const onChange = vi.fn()
    render(
      snsWithFriendPolicyComponent.FormItem!({
        value: defaultValue,
        onChange,
        t,
        blockConfig: { platform: 'x' },
      })
    )
    const input = screen.getByPlaceholderText('@yourhandle')
    fireEvent.change(input, { target: { value: '@foo' } })
    expect(onChange).toHaveBeenCalledWith({ id: '@foo', friendPolicy: '' })
  })

  it('7. CardItem: ID とポリシーラベルが描画される', () => {
    render(
      snsWithFriendPolicyComponent.CardItem!({
        value: { id: 'sample_user', friendPolicy: 'frPolicyAnyone' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { platform: 'vrchat' },
      })
    )
    expect(screen.getByText('sample_user')).toBeInTheDocument()
    expect(screen.getByText('だれでもOK')).toBeInTheDocument()
  })

  it('8. CardItem: 空値はエラーなく描画される', () => {
    expect(() =>
      render(
        snsWithFriendPolicyComponent.CardItem!({
          value: defaultValue,
          ctx: DEFAULT_CARD_RENDER_CONTEXT,
          blockConfig: { platform: 'vrchat' },
        })
      )
    ).not.toThrow()
  })
})
