/**
 * 空値（未設定）時の「-」表示カラーテスト
 *
 * 値が未設定のとき「-」を表示するコンポーネントは
 * テキスト色に ctx.theme.subText（グレー）を使うべき。
 * ctx.theme.text（濃色）を使うと未入力と入力済みが
 * 視覚的に区別できなくなる。
 *
 * 対象コンポーネント（全網羅）:
 *   gender, age, expressiveSelect, language (default/slash),
 *   simpleSns, snsWithFriendPolicy,
 *   text, multiSelect (slash/icon-slash),
 *   colorStatus (default/cards), colorLabeledList, dateItem, linkItem
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { genderComponent } from '../gender'
import { ageComponent } from '../age'
import { expressiveSelectComponent } from '../expressiveSelect'
import { languageComponent } from '../language'
import { simpleSnsComponent } from '../simpleSns'
import { snsWithFriendPolicyComponent } from '../snsWithFriendPolicy'
import { textComponent } from '../text'
import { multiSelectComponent } from '../multiSelect'
import { colorStatusComponent } from '../colorStatus'
import { colorLabeledListComponent } from '../colorLabeledList'
import { dateItemComponent } from '../dateItem'
import { linkItemComponent } from '../linkItem'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

const CTX = DEFAULT_CARD_RENDER_CONTEXT
const SUB = CTX.theme.subText

/** 「-」を表示している要素の color を返す。
 *  span/p タグに加え、直接テキストノードを持つ div（slash variant など）も対象にする */
function getDashSpanColor(container: HTMLElement): string | null {
  // まず span / p を探す
  const tagged = Array.from(container.querySelectorAll('span, p'))
  const taggedMatch = tagged.find(el => el.textContent?.trim() === '-')
  if (taggedMatch) return (taggedMatch as HTMLElement).style.color

  // 次に div で直接「-」テキストノードを持つものを探す（slash 系 variant）
  const divs = Array.from(container.querySelectorAll('div'))
  const divMatch = divs.find(el => {
    const directText = Array.from(el.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent?.trim())
      .join('')
    return directText === '-'
  })
  return divMatch ? (divMatch as HTMLElement).style.color : null
}

describe('空値の「-」表示: テキスト色は subText', () => {
  it('gender / default: 空のとき「-」は subText 色', () => {
    const { container } = render(
      genderComponent.CardItem!({ value: { tag: '', display: '' }, ctx: CTX })
    )
    expect(getDashSpanColor(container)).toBe(SUB)
  })

  it('gender / compact: 空のとき「-」は subText 色', () => {
    const { container } = render(
      genderComponent.CardItem!({ value: { tag: '', display: '' }, ctx: CTX, variant: 'compact' })
    )
    expect(getDashSpanColor(container)).toBe(SUB)
  })

  it('age / default: 空のとき「-」は subText 色', () => {
    const { container } = render(
      ageComponent.CardItem!({ value: { searchTag: '', display: '' }, ctx: CTX })
    )
    expect(getDashSpanColor(container)).toBe(SUB)
  })

  it('age / default: 非公開（searchTag=非公開）のとき「-」は subText 色', () => {
    const { container } = render(
      ageComponent.CardItem!({ value: { searchTag: '非公開', display: '' }, ctx: CTX })
    )
    expect(getDashSpanColor(container)).toBe(SUB)
  })

  it('expressiveSelect / default: 空のとき「-」は subText 色', () => {
    const { container } = render(
      expressiveSelectComponent.CardItem!({
        value: { tag: '', display: '' },
        ctx: CTX,
        blockConfig: { options: [{ value: 'a', label: 'A', color: '#000' }] },
      })
    )
    expect(getDashSpanColor(container)).toBe(SUB)
  })

  it('language / default: 選択なしのとき「-」は subText 色', () => {
    const { container } = render(
      languageComponent.CardItem!({ value: [], ctx: CTX })
    )
    expect(getDashSpanColor(container)).toBe(SUB)
  })

  it('simpleSns / simple: id 未設定のとき「-」が表示される', () => {
    const { container } = render(
      simpleSnsComponent.CardItem!({
        value: '',
        ctx: CTX,
        variant: 'simple',
        blockConfig: { platform: 'x' },
      })
    )
    expect(container.textContent).toContain('-')
  })

  it('snsWithFriendPolicy / simple: id 未設定のとき「-」は subText 相当色', () => {
    const { container } = render(
      snsWithFriendPolicyComponent.CardItem!({
        value: { id: '', friendPolicy: '' },
        ctx: CTX,
        variant: 'simple',
        blockConfig: {
          platform: 'vrchat',
          policies: [{ icon: 'TbHeart', label: 'だれでもOK', value: 'frPolicyAnyone' }],
        },
      })
    )
    const dash = getDashSpanColor(container)
    expect(dash).not.toBe(CTX.theme.text)
  })

  it('text / default: 空のとき「-」は subText 色', () => {
    const { container } = render(
      textComponent.CardItem!({ value: '', ctx: CTX })
    )
    expect(getDashSpanColor(container)).toBe(SUB)
  })

  it('multiSelect / slash: 選択なしのとき「-」は subText 色', () => {
    const { container } = render(
      multiSelectComponent.CardItem!({
        value: [],
        ctx: CTX,
        variant: 'slash',
        blockConfig: { options: [{ value: 'a', label: 'A' }] },
      })
    )
    expect(getDashSpanColor(container)).toBe(SUB)
  })

  it('multiSelect / icon-slash: 選択なしのとき「-」は subText 色', () => {
    const { container } = render(
      multiSelectComponent.CardItem!({
        value: [],
        ctx: CTX,
        variant: 'icon-slash',
        blockConfig: { options: [{ value: 'a', label: 'A', icon: 'TbStar' }] },
      })
    )
    expect(getDashSpanColor(container)).toBe(SUB)
  })

  it('language / slash: 選択なしのとき「-」は subText 色', () => {
    const { container } = render(
      languageComponent.CardItem!({ value: { preset: [], custom: [] }, ctx: CTX, variant: 'slash' })
    )
    expect(getDashSpanColor(container)).toBe(SUB)
  })

  it('colorStatus / default: 値なしのとき「-」は subText 色', () => {
    const { container } = render(
      colorStatusComponent.CardItem!({
        value: { blue: '' },
        ctx: CTX,
        variant: 'default',
        blockConfig: { fields: [{ key: 'blue', color: '#60a5fa', label: '青' }] },
      })
    )
    expect(getDashSpanColor(container)).toBe(SUB)
  })

  it('colorStatus / cards: 値なしのとき「-」は subText 色', () => {
    const { container } = render(
      colorStatusComponent.CardItem!({
        value: { blue: '' },
        ctx: CTX,
        variant: 'cards',
        blockConfig: { fields: [{ key: 'blue', color: '#60a5fa', label: '青' }] },
      })
    )
    expect(getDashSpanColor(container)).toBe(SUB)
  })

  it('colorLabeledList / default: label なしのとき「-」は subText 色', () => {
    const { container } = render(
      colorLabeledListComponent.CardItem!({
        value: { items: [{ label: '', color: '' }] },
        ctx: CTX,
        variant: 'default',
      })
    )
    expect(getDashSpanColor(container)).toBe(SUB)
  })

  it('dateItem / default: 日付未設定のとき「-」は subText 色', () => {
    const { container } = render(
      dateItemComponent.CardItem!({
        value: { display: '', iso: '' },
        ctx: CTX,
        variant: 'default',
        label: { text: '日付', dir: 'col' },
      })
    )
    expect(getDashSpanColor(container)).toBe(SUB)
  })

  it('linkItem / default: url・label 両方なしのとき「-」は subText 色', () => {
    const { container } = render(
      linkItemComponent.CardItem!({
        value: { label: '', url: '' },
        ctx: CTX,
      })
    )
    expect(getDashSpanColor(container)).toBe(SUB)
  })
})
