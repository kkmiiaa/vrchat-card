import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { tagListComponent } from '../tagList'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

// tagList.FormItem uses useState internally, so we need to render via React component
function TagListForm(props: Parameters<typeof tagListComponent.FormItem>[0]) {
  return <>{tagListComponent.FormItem!(props)}</>
}

describe('tagList', () => {
  it('1. defaultValue は [] (空配列)', () => {
    expect(tagListComponent.defaultValue).toEqual([])
  })

  it('2. FormItem にタグ入力欄が存在する', () => {
    render(
      <TagListForm
        value={[]}
        onChange={() => {}}
        t={{} as never}
      />
    )
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('3. タグを追加すると onChange に新しいタグを含む配列が渡される', () => {
    const onChange = vi.fn()
    render(
      <TagListForm
        value={[]}
        onChange={onChange}
        t={{} as never}
      />
    )
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'VRC' } })
    fireEvent.click(screen.getByText('追加'))
    expect(onChange).toHaveBeenCalledWith(['VRC'])
  })

  it('4. 削除ボタンをクリックすると削除後の配列が渡される', () => {
    const onChange = vi.fn()
    render(
      <TagListForm
        value={['VRC', 'ゲーム']}
        onChange={onChange}
        t={{} as never}
      />
    )
    const removeButtons = screen.getAllByText('×')
    fireEvent.click(removeButtons[0])
    expect(onChange).toHaveBeenCalledWith(['ゲーム'])
  })

  it('5. blockConfig.maxTags=2 のとき 2個超の追加ができない', () => {
    const onChange = vi.fn()
    render(
      <TagListForm
        value={['VRC', 'ゲーム']}
        onChange={onChange}
        t={{} as never}
        blockConfig={{ maxTags: 2 }}
      />
    )
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '音楽' } })
    fireEvent.click(screen.getByText('追加'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('6. CardItem: blockConfig.prefix="#" のとき # が付与される', () => {
    render(
      tagListComponent.CardItem!({
        value: ['VRC', 'ゲーム'],
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { prefix: '#' },
      })
    )
    expect(screen.getByText('#VRC')).toBeInTheDocument()
    expect(screen.getByText('#ゲーム')).toBeInTheDocument()
  })

  it('6b. blockConfig.prefix が未設定のときプレフィックスは付かない', () => {
    render(
      tagListComponent.CardItem!({
        value: ['VRC'],
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: {},
      })
    )
    expect(screen.getByText('VRC')).toBeInTheDocument()
    expect(screen.queryByText('#VRC')).toBeNull()
  })

  it('11. CardItem: タグが描画される', () => {
    render(
      tagListComponent.CardItem!({
        value: ['VRC', 'ゲーム', '音楽'],
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    expect(screen.getByText('VRC')).toBeInTheDocument()
    expect(screen.getByText('ゲーム')).toBeInTheDocument()
  })

  it('12. CardItem: 空配列はエラーなく描画される', () => {
    expect(() =>
      render(
        tagListComponent.CardItem!({
          value: [],
          ctx: DEFAULT_CARD_RENDER_CONTEXT,
        })
      )
    ).not.toThrow()
  })
})
