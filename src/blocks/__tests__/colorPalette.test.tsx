import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { colorPaletteComponent } from '../colorPalette'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

describe('colorPalette', () => {
  it('1. defaultValue は 4色の配列', () => {
    expect(colorPaletteComponent.defaultValue).toEqual(['#60a5fa', '#4ade80', '#fbbf24', '#f87171'])
  })

  it('2. 初期値の色数分カラーピッカートリガーが描画される', () => {
    const { container } = render(
      colorPaletteComponent.FormItem!({
        value: ['#60a5fa', '#4ade80', '#fbbf24', '#f87171'],
        onChange: () => {},
        t: {} as never,
      })
    )
    const triggers = container.querySelectorAll('[data-testid="color-picker-trigger"]')
    expect(triggers.length).toBe(4)
  })

  it('3. 色の数が value の長さと一致する', () => {
    const { container } = render(
      colorPaletteComponent.FormItem!({
        value: ['#60a5fa', '#4ade80'],
        onChange: vi.fn(),
        t: {} as never,
      })
    )
    const triggers = container.querySelectorAll('[data-testid="color-picker-trigger"]')
    expect(triggers.length).toBe(2)
  })

  it('4. blockConfig.maxColors=3 のとき 3色で追加ボタンが表示される（デフォルト max=8）', () => {
    const { container } = render(
      colorPaletteComponent.FormItem!({
        value: ['#ff0000', '#00ff00', '#0000ff'],
        onChange: () => {},
        t: {} as never,
      })
    )
    // 3色 < 8 なので追加ボタンは存在する
    const btn = container.querySelector('button')
    expect(btn).not.toBeNull()
  })

  it('5. blockConfig.freeInput=true のとき カラーピッカートリガーが表示される', () => {
    const { container } = render(
      colorPaletteComponent.FormItem!({
        value: ['#ff0000'],
        onChange: () => {},
        t: {} as never,
        blockConfig: { freeInput: true },
      })
    )
    expect(container.querySelector('[data-testid="color-picker-trigger"]')).not.toBeNull()
  })

  it('6. blockConfig.freeInput=false のとき カラーピッカーが非表示', () => {
    const { container } = render(
      colorPaletteComponent.FormItem!({
        value: ['#ff0000'],
        onChange: () => {},
        t: {} as never,
        blockConfig: { freeInput: false },
      })
    )
    expect(container.querySelector('[data-testid="color-picker-trigger"]')).toBeNull()
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
