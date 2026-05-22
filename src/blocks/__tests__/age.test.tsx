import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ageComponent } from '../age'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'
import { translations } from '@/utils/translations'

const t = translations.ja

describe('age', () => {
  it('1. defaultValue は { searchTag: "", display: "" }', () => {
    expect(ageComponent.defaultValue).toEqual({ searchTag: '', display: '' })
  })

  it('2. global === true', () => {
    expect(ageComponent.global).toBe(true)
  })

  it('3. 固定の年齢帯選択肢が表示される', () => {
    render(
      ageComponent.FormItem!({
        value: { searchTag: '', display: '' },
        onChange: () => {},
        t,
      })
    )
    expect(screen.getByText('18歳未満')).toBeInTheDocument()
    expect(screen.getByText('18+')).toBeInTheDocument()
    expect(screen.getByText('非公開')).toBeInTheDocument()
  })

  it('4. 年齢帯を選択すると searchTag が更新される', () => {
    const onChange = vi.fn()
    render(
      ageComponent.FormItem!({
        value: { searchTag: '', display: '' },
        onChange,
        t,
      })
    )
    fireEvent.click(screen.getByText('18+'))
    expect(onChange).toHaveBeenCalledWith({ searchTag: '18+', display: '' })
  })

  it('5. 自由入力を選択すると display 入力欄が表示される', () => {
    render(
      ageComponent.FormItem!({
        value: { searchTag: '', display: '' },
        onChange: () => {},
        t,
      })
    )
    // searchTag === '' のとき input が表示される
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('7. card_data の値の型は { searchTag: string, display: string }', () => {
    expect(ageComponent.defaultValue).toHaveProperty('searchTag')
    expect(ageComponent.defaultValue).toHaveProperty('display')
  })

  it('10. CardItem: searchTag と display が描画される', () => {
    render(
      ageComponent.CardItem!({
        value: { searchTag: '18+', display: '20代前半' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    expect(screen.getByText('20代前半')).toBeInTheDocument()
  })

  it('11. CardItem: 空値はエラーなく描画される', () => {
    expect(() =>
      render(
        ageComponent.CardItem!({
          value: { searchTag: '', display: '' },
          ctx: DEFAULT_CARD_RENDER_CONTEXT,
        })
      )
    ).not.toThrow()
  })
})
