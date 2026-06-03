import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { itemListComponent } from '../itemList'
import type { ItemListValue } from '../itemList'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

const CTX = DEFAULT_CARD_RENDER_CONTEXT

const SAMPLE: ItemListValue = [
  { category: 'HAIR', name: 'Ash Lilac Waves', url: 'https://booth.pm/example' },
  { category: 'OUTFIT', name: 'Celestia Set' },
  { category: '', name: '名前のみ' },
]

// ─── defaultValue ────────────────────────────────────────────────────────────

describe('itemList defaultValue', () => {
  it('空配列', () => {
    expect(itemListComponent.defaultValue).toEqual([])
  })
})

// ─── CardItem ────────────────────────────────────────────────────────────────

describe('itemList CardItem', () => {
  it('1. name を持つエントリが描画される', () => {
    render(itemListComponent.CardItem!({ value: SAMPLE, ctx: CTX }))
    expect(screen.getByText('Ash Lilac Waves')).toBeInTheDocument()
    expect(screen.getByText('Celestia Set')).toBeInTheDocument()
  })

  it('2. category が大文字で描画される', () => {
    render(itemListComponent.CardItem!({ value: SAMPLE, ctx: CTX }))
    expect(screen.getByText('HAIR')).toBeInTheDocument()
    expect(screen.getByText('OUTFIT')).toBeInTheDocument()
  })

  it('3. url を持つエントリが描画される（code フィールドは廃止済み）', () => {
    render(itemListComponent.CardItem!({ value: SAMPLE, ctx: CTX }))
    expect(screen.getByText('Ash Lilac Waves')).toBeInTheDocument()
  })

  it('4. name が空のエントリは描画されない', () => {
    const value: ItemListValue = [{ category: 'HAIR', name: '' }]
    render(itemListComponent.CardItem!({ value, ctx: CTX, blockConfig: { hideWhenEmpty: false } }))
    expect(screen.queryByText('HAIR')).toBeNull()
  })

  it('5. 空配列 + hideWhenEmpty: true は null を返す', () => {
    const { container } = render(
      itemListComponent.CardItem!({ value: [], ctx: CTX, blockConfig: { hideWhenEmpty: true } })
    )
    expect(container.firstChild).toBeNull()
  })

  it('6. 空配列 + hideWhenEmpty なし は「–」を表示', () => {
    render(itemListComponent.CardItem!({ value: [], ctx: CTX }))
    expect(screen.getByText('–')).toBeInTheDocument()
  })

  it('7. isInteractive + url があるとき <a> タグが存在する', () => {
    const { container } = render(
      itemListComponent.CardItem!({ value: SAMPLE, ctx: CTX, isInteractive: true })
    )
    const links = container.querySelectorAll('a[href]')
    expect(links.length).toBeGreaterThan(0)
    expect((links[0] as HTMLAnchorElement).href).toContain('booth.pm')
  })

  it('8. isInteractive でも url がないエントリは <a> にならない', () => {
    const value: ItemListValue = [{ category: 'OUTFIT', name: 'Celestia Set' }]
    const { container } = render(
      itemListComponent.CardItem!({ value, ctx: CTX, isInteractive: true })
    )
    expect(container.querySelectorAll('a[href]').length).toBe(0)
  })

  it('9. imageUrl があるとき img が描画される', () => {
    const value: ItemListValue = [
      { category: 'HAIR', name: 'Test', imageUrl: 'https://example.com/img.webp' },
    ]
    const { container } = render(itemListComponent.CardItem!({ value, ctx: CTX }))
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img!.src).toContain('example.com')
  })

  it('10. imageUrl がないとき img は描画されない', () => {
    const value: ItemListValue = [{ category: 'HAIR', name: 'Test' }]
    const { container } = render(itemListComponent.CardItem!({ value, ctx: CTX }))
    expect(container.querySelector('img')).toBeNull()
  })

  it('11. compact variant でもエラーなく描画される', () => {
    expect(() =>
      render(itemListComponent.CardItem!({ value: SAMPLE, ctx: CTX, variant: 'compact' }))
    ).not.toThrow()
  })

  it('12. 不正な値（null）を渡してもクラッシュしない', () => {
    expect(() =>
      render(itemListComponent.CardItem!({ value: null as never, ctx: CTX }))
    ).not.toThrow()
  })
})

// ─── FormItem ────────────────────────────────────────────────────────────────
// useContext フックを使うため、コンポーネントとしてラップして render する

const FormWrapper = ({ value, onChange }: { value: ItemListValue; onChange: (v: ItemListValue) => void }) =>
  itemListComponent.FormItem!({ value, onChange, t: {} as never }) as React.ReactElement

describe('itemList FormItem', () => {
  it('20. アイテム追加ボタンが存在する', () => {
    render(<FormWrapper value={[]} onChange={() => {}} />)
    expect(screen.getByText('+ アイテムを追加')).toBeInTheDocument()
  })

  it('21. 追加ボタンを押すと onChange に空エントリが追加される', () => {
    const onChange = vi.fn()
    render(<FormWrapper value={[]} onChange={onChange} />)
    fireEvent.click(screen.getByText('+ アイテムを追加'))
    expect(onChange).toHaveBeenCalledOnce()
    const result = onChange.mock.calls[0][0] as ItemListValue
    expect(result).toHaveLength(1)
  })

  it('22. 削除ボタンを押すとエントリが消える', () => {
    const onChange = vi.fn()
    render(<FormWrapper value={[{ category: 'HAIR', name: 'Test' }]} onChange={onChange} />)
    fireEvent.click(screen.getByText('✕'))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('23. アイテム名を変更すると onChange が正しい値で呼ばれる', () => {
    const onChange = vi.fn()
    render(<FormWrapper value={[{ category: 'HAIR', name: '' }]} onChange={onChange} />)
    const inputs = screen.getAllByRole('textbox')
    const nameInput = inputs.find(el => (el as HTMLInputElement).placeholder?.includes('アイテム名'))
    fireEvent.change(nameInput!, { target: { value: 'New Hair' } })
    const result = onChange.mock.calls[0][0] as ItemListValue
    expect(result[0].name).toBe('New Hair')
  })

  it('24. ImageUploadContext がない場合は画像アップロードUIが表示されない', () => {
    const { container } = render(
      <FormWrapper value={[{ category: 'HAIR', name: 'Test' }]} onChange={() => {}} />
    )
    expect(container.querySelector('input[type="file"]')).toBeNull()
  })
})
