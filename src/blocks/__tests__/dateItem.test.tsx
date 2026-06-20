import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { dateItemComponent } from '../dateItem'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

describe('dateItem', () => {
  it('1. defaultValue は { display: "", iso: "" }', () => {
    expect(dateItemComponent.defaultValue).toEqual({ display: '', iso: '' })
  })

  it('2. 日付入力欄が存在する', () => {
    const { container } = render(
      dateItemComponent.FormItem!({
        value: { display: '', iso: '' },
        onChange: () => {},
        t: {} as never,
      })
    )
    const dateInput = container.querySelector('input[type="date"]')
    expect(dateInput).not.toBeNull()
  })

  it('3. 日付を入力すると iso フィールドが更新される', () => {
    const onChange = vi.fn()
    const { container } = render(
      dateItemComponent.FormItem!({
        value: { display: '', iso: '' },
        onChange,
        t: {} as never,
      })
    )
    const dateInput = container.querySelector('input[type="date"]')!
    fireEvent.change(dateInput, { target: { value: '1990-01-01' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ iso: '1990-01-01' }))
  })

  it('5. 不正フォーマットのとき エラーメッセージが表示される', () => {
    render(
      dateItemComponent.FormItem!({
        value: { display: '', iso: 'not-a-date' },
        onChange: () => {},
        t: {} as never,
      })
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('6. blockConfig.minDate / maxDate を設定して範囲外の日付を入力するとエラーが表示される', () => {
    render(
      dateItemComponent.FormItem!({
        value: { display: '', iso: '1999-12-31' },
        onChange: () => {},
        t: {} as never,
        blockConfig: { minDate: '2000-01-01', maxDate: '2010-12-31' },
      })
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('6b. 範囲内の日付はエラーなし', () => {
    render(
      dateItemComponent.FormItem!({
        value: { display: '', iso: '2005-06-15' },
        onChange: () => {},
        t: {} as never,
        blockConfig: { minDate: '2000-01-01', maxDate: '2010-12-31' },
      })
    )
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('8. card_data の値の型は { display: string, iso: string }', () => {
    expect(dateItemComponent.defaultValue).toHaveProperty('display')
    expect(dateItemComponent.defaultValue).toHaveProperty('iso')
  })

  it('11. CardItem: display が描画される', () => {
    render(
      dateItemComponent.CardItem!({
        value: { display: '1月1日', iso: '1990-01-01' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    expect(screen.getByText('1月1日')).toBeInTheDocument()
  })

  it('12. CardItem: 空値はエラーなく描画される', () => {
    expect(() =>
      render(
        dateItemComponent.CardItem!({
          value: { display: '', iso: '' },
          ctx: DEFAULT_CARD_RENDER_CONTEXT,
        })
      )
    ).not.toThrow()
  })
})
