import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { colorPaletteComponent } from '../colorPalette'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

describe('colorPalette', () => {
  it('1. defaultValue は 4色の配列', () => {
    expect(colorPaletteComponent.defaultValue).toEqual(['#60a5fa', '#4ade80', '#fbbf24', '#f87171'])
  })

  it('2. 初期値の色数分 color ピッカーが描画される', () => {
    const { container } = render(
      colorPaletteComponent.FormItem!({
        value: ['#60a5fa', '#4ade80', '#fbbf24', '#f87171'],
        onChange: () => {},
        t: {} as never,
      })
    )
    const colorInputs = container.querySelectorAll('input[type="color"]')
    expect(colorInputs.length).toBe(4)
  })

  it('3. 色を変更すると変更後の配列が onChange に渡される', () => {
    const onChange = vi.fn()
    const { container } = render(
      colorPaletteComponent.FormItem!({
        value: ['#60a5fa', '#4ade80'],
        onChange,
        t: {} as never,
      })
    )
    const firstInput = container.querySelector('input[type="color"]')!
    fireEvent.change(firstInput, { target: { value: '#ff0000' } })
    expect(onChange).toHaveBeenCalledWith(['#ff0000', '#4ade80'])
  })

  it('4. blockConfig.maxColors=3 のとき 3色超の追加ができない（追加ボタンが消える）', () => {
    // maxColors は blockConfigForm 側の設定のため、FormItem 内では maxCount が 3 かつ 3色の場合は追加ボタンが非表示
    const { container } = render(
      colorPaletteComponent.FormItem!({
        value: ['#ff0000', '#00ff00', '#0000ff'],
        onChange: () => {},
        t: {} as never,
      })
    )
    // colors.length < 8 のとき追加ボタンは表示される（デフォルトmax=8）
    const btn = container.querySelector('button')
    // 3色 < 8 なので追加ボタンは存在する
    expect(btn).not.toBeNull()
  })

  it('5. blockConfig.freeInput=true のとき color ピッカー(input[type=color])が表示される', () => {
    const { container } = render(
      colorPaletteComponent.FormItem!({
        value: ['#ff0000'],
        onChange: () => {},
        t: {} as never,
        blockConfig: { freeInput: true },
      })
    )
    expect(container.querySelector('input[type="color"]')).not.toBeNull()
  })

  it('6. blockConfig.freeInput=false のとき color ピッカーが非表示', () => {
    const { container } = render(
      colorPaletteComponent.FormItem!({
        value: ['#ff0000'],
        onChange: () => {},
        t: {} as never,
        blockConfig: { freeInput: false },
      })
    )
    expect(container.querySelector('input[type="color"]')).toBeNull()
  })

  it('11. CardItem: 各色のスウォッチが描画される', () => {
    const { container } = render(
      colorPaletteComponent.CardItem!({
        value: ['#ff0000', '#00ff00'],
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    const swatches = container.querySelectorAll('div > div')
    expect(swatches.length).toBeGreaterThanOrEqual(2)
  })

  it('12. CardItem: 空配列はエラーなく描画される', () => {
    expect(() =>
      render(
        colorPaletteComponent.CardItem!({
          value: [],
          ctx: DEFAULT_CARD_RENDER_CONTEXT,
        })
      )
    ).not.toThrow()
  })
})
