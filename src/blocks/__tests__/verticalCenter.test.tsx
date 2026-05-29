/**
 * 各コンポーネントの白ボックス（flex column container）が
 * justifyContent: 'center' を持ち、テキストが縦中央揃えになることを確認するテスト
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { textComponent } from '../text'
import { languageComponent } from '../language'
import { genderComponent } from '../gender'
import { selectComponent } from '../select'
import { multiSelectComponent } from '../multiSelect'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'
import type { LabelDef } from '../types'

const LABEL: LabelDef = { text: 'LABEL', dir: 'col' }
const CTX = DEFAULT_CARD_RENDER_CONTEXT

// ─── text ─────────────────────────────────────────────────────────────────────

describe('text: 縦中央揃え', () => {
  it('ラベルなし・single line のとき root div に justifyContent: center が設定される', () => {
    const { container } = render(
      textComponent.CardItem!({
        value: 'テスト',
        ctx: CTX,
        blockConfig: { multiline: false },
      })
    )
    const root = container.querySelector('div') as HTMLElement
    expect(root.style.justifyContent).toBe('center')
  })

  it('multiline のとき justifyContent は flex-start（上揃え）', () => {
    const { container } = render(
      textComponent.CardItem!({
        value: 'テスト\n2行目',
        ctx: CTX,
        blockConfig: { multiline: true },
      })
    )
    const root = container.querySelector('div') as HTMLElement
    expect(root.style.justifyContent).toBe('flex-start')
  })

  it('labelInset（col方向）のとき justifyContent: center が設定される', () => {
    const { container } = render(
      textComponent.CardItem!({
        value: 'テスト',
        ctx: CTX,
        label: LABEL,
        blockConfig: { multiline: false },
      })
    )
    const root = container.querySelector('div') as HTMLElement
    expect(root.style.justifyContent).toBe('center')
  })

  it('labelInset（row方向）のとき justifyContent は設定されない', () => {
    const { container } = render(
      textComponent.CardItem!({
        value: 'テスト',
        ctx: CTX,
        label: { text: 'LABEL', dir: 'row' },
        blockConfig: { multiline: false },
      })
    )
    const root = container.querySelector('div') as HTMLElement
    expect(root.style.justifyContent).toBeFalsy()
  })
})

// ─── language ─────────────────────────────────────────────────────────────────

describe('language: 縦中央揃え（slash variant）', () => {
  it('slash variant のとき root div に justifyContent: center が設定される', () => {
    const { container } = render(
      languageComponent.CardItem!({
        value: { preset: ['日本語'], custom: [] },
        ctx: CTX,
        variant: 'slash',
      })
    )
    const root = container.querySelector('div') as HTMLElement
    expect(root.style.justifyContent).toBe('center')
  })

  it('slash・labelInset（row方向）のとき justifyContent は設定されない', () => {
    const { container } = render(
      languageComponent.CardItem!({
        value: { preset: ['日本語'], custom: [] },
        ctx: CTX,
        variant: 'slash',
        label: { text: 'LANG', dir: 'row' },
      })
    )
    const root = container.querySelector('div') as HTMLElement
    expect(root.style.justifyContent).toBeFalsy()
  })
})

// ─── gender ───────────────────────────────────────────────────────────────────

describe('gender: 縦中央揃え', () => {
  it('ラベルなしのとき root div に justifyContent: center が設定される', () => {
    const { container } = render(
      genderComponent.CardItem!({
        value: { tag: 'female', display: '女性' },
        ctx: CTX,
      })
    )
    const root = container.querySelector('div') as HTMLElement
    expect(root.style.justifyContent).toBe('center')
  })

  it('labelInset（row方向）のとき justifyContent は設定されない', () => {
    const { container } = render(
      genderComponent.CardItem!({
        value: { tag: 'female', display: '女性' },
        ctx: CTX,
        label: { text: 'GENDER', dir: 'row' },
      })
    )
    const root = container.querySelector('div') as HTMLElement
    expect(root.style.justifyContent).toBeFalsy()
  })
})

// ─── select ───────────────────────────────────────────────────────────────────

describe('select: 縦中央揃え（labelInset時）', () => {
  it('labelInset（col方向）のとき container に justifyContent: center が設定される', () => {
    const { container } = render(
      selectComponent.CardItem!({
        value: 'user',
        ctx: CTX,
        label: LABEL,
        blockConfig: { options: [{ value: 'user', label: 'User' }] },
      })
    )
    const root = container.querySelector('div') as HTMLElement
    expect(root.style.justifyContent).toBe('center')
  })

  it('labelInset（row方向）のとき justifyContent は設定されない', () => {
    const { container } = render(
      selectComponent.CardItem!({
        value: 'user',
        ctx: CTX,
        label: { text: 'RANK', dir: 'row' },
        blockConfig: { options: [{ value: 'user', label: 'User' }] },
      })
    )
    const root = container.querySelector('div') as HTMLElement
    expect(root.style.justifyContent).toBeFalsy()
  })
})

// ─── multiSelect ──────────────────────────────────────────────────────────────

describe('multiSelect: 縦中央揃え', () => {
  it('slash variant・labelInset（col方向）のとき justifyContent: center が設定される', () => {
    const { container } = render(
      multiSelectComponent.CardItem!({
        value: ['pcvr'],
        ctx: CTX,
        variant: 'slash',
        label: LABEL,
        blockConfig: { options: [{ value: 'pcvr', label: 'PCVR' }] },
      })
    )
    const root = container.querySelector('div') as HTMLElement
    expect(root.style.justifyContent).toBe('center')
  })

  it('icon-slash variant・labelInset（col方向）のとき justifyContent: center が設定される', () => {
    const { container } = render(
      multiSelectComponent.CardItem!({
        value: ['pcvr'],
        ctx: CTX,
        variant: 'icon-slash',
        label: LABEL,
        blockConfig: { options: [{ value: 'pcvr', label: 'PCVR' }] },
      })
    )
    const root = container.querySelector('div') as HTMLElement
    expect(root.style.justifyContent).toBe('center')
  })
})
