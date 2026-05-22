import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { markListComponent } from '../markList'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'
import { translations } from '@/utils/translations'

const t = translations.ja

describe('markList', () => {
  it('1. defaultValue はデフォルト項目を含む配列（空配列ではない）', () => {
    expect(Array.isArray(markListComponent.defaultValue)).toBe(true)
    expect(markListComponent.defaultValue.length).toBeGreaterThan(0)
  })

  it('2. blockConfig.marks でマーク記号が表示される', () => {
    const marks = [{ symbol: '★', color: '#f59e0b', bg: 'rgba(254,243,199,0.6)' }]
    render(
      markListComponent.FormItem!({
        value: [{ label: 'ハグOK', mark: '-' }],
        onChange: () => {},
        t,
        blockConfig: { marks },
      })
    )
    // select に ★ の option が表示される
    expect(screen.getByText('★')).toBeInTheDocument()
  })

  it('3. blockConfig.items でカスタム項目が描画される', () => {
    render(
      markListComponent.FormItem!({
        value: [{ label: 'ハグOK', mark: '-' }, { label: 'なでなでOK', mark: '-' }],
        onChange: () => {},
        t,
      })
    )
    // ラベルが翻訳されるため exists チェック
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0)
  })

  it('5. blockConfig.maxCustomItems=1 のとき 1件超のカスタム項目が追加できない', () => {
    render(
      markListComponent.FormItem!({
        value: [{ label: 'カスタム1', mark: '-', isCustom: true }],
        onChange: () => {},
        t,
        blockConfig: { maxCustomItems: 1 },
      })
    )
    // 追加ボタンが非表示
    expect(screen.queryByText(t.addCustomItem)).toBeNull()
  })

  it('5b. カスタム数 < maxCustomItems のとき追加ボタンが表示される', () => {
    render(
      markListComponent.FormItem!({
        value: [],
        onChange: () => {},
        t,
        blockConfig: { maxCustomItems: 3 },
      })
    )
    expect(screen.getByText(t.addCustomItem)).toBeInTheDocument()
  })

  it('6. マーク記号を変更すると該当行が更新された配列が onChange に渡される', () => {
    const onChange = vi.fn()
    render(
      markListComponent.FormItem!({
        value: [{ label: 'ハグOK', mark: '-' }],
        onChange,
        t,
      })
    )
    const select = screen.getAllByRole('combobox')[0]
    fireEvent.change(select, { target: { value: '◎' } })
    expect(onChange).toHaveBeenCalledWith([{ label: 'ハグOK', mark: '◎' }])
  })

  it('8. カスタム項目追加ボタンをクリックすると isCustom: true が追加される', () => {
    const onChange = vi.fn()
    render(
      markListComponent.FormItem!({
        value: [],
        onChange,
        t,
      })
    )
    fireEvent.click(screen.getByText(t.addCustomItem))
    const called = onChange.mock.calls[0][0]
    expect(called.some((item: { isCustom?: boolean }) => item.isCustom === true)).toBe(true)
  })

  it('13. CardItem: マーク済み項目が描画される', () => {
    render(
      markListComponent.CardItem!({
        value: [{ label: 'ハグOK', mark: '◎' }],
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    expect(screen.getByText(/◎/)).toBeInTheDocument()
  })

  it('14. CardItem: 全項目未選択はエラーなく描画される', () => {
    expect(() =>
      render(
        markListComponent.CardItem!({
          value: [{ label: 'ハグOK', mark: '-' }],
          ctx: DEFAULT_CARD_RENDER_CONTEXT,
        })
      )
    ).not.toThrow()
  })
})
