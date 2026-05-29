/**
 * データ型スキーマのテスト
 *
 * 各ブロックのデータ仕様（保存形式）を検証する。
 * - 正常データ: parse() が期待値を返す
 * - 不正データ: .catch() によりデフォルト値にフォールバックする
 * - BlockValuesSchema: 全フィールドが正しく parse される
 */
import { describe, it, expect } from 'vitest'
import {
  AgeValueSchema,
  ActivityValueSchema,
  GalleryValueSchema,
  BackgroundValueSchema,
  OverlayValueSchema,
  GenderValueSchema,
  LanguageValueSchema,
  SnsValueSchema,
  StatusValueSchema,
  InteractionItemSchema,
  MarkListValueSchema,
  DateItemValueSchema,
  LinkItemValueSchema,
  QrCodeValueSchema,
  BadgeValueSchema,
  BadgeItemSchema,
  ColorLabeledListValueSchema,
  MarkDefinitionSchema,
  BlockValuesSchema,
} from '../schemas'

// ─── AgeValueSchema ───────────────────────────────────────────────────────────

describe('AgeValueSchema', () => {
  it('正常データをそのまま返す', () => {
    const result = AgeValueSchema.parse({ searchTag: '18+', display: '20代', mode: 'range' })
    expect(result).toEqual({ searchTag: '18+', display: '20代', mode: 'range' })
  })

  it('不正な searchTag は "" にフォールバック', () => {
    const result = AgeValueSchema.parse({ searchTag: '不正値', display: '20代' })
    expect(result.searchTag).toBe('')
  })

  it('null は catch でデフォルト値にフォールバック', () => {
    const result = AgeValueSchema.parse(null)
    expect(result).toEqual({ searchTag: '', display: '' })
  })

  it('mode は省略可能', () => {
    const result = AgeValueSchema.parse({ searchTag: '非公開', display: '非公開' })
    expect(result.mode).toBeUndefined()
  })
})

// ─── GenderValueSchema ────────────────────────────────────────────────────────

describe('GenderValueSchema', () => {
  it('{ tag, display } をそのまま返す', () => {
    const result = GenderValueSchema.parse({ tag: 'female', display: '女性' })
    expect(result).toEqual({ tag: 'female', display: '女性' })
  })

  it('display は省略可能', () => {
    const result = GenderValueSchema.parse({ tag: 'male' })
    expect(result.tag).toBe('male')
    expect(result.display).toBeUndefined()
  })

  it('オブジェクト以外（文字列など）は catch でデフォルト値にフォールバック', () => {
    const result = GenderValueSchema.parse('female')
    expect(result).toEqual({ tag: '' })
  })

  it('null → デフォルト { tag: "" }', () => {
    const result = GenderValueSchema.parse(null)
    expect(result.tag).toBe('')
  })
})

// ─── LanguageValueSchema ──────────────────────────────────────────────────────

describe('LanguageValueSchema', () => {
  it('{ preset, custom } をそのまま返す', () => {
    const result = LanguageValueSchema.parse({ preset: ['日本語', 'English'], custom: ['カスタム語'] })
    expect(result).toEqual({ preset: ['日本語', 'English'], custom: ['カスタム語'] })
  })

  it('空配列も有効', () => {
    const result = LanguageValueSchema.parse({ preset: [], custom: [] })
    expect(result).toEqual({ preset: [], custom: [] })
  })

  it('オブジェクト以外（配列など）は catch でデフォルト値にフォールバック', () => {
    const result = LanguageValueSchema.parse(['日本語'])
    expect(result).toEqual({ preset: [], custom: [] })
  })

  it('null → デフォルト { preset: [], custom: [] }', () => {
    const result = LanguageValueSchema.parse(null)
    expect(result).toEqual({ preset: [], custom: [] })
  })
})

// ─── SnsValueSchema ───────────────────────────────────────────────────────────

describe('SnsValueSchema', () => {
  it('{ vrchatId, twitterId, discordId } をそのまま返す', () => {
    const result = SnsValueSchema.parse({ vrchatId: 'Usagi', twitterId: '@usagi', discordId: 'usagi#1234' })
    expect(result).toEqual({ vrchatId: 'Usagi', twitterId: '@usagi', discordId: 'usagi#1234' })
  })

  it('friendPolicy は省略可能', () => {
    const result = SnsValueSchema.parse({ vrchatId: 'Usagi', twitterId: '', discordId: '' })
    expect(result.friendPolicy).toBeUndefined()
  })

  it('friendPolicy を含む場合もパース成功', () => {
    const result = SnsValueSchema.parse({ vrchatId: '', twitterId: '', discordId: '', friendPolicy: 'mutual' })
    expect(result.friendPolicy).toBe('mutual')
  })

  it('必須フィールドが欠けている場合、各フィールドが "" にフォールバック', () => {
    const result = SnsValueSchema.parse({ someKey: 'value' })
    expect(result.vrchatId).toBe('')
    expect(result.twitterId).toBe('')
    expect(result.discordId).toBe('')
  })
})

// ─── StatusValueSchema ────────────────────────────────────────────────────────

describe('StatusValueSchema', () => {
  it('{ blue, green, yellow, red } をそのまま返す', () => {
    const result = StatusValueSchema.parse({ blue: '在宅中', green: '快適', yellow: '混雑', red: '満員' })
    expect(result).toEqual({ blue: '在宅中', green: '快適', yellow: '混雑', red: '満員' })
  })

  it('null → デフォルト { blue: "", green: "", yellow: "", red: "" }', () => {
    const result = StatusValueSchema.parse(null)
    expect(result).toEqual({ blue: '', green: '', yellow: '', red: '' })
  })
})

// ─── InteractionItemSchema ────────────────────────────────────────────────────

describe('InteractionItemSchema', () => {
  it('{ label, mark } をそのまま返す', () => {
    const result = InteractionItemSchema.parse({ label: 'ハグ', mark: '◎' })
    expect(result).toEqual({ label: 'ハグ', mark: '◎' })
  })

  it('isCustom を含む場合もパース成功', () => {
    const result = InteractionItemSchema.parse({ label: 'カスタム', mark: '◯', isCustom: true })
    expect(result.isCustom).toBe(true)
  })

  it('null → デフォルト { label: "", mark: "" }', () => {
    const result = InteractionItemSchema.parse(null)
    expect(result).toEqual({ label: '', mark: '' })
  })
})

// ─── MarkListValueSchema ──────────────────────────────────────────────────────

describe('MarkListValueSchema', () => {
  it('{ marks, custom } をそのまま返す', () => {
    const result = MarkListValueSchema.parse({ marks: { 0: '◎', 1: '◯' }, custom: [{ label: 'カスタム', mark: '△' }] })
    expect(result.marks).toEqual({ 0: '◎', 1: '◯' })
    expect(result.custom).toEqual([{ label: 'カスタム', mark: '△' }])
  })

  it('removed は省略可能', () => {
    const result = MarkListValueSchema.parse({ marks: {}, custom: [] })
    expect(result.removed).toBeUndefined()
  })

  it('removed を含む場合もパース成功', () => {
    const result = MarkListValueSchema.parse({ marks: {}, custom: [], removed: [2, 3] })
    expect(result.removed).toEqual([2, 3])
  })

  it('null → デフォルト { marks: {}, custom: [] }', () => {
    const result = MarkListValueSchema.parse(null)
    expect(result).toEqual({ marks: {}, custom: [] })
  })
})

// ─── DateItemValueSchema ──────────────────────────────────────────────────────

describe('DateItemValueSchema', () => {
  it('{ display, iso } をそのまま返す', () => {
    const result = DateItemValueSchema.parse({ display: '2024年1月1日', iso: '2024-01-01' })
    expect(result).toEqual({ display: '2024年1月1日', iso: '2024-01-01' })
  })

  it('iso は省略可能', () => {
    const result = DateItemValueSchema.parse({ display: '不明' })
    expect(result.iso).toBeUndefined()
  })

  it('null → デフォルト { display: "" }', () => {
    const result = DateItemValueSchema.parse(null)
    expect(result).toEqual({ display: '' })
  })
})

// ─── LinkItemValueSchema ──────────────────────────────────────────────────────

describe('LinkItemValueSchema', () => {
  it('{ label, url } をそのまま返す', () => {
    const result = LinkItemValueSchema.parse({ label: 'ポートフォリオ', url: 'https://example.com' })
    expect(result).toEqual({ label: 'ポートフォリオ', url: 'https://example.com' })
  })

  it('null → デフォルト { label: "", url: "" }', () => {
    const result = LinkItemValueSchema.parse(null)
    expect(result).toEqual({ label: '', url: '' })
  })
})

// ─── QrCodeValueSchema ────────────────────────────────────────────────────────

describe('QrCodeValueSchema', () => {
  it('空オブジェクト {} は有効', () => {
    const result = QrCodeValueSchema.parse({})
    expect(result).toEqual({})
  })

  it('customUrl を含む場合もパース成功', () => {
    const result = QrCodeValueSchema.parse({ customUrl: 'https://example.com' })
    expect(result.customUrl).toBe('https://example.com')
  })

  it('null → デフォルト {}', () => {
    const result = QrCodeValueSchema.parse(null)
    expect(result).toEqual({})
  })
})

// ─── BadgeValueSchema ─────────────────────────────────────────────────────────

describe('BadgeValueSchema', () => {
  it('{ label, color } をそのまま返す', () => {
    const result = BadgeValueSchema.parse({ label: 'VRC歴3年', color: '#00AADB' })
    expect(result).toEqual({ label: 'VRC歴3年', color: '#00AADB' })
  })

  it('color は省略可能', () => {
    const result = BadgeValueSchema.parse({ label: 'テスト' })
    expect(result.color).toBeUndefined()
  })
})

// ─── ColorLabeledListValueSchema ──────────────────────────────────────────────

describe('ColorLabeledListValueSchema', () => {
  it('{ items: [...] } をそのまま返す', () => {
    const result = ColorLabeledListValueSchema.parse({
      items: [{ color: '#f87171', label: '重要' }, { color: '#60a5fa', label: '情報' }],
    })
    expect(result.items).toHaveLength(2)
    expect(result.items[0]).toEqual({ color: '#f87171', label: '重要' })
  })

  it('null → デフォルト { items: [] }', () => {
    const result = ColorLabeledListValueSchema.parse(null)
    expect(result).toEqual({ items: [] })
  })
})

// ─── ActivityValueSchema ──────────────────────────────────────────────────────

describe('ActivityValueSchema', () => {
  it('フル構造をそのまま返す', () => {
    const input = {
      days: [true, true, true, true, true, false, false],
      daysMode: 'irregular',
      weekdayStart: '20:00', weekdayEnd: '24:00',
      weekdayTimesMode: undefined,
      holidayStart: '12:00', holidayEnd: '24:00',
      holidayTimesMode: 'irregular',
    }
    const result = ActivityValueSchema.parse(input)
    expect(result.days).toEqual([true, true, true, true, true, false, false])
    expect(result.weekdayStart).toBe('20:00')
    expect(result.holidayTimesMode).toBe('irregular')
  })

  it('null → デフォルト値にフォールバック', () => {
    const result = ActivityValueSchema.parse(null)
    expect(result.days).toEqual([true, true, true, true, true, false, false])
    expect(result.weekdayStart).toBe('')
  })
})

// ─── OverlayValueSchema ───────────────────────────────────────────────────────

describe('OverlayValueSchema', () => {
  it('variant + opacity をそのまま返す', () => {
    const result = OverlayValueSchema.parse({ variant: 'solid', opacity: 70 })
    expect(result.variant).toBe('solid')
    expect(result.opacity).toBe(70)
  })

  it('不正な variant は "glass" にフォールバック', () => {
    const result = OverlayValueSchema.parse({ variant: '不正値' })
    expect(result.variant).toBe('glass')
  })
})

// ─── BlockValuesSchema ────────────────────────────────────────────────────────

describe('BlockValuesSchema', () => {
  it('最小構成（空オブジェクト）をパース可能', () => {
    const result = BlockValuesSchema.parse({})
    expect(result.name).toBe('')
    expect(result.selfIntro).toBe('')
    expect(result.micOnRate).toBe(0)
    expect(result.playEnv).toEqual([])
    expect(result.interactions).toEqual([])
  })

  it('gender: GenderValue 形式をパース', () => {
    const result = BlockValuesSchema.parse({ gender: { tag: 'female', display: '女性' } })
    expect(result.gender).toEqual({ tag: 'female', display: '女性' })
  })

  it('language: LanguageValue 形式をパース', () => {
    const result = BlockValuesSchema.parse({ language: { preset: ['日本語'], custom: [] } })
    expect((result.language as { preset: string[] }).preset).toEqual(['日本語'])
  })

  it('sns: SnsValue 形式をパース', () => {
    const result = BlockValuesSchema.parse({ sns: { vrchatId: 'Usagi', twitterId: '', discordId: '' } })
    expect((result.sns as { vrchatId: string }).vrchatId).toBe('Usagi')
  })

  it('status: StatusValue 形式をパース', () => {
    const result = BlockValuesSchema.parse({ status: { blue: '在宅', green: '快適', yellow: '混雑', red: '満員' } })
    expect((result.status as { blue: string }).blue).toBe('在宅')
  })

  it('interactions: InteractionItem[] 形式をパース', () => {
    const result = BlockValuesSchema.parse({
      interactions: [{ label: 'ハグ', mark: '◎' }, { label: 'ボイス', mark: '◯' }]
    })
    expect(result.interactions).toHaveLength(2)
    expect(result.interactions[0]).toEqual({ label: 'ハグ', mark: '◎' })
  })

  it('age フィールドをパース', () => {
    const result = BlockValuesSchema.parse({ age: { searchTag: '18+', display: '20代' } })
    expect((result.age as { searchTag: string }).searchTag).toBe('18+')
  })

  it('passthrough: 未知のキー（カスタムブロック値）をそのまま通す', () => {
    const result = BlockValuesSchema.parse({ customBlock1: 'カスタム値', name: 'うさぎ' }) as Record<string, unknown>
    expect(result['customBlock1']).toBe('カスタム値')
    expect(result['name']).toBe('うさぎ')
  })

  it('不正な型は各フィールドのデフォルト値にフォールバック', () => {
    const result = BlockValuesSchema.parse({
      name: 123,        // should be string
      micOnRate: 'abc', // should be number
      playEnv: 'PCVR',  // should be array
    })
    expect(result.name).toBe('')
    expect(result.micOnRate).toBe(0)
    expect(result.playEnv).toEqual([])
  })

  it('safeParse は非オブジェクトでも例外を投げない', () => {
    expect(BlockValuesSchema.safeParse(null).success).toBe(false)
    expect(BlockValuesSchema.safeParse(undefined).success).toBe(false)
    expect(BlockValuesSchema.safeParse('invalid').success).toBe(false)
  })

  it('オブジェクト入力では各フィールドの .catch() により parse が例外を投げない', () => {
    // 不正値を持つオブジェクトでも例外なし（各フィールドが .catch() でフォールバック）
    expect(() => BlockValuesSchema.parse({ name: 123, micOnRate: 'abc' })).not.toThrow()
  })
})
