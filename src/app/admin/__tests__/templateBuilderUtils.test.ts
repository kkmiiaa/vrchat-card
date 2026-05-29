import { describe, it, expect } from 'vitest'
import type { LayoutNode, TemplateDefinition, FormSection } from '@/blocks/types'
import type { TemplateLayoutRow } from '@/lib/templateLayout'
import {
  collectBlockEntries,
  collectAllDataKeys,
  generateDataKey,
  collectDefaultValues,
  makeDefaultFormSections,
  resolveFormSections,
  buildSavePayload,
} from '../templateBuilderUtils'

// ─── テスト用フィクスチャ ─────────────────────────────────────────────────────

const makeBlock = (componentKey: string, dataKey: string, extra: Partial<LayoutNode & { type: 'block' }> = {}): LayoutNode => ({
  type: 'block', componentKey, dataKey, ...extra,
} as LayoutNode)

const makeRow = (...children: LayoutNode[]): LayoutNode => ({
  type: 'row', children,
} as LayoutNode)

const makeCol = (...children: LayoutNode[]): LayoutNode => ({
  type: 'col', children,
} as LayoutNode)

const makeDefinition = (overrides: Partial<TemplateDefinition> = {}): TemplateDefinition => ({
  id: 'test',
  label: 'テスト',
  theme: { accent: '#000', text: '#000', subText: '#999', bg: '#fff' },
  fontFamily: 'sans-serif',
  backgroundKey: 'background',
  landscape: { layout: makeRow(), cardWidth: 800, cardHeight: 450 } as never,
  portrait:  { layout: makeRow(), cardWidth: 450, cardHeight: 700 } as never,
  ...overrides,
})

const makeSavedLayout = (overrides: Partial<TemplateLayoutRow> = {}): TemplateLayoutRow => ({
  id: 'test',
  label: 'テスト',
  description: null,
  is_published: false,
  landscape_layout: null,
  portrait_layout: null,
  block_pool: null,
  form_sections: null,
  orientation_scales: null,
  overlay_config: null,
  ...overrides,
})

const LANDSCAPE_LAYOUT: LayoutNode = makeRow(
  makeCol(
    makeBlock('text', 'name'),
    makeBlock('gender', 'gender'),
  ),
  makeBlock('text', 'selfIntro', { blockConfig: { multiline: true } }),
)

// ─── collectBlockEntries ──────────────────────────────────────────────────────

describe('collectBlockEntries', () => {
  it('1. 単一ブロックノードからエントリを返す', () => {
    const node = makeBlock('text', 'name')
    const result = collectBlockEntries(node)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ componentKey: 'text', dataKey: 'name' })
  })

  it('2. ネストした row/col から全ブロックを順序通りに収集する', () => {
    const result = collectBlockEntries(LANDSCAPE_LAYOUT)
    expect(result.map(e => e.dataKey)).toEqual(['name', 'gender', 'selfIntro'])
  })

  it('3. 同じ dataKey は重複して収集されない', () => {
    const node = makeRow(makeBlock('text', 'name'), makeBlock('text', 'name'))
    const result = collectBlockEntries(node)
    expect(result.filter(e => e.dataKey === 'name')).toHaveLength(1)
  })

  it('4. blockConfig が設定されているとき保持される', () => {
    const node = makeBlock('text', 'selfIntro', { blockConfig: { multiline: true } })
    const result = collectBlockEntries(node)
    expect(result[0].blockConfig).toEqual({ multiline: true })
  })

  it('5. formLabel が設定されているとき保持される', () => {
    const node = makeBlock('text', 'name', { formLabel: '表示名' } as never)
    const result = collectBlockEntries(node)
    expect(result[0].formLabel).toBe('表示名')
  })

  it('6. hideWhenEmpty フラグが設定されているとき保持される', () => {
    const node = makeBlock('text', 'name', { hideWhenEmpty: true } as never)
    const result = collectBlockEntries(node)
    expect(result[0].hideWhenEmpty).toBe(true)
  })

  it('7. 空の col/row は空配列を返す', () => {
    expect(collectBlockEntries(makeRow())).toEqual([])
    expect(collectBlockEntries(makeCol())).toEqual([])
  })

  it('8. 深くネストした構造でも全ブロックを収集する', () => {
    const deep = makeRow(makeCol(makeRow(makeCol(makeBlock('text', 'deep1'), makeBlock('text', 'deep2')))))
    const result = collectBlockEntries(deep)
    expect(result.map(e => e.dataKey)).toEqual(['deep1', 'deep2'])
  })
})

// ─── collectAllDataKeys ───────────────────────────────────────────────────────

describe('collectAllDataKeys', () => {
  it('1. レイアウト内の全 dataKey を Set で返す', () => {
    const keys = collectAllDataKeys(LANDSCAPE_LAYOUT)
    expect(keys).toEqual(new Set(['name', 'gender', 'selfIntro']))
  })

  it('2. 重複 dataKey は Set なので1件になる', () => {
    const node = makeRow(makeBlock('text', 'name'), makeBlock('text', 'name'))
    expect(collectAllDataKeys(node).size).toBe(1)
  })
})

// ─── generateDataKey ──────────────────────────────────────────────────────────

describe('generateDataKey', () => {
  it('1. 使用済みキーがない場合は <componentKey>1 を返す', () => {
    expect(generateDataKey('text', new Set())).toBe('text1')
  })

  it('2. text1 が使用済みなら text2 を返す', () => {
    expect(generateDataKey('text', new Set(['text1']))).toBe('text2')
  })

  it('3. text1〜text3 が使用済みなら text4 を返す', () => {
    expect(generateDataKey('text', new Set(['text1', 'text2', 'text3']))).toBe('text4')
  })

  it('4. 別の componentKey のキーは無視して独立してカウントする', () => {
    expect(generateDataKey('gender', new Set(['text1', 'text2']))).toBe('gender1')
  })

  it('5. 連番に空きがあっても最小の未使用番号を返す（text2 が空き → text2）', () => {
    expect(generateDataKey('text', new Set(['text1', 'text3']))).toBe('text2')
  })
})

// ─── collectDefaultValues ────────────────────────────────────────────────────

describe('collectDefaultValues', () => {
  it('1. レジストリに登録されたブロックの defaultValue が収集される', () => {
    const node = makeBlock('text', 'name')
    const values = collectDefaultValues(node)
    expect('name' in values).toBe(true)
    expect(values['name']).toBe('') // text の defaultValue は ''
  })

  it('2. 複数ブロックの defaultValue が全て収集される', () => {
    const values = collectDefaultValues(LANDSCAPE_LAYOUT)
    expect(Object.keys(values)).toEqual(expect.arrayContaining(['name', 'gender', 'selfIntro']))
  })

  it('3. 登録されていない componentKey のブロックはスキップされる', () => {
    const node = makeBlock('unknown_component', 'unknownKey')
    const values = collectDefaultValues(node)
    expect('unknownKey' in values).toBe(false)
  })

  it('4. 空レイアウトのとき空オブジェクトを返す', () => {
    expect(collectDefaultValues(makeRow())).toEqual({})
  })

  it('5. 同じ dataKey が複数あっても defaultValue は1件のみ収集される', () => {
    const node = makeRow(makeBlock('text', 'name'), makeBlock('text', 'name'))
    const values = collectDefaultValues(node)
    expect(Object.keys(values).filter(k => k === 'name')).toHaveLength(1)
  })
})

// ─── makeDefaultFormSections ─────────────────────────────────────────────────

describe('makeDefaultFormSections', () => {
  it('1. 「カードデザイン」セクションが1つ生成される', () => {
    const sections = makeDefaultFormSections(makeDefinition())
    expect(sections).toHaveLength(1)
    expect(sections[0].title).toBe('カードデザイン')
  })

  it('2. defaultOpen が true になっている', () => {
    const sections = makeDefaultFormSections(makeDefinition())
    expect(sections[0].defaultOpen).toBe(true)
  })

  it('3. items に font アイテムが含まれる', () => {
    const sections = makeDefaultFormSections(makeDefinition())
    expect(sections[0].items.some(i => i.type === 'font')).toBe(true)
  })

  it('4. backgroundKey がある場合、items に背景ブロックが含まれる', () => {
    const sections = makeDefaultFormSections(makeDefinition({ backgroundKey: 'background' }))
    expect(sections[0].items.some(i => i.type === 'block' && i.dataKey === 'background')).toBe(true)
  })

  it('5. backgroundKey がない場合、背景ブロックは含まれない', () => {
    const sections = makeDefaultFormSections(makeDefinition({ backgroundKey: undefined }))
    expect(sections[0].items.every(i => i.type !== 'block')).toBe(true)
  })

  it('6. items の順序は font → background', () => {
    const sections = makeDefaultFormSections(makeDefinition({ backgroundKey: 'bg' }))
    expect(sections[0].items[0].type).toBe('font')
    expect(sections[0].items[1]).toMatchObject({ type: 'block', dataKey: 'bg' })
  })
})

// ─── resolveFormSections ─────────────────────────────────────────────────────

describe('resolveFormSections', () => {
  const dbSections: FormSection[] = [
    { title: 'DBセクション', items: [{ type: 'block', dataKey: 'name' }] },
  ]
  const defSections: FormSection[] = [
    { title: '定義セクション', items: [{ type: 'block', dataKey: 'gender' }] },
  ]

  it('1. DB に form_sections があればそれを優先する', () => {
    const savedLayouts = { test: makeSavedLayout({ form_sections: dbSections }) }
    const result = resolveFormSections(makeDefinition(), savedLayouts)
    expect(result).toBe(dbSections)
  })

  it('2. DB の form_sections が空配列のときは TS 定義にフォールバック', () => {
    const savedLayouts = { test: makeSavedLayout({ form_sections: [] }) }
    const def = makeDefinition({ formSections: defSections })
    const result = resolveFormSections(def, savedLayouts)
    expect(result).toBe(defSections)
  })

  it('3. DB の form_sections が null のときは TS 定義にフォールバック', () => {
    const savedLayouts = { test: makeSavedLayout({ form_sections: null }) }
    const def = makeDefinition({ formSections: defSections })
    const result = resolveFormSections(def, savedLayouts)
    expect(result).toBe(defSections)
  })

  it('4. DB も TS 定義もない場合はデフォルト（カードデザイン）を返す', () => {
    const result = resolveFormSections(makeDefinition({ formSections: undefined }), {})
    expect(result[0].title).toBe('カードデザイン')
  })

  it('5. savedLayouts に対象テンプレートの行がない場合もデフォルトを返す', () => {
    const result = resolveFormSections(makeDefinition({ id: 'missing' }), {})
    expect(result[0].title).toBe('カードデザイン')
  })

  it('6. savedLayouts を省略した場合もデフォルトを返す', () => {
    const result = resolveFormSections(makeDefinition())
    expect(result[0].title).toBe('カードデザイン')
  })

  it('7. DB の form_sections が1件以上あれば TS 定義は無視される', () => {
    const savedLayouts = { test: makeSavedLayout({ form_sections: dbSections }) }
    const def = makeDefinition({ formSections: defSections })
    const result = resolveFormSections(def, savedLayouts)
    expect(result[0].title).toBe('DBセクション')
  })
})

// ─── buildSavePayload ─────────────────────────────────────────────────────────

describe('buildSavePayload', () => {
  const layout = makeRow(makeBlock('text', 'name'))
  const baseData = {
    landscape_layout: layout,
    portrait_layout:  layout,
    form_sections:    [] as FormSection[],
    orientation_scales: { landscape: {}, portrait: {} },
  }

  it('1. id が payload に含まれる', () => {
    const payload = buildSavePayload('v2', baseData)
    expect(payload.id).toBe('v2')
  })

  it('2. landscape_layout / portrait_layout が正しく含まれる', () => {
    const payload = buildSavePayload('v2', baseData)
    expect(payload.landscape_layout).toBe(layout)
    expect(payload.portrait_layout).toBe(layout)
  })

  it('3. form_sections が含まれる', () => {
    const sections: FormSection[] = [{ title: 'テスト', items: [] }]
    const payload = buildSavePayload('v2', { ...baseData, form_sections: sections })
    expect(payload.form_sections).toBe(sections)
  })

  it('4. orientation_scales が含まれる', () => {
    const scales = { landscape: { defaultPaddingScale: 1.2 }, portrait: {} }
    const payload = buildSavePayload('v2', { ...baseData, orientation_scales: scales })
    expect(payload.orientation_scales).toBe(scales)
  })

  it('5. label を渡すと payload に含まれる', () => {
    const payload = buildSavePayload('v2', { ...baseData, label: 'Glass Card' })
    expect(payload.label).toBe('Glass Card')
  })

  it('6. label を渡さないと payload に label キーが存在しない', () => {
    const payload = buildSavePayload('v2', baseData)
    expect('label' in payload).toBe(false)
  })

  it('7. description を渡すと payload に含まれる', () => {
    const payload = buildSavePayload('v2', { ...baseData, description: '説明文' })
    expect(payload.description).toBe('説明文')
  })

  it('8. description を渡さないと payload に description キーが存在しない', () => {
    const payload = buildSavePayload('v2', baseData)
    expect('description' in payload).toBe(false)
  })

  it('9. updated_at が ISO 8601 形式の文字列になっている', () => {
    const payload = buildSavePayload('v2', baseData)
    expect(() => new Date(payload.updated_at)).not.toThrow()
    expect(new Date(payload.updated_at).toISOString()).toBe(payload.updated_at)
  })

  it('10. 空文字の label は payload に含まれない', () => {
    const payload = buildSavePayload('v2', { ...baseData, label: '' })
    expect('label' in payload).toBe(false)
  })

  it('11. 空文字の description は payload に含まれない', () => {
    const payload = buildSavePayload('v2', { ...baseData, description: '' })
    expect('description' in payload).toBe(false)
  })
})
