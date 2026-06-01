'use client'

import React, { useState } from 'react'
import type { ReactNode } from 'react'
import { languageComponent } from '@/blocks/language'
import { ageComponent } from '@/blocks/age'
import { textComponent } from '@/blocks/text'
import { selectComponent } from '@/blocks/select'
import { multiSelectComponent } from '@/blocks/multiSelect'
import { gaugeComponent } from '@/blocks/gauge'
import { expressiveSelectComponent } from '@/blocks/expressiveSelect'
import { genderComponent } from '@/blocks/gender'
import { profileImageComponent } from '@/blocks/profileImage'
import { simpleSnsComponent } from '@/blocks/simpleSns'
import { snsWithFriendPolicyComponent } from '@/blocks/snsWithFriendPolicy'
import { colorStatusComponent } from '@/blocks/colorStatus'
import { activityComponent } from '@/blocks/activity'
import { markListComponent } from '@/blocks/markList'
import { markGridComponent } from '@/blocks/markGrid'
import { galleryComponent } from '@/blocks/gallery'
import { dividerComponent } from '@/blocks/divider'
import { badgeComponent } from '@/blocks/badge'
import { booleanFlagComponent } from '@/blocks/booleanFlag'
import { ratingComponent } from '@/blocks/rating'
import { tagListComponent } from '@/blocks/tagList'
import { linkItemComponent } from '@/blocks/linkItem'
import { colorPaletteComponent } from '@/blocks/colorPalette'
import { dateItemComponent } from '@/blocks/dateItem'
import { qrCodeComponent } from '@/blocks/qrCode'
import { translations } from '@/utils/translations'
import type { ComponentDef, BgVariant } from '@/blocks/types'
import { DEFAULT_CARD_RENDER_CONTEXT } from '@/blocks/types'
import { BlockPropertyEditor, defaultBlockDisplaySettings, type BlockDisplaySettings } from './BlockPropertyEditor'

const t = translations.ja

const GLOBAL_BADGE = 'bg-violet-100 text-violet-700 border-violet-200'

export const INPUT_TYPE_COLORS: Record<string, string> = {
  // primitive
  'text':                   'bg-gray-100 text-gray-600 border-gray-200',
  'select':                 'bg-sky-100 text-sky-700 border-sky-200',
  'multi-select':           'bg-blue-100 text-blue-700 border-blue-200',
  'expressive-select':      'bg-purple-100 text-purple-700 border-purple-200',
  'number':                 'bg-orange-100 text-orange-700 border-orange-200',
  // complex
  'mark-list':              'bg-amber-100 text-amber-700 border-amber-200',
  'mark-grid':              'bg-amber-100 text-amber-700 border-amber-200',
  'weekly-activity':        'bg-teal-100 text-teal-700 border-teal-200',
  'gallery':                'bg-yellow-100 text-yellow-700 border-yellow-200',
  'profile-image':          'bg-indigo-100 text-indigo-700 border-indigo-200',
  // sns
  'color-status':           'bg-teal-100 text-teal-700 border-teal-200',
  'simple-sns':             'bg-pink-100 text-pink-700 border-pink-200',
  'sns-with-friend-policy': 'bg-rose-100 text-rose-700 border-rose-200',
  // promoted
  'gender':                 'bg-violet-100 text-violet-700 border-violet-200',
  'language':               'bg-violet-100 text-violet-700 border-violet-200',
  'age':                    'bg-violet-100 text-violet-700 border-violet-200',
  // primitive (追加)
  'badge':                  'bg-sky-100 text-sky-700 border-sky-200',
  'boolean':                'bg-emerald-100 text-emerald-700 border-emerald-200',
  'rating':                 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'tag-list':               'bg-cyan-100 text-cyan-700 border-cyan-200',
  'link':                   'bg-blue-100 text-blue-700 border-blue-200',
  'color-palette':          'bg-pink-100 text-pink-700 border-pink-200',
  'date':                   'bg-orange-100 text-orange-700 border-orange-200',
}

// ─── 検索フォームのUIパーツ ──────────────────────────────────────

function SearchTag({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-lg text-xs border font-medium transition-all ${
        selected
          ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]'
          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  )
}

// ─── 各コンポーネントの検索フォーム（入力UIとクエリを分離）──────

type SearchInputProps = { onQueryChange: (q: string) => void }

function SearchExpressiveSelectInput({ onQueryChange }: SearchInputProps) {
  const [tag, setTag] = useState('')
  const tags = ['male', 'female', 'other']
  const handleClick = (v: string) => {
    const next = tag === v ? '' : v
    setTag(next)
    onQueryChange(next ? `WHERE tag = '${next}'` : '')
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] text-gray-400">tag で完全一致</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(v => (
          <SearchTag key={v} label={v} selected={tag === v} onClick={() => handleClick(v)} />
        ))}
      </div>
    </div>
  )
}

function SearchSelectInput({ onQueryChange }: SearchInputProps) {
  const [val, setVal] = useState('')
  const options = ['Known User', 'Trusted User', 'Veteran User', 'Legendary User']
  const handleClick = (v: string) => {
    const next = val === v ? '' : v
    setVal(next)
    onQueryChange(next ? `WHERE value = '${next}'` : '')
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] text-gray-400">完全一致</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(v => (
          <SearchTag key={v} label={v} selected={val === v} onClick={() => handleClick(v)} />
        ))}
      </div>
    </div>
  )
}

function SearchMultiSelectInput({ onQueryChange }: SearchInputProps) {
  const [selected, setSelected] = useState<string[]>([])
  const options = ['PCVR', 'Quest', 'Desktop']
  const toggle = (v: string) => {
    const next = selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]
    setSelected(next)
    onQueryChange(next.length > 0 ? `WHERE value && ARRAY['${next.join("','")}']` : '')
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] text-gray-400">配列内包含（AND/OR 選択可）</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(v => (
          <SearchTag key={v} label={v} selected={selected.includes(v)} onClick={() => toggle(v)} />
        ))}
      </div>
    </div>
  )
}

function SearchTextInput({ onQueryChange }: SearchInputProps) {
  const [q, setQ] = useState('')
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] text-gray-400">全文検索</p>
      <input
        type="text"
        value={q}
        onChange={e => { setQ(e.target.value); onQueryChange(e.target.value ? `WHERE value ILIKE '%${e.target.value}%'` : '') }}
        placeholder="キーワードを入力"
        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-sky-200"
      />
    </div>
  )
}

function SearchGaugeInput({ onQueryChange }: SearchInputProps) {
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(100)
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] text-gray-400">範囲検索</p>
      <div className="flex items-center gap-2">
        <input type="number" min={0} max={100} value={min}
          onChange={e => { setMin(Number(e.target.value)); onQueryChange(`WHERE value BETWEEN ${e.target.value} AND ${max}`) }}
          className="w-16 px-2 py-1 border border-gray-200 rounded text-xs text-center" />
        <span className="text-xs text-gray-400">〜</span>
        <input type="number" min={0} max={100} value={max}
          onChange={e => { setMax(Number(e.target.value)); onQueryChange(`WHERE value BETWEEN ${min} AND ${e.target.value}`) }}
          className="w-16 px-2 py-1 border border-gray-200 rounded text-xs text-center" />
        <span className="text-xs text-gray-400">%</span>
      </div>
    </div>
  )
}

function SearchGenderInput({ onQueryChange }: SearchInputProps) {
  const [tag, setTag] = useState('')
  const tags = ['male', 'female', 'other', 'nonbinary']
  const handleClick = (v: string) => {
    const next = tag === v ? '' : v
    setTag(next)
    onQueryChange(next ? `WHERE gender_tag = '${next}'` : '')
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] text-gray-400">tag で完全一致</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(v => (
          <SearchTag key={v} label={v} selected={tag === v} onClick={() => handleClick(v)} />
        ))}
      </div>
    </div>
  )
}

function SearchLanguageInput({ onQueryChange }: SearchInputProps) {
  const [selected, setSelected] = useState<string[]>([])
  const presets = ['日本語', 'English', '한국어', '中文']
  const toggle = (v: string) => {
    const next = selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]
    setSelected(next)
    onQueryChange(next.length > 0 ? `WHERE preset && ARRAY['${next.join("','")}']` : '')
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] text-gray-400">preset 内包含（custom は対象外）</p>
      <div className="flex flex-wrap gap-1.5">
        {presets.map(v => (
          <SearchTag key={v} label={v} selected={selected.includes(v)} onClick={() => toggle(v)} />
        ))}
      </div>
    </div>
  )
}

function SearchAgeInput({ onQueryChange }: SearchInputProps) {
  const [tag, setTag] = useState('')
  const tags = ['18歳未満', '18+']
  const handleClick = (v: string) => {
    const next = tag === v ? '' : v
    setTag(next)
    onQueryChange(next ? `WHERE search_tag = '${next}'` : '')
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] text-gray-400">searchTag で完全一致（非公開・未設定は除外）</p>
      <div className="flex gap-1.5">
        {tags.map(v => (
          <SearchTag key={v} label={v} selected={tag === v} onClick={() => handleClick(v)} />
        ))}
      </div>
    </div>
  )
}

function SearchNoSupportInput({ onQueryChange: _ }: SearchInputProps) {
  return <span className="text-xs text-gray-300 italic">検索対象外</span>
}

// ─── ComponentEntry ────────────────────────────────────────────────

export type { ComponentCategory } from './componentCatalog'
export { COMPONENT_CATEGORIES } from './componentCatalog'

export type ComponentEntry = {
  name: string
  category: ComponentCategory
  inputType: string
  format: string
  description: string
  exampleBlock?: string
  component: ComponentDef<unknown>
  SearchInput?: (props: SearchInputProps) => ReactNode
}

import type { ComponentCategory } from './componentCatalog'

export const COMPONENTS: ComponentEntry[] = [
  // ─── Primitive ────────────────────────────────────────────────
  {
    name: 'text',
    category: 'primitive',
    inputType: 'text',
    format: 'string',
    description: '自由テキスト。pre-wrap で改行反映。全文検索のみ',
    exampleBlock: 'selfIntro',
    component: textComponent as ComponentDef<unknown>,
    SearchInput: SearchTextInput,
  },
  {
    name: 'select',
    category: 'primitive',
    inputType: 'select',
    format: 'string',
    description: '固定選択肢から一つ選ぶ。完全一致で検索可能',
    exampleBlock: 'trustRank',
    component: selectComponent as ComponentDef<unknown>,
    SearchInput: SearchSelectInput,
  },
  {
    name: 'multi-select',
    category: 'primitive',
    inputType: 'multi-select',
    format: 'string[]',
    description: '複数選択。配列内包含で検索可能',
    exampleBlock: 'playEnv',
    component: multiSelectComponent as ComponentDef<unknown>,
    SearchInput: SearchMultiSelectInput,
  },
  {
    name: 'expressive-select',
    category: 'primitive',
    inputType: 'expressive-select',
    format: '{ tag: string, display?: string }',
    description: 'タグ（検索用）＋自由テキスト（表示用）の二層構造。選択肢の表示名をユーザーが自由に入力できる',
    exampleBlock: 'genderTag',
    component: expressiveSelectComponent as ComponentDef<unknown>,
    SearchInput: SearchExpressiveSelectInput,
  },
  {
    name: 'gauge',
    category: 'primitive',
    inputType: 'number',
    format: 'number (0–100)',
    description: '0〜100のパーセンテージ値。プログレスバーで表示。範囲検索が可能',
    exampleBlock: 'micOnRate',
    component: gaugeComponent as ComponentDef<unknown>,
    SearchInput: SearchGaugeInput,
  },
  {
    name: 'badge',
    category: 'primitive',
    inputType: 'badge',
    format: '{ label: string, color?: string }',
    description: 'ラベル＋カラーのバッジ。フレンドポリシーや状態表示などに使用',
    exampleBlock: 'badge',
    component: badgeComponent as ComponentDef<unknown>,
    SearchInput: SearchNoSupportInput,
  },
  {
    name: 'boolean',
    category: 'primitive',
    inputType: 'boolean',
    format: 'boolean',
    description: 'ON/OFF フラグ。通話OK・写真OKなどのシンプルな可否表示',
    exampleBlock: 'booleanFlag',
    component: booleanFlagComponent as ComponentDef<unknown>,
    SearchInput: SearchNoSupportInput,
  },
  {
    name: 'rating',
    category: 'primitive',
    inputType: 'rating',
    format: 'number (0–5)',
    description: '0〜5の星評価。おすすめ度・活動頻度などに使用',
    exampleBlock: 'rating',
    component: ratingComponent as ComponentDef<unknown>,
    SearchInput: SearchNoSupportInput,
  },
  {
    name: 'link',
    category: 'primitive',
    inputType: 'link',
    format: '{ label: string, url: string }',
    description: 'ラベル付きリンク。ポートフォリオ・Boothなどの外部リンク表示',
    exampleBlock: 'linkItem',
    component: linkItemComponent as ComponentDef<unknown>,
    SearchInput: SearchNoSupportInput,
  },
  {
    name: 'date',
    category: 'primitive',
    inputType: 'date',
    format: '{ display: string, iso?: string }',
    description: '日付表示。誕生日・VRC開始日など。display で自由テキスト上書き可',
    exampleBlock: 'dateItem',
    component: dateItemComponent as ComponentDef<unknown>,
    SearchInput: SearchNoSupportInput,
  },

  // ─── Complex ──────────────────────────────────────────────────
  {
    name: 'profile-image',
    category: 'complex',
    inputType: 'file',
    format: '{ base64: string | null, url: string | null }',
    description: 'プロフィール画像。base64 または URL を格納。variant: default / circle / glass',
    exampleBlock: 'profileImage',
    component: profileImageComponent as ComponentDef<unknown>,
  },
  {
    name: 'divider',
    category: 'primitive',
    inputType: 'none',
    format: 'null',
    description: '水平・垂直の区切り線。色・不透明度・太さを設定可能',
    exampleBlock: 'divider',
    component: dividerComponent as ComponentDef<unknown>,
    SearchInput: SearchNoSupportInput,
  },
  {
    name: 'mark-list',
    category: 'complex',
    inputType: 'mark-list',
    format: '{ label: string, mark: string }[]',
    description: 'ラベル＋記号（◎◯△✗）のバッジ形式リスト。マークされた項目のみ表示',
    exampleBlock: 'interactions',
    component: markListComponent as ComponentDef<unknown>,
    SearchInput: SearchNoSupportInput,
  },
  {
    name: 'mark-grid',
    category: 'complex',
    inputType: 'mark-grid',
    format: '{ label: string, mark: string }[]',
    description: 'ラベル＋記号（◎◯△✗）のグリッド表示。全項目を格子状に並べる',
    exampleBlock: 'interactions',
    component: markGridComponent as ComponentDef<unknown>,
    SearchInput: SearchNoSupportInput,
  },
  {
    name: 'weekly-activity',
    category: 'complex',
    inputType: 'weekly-activity',
    format: '{ days, weekdayStart, weekdayEnd, holidayStart, holidayEnd }',
    description: '曜日＋時間帯。平日/休日を別設定。検索対象外',
    exampleBlock: 'activity',
    component: activityComponent as ComponentDef<unknown>,
    SearchInput: SearchNoSupportInput,
  },
  {
    name: 'tag-list',
    category: 'complex',
    inputType: 'tag-list',
    format: 'string[]',
    description: '自由入力タグの羅列。趣味・ゲームタイトルなどに使用',
    exampleBlock: 'tagList',
    component: tagListComponent as ComponentDef<unknown>,
    SearchInput: SearchNoSupportInput,
  },
  {
    name: 'color-palette',
    category: 'complex',
    inputType: 'color-palette',
    format: 'string[] (hex)',
    description: 'カラースウォッチの並び。テーマカラーや好きな色の表示',
    exampleBlock: 'colorPalette',
    component: colorPaletteComponent as ComponentDef<unknown>,
    SearchInput: SearchNoSupportInput,
  },

  {
    name: 'color-status',
    category: 'complex',
    inputType: 'color-status',
    format: 'Record<string, string>',
    description: '色付きフィールドのステータス表示。フィールド構成は blockConfig で定義',
    exampleBlock: 'status',
    component: colorStatusComponent as ComponentDef<unknown>,
    SearchInput: SearchNoSupportInput,
  },

  // ─── SNS ──────────────────────────────────────────────────────
  {
    name: 'simple-sns',
    category: 'sns',
    inputType: 'simple-sns',
    format: '{ id: string }',
    description: 'アイコン＋ID のシンプルなSNSブロック。X・Discord などに使用',
    exampleBlock: 'x / discord',
    component: simpleSnsComponent as ComponentDef<unknown>,
    SearchInput: SearchNoSupportInput,
  },
  {
    name: 'sns-with-friend-policy',
    category: 'sns',
    inputType: 'sns-with-friend-policy',
    format: '{ platforms: Record<string, string>, friendPolicy: string }',
    description: 'SNS ID複数 ＋ フレンドポリシーをまとめて扱うブロック',
    exampleBlock: 'sns-with-friend-policy',
    component: snsWithFriendPolicyComponent as ComponentDef<unknown>,
    SearchInput: SearchNoSupportInput,
  },

  // ─── 昇格 ─────────────────────────────────────────────────────
  {
    name: 'gender',
    category: 'global',
    inputType: 'gender',
    format: '{ tag: string, display?: string }',
    description: '性別。tag で完全一致検索。display はカード表示用の自由入力テキスト',
    exampleBlock: 'gender',
    component: genderComponent as ComponentDef<unknown>,
    SearchInput: SearchGenderInput,
  },
  {
    name: 'language',
    category: 'global',
    inputType: 'language',
    format: '{ preset: string[], custom: string[] }',
    description: '使用言語。preset は界隈検索対象、custom は表示専用',
    exampleBlock: 'language',
    component: languageComponent as ComponentDef<unknown>,
    SearchInput: SearchLanguageInput,
  },
  {
    name: 'age',
    category: 'global',
    inputType: 'age',
    format: '{ searchTag: ""| "18歳未満"|"18+"|"非公開", display: string }',
    description: '年齢。数値入力で searchTag を自動セット、display は自由入力で上書き可',
    exampleBlock: 'age',
    component: ageComponent as ComponentDef<unknown>,
    SearchInput: SearchAgeInput,
  },
  {
    name: 'gallery',
    category: 'complex',
    inputType: 'gallery',
    format: '{ images: (File|null)[], base64: (string|null)[] }',
    description: '画像ギャラリー（最大3枚）。optional: true にすると未入力時は非表示',
    component: galleryComponent as ComponentDef<unknown>,
    SearchInput: SearchNoSupportInput,
  },
  // ─── Utility ────────────────────────────────────────────────────
  {
    name: 'qr-code',
    category: 'utility',
    inputType: 'qr',
    format: '{ customUrl?: string }',
    description: 'QR コード。カードページ・ユーザーページ・カスタム URL に対応',
    component: qrCodeComponent as ComponentDef<unknown>,
  },
]


// ─── セクションラベル ─────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">{children}</p>
}

function RowDivider() {
  return <div className="border-t border-gray-100" />
}

// ─── ラベル付き CardItem プレビュー ──────────────────────────────

function LabeledCardItemPreview({
  component, value, variant, bgVariant, labelConfig, config,
}: {
  component: ComponentDef<unknown>
  value: unknown
  variant: string
  bgVariant: BgVariant
  labelConfig: Pick<BlockDisplaySettings, 'label' | 'subLabel' | 'labelColor' | 'labelInset' | 'labelInsetDir'>
  config?: Record<string, unknown>
}) {
  const ctx = DEFAULT_CARD_RENDER_CONTEXT
  const { label, subLabel, labelColor, labelInset, labelInsetDir } = labelConfig
  const hasLabel = label.trim() !== ''
  const color = labelColor || ctx.theme.text

  const cardContent = component.CardItem
    ? <component.CardItem value={value} ctx={ctx} variant={variant} bgVariant={bgVariant} blockConfig={config} />
    : <span className="text-xs text-gray-300 italic">未実装</span>

  const labelEl = hasLabel ? (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexShrink: 0 }}>
      <span style={{ fontSize: ctx.fontSize.sm, fontWeight: 700, color }}>{label}</span>
      {subLabel && <span style={{ fontSize: ctx.fontSize.xs, color: ctx.theme.subText }}>{subLabel}</span>}
    </div>
  ) : null

  if (!hasLabel) {
    return (
      <div style={{ display: 'flex', flexGrow: 1, minWidth: 0, overflow: 'hidden' }}>
        {cardContent}
      </div>
    )
  }

  if (labelInset) {
    const flexDir: React.CSSProperties['flexDirection'] = labelInsetDir === 'row' ? 'row' : 'column'
    return (
      <div style={{
        display: 'flex',
        flexDirection: flexDir,
        gap: labelInsetDir === 'row' ? 8 : 4,
        alignItems: labelInsetDir === 'row' ? 'center' : 'stretch',
        background: 'rgba(255,255,255,0.85)',
        borderRadius: 8,
        padding: '6px 8px',
        flexGrow: 1,
        minWidth: 0,
        overflow: 'hidden',
      }}>
        {labelEl}
        <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0, overflow: 'hidden', display: 'flex', alignItems: 'stretch' }}>
          {cardContent}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexGrow: 1, minWidth: 0, overflow: 'hidden' }}>
      {labelEl}
      <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0, overflow: 'hidden', display: 'flex', alignItems: 'stretch' }}>
        {cardContent}
      </div>
    </div>
  )
}

// ─── ComponentPreview ────────────────────────────────────────────

const CATEGORY_BADGE: Record<ComponentCategory, string> = {
  primitive: 'bg-gray-100 text-gray-600 border-gray-200',
  complex:   'bg-orange-100 text-orange-700 border-orange-200',
  sns:       'bg-pink-100 text-pink-700 border-pink-200',
  global:    'bg-violet-100 text-violet-700 border-violet-200',
  utility:   'bg-sky-100 text-sky-700 border-sky-200',
}

// CardItem プレビュー背景パターン
const PREVIEW_BACKGROUNDS = [
  { key: 'slate',    label: 'スレート',         bg: '#f1f5f9',                                                        swatch: '#f1f5f9' },
  { key: 'dark',     label: 'ダーク',           bg: '#1e293b',                                                        swatch: '#1e293b' },
  { key: 'gradient', label: 'グラデーション',   bg: 'linear-gradient(135deg, #fcd5ce 0%, #e0f7fa 100%)',              swatch: 'linear-gradient(135deg, #fcd5ce, #e0f7fa)' },
  { key: 'photo',    label: '写真風',           bg: 'linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #f59e0b 100%)', swatch: 'linear-gradient(135deg, #6366f1, #ec4899, #f59e0b)' },
] as const
type PreviewBgKey = typeof PREVIEW_BACKGROUNDS[number]['key']

// セル数 → ピクセル変換（cellSize:10, gap:2）
function cellsToPx(cells: number) { return 12 * cells - 2 }
const CELL_OPTIONS = [
  { label: '自由', value: '' },
  ...[2, 3, 4, 6, 8, 10, 12, 14, 16, 20, 24].map(n => ({ label: `${n}c — ${cellsToPx(n)}px`, value: String(cellsToPx(n)) })),
]

function ComponentPreview({ name, category, inputType, format, description, exampleBlock, component, SearchInput }: ComponentEntry) {
  const [value, setValue] = useState(component.defaultValue)
  const [blockConfig, setBlockConfig] = useState<Record<string, unknown>>({})
  const [dataKey, setDataKey] = useState('')
  const [formLabel, setFormLabel] = useState('')
  const [query, setQuery] = useState('')
  const [displaySettings, setDisplaySettings] = useState<BlockDisplaySettings>(
    () => defaultBlockDisplaySettings(component)
  )
  const patchDisplay = (patch: Partial<BlockDisplaySettings>) =>
    setDisplaySettings(prev => ({ ...prev, ...patch }))

  // サイズ制約
  const [previewW, setPreviewW] = useState('')
  const [previewH, setPreviewH] = useState('')
  const previewStyle: React.CSSProperties = {
    ...(previewW ? { width: Number(previewW) } : { width: '100%' }),
    ...(previewH ? { height: Number(previewH) } : {}),
  }

  // プレビュー背景
  const [previewBg, setPreviewBg] = useState<PreviewBgKey>('slate')


  return (
    <div id={`component-${name}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* ヘッダー */}
      <div className="px-5 pt-4 pb-2 flex items-center gap-2 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORY_BADGE[category]}`}>
          {name}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${INPUT_TYPE_COLORS[inputType] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
          {inputType}
        </span>
        {component.global && (
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${GLOBAL_BADGE}`}>
            Global
          </span>
        )}
        {category !== 'global' && (
          <span className="text-xs text-gray-400 ml-1">例: {exampleBlock}</span>
        )}
      </div>
      <div className="px-5 pt-1 pb-2">
        <span className="text-xs text-gray-500">{description}</span>
      </div>
      <div className="px-5 pb-3 border-b border-gray-100 flex items-center gap-2">
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">card_data</span>
        <span className="font-mono text-[10px] text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{format}</span>
      </div>

      {/* Row 1: ブロック設定 | ブロック定義JSON */}
      <div className="grid grid-cols-2 divide-x divide-gray-100 min-w-0">
        <div className="px-5 py-4 min-w-0 overflow-hidden flex flex-col gap-2">
          <SectionLabel>ブロック設定</SectionLabel>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 w-20 shrink-0">データキー</span>
            <input
              className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-white font-mono"
              placeholder={`例: ${name}`}
              value={dataKey}
              onChange={e => setDataKey(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 w-20 shrink-0">フォームラベル</span>
            <input
              className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-white"
              placeholder="例: マイクON率"
              value={formLabel}
              onChange={e => setFormLabel(e.target.value)}
            />
          </div>
          {component.blockConfigForm && component.blockConfigForm({ blockConfig, onChange: setBlockConfig })}
        </div>
        <div className="px-5 py-4 min-w-0 overflow-hidden">
          <SectionLabel>ブロック定義 JSON</SectionLabel>
          <pre className="text-[10px] text-gray-600 bg-gray-50 rounded px-3 py-3 overflow-auto whitespace-pre-wrap border border-gray-100">
            {JSON.stringify({
              type: 'block',
              componentKey: component.key,
              dataKey: dataKey || `(未設定)`,
              ...(formLabel ? { label: formLabel } : {}),
              variant: 'simple',
              ...(Object.keys(blockConfig).length > 0 ? { blockConfig } : {}),
            }, null, 2)}
          </pre>
        </div>
      </div>

      <RowDivider />

      {/* Row 2: FormItem | 保存値 */}
      <div className="grid grid-cols-2 divide-x divide-gray-100 min-w-0">
        <div className="px-5 py-4 min-w-0 overflow-hidden">
          <SectionLabel>FormItem</SectionLabel>
          {formLabel && (
            <p className="text-xs font-medium text-gray-700 mb-2">{formLabel}</p>
          )}
          <component.FormItem value={value} onChange={setValue} t={t} blockConfig={blockConfig} />
        </div>
        <div className="px-5 py-4 min-w-0 overflow-hidden">
          <SectionLabel>保存値</SectionLabel>
          <pre className="text-[10px] text-gray-400 bg-gray-50 rounded px-2 py-2 overflow-auto whitespace-pre-wrap">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      </div>

      <RowDivider />

      {/* Row 3: CardItem 設定 | CardItem プレビュー */}
      <div className="grid grid-cols-2 divide-x divide-gray-100 min-w-0">
        <div className="px-5 py-4 min-w-0 overflow-hidden flex flex-col gap-3">
          <SectionLabel>CardItem 設定</SectionLabel>
          <BlockPropertyEditor
            component={component}
            settings={displaySettings}
            onChange={patchDisplay}
            extras={
              <div className="border-t border-gray-100 pt-3 mt-1 flex flex-col gap-2">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">サイズ制約</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 w-16 shrink-0">width</span>
                  <select value={previewW} onChange={e => setPreviewW(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-200">
                    {CELL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 w-16 shrink-0">height</span>
                  <select value={previewH} onChange={e => setPreviewH(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-200">
                    {CELL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            }
          />
        </div>

        <div className="px-5 py-4 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <SectionLabel>CardItem プレビュー</SectionLabel>
            <div className="ml-auto flex items-center gap-1">
              {PREVIEW_BACKGROUNDS.map(bg => (
                <button
                  key={bg.key}
                  type="button"
                  title={bg.label}
                  onClick={() => setPreviewBg(bg.key)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${previewBg === bg.key ? 'border-sky-400 scale-110' : 'border-transparent hover:border-gray-300'}`}
                  style={{ background: bg.swatch }}
                />
              ))}
            </div>
          </div>
          <div
            className="flex items-start rounded-xl p-3"
            style={{ minHeight: 40, background: PREVIEW_BACKGROUNDS.find(b => b.key === previewBg)?.bg ?? '#f1f5f9' }}
          >
            <div style={{ ...previewStyle, display: 'flex', overflow: 'hidden', minWidth: 0 }}>
              <LabeledCardItemPreview
                component={component}
                value={value}
                variant={displaySettings.variant}
                bgVariant={displaySettings.bgVariant}
                labelConfig={displaySettings}
                config={Object.keys(blockConfig).length > 0 ? blockConfig : undefined}
              />
            </div>
          </div>
        </div>
      </div>

      <RowDivider />

      {/* Row 3: SearchForm 入力UI | クエリ */}
      <div className="grid grid-cols-2 divide-x divide-gray-100 min-w-0">
        <div className="px-5 py-4 min-w-0 overflow-hidden">
          <SectionLabel>SearchForm 入力UI</SectionLabel>
          {SearchInput ? <SearchInput onQueryChange={setQuery} /> : <p className="text-xs text-gray-400">検索非対応</p>}
        </div>
        <div className="px-5 py-4 min-w-0 overflow-hidden">
          <SectionLabel>クエリ</SectionLabel>
          {query
            ? <p className="font-mono text-[10px] text-gray-500 bg-gray-50 rounded px-2 py-2 break-all">{query}</p>
            : <span className="text-xs text-gray-300 italic">—</span>
          }
        </div>
      </div>
    </div>
  )
}

export default function ComponentBlockList() {
  return (
    <div className="space-y-4">
      {COMPONENTS.map(c => <ComponentPreview key={c.name} {...c} />)}
    </div>
  )
}
