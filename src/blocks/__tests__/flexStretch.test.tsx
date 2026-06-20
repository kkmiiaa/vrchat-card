/**
 * flex stretch 互換性テスト
 *
 * GenericCardRenderer は minH を持つブロックの wrapper に
 * `display: flex; align-items: stretch; min-height: X` を設定し、
 * コンポーネントの高さを minH に追従させる。
 *
 * コンポーネントのルート div に `height: '100%'` が設定されていると
 * flex の align-items: stretch が無効になり minH に追従しなくなる。
 * （height: 100% は親に定義された height が必要。minHeight のみでは auto に解決される）
 *
 * このテストは上記バグの回帰を防ぐ。
 * 対象コンポーネントのルート div が height: '100%' を持たないことを確認する。
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { genderComponent } from '../gender'
import { ageComponent } from '../age'
import { colorStatusComponent } from '../colorStatus'
import { selectComponent } from '../select'
import { snsWithFriendPolicyComponent } from '../snsWithFriendPolicy'
import { simpleSnsComponent } from '../simpleSns'
import { galleryComponent } from '../gallery'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

const CTX = DEFAULT_CARD_RENDER_CONTEXT

/** ルート div の style を取得するヘルパー */
function getRootStyle(container: HTMLElement): CSSStyleDeclaration {
  const root = container.firstElementChild as HTMLElement
  return root?.style ?? ({} as CSSStyleDeclaration)
}

describe('flex stretch 互換性: ルート div が height: 100% を持たない', () => {
  it('gender / default: ルート div に height: 100% が設定されていない', () => {
    const { container } = render(
      genderComponent.CardItem!({ value: { tag: 'female', display: '女性' }, ctx: CTX, variant: 'default' })
    )
    expect(getRootStyle(container).height).not.toBe('100%')
  })

  it('gender / compact: ルート div に height: 100% が設定されていない', () => {
    const { container } = render(
      genderComponent.CardItem!({ value: { tag: 'female', display: '女性' }, ctx: CTX, variant: 'compact' })
    )
    expect(getRootStyle(container).height).not.toBe('100%')
  })

  it('age / default: ルート div に height: 100% が設定されていない', () => {
    const { container } = render(
      ageComponent.CardItem!({ value: { searchTag: '20代', display: '20代' }, ctx: CTX, variant: 'default' })
    )
    expect(getRootStyle(container).height).not.toBe('100%')
  })

  it('age / badge: ルート div に height: 100% が設定されていない', () => {
    const { container } = render(
      ageComponent.CardItem!({ value: { searchTag: '20代', display: '20代' }, ctx: CTX, variant: 'badge' })
    )
    expect(getRootStyle(container).height).not.toBe('100%')
  })

  it('colorStatus / default: ルート div に height: 100% が設定されていない', () => {
    const { container } = render(
      colorStatusComponent.CardItem!({
        value: { blue: true, green: false, yellow: false, red: false },
        ctx: CTX,
        variant: 'default',
        blockConfig: { fields: [{ key: 'blue', color: '#60a5fa', label: '青' }] },
      })
    )
    expect(getRootStyle(container).height).not.toBe('100%')
  })

  it('select / default (labelInset): ルート div に height: 100% が設定されていない', () => {
    const label = { text: 'トラスト', dir: 'row' as const }
    const { container } = render(
      selectComponent.CardItem!({
        value: 'user',
        ctx: CTX,
        variant: 'default',
        label,
        blockConfig: { options: [{ value: 'user', label: 'User' }] },
      })
    )
    expect(getRootStyle(container).height).not.toBe('100%')
  })

  it('snsWithFriendPolicy / default: ルート div に height: 100% が設定されていない', () => {
    const { container } = render(
      snsWithFriendPolicyComponent.CardItem!({
        value: { frPolicyAnyone: true },
        ctx: CTX,
        variant: 'default',
        blockConfig: {
          platform: 'vrchat',
          policies: [{ icon: 'TbHeart', label: 'だれでもOK', value: 'frPolicyAnyone' }],
        },
      })
    )
    expect(getRootStyle(container).height).not.toBe('100%')
  })

  it('simpleSns / glass: ルート div に height: 100% が設定されていない', () => {
    const { container } = render(
      simpleSnsComponent.CardItem!({
        value: { handle: '@test' },
        ctx: CTX,
        variant: 'glass',
        blockConfig: { platform: 'x' },
      })
    )
    expect(getRootStyle(container).height).not.toBe('100%')
  })

  it('gallery / default: ルート div に height: 100% が設定されている（minH を親から継承するため）', () => {
    const { container } = render(
      galleryComponent.CardItem!({
        value: { enabled: true, images: [null, null, null], base64: ['data:image/png;base64,abc', null, null] },
        ctx: CTX,
        variant: 'default',
      })
    )
    expect(getRootStyle(container).height).toBe('100%')
  })
})
