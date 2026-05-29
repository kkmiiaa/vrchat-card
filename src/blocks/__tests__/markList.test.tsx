import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { markListComponent } from '../markList'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'
import { translations } from '@/utils/translations'

const t = translations.ja
const defaultValue = { marks: {}, custom: [] }

describe('markList', () => {
  it('1. defaultValue は { marks: {}, custom: [] }', () => {
    expect(markListComponent.defaultValue).toEqual({ marks: {}, custom: [] })
  })

  it('2. blockConfig.marks でマーク記号が select に表示される', () => {
    const marks = [{ symbol: '★', color: '#f59e0b', bg: 'rgba(254,243,199,0.6)' }]
    render(
      markListComponent.FormItem!({
        value: defaultValue,
        onChange: () => {}, t,
        blockConfig: { marks, items: [{ label: 'ハグOK' }] },
      })
    )
    expect(screen.getByText('★')).toBeInTheDocument()
  })

  it('3. blockConfig.items で固定項目が描画される', () => {
    render(
      markListComponent.FormItem!({
        value: defaultValue,
        onChange: () => {}, t,
        blockConfig: { items: [{ label: 'ハグOK' }, { label: 'なでなでOK' }] },
      })
    )
    expect(screen.getByText('ハグOK')).toBeInTheDocument()
    expect(screen.getByText('なでなでOK')).toBeInTheDocument()
  })

  it('4. blockConfig.maxCustomItems=1 のとき上限に達すると追加ボタンが非表示', () => {
    render(
      markListComponent.FormItem!({
        value: { marks: {}, custom: [{ label: 'カスタム1', mark: '-' }] },
        onChange: () => {}, t,
        blockConfig: { maxCustomItems: 1, items: [{ label: 'ハグOK' }] },
      })
    )
    expect(screen.queryByText('+ カスタム項目を追加')).toBeNull()
  })

  it('5. maxCustomItems > custom.length のとき追加ボタンが表示される', () => {
    render(
      markListComponent.FormItem!({
        value: defaultValue,
        onChange: () => {}, t,
        blockConfig: { maxCustomItems: 3, items: [{ label: 'ハグOK' }] },
      })
    )
    expect(screen.getByText('+ カスタム項目を追加')).toBeInTheDocument()
  })

  it('6. マーク記号を変更すると marks が更新された value が onChange に渡される', () => {
    const onChange = vi.fn()
    render(
      markListComponent.FormItem!({
        value: defaultValue,
        onChange, t,
        blockConfig: {
          marks: [{ symbol: '◎', color: '#22c55e', bg: '#f0fdf4' }],
          items: [{ label: 'ハグOK' }],
        },
      })
    )
    const select = screen.getAllByRole('combobox')[0]
    fireEvent.change(select, { target: { value: '◎' } })
    expect(onChange).toHaveBeenCalledWith({ marks: { 0: '◎' }, custom: [] })
  })

  it('7. カスタム項目追加ボタンをクリックすると custom に空要素が追加される', () => {
    const onChange = vi.fn()
    render(
      markListComponent.FormItem!({
        value: defaultValue,
        onChange, t,
        blockConfig: { maxCustomItems: 3, items: [{ label: 'ハグOK' }] },
      })
    )
    fireEvent.click(screen.getByText('+ カスタム項目を追加'))
    expect(onChange).toHaveBeenCalledWith({ marks: {}, custom: [{ label: '', mark: '-' }] })
  })

  it('8. CardItem: マーク済み固定項目が描画される', () => {
    render(
      markListComponent.CardItem!({
        value: { marks: { 0: '◎' }, custom: [] },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: {
          marks: [{ symbol: '◎', color: '#22c55e', bg: '#f0fdf4' }],
          items: [{ label: 'ハグOK' }],
        },
      })
    )
    expect(screen.getByText(/◎/)).toBeInTheDocument()
  })

  it('9. CardItem: 全項目未選択（-）は「-」が表示される（null を返さない）', () => {
    render(
      markListComponent.CardItem!({
        value: defaultValue,
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { items: [{ label: 'ハグOK' }] },
      })
    )
    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('10. CardItem: ルート要素に alignSelf: flex-start が設定される（縦方向への引き伸ばし防止）', () => {
    const { container } = render(
      markListComponent.CardItem!({
        value: { marks: { 0: '◎' }, custom: [] },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: {
          marks: [{ symbol: '◎', color: '#22c55e', bg: '#f0fdf4' }],
          items: [{ label: 'ハグOK' }],
        },
      })
    )
    const root = container.firstChild as HTMLElement
    expect(root.style.alignSelf).toBe('flex-start')
  })

  it('11. CardItem: ルート要素に alignContent: flex-start が設定される', () => {
    const { container } = render(
      markListComponent.CardItem!({
        value: { marks: { 0: '◎' }, custom: [] },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: {
          marks: [{ symbol: '◎', color: '#22c55e', bg: '#f0fdf4' }],
          items: [{ label: 'ハグOK' }],
        },
      })
    )
    const root = container.firstChild as HTMLElement
    expect(root.style.alignContent).toBe('flex-start')
  })
})
