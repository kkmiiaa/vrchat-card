import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { simpleSnsComponent } from '../simpleSns'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

describe('simpleSns', () => {
  it('defaultValue は ""', () => {
    expect(simpleSnsComponent.defaultValue).toBe('')
  })

  it('blockConfig.actionType="copy" のとき CardItem にコピーボタンが表示される', () => {
    render(
      simpleSnsComponent.CardItem!({
        value: '@example',
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { platform: 'x', actionType: 'copy' },
      })
    )
    // コピーボタンが存在する
    const copyBtn = screen.queryByRole('button', { name: /copy|コピー/i })
    expect(copyBtn).not.toBeNull()
  })

  it('blockConfig.actionType="navigate" のとき CardItem はリンクとして描画される', () => {
    render(
      simpleSnsComponent.CardItem!({
        value: '@example',
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { platform: 'x', actionType: 'navigate' },
      })
    )
    // a タグが存在する
    const link = document.querySelector('a')
    expect(link).not.toBeNull()
  })

  it('blockConfig.allowSecret=true のとき FormItem に「秘密」選択肢が表示される', () => {
    render(
      simpleSnsComponent.FormItem!({
        value: '',
        onChange: () => {},
        t: {} as never,
        blockConfig: { platform: 'x', allowSecret: true },
      })
    )
    expect(screen.getByText('秘密')).toBeInTheDocument()
  })

  it('blockConfig.allowSecret が未設定のとき「秘密」は表示されない', () => {
    render(
      simpleSnsComponent.FormItem!({
        value: '',
        onChange: () => {},
        t: {} as never,
        blockConfig: { platform: 'x' },
      })
    )
    expect(screen.queryByText('秘密')).toBeNull()
  })

  it('CardItem: ID が描画される', () => {
    render(
      simpleSnsComponent.CardItem!({
        value: '@example',
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { platform: 'x' },
      })
    )
    expect(screen.getByText('@example')).toBeInTheDocument()
  })

  it('CardItem: 空文字はエラーなく描画される', () => {
    expect(() =>
      render(
        simpleSnsComponent.CardItem!({
          value: '',
          ctx: DEFAULT_CARD_RENDER_CONTEXT,
          blockConfig: { platform: 'x' },
        })
      )
    ).not.toThrow()
  })
})
