import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { multiSelectComponent } from '../multiSelect'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

const OPTIONS = [
  { value: 'pcvr', label: 'PCVR' },
  { value: 'quest', label: 'Quest' },
  { value: 'mobile', label: 'Mobile' },
]

describe('multiSelect', () => {
  it('1. defaultValue は [] (空配列)', () => {
    expect(multiSelectComponent.defaultValue).toEqual([])
  })

  it('2. blockConfig.options のラベルが表示される', () => {
    render(
      multiSelectComponent.FormItem!({
        value: [],
        onChange: () => {},
        t: {} as never,
        blockConfig: { options: OPTIONS },
      })
    )
    expect(screen.getByText('PCVR')).toBeInTheDocument()
    expect(screen.getByText('Quest')).toBeInTheDocument()
  })

  it('3. 選択肢を複数クリックすると value の配列が onChange に渡される', () => {
    const onChange = vi.fn()
    render(
      multiSelectComponent.FormItem!({
        value: [],
        onChange,
        t: {} as never,
        blockConfig: { options: OPTIONS },
      })
    )
    fireEvent.click(screen.getByText('PCVR'))
    expect(onChange).toHaveBeenCalledWith(['pcvr'])
  })

  it('4. 選択済みの選択肢を再クリックすると value が除去された配列が渡される', () => {
    const onChange = vi.fn()
    render(
      multiSelectComponent.FormItem!({
        value: ['pcvr'],
        onChange,
        t: {} as never,
        blockConfig: { options: OPTIONS },
      })
    )
    fireEvent.click(screen.getByText('PCVR'))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('5. A を選択後に B を選択すると A の選択状態が維持される', () => {
    const onChange = vi.fn()
    render(
      multiSelectComponent.FormItem!({
        value: ['pcvr'],
        onChange,
        t: {} as never,
        blockConfig: { options: OPTIONS },
      })
    )
    fireEvent.click(screen.getByText('Quest'))
    expect(onChange).toHaveBeenCalledWith(['pcvr', 'quest'])
  })

  it('7. card_data の値の型は string[]', () => {
    expect(Array.isArray(multiSelectComponent.defaultValue)).toBe(true)
  })

  it('10. CardItem: 複数選択済み値が描画される', () => {
    render(
      multiSelectComponent.CardItem!({
        value: ['pcvr', 'quest'],
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { options: OPTIONS },
      })
    )
    expect(screen.getByText('PCVR')).toBeInTheDocument()
    expect(screen.getByText('Quest')).toBeInTheDocument()
  })

  it('11. CardItem: 空配列のとき「-」が表示される（null を返さない）', () => {
    render(
      multiSelectComponent.CardItem!({
        value: [],
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('12. CardItem: icon-slash variant でアイコン付きラベルが「/」区切りで描画される', () => {
    const options = [
      { value: 'pcvr', label: 'PCVR', icon: 'TbBadgeVr' },
      { value: 'quest', label: 'Quest', icon: 'TbDeviceGamepad2' },
    ]
    const { container } = render(
      multiSelectComponent.CardItem!({
        value: ['pcvr', 'quest'],
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        variant: 'icon-slash',
        blockConfig: { options },
      })
    )
    expect(screen.getByText('PCVR')).toBeInTheDocument()
    expect(screen.getByText('Quest')).toBeInTheDocument()
    // 2番目以降の選択肢の前に「/」区切りが入る
    expect(screen.getByText('/')).toBeInTheDocument()
  })

  it('13. icon-slash variant は variants 配列に含まれる', () => {
    expect(multiSelectComponent.variants).toContain('icon-slash')
  })
})
