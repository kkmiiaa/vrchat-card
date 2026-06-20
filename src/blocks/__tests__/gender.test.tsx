import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { genderComponent } from '../gender'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

describe('gender', () => {
  it('1. defaultValue は { tag: "", display: "" }', () => {
    expect(genderComponent.defaultValue).toEqual({ tag: '', display: '' })
  })

  it('2. global === true', () => {
    expect(genderComponent.global).toBe(true)
  })

  it('3. 固定の性別選択肢が表示される', () => {
    render(
      genderComponent.FormItem!({
        value: { tag: '', display: '' },
        onChange: () => {},
        t: {} as never,
      })
    )
    expect(screen.getByText('男性')).toBeInTheDocument()
    expect(screen.getByText('女性')).toBeInTheDocument()
    expect(screen.getByText('その他')).toBeInTheDocument()
  })

  it('4. blockConfig.allowedTags で選択肢を絞ると指定した選択肢のみ表示される', () => {
    render(
      genderComponent.FormItem!({
        value: { tag: '', display: '' },
        onChange: () => {},
        t: {} as never,
        blockConfig: { allowedTags: ['male', 'female'] },
      })
    )
    expect(screen.getByText('男性')).toBeInTheDocument()
    expect(screen.getByText('女性')).toBeInTheDocument()
    expect(screen.queryByText('その他')).toBeNull()
    expect(screen.queryByText('非公開')).toBeNull()
  })

  it('5. 選択肢をクリックすると { tag, display: "" } が onChange に渡される', () => {
    const onChange = vi.fn()
    render(
      genderComponent.FormItem!({
        value: { tag: '', display: '' },
        onChange,
        t: {} as never,
      })
    )
    fireEvent.click(screen.getByText('女性'))
    expect(onChange).toHaveBeenCalledWith({ tag: 'female', display: '' })
  })

  it('6. tag 選択後に display 入力欄が表示される', () => {
    render(
      genderComponent.FormItem!({
        value: { tag: 'female', display: '' },
        onChange: () => {},
        t: {} as never,
      })
    )
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('11. CardItem: tag と display が描画される', () => {
    render(
      genderComponent.CardItem!({
        value: { tag: 'female', display: 'ふわふわ系' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    expect(screen.getByText('ふわふわ系')).toBeInTheDocument()
  })

  it('12. CardItem: tag が空のとき「-」が表示される（null を返さない）', () => {
    render(
      genderComponent.CardItem!({
        value: { tag: '', display: '' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('13. CardItem: アイコンとテキストが同一行（flex row）に描画される', () => {
    const { container } = render(
      genderComponent.CardItem!({
        value: { tag: 'female', display: '女性' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    // アイコン+テキストを包む内側 div は flex（row がデフォルト）
    const innerRow = container.querySelector('div > div > div') as HTMLElement
    expect(innerRow.style.display).toBe('flex')
    // flexDirection は 'row' か未設定（row がデフォルト）
    expect(innerRow.style.flexDirection).not.toBe('column')
  })

  it('14. CardItem: 非公開の場合は「-」が表示される', () => {
    render(
      genderComponent.CardItem!({
        value: { tag: 'none', display: '' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('15. CardItem: 非公開の場合は null を返さない', () => {
    const result = genderComponent.CardItem!({
      value: { tag: 'none', display: '' },
      ctx: DEFAULT_CARD_RENDER_CONTEXT,
    })
    expect(result).not.toBeNull()
  })

  // ─── 空・非公開時の「-」表示：配置と色 ─────────────────────────────

  it('16. CardItem / default: tag が空のとき「-」のテキスト色は subText', () => {
    const { container } = render(
      genderComponent.CardItem!({
        value: { tag: '', display: '' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    const span = container.querySelector('span') as HTMLElement
    expect(span.style.color).toBe(DEFAULT_CARD_RENDER_CONTEXT.theme.subText)
  })

  it('17. CardItem / default: tag が空のとき「-」は縦中央に配置される（justifyContent: center）', () => {
    const { container } = render(
      genderComponent.CardItem!({
        value: { tag: '', display: '' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.style.justifyContent).toBe('center')
  })

  it('18. CardItem / default: tag が空のとき「-」を包む内側行は alignItems: center（横方向に中央揃え）', () => {
    const { container } = render(
      genderComponent.CardItem!({
        value: { tag: '', display: '' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    // root div > innerRow div（アイコン+テキストを横並びにする行）
    const innerRow = container.querySelector('div > div > div') as HTMLElement
    expect(innerRow.style.alignItems).toBe('center')
  })

  it('19. CardItem / compact: tag が空のとき「-」のテキスト色は subText', () => {
    const { container } = render(
      genderComponent.CardItem!({
        value: { tag: '', display: '' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        variant: 'compact',
      })
    )
    const span = container.querySelector('span') as HTMLElement
    expect(span.style.color).toBe(DEFAULT_CARD_RENDER_CONTEXT.theme.subText)
  })

  it('20. CardItem / compact: tag が空のとき「-」は横・縦ともに中央配置（justifyContent / alignItems: center）', () => {
    const { container } = render(
      genderComponent.CardItem!({
        value: { tag: '', display: '' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        variant: 'compact',
      })
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.style.justifyContent).toBe('center')
    expect(root.style.alignItems).toBe('center')
  })

  it('21. CardItem / default: tag が "none"（非公開）のとき「-」のテキスト色は text（通常色）', () => {
    // tag='none' は isEmpty=false のため通常の text 色が適用される
    // （tag='' の未設定とは異なり、「非公開」という意思表示として扱う）
    const { container } = render(
      genderComponent.CardItem!({
        value: { tag: 'none', display: '' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    const span = container.querySelector('span') as HTMLElement
    expect(span.style.color).toBe(DEFAULT_CARD_RENDER_CONTEXT.theme.text)
  })

  it('22. CardItem / default: tag が "none"（非公開）のとき「-」は縦中央配置（justifyContent: center）', () => {
    const { container } = render(
      genderComponent.CardItem!({
        value: { tag: 'none', display: '' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
      })
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.style.justifyContent).toBe('center')
  })
})
