import { describe, it, expect, vi } from 'vitest'

// next/font/google は Node 環境では動作しないためモック
const fontMock = () => ({ className: 'mock-font', style: { fontFamily: 'mock' }, variable: '--mock' })
vi.mock('next/font/google', () => ({
  M_PLUS_Rounded_1c: fontMock,
  Kosugi_Maru:       fontMock,
  Zen_Maru_Gothic:   fontMock,
  Kaisei_Tokumin:    fontMock,
  Klee_One:          fontMock,
}))
vi.mock('next/font/local', () => ({ default: fontMock }))

const { v1Template } = await import('../v1')
const { v2Template } = await import('../v2')

// ─── v1 テンプレート構造 ──────────────────────────────────────────────────────

describe('v1Template', () => {
  it('id が "v1" である', () => {
    expect(v1Template.id).toBe('v1')
  })

  it('sections が5つある', () => {
    expect(v1Template.sections).toHaveLength(5)
  })

  it('sections の順序が仕様通り', () => {
    const titles = v1Template.sections.map(s => s.titleKey)
    expect(titles).toEqual([
      'カードデザイン',
      'プロフィール情報',
      'SNS・コンタクト',
      '自己紹介・画像',
      '使用環境・言語',
    ])
  })

  it('カードデザインセクションが defaultOpen=true', () => {
    const section = v1Template.sections.find(s => s.titleKey === 'カードデザイン')
    expect(section?.defaultOpen).toBe(true)
  })

  it('プロフィール情報に name ブロックが含まれる', () => {
    const section = v1Template.sections.find(s => s.titleKey === 'プロフィール情報')
    expect(section?.blockKeys).toContain('name')
  })

  it('SNS・コンタクトに sns と friendPolicy が含まれる', () => {
    const section = v1Template.sections.find(s => s.titleKey === 'SNS・コンタクト')
    expect(section?.blockKeys).toContain('sns')
    expect(section?.blockKeys).toContain('friendPolicy')
  })

  it('使用環境・言語に micOnRate が含まれる', () => {
    const section = v1Template.sections.find(s => s.titleKey === '使用環境・言語')
    expect(section?.blockKeys).toContain('micOnRate')
  })

  it('v1 には activity ブロックが存在しない', () => {
    const allBlockKeys = v1Template.sections.flatMap(s => s.blockKeys)
    expect(allBlockKeys).not.toContain('activity')
  })

  it('blocks に全 blockKey に対応するブロックが登録されている', () => {
    const allBlockKeys = v1Template.sections.flatMap(s => s.blockKeys)
    const registeredKeys = v1Template.blocks.map(b => b.key)
    for (const key of allBlockKeys) {
      expect(registeredKeys).toContain(key)
    }
  })
})

// ─── v2 テンプレート構造 ──────────────────────────────────────────────────────

describe('v2Template', () => {
  it('id が "v2" である', () => {
    expect(v2Template.id).toBe('v2')
  })

  it('sections が4つある', () => {
    expect(v2Template.sections).toHaveLength(4)
  })

  it('sections の順序が仕様通り', () => {
    const titles = v2Template.sections.map(s => s.titleKey)
    expect(titles).toEqual([
      'カードデザイン',
      'プロフィール情報',
      'SNS・コンタクト',
      '自己紹介・画像',
    ])
  })

  it('プロフィール情報に micOnRate が含まれる（v2 は このセクション内）', () => {
    const section = v2Template.sections.find(s => s.titleKey === 'プロフィール情報')
    expect(section?.blockKeys).toContain('micOnRate')
  })

  it('SNS・コンタクトに activity が含まれる（v2 のみ）', () => {
    const section = v2Template.sections.find(s => s.titleKey === 'SNS・コンタクト')
    expect(section?.blockKeys).toContain('activity')
  })

  it('v2 には friendPolicy ブロックが存在しない（snsWithFriendPolicy に統合済み）', () => {
    const allBlockKeys = v2Template.sections.flatMap(s => s.blockKeys)
    expect(allBlockKeys).not.toContain('friendPolicy')
  })

  it('blocks に全 blockKey に対応するブロックが登録されている', () => {
    const allBlockKeys = v2Template.sections.flatMap(s => s.blockKeys)
    const registeredKeys = v2Template.blocks.map(b => b.key)
    for (const key of allBlockKeys) {
      expect(registeredKeys).toContain(key)
    }
  })
})
