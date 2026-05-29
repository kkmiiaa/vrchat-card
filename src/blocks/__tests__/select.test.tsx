import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { selectComponent } from '../select'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

const OPTIONS = [
  { value: 'trusted', label: '信頼済み', color: '#6366f1' },
  { value: 'friend', label: 'フレンド', color: '#f59e0b' },
]

describe('select', () => {
  it('1. defaultValue は ""（空文字）', () => {
    expect(selectComponent.defaultValue).toBe('')
  })

  it('2. blockConfig.options のラベルが表示される', () => {
    render(
      selectComponent.FormItem!({
        value: '',
        onChange: () => {},
        t: {} as never,
        blockConfig: { options: [{ value: 'A', label: 'Aさん' }] },
      })
    )
    expect(screen.getByText('Aさん')).toBeInTheDocument()
  })

  it('3. blockConfig.options に color を設定したとき選択肢ボタンに style が適用される', () => {
    render(
      selectComponent.FormItem!({
        value: '',
        onChange: () => {},
        t: {} as never,
        blockConfig: { options: OPTIONS },
      })
    )
    // ボタンが存在する
    expect(screen.getByText('信頼済み')).toBeInTheDocument()
  })

  it('4. 選択肢をクリックすると value が onChange に渡される', () => {
    const onChange = vi.fn()
    render(
      selectComponent.FormItem!({
        value: '',
        onChange,
        t: {} as never,
        blockConfig: { options: OPTIONS },
      })
    )
    fireEvent.click(screen.getByText('信頼済み'))
    expect(onChange).toHaveBeenCalledWith('trusted')
  })

  it('5. 選択済みの選択肢を再クリックすると "" が onChange に渡される', () => {
    const onChange = vi.fn()
    render(
      selectComponent.FormItem!({
        value: 'trusted',
        onChange,
        t: {} as never,
        blockConfig: { options: OPTIONS },
      })
    )
    fireEvent.click(screen.getByText('信頼済み'))
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('10. CardItem: value に対応する label が描画される', () => {
    render(
      selectComponent.CardItem!({
        value: 'trusted',
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { options: OPTIONS },
      })
    )
    expect(screen.getByText('信頼済み')).toBeInTheDocument()
  })

  it('11. CardItem: blockConfig.options の color が反映される', () => {
    const { container } = render(
      selectComponent.CardItem!({
        value: 'trusted',
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { options: OPTIONS },
      })
    )
    const span = container.querySelector('span')
    expect(span?.style.color).toContain('#6366f1')
  })

  it('12. CardItem: 空文字のとき「-」が表示される（null を返さない）', () => {
    render(
      selectComponent.CardItem!({
        value: '',
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { options: OPTIONS },
      })
    )
    expect(screen.getByText('-')).toBeInTheDocument()
  })
})
