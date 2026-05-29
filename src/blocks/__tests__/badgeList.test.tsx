import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { badgeListComponent } from '../badgeList'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

describe('badgeList', () => {
  it('1. defaultValue は [] (空配列)', () => {
    expect(badgeListComponent.defaultValue).toEqual([])
  })

  it('2. バッジを追加ボタンをクリックすると onChange に新しいバッジが渡される', () => {
    const onChange = vi.fn()
    render(
      badgeListComponent.FormItem!({
        value: [],
        onChange,
        t: {} as never,
      })
    )
    fireEvent.click(screen.getByText('+ バッジを追加'))
    expect(onChange).toHaveBeenCalledWith([{ label: '', color: '#6b7280' }])
  })

  it('3. 削除ボタンをクリックすると削除後の配列が onChange に渡される', () => {
    const onChange = vi.fn()
    render(
      badgeListComponent.FormItem!({
        value: [{ label: 'VR廃人', color: '#6366f1' }],
        onChange,
        t: {} as never,
      })
    )
    fireEvent.click(screen.getByText('✕'))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('4. blockConfig.allowColorPicker=true のとき color ピッカーが表示される', () => {
    const { container } = render(
      badgeListComponent.FormItem!({
        value: [{ label: 'test', color: '#fff' }],
        onChange: () => {},
        t: {} as never,
        blockConfig: { allowColorPicker: true },
      })
    )
    const colorInput = container.querySelector('[data-testid="color-picker-trigger"]')
    expect(colorInput).not.toBeNull()
  })

  it('4b. blockConfig.allowColorPicker=false のとき color ピッカーが表示されない', () => {
    const { container } = render(
      badgeListComponent.FormItem!({
        value: [{ label: 'test', color: '#fff' }],
        onChange: () => {},
        t: {} as never,
        blockConfig: { allowColorPicker: false },
      })
    )
    const colorInput = container.querySelector('[data-testid="color-picker-trigger"]')
    expect(colorInput).toBeNull()
  })

  it('5. blockConfig.defaultColor のとき追加したバッジがそのカラーで追加される', () => {
    const onChange = vi.fn()
    render(
      badgeListComponent.FormItem!({
        value: [],
        onChange,
        t: {} as never,
        blockConfig: { defaultColor: '#ff0000' },
      })
    )
    fireEvent.click(screen.getByText('+ バッジを追加'))
    expect(onChange).toHaveBeenCalledWith([{ label: '', color: '#ff0000' }])
  })

  it('7. card_data の値の型は BadgeItem[]', () => {
    expect(Array.isArray(badgeListComponent.defaultValue)).toBe(true)
  })

  it('10. CardItem: 入力済みバッジが描画される', () => {
    render(
      badgeListComponent.CardItem!({
        value: [{ label: 'VR廃人', color: '#6366f1' }],
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    expect(screen.getByText('VR廃人')).toBeInTheDocument()
  })

  it('11. CardItem: 空配列はエラーなく描画される', () => {
    expect(() =>
      render(
        badgeListComponent.CardItem!({
          value: [],
          ctx: DEFAULT_CARD_RENDER_CONTEXT,
        })
      )
    ).not.toThrow()
  })
})
