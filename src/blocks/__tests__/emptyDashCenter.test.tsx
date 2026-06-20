/**
 * 空値時の「-」中央配置テスト
 *
 * 値が未設定のとき「-」を表示するコンポーネントは
 * justifyContent: 'center' かつ alignItems: 'center' のラッパーで
 * 中央配置されるべき。
 *
 * 対象コンポーネント（全網羅）:
 *   select, gender, age, language (default/slash),
 *   multiSelect (default/slash/icon-slash),
 *   colorLabeledList, badgeList, markList
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { selectComponent } from '../select'
import { genderComponent } from '../gender'
import { ageComponent } from '../age'
import { languageComponent } from '../language'
import { multiSelectComponent } from '../multiSelect'
import { colorLabeledListComponent } from '../colorLabeledList'
import { badgeListComponent } from '../badgeList'
import { markListComponent } from '../markList'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

const CTX = DEFAULT_CARD_RENDER_CONTEXT

/** 「-」を含む要素の最も近い祖先 div の justifyContent / alignItems を返す */
function getDashWrapperStyle(container: HTMLElement): { justifyContent: string; alignItems: string } | null {
  const spans = Array.from(container.querySelectorAll('span, p'))
  const dash = spans.find(el => el.textContent?.trim() === '-')
  if (!dash) return null
  // 親要素を辿って div を探す
  let el: HTMLElement | null = dash.parentElement
  while (el && el !== container) {
    if (el.tagName === 'DIV') {
      return { justifyContent: el.style.justifyContent, alignItems: el.style.alignItems }
    }
    el = el.parentElement
  }
  return null
}

describe('空値の「-」中央配置', () => {
  it('select: 空のとき「-」のラッパーが中央配置', () => {
    const { container } = render(
      selectComponent.CardItem!({ value: '', ctx: CTX, blockConfig: { options: [] } })
    )
    const s = getDashWrapperStyle(container)
    expect(s?.justifyContent).toBe('center')
    expect(s?.alignItems).toBe('center')
  })

  it('gender / default: 空のとき「-」が縦中央（justifyContent: center）', () => {
    const { container } = render(
      genderComponent.CardItem!({ value: { tag: '', display: '' }, ctx: CTX })
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.style.justifyContent).toBe('center')
  })

  it('gender / compact: 空のとき「-」が横・縦中央', () => {
    const { container } = render(
      genderComponent.CardItem!({ value: { tag: '', display: '' }, ctx: CTX, variant: 'compact' })
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.style.justifyContent).toBe('center')
    expect(root.style.alignItems).toBe('center')
  })

  it('age / default: 空のとき「-」が縦中央（justifyContent: center）', () => {
    const { container } = render(
      ageComponent.CardItem!({ value: { searchTag: '', display: '' }, ctx: CTX })
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.style.justifyContent).toBe('center')
  })

  it('language / default: 空のとき「-」のラッパーが中央配置', () => {
    const { container } = render(
      languageComponent.CardItem!({ value: { preset: [], custom: [] }, ctx: CTX })
    )
    const s = getDashWrapperStyle(container)
    expect(s?.justifyContent).toBe('center')
    expect(s?.alignItems).toBe('center')
  })

  it('language / slash: 空のとき「-」が縦中央（justifyContent: center）', () => {
    const { container } = render(
      languageComponent.CardItem!({ value: { preset: [], custom: [] }, ctx: CTX, variant: 'slash' })
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.style.justifyContent).toBe('center')
  })

  it('multiSelect / default: 空のとき「-」のラッパーが中央配置', () => {
    const { container } = render(
      multiSelectComponent.CardItem!({ value: [], ctx: CTX, blockConfig: { options: [] } })
    )
    const s = getDashWrapperStyle(container)
    expect(s?.justifyContent).toBe('center')
    expect(s?.alignItems).toBe('center')
  })

  it('multiSelect / slash: 空のとき「-」が縦中央（justifyContent: center）', () => {
    const { container } = render(
      multiSelectComponent.CardItem!({ value: [], ctx: CTX, variant: 'slash', blockConfig: { options: [] } })
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.style.justifyContent).toBe('center')
  })

  it('multiSelect / icon-slash: 空のとき「-」のラッパーが中央配置', () => {
    const { container } = render(
      multiSelectComponent.CardItem!({ value: [], ctx: CTX, variant: 'icon-slash', blockConfig: { options: [] } })
    )
    const s = getDashWrapperStyle(container)
    expect(s?.justifyContent).toBe('center')
  })

  it('colorLabeledList: 空のとき「-」のラッパーが中央配置', () => {
    const { container } = render(
      colorLabeledListComponent.CardItem!({ value: { items: [] }, ctx: CTX })
    )
    const s = getDashWrapperStyle(container)
    expect(s?.justifyContent).toBe('center')
    expect(s?.alignItems).toBe('center')
  })

  it('badgeList: 空のとき「-」のラッパーが中央配置', () => {
    const { container } = render(
      badgeListComponent.CardItem!({ value: [], ctx: CTX })
    )
    const s = getDashWrapperStyle(container)
    expect(s?.justifyContent).toBe('center')
    expect(s?.alignItems).toBe('center')
  })

  it('markList: 空のとき「-」のラッパーが中央配置', () => {
    const { container } = render(
      markListComponent.CardItem!({
        value: { preset: [], custom: [] },
        ctx: CTX,
        blockConfig: { items: [] },
      })
    )
    const s = getDashWrapperStyle(container)
    expect(s?.justifyContent).toBe('center')
    expect(s?.alignItems).toBe('center')
  })
})
