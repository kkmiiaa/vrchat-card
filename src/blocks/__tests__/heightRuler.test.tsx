import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { heightRulerComponent } from '../heightRuler'
import type { HeightRulerValue } from '../heightRuler'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

const CTX = DEFAULT_CARD_RENDER_CONTEXT

const DEFAULT: HeightRulerValue = {
  height: 160,
  avatarImage: null,
  imageScale: 1,
  imageOffsetY: 0,
}

// ─── defaultValue ────────────────────────────────────────────────────────────

describe('heightRuler defaultValue', () => {
  it('height=160, avatarImage=null, imageScale=1, imageOffsetY=0', () => {
    expect(heightRulerComponent.defaultValue).toEqual({
      height: 160,
      avatarImage: null,
      imageScale: 1,
      imageOffsetY: 0,
    })
  })
})

// ─── CardItem ────────────────────────────────────────────────────────────────

describe('heightRuler CardItem', () => {
  it('1. 身長マーカーラベルが描画される', () => {
    render(heightRulerComponent.CardItem!({ value: DEFAULT, ctx: CTX }))
    expect(screen.getByText('160 cm')).toBeInTheDocument()
  })

  it('2. 任意の身長が反映される', () => {
    render(heightRulerComponent.CardItem!({
      value: { ...DEFAULT, height: 154 },
      ctx: CTX,
    }))
    expect(screen.getByText('154 cm')).toBeInTheDocument()
  })

  it('3. avatarImage (base64) があるとき img が描画される', () => {
    const { container } = render(heightRulerComponent.CardItem!({
      value: { ...DEFAULT, avatarImage: 'data:image/png;base64,abc' },
      ctx: CTX,
    }))
    expect(container.querySelector('img')).not.toBeNull()
  })

  it('4. avatarImageUrl があるとき URL が src に使われる', () => {
    const { container } = render(heightRulerComponent.CardItem!({
      value: { ...DEFAULT, avatarImageUrl: 'https://example.com/avatar.webp' },
      ctx: CTX,
    }))
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img!.src).toContain('example.com')
  })

  it('5. avatarImageUrl を avatarImage より優先する', () => {
    const { container } = render(heightRulerComponent.CardItem!({
      value: {
        ...DEFAULT,
        avatarImage: 'data:image/png;base64,old',
        avatarImageUrl: 'https://example.com/new.webp',
      },
      ctx: CTX,
    }))
    const img = container.querySelector('img')
    expect(img!.src).toContain('example.com')
    expect(img!.src).not.toContain('base64')
  })

  it('6. 画像なしのとき img が存在しない', () => {
    const { container } = render(heightRulerComponent.CardItem!({ value: DEFAULT, ctx: CTX }))
    expect(container.querySelector('img')).toBeNull()
  })

  it('7. blockConfig.maxHeight が反映される（ラベルは変わらないがエラーにならない）', () => {
    expect(() =>
      render(heightRulerComponent.CardItem!({
        value: { ...DEFAULT, height: 180 },
        ctx: CTX,
        blockConfig: { maxHeight: 250 },
      }))
    ).not.toThrow()
    expect(screen.getByText('180 cm')).toBeInTheDocument()
  })

  it('8. 不正な値（null）を渡してもクラッシュしない', () => {
    expect(() =>
      render(heightRulerComponent.CardItem!({ value: null as never, ctx: CTX }))
    ).not.toThrow()
  })

  it('9. SVG が描画される', () => {
    const { container } = render(heightRulerComponent.CardItem!({ value: DEFAULT, ctx: CTX }))
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('10. 目盛りラベル（50, 100, 150, 200）が描画される', () => {
    render(heightRulerComponent.CardItem!({ value: DEFAULT, ctx: CTX }))
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
  })
})

// ─── FormItem ────────────────────────────────────────────────────────────────
// useContext フックを使うため、コンポーネントとしてラップして render する

const FormWrapper = ({ value, onChange }: { value: HeightRulerValue; onChange: (v: HeightRulerValue) => void }) =>
  heightRulerComponent.FormItem!({ value, onChange, t: {} as never }) as React.ReactElement

describe('heightRuler FormItem', () => {
  it('20. 身長入力欄が存在する', () => {
    render(<FormWrapper value={DEFAULT} onChange={() => {}} />)
    const input = screen.getByRole('spinbutton')
    expect(input).toBeInTheDocument()
    expect((input as HTMLInputElement).value).toBe('160')
  })

  it('21. 身長を変更すると onChange が呼ばれる', () => {
    const onChange = vi.fn()
    render(<FormWrapper value={DEFAULT} onChange={onChange} />)
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '154' } })
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange.mock.calls[0][0].height).toBe(154)
  })

  it('22. 画像削除ボタンは画像がないとき表示されない', () => {
    render(<FormWrapper value={DEFAULT} onChange={() => {}} />)
    expect(screen.queryByText('画像を削除')).toBeNull()
  })

  it('23. avatarImage があるとき画像削除ボタンが表示される', () => {
    render(<FormWrapper value={{ ...DEFAULT, avatarImage: 'data:image/png;base64,abc' }} onChange={() => {}} />)
    expect(screen.getByText('画像を削除')).toBeInTheDocument()
  })

  it('24. 画像削除ボタンを押すと avatarImage と avatarImageUrl が null になる', () => {
    const onChange = vi.fn()
    render(<FormWrapper
      value={{ ...DEFAULT, avatarImage: 'data:image/png;base64,abc', avatarImageUrl: 'https://example.com/img.webp' }}
      onChange={onChange}
    />)
    fireEvent.click(screen.getByText('画像を削除'))
    const result = onChange.mock.calls[0][0] as HeightRulerValue
    expect(result.avatarImage).toBeNull()
    expect(result.avatarImageUrl).toBeNull()
  })
})

// ─── blockConfigForm ─────────────────────────────────────────────────────────

describe('heightRuler blockConfigForm', () => {
  it('30. maxHeight 入力欄が存在する', () => {
    render(heightRulerComponent.blockConfigForm!({
      blockConfig: {},
      onChange: () => {},
    }))
    const input = screen.getByRole('spinbutton')
    expect(input).toBeInTheDocument()
  })

  it('31. maxHeight を変更すると onChange が呼ばれる', () => {
    const onChange = vi.fn()
    render(heightRulerComponent.blockConfigForm!({
      blockConfig: { maxHeight: 200 },
      onChange,
    }))
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '250' } })
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange.mock.calls[0][0].maxHeight).toBe(250)
  })
})
