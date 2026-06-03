'use client'

import { useState } from 'react'
import { DEFAULT_CARD_RENDER_CONTEXT } from '@/blocks/types'
import { expressiveSelectComponent } from '@/blocks/expressiveSelect'
import { multiSelectComponent } from '@/blocks/multiSelect'
import { selectComponent } from '@/blocks/select'
import { textComponent } from '@/blocks/text'
import { gaugeComponent } from '@/blocks/gauge'
import { booleanFlagComponent } from '@/blocks/booleanFlag'
import { activityComponent } from '@/blocks/activity'
import { markListComponent } from '@/blocks/markList'
import { markGridComponent } from '@/blocks/markGrid'
import { profileImageComponent } from '@/blocks/profileImage'
import { itemListComponent } from '@/blocks/itemList'
import { heightRulerComponent } from '@/blocks/heightRuler'
import type { ActivityValue } from '@/blocks/types'
import type { ItemListValue } from '@/blocks/itemList'
import type { HeightRulerValue } from '@/blocks/heightRuler'

const ctx = DEFAULT_CARD_RENDER_CONTEXT

const SUB_STYLE: React.CSSProperties = {
  fontSize: ctx.cardWidth * 0.011,
  color: ctx.theme.subText,
  fontFamily: ctx.fontFamily,
}

// ─────────────────────────────────────────
// 共通: blockConfigForm パネル
// ─────────────────────────────────────────
function BlockConfigPanel({
  blockConfig,
  onChange,
  blockConfigForm,
}: {
  blockConfig: Record<string, unknown>
  onChange: (v: Record<string, unknown>) => void
  blockConfigForm?: (props: { blockConfig: Record<string, unknown>; onChange: (v: Record<string, unknown>) => void }) => React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  if (!blockConfigForm) return null
  return (
    <div className="border-t border-gray-100 px-5 py-2">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-1">
        <span>{open ? '▾' : '▸'}</span> blockConfig
      </button>
      {open && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          {blockConfigForm({ blockConfig, onChange })}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// 抽象コンポーネント型
// ─────────────────────────────────────────
type AbstractComponent = {
  inputType: string
  description: string
  variants: string[]
  Demo: (props: { variant: string }) => React.ReactNode
}

// ─────────────────────────────────────────
// expressive-select
// ─────────────────────────────────────────
function ExpressiveSelectDemo({ variant }: { variant: string }) {
  const [value, setValue] = useState({ tag: '', display: '' })
  const [blockConfig, setBlockConfig] = useState<Record<string, unknown>>({
    options: [
      { value: '選択肢A', label: '選択肢A' },
      { value: '選択肢B', label: '選択肢B' },
      { value: '選択肢C', label: '選択肢C' },
      { value: '選択肢D', label: '選択肢D' },
    ],
  })

  return (
    <div>
      <div className="grid grid-cols-2 divide-x divide-gray-100 min-w-0">
        <div className="px-5 py-5 space-y-3 min-w-0 overflow-hidden">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
          <expressiveSelectComponent.FormItem value={value} onChange={setValue} t={{} as never} blockConfig={blockConfig} />
        </div>
        <div className="px-5 py-5 min-w-0 overflow-hidden">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
          <div className="min-h-[40px]">
            {expressiveSelectComponent.CardItem
              ? <expressiveSelectComponent.CardItem value={value} ctx={ctx} variant={variant} blockConfig={blockConfig} />
              : <span style={SUB_STYLE}>—</span>
            }
          </div>
        </div>
      </div>
      <BlockConfigPanel blockConfig={blockConfig} onChange={setBlockConfig} blockConfigForm={expressiveSelectComponent.blockConfigForm} />
    </div>
  )
}

// ─────────────────────────────────────────
// multi-select
// ─────────────────────────────────────────
function MultiSelectDemo({ variant }: { variant: string }) {
  const [value, setValue] = useState<string[]>([])
  const [blockConfig, setBlockConfig] = useState<Record<string, unknown>>({
    options: [
      { value: 'optA', label: '選択肢A', color: '#60a5fa' },
      { value: 'optB', label: '選択肢B', color: '#4ade80' },
      { value: 'optC', label: '選択肢C', color: '#f59e0b' },
      { value: 'optD', label: '選択肢D', color: '#f87171' },
    ],
  })

  return (
    <div>
      <div className="grid grid-cols-2 divide-x divide-gray-100 min-w-0">
        <div className="px-5 py-5 space-y-3 min-w-0 overflow-hidden">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
          <multiSelectComponent.FormItem value={value} onChange={setValue} t={{} as never} blockConfig={blockConfig} />
        </div>
        <div className="px-5 py-5 min-w-0 overflow-hidden">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
          <div className="min-h-[40px]">
            {multiSelectComponent.CardItem
              ? <multiSelectComponent.CardItem value={value} ctx={ctx} variant={variant} blockConfig={blockConfig} />
              : <span style={SUB_STYLE}>—</span>
            }
          </div>
        </div>
      </div>
      <BlockConfigPanel blockConfig={blockConfig} onChange={setBlockConfig} blockConfigForm={multiSelectComponent.blockConfigForm} />
    </div>
  )
}

// ─────────────────────────────────────────
// select
// ─────────────────────────────────────────
function SelectDemo({ variant }: { variant: string }) {
  const [value, setValue] = useState('')
  const [blockConfig, setBlockConfig] = useState<Record<string, unknown>>({
    options: [
      { value: 'Visitor',      label: 'Visitor',      color: '#9ca3af' },
      { value: 'New User',     label: 'New User',     color: '#3b82f6' },
      { value: 'User',         label: 'User',         color: '#22c55e' },
      { value: 'Known User',   label: 'Known User',   color: '#f97316' },
      { value: 'Trusted User', label: 'Trusted User', color: '#a855f7' },
    ],
  })

  return (
    <div>
      <div className="grid grid-cols-2 divide-x divide-gray-100 min-w-0">
        <div className="px-5 py-5 space-y-3 min-w-0 overflow-hidden">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
          <selectComponent.FormItem value={value} onChange={setValue} t={{} as never} blockConfig={blockConfig} />
        </div>
        <div className="px-5 py-5 min-w-0 overflow-hidden">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
          <div className="min-h-[40px]">
            {selectComponent.CardItem
              ? <selectComponent.CardItem value={value} ctx={ctx} variant={variant} blockConfig={blockConfig} />
              : <span style={SUB_STYLE}>—</span>
            }
          </div>
        </div>
      </div>
      <BlockConfigPanel blockConfig={blockConfig} onChange={setBlockConfig} blockConfigForm={selectComponent.blockConfigForm} />
    </div>
  )
}

// ─────────────────────────────────────────
// text
// ─────────────────────────────────────────
function TextDemo() {
  const [value, setValue] = useState('')
  const [blockConfig, setBlockConfig] = useState<Record<string, unknown>>({ multiline: true })

  return (
    <div>
      <div className="grid grid-cols-2 divide-x divide-gray-100 min-w-0">
        <div className="px-5 py-5 space-y-3 min-w-0 overflow-hidden">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
          <textComponent.FormItem value={value} onChange={setValue} t={{} as never} blockConfig={blockConfig} />
        </div>
        <div className="px-5 py-5 min-w-0 overflow-hidden">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
          <div className="min-h-[40px]">
            {textComponent.CardItem
              ? <textComponent.CardItem value={value} ctx={ctx} blockConfig={blockConfig} />
              : <span style={SUB_STYLE}>—</span>
            }
          </div>
        </div>
      </div>
      <BlockConfigPanel blockConfig={blockConfig} onChange={setBlockConfig} blockConfigForm={textComponent.blockConfigForm} />
    </div>
  )
}

// ─────────────────────────────────────────
// number (gauge)
// ─────────────────────────────────────────
function NumberDemo({ variant }: { variant: string }) {
  const [value, setValue] = useState(50)
  const [blockConfig, setBlockConfig] = useState<Record<string, unknown>>({})

  return (
    <div>
      <div className="grid grid-cols-2 divide-x divide-gray-100 min-w-0">
        <div className="px-5 py-5 space-y-3 min-w-0 overflow-hidden">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
          <gaugeComponent.FormItem value={value} onChange={setValue} t={{} as never} blockConfig={blockConfig} />
        </div>
        <div className="px-5 py-5 min-w-0 overflow-hidden">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
          <div className="min-h-[40px]">
            {gaugeComponent.CardItem
              ? <gaugeComponent.CardItem value={value} ctx={ctx} variant={variant} blockConfig={blockConfig} />
              : <span style={SUB_STYLE}>—</span>
            }
          </div>
        </div>
      </div>
      <BlockConfigPanel blockConfig={blockConfig} onChange={setBlockConfig} blockConfigForm={gaugeComponent.blockConfigForm} />
    </div>
  )
}

// ─────────────────────────────────────────
// boolean
// ─────────────────────────────────────────
function BooleanDemo() {
  const [value, setValue] = useState(false)
  const [blockConfig, setBlockConfig] = useState<Record<string, unknown>>({})

  return (
    <div>
      <div className="grid grid-cols-2 divide-x divide-gray-100 min-w-0">
        <div className="px-5 py-5 space-y-3 min-w-0 overflow-hidden">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
          <booleanFlagComponent.FormItem value={value} onChange={setValue} t={{} as never} blockConfig={blockConfig} />
        </div>
        <div className="px-5 py-5 min-w-0 overflow-hidden">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
          <div className="min-h-[40px]">
            {booleanFlagComponent.CardItem
              ? <booleanFlagComponent.CardItem value={value} ctx={ctx} blockConfig={blockConfig} />
              : <span style={SUB_STYLE}>—</span>
            }
          </div>
        </div>
      </div>
      <BlockConfigPanel blockConfig={blockConfig} onChange={setBlockConfig} blockConfigForm={booleanFlagComponent.blockConfigForm} />
    </div>
  )
}

// ─────────────────────────────────────────
// weekly-activity
// ─────────────────────────────────────────
function WeeklyActivityDemo() {
  const [value, setValue] = useState<ActivityValue>({
    days: [true, true, true, true, true, false, false],
    weekdayStart: '22:00', weekdayEnd: '02:00',
    holidayStart: '', holidayEnd: '',
  })
  const [blockConfig, setBlockConfig] = useState<Record<string, unknown>>({})

  return (
    <div>
      <div className="grid grid-cols-2 divide-x divide-gray-100 min-w-0">
        <div className="px-5 py-5 space-y-3 min-w-0 overflow-hidden">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
          <activityComponent.FormItem value={value} onChange={setValue} t={{} as never} blockConfig={blockConfig} />
        </div>
        <div className="px-5 py-5 min-w-0 overflow-hidden">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
          <div className="min-h-[40px]">
            {activityComponent.CardItem
              ? <activityComponent.CardItem value={value} ctx={ctx} blockConfig={blockConfig} />
              : <span style={SUB_STYLE}>—</span>
            }
          </div>
        </div>
      </div>
      <BlockConfigPanel blockConfig={blockConfig} onChange={setBlockConfig} blockConfigForm={activityComponent.blockConfigForm} />
    </div>
  )
}

// ─────────────────────────────────────────
// mark-list / mark-grid
// ─────────────────────────────────────────
function MarkListDemo() {
  const [value, setValue] = useState(markListComponent.defaultValue)
  const [blockConfig, setBlockConfig] = useState<Record<string, unknown>>({})
  return (
    <div>
      <div className="grid grid-cols-2 divide-x divide-gray-100 min-w-0">
        <div className="px-5 py-5 space-y-2 min-w-0 overflow-hidden">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
          <markListComponent.FormItem value={value} onChange={setValue} t={{} as never} blockConfig={blockConfig} />
        </div>
        <div className="px-5 py-5 min-w-0 overflow-hidden">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
          <div className="min-h-[40px]">
            {markListComponent.CardItem
              ? <markListComponent.CardItem value={value} ctx={ctx} blockConfig={blockConfig} />
              : <span style={SUB_STYLE}>—</span>}
          </div>
        </div>
      </div>
      <BlockConfigPanel blockConfig={blockConfig} onChange={setBlockConfig} blockConfigForm={markListComponent.blockConfigForm} />
    </div>
  )
}

function MarkGridDemo() {
  const [value, setValue] = useState(markGridComponent.defaultValue)
  const [blockConfig, setBlockConfig] = useState<Record<string, unknown>>({})
  return (
    <div>
      <div className="grid grid-cols-2 divide-x divide-gray-100 min-w-0">
        <div className="px-5 py-5 space-y-2 min-w-0 overflow-hidden">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
          <markGridComponent.FormItem value={value} onChange={setValue} t={{} as never} blockConfig={blockConfig} />
        </div>
        <div className="px-5 py-5 min-w-0 overflow-hidden">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
          <div className="min-h-[120px]">
            {markGridComponent.CardItem
              ? <markGridComponent.CardItem value={value} ctx={ctx} blockConfig={blockConfig} />
              : <span style={SUB_STYLE}>—</span>}
          </div>
        </div>
      </div>
      <BlockConfigPanel blockConfig={blockConfig} onChange={setBlockConfig} blockConfigForm={markGridComponent.blockConfigForm} />
    </div>
  )
}

// ─────────────────────────────────────────
// gallery（仮実装のまま）
// ─────────────────────────────────────────
function GalleryDemo() {
  return (
    <div className="grid grid-cols-2 divide-x divide-gray-100 min-w-0">
      <div className="px-5 py-5 space-y-3 min-w-0 overflow-hidden">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex-1 aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-300">
              {i + 1}
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 py-5 min-w-0 overflow-hidden">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
        <div style={{ display: 'flex', gap: 4 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ flex: 1, aspectRatio: '1', borderRadius: 6, background: '#e5e7eb' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// profile-image
// ─────────────────────────────────────────
function ProfileImageDemo({ variant }: { variant: string }) {
  const [value, setValue] = useState<{ base64: string | null; url: string | null }>({ base64: null, url: null })

  return (
    <div className="grid grid-cols-2 divide-x divide-gray-100 min-w-0">
      <div className="px-5 py-5 space-y-3 min-w-0 overflow-hidden">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
        <profileImageComponent.FormItem value={value} onChange={setValue} t={{} as never} />
      </div>
      <div className="px-5 py-5 space-y-2">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">CardItem</p>
        <div style={{ width: 120 }}>
          {profileImageComponent.CardItem && <profileImageComponent.CardItem value={value} ctx={ctx} variant={variant} />}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// item-list
// ─────────────────────────────────────────
function ItemListDemo({ variant }: { variant: string }) {
  const [value, setValue] = useState<ItemListValue>([
    { category: 'BASE AVATAR', name: 'Luna Base（少女体）', code: '#PB-03', url: '' },
    { category: 'OUTFIT',      name: 'Celestia Set',       code: '#OF-17', url: '' },
  ])
  return (
    <div className="grid grid-cols-2 divide-x divide-gray-100 min-w-0">
      <div className="px-5 py-5 space-y-3 min-w-0 overflow-hidden">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
        <itemListComponent.FormItem value={value} onChange={setValue} t={{} as never} />
      </div>
      <div className="px-5 py-5 min-w-0 overflow-hidden">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
        <div style={{ width: 280 }}>
          {itemListComponent.CardItem && <itemListComponent.CardItem value={value} ctx={ctx} variant={variant} />}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// height-ruler
// ─────────────────────────────────────────
function HeightRulerDemo() {
  const [value, setValue] = useState<HeightRulerValue>({ height: 154, avatarImage: null, imageScale: 1, imageOffsetY: 0 })
  return (
    <div className="grid grid-cols-2 divide-x divide-gray-100 min-w-0">
      <div className="px-5 py-5 space-y-3 min-w-0 overflow-hidden">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
        <heightRulerComponent.FormItem value={value} onChange={setValue} t={{} as never} />
      </div>
      <div className="px-5 py-5 min-w-0 overflow-hidden">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
        {heightRulerComponent.CardItem && <heightRulerComponent.CardItem value={value} ctx={ctx} variant="simple" />}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// 抽象コンポーネント一覧
// ─────────────────────────────────────────
const ABSTRACT_COMPONENTS: AbstractComponent[] = [
  { inputType: 'expressive-select', description: 'タグ（検索用）＋自由テキスト（表示用）の二層構造',   variants: ['simple', 'icon'],     Demo: ExpressiveSelectDemo },
  { inputType: 'multi-select',      description: '複数選択。配列で保存。バッジ or スラッシュ区切り',  variants: ['simple', 'slash', 'icon'], Demo: MultiSelectDemo },
  { inputType: 'select',            description: '単一選択。文字列で保存。',                          variants: ['simple', 'badge'],    Demo: SelectDemo },
  { inputType: 'text',              description: '自由テキスト。multiline で1行/複数行を切替。',      variants: ['simple'],             Demo: ({ variant: _ }) => <TextDemo /> },
  { inputType: 'number',            description: '数値。プログレスバーで表示。unit で単位を設定。',   variants: ['simple'],             Demo: NumberDemo },
  { inputType: 'boolean',           description: 'ON/OFF の二値。trueLabel/falseLabel/color 対応。', variants: ['simple', 'badge'],    Demo: ({ variant: _ }) => <BooleanDemo /> },
  { inputType: 'weekly-activity',   description: '曜日＋時間帯。平日/休日を個別設定可能。',            variants: ['simple', 'v2'],       Demo: ({ variant: _ }) => <WeeklyActivityDemo /> },
  { inputType: 'mark-list',         description: 'ラベル＋記号（◎◯△✗）のバッジ形式リスト。マークされた項目のみ表示。',  variants: ['simple'],  Demo: ({ variant: _ }) => <MarkListDemo /> },
  { inputType: 'mark-grid',         description: 'ラベル＋記号（◎◯△✗）のグリッド表示。全項目を格子状に並べる。',        variants: ['simple'],  Demo: ({ variant: _ }) => <MarkGridDemo /> },
  { inputType: 'gallery',           description: '画像ギャラリー（最大3枚）。',                       variants: ['simple'],             Demo: ({ variant: _ }) => <GalleryDemo /> },
  { inputType: 'profile-image',     description: 'プロフィール画像。正方形トリミング。variant で形状変更。', variants: ['simple', 'circle'], Demo: ProfileImageDemo },
  { inputType: 'item-list',        description: '改変アイテムリスト。カテゴリ・名前・コード・Booth URL を可変エントリで管理。', variants: ['simple', 'compact'], Demo: ItemListDemo },
  { inputType: 'height-ruler',     description: '身長ルーラー。SVG目盛り＋透過PNG重ね合わせ。身長マーカー自動計算。', variants: ['simple'], Demo: ({ variant: _ }) => <HeightRulerDemo /> },
]

const INPUT_TYPE_COLORS: Record<string, string> = {
  'expressive-select': 'bg-purple-100 text-purple-700 border-purple-200',
  'multi-select':      'bg-blue-100 text-blue-700 border-blue-200',
  'select':            'bg-sky-100 text-sky-700 border-sky-200',
  'text':              'bg-gray-100 text-gray-600 border-gray-200',
  'number':            'bg-orange-100 text-orange-700 border-orange-200',
  'boolean':           'bg-green-100 text-green-700 border-green-200',
  'weekly-activity':   'bg-teal-100 text-teal-700 border-teal-200',
  'mark-list':         'bg-rose-100 text-rose-700 border-rose-200',
  'gallery':           'bg-yellow-100 text-yellow-700 border-yellow-200',
  'profile-image':     'bg-indigo-100 text-indigo-700 border-indigo-200',
  'item-list':         'bg-violet-100 text-violet-700 border-violet-200',
  'height-ruler':      'bg-cyan-100 text-cyan-700 border-cyan-200',
}

function AbstractComponentCard({ inputType, description, variants, Demo }: AbstractComponent) {
  const [selected, setSelected] = useState(variants[0])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium font-mono ${INPUT_TYPE_COLORS[inputType] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
          {inputType}
        </span>
        <span className="text-xs text-gray-400">{description}</span>
        <div className="ml-auto flex items-center gap-1">
          <span className="text-[10px] text-gray-300 uppercase tracking-wider mr-1">variant</span>
          {variants.map(v => (
            <button key={v} type="button" onClick={() => setSelected(v)}
              className={`text-xs px-2 py-0.5 rounded border font-mono transition-colors ${selected === v ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>
      <Demo variant={selected} />
    </div>
  )
}

export default function AbstractComponentPreview() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">input_type ごとの FormItem / CardItem パターン。▸ blockConfig から設定を変更して動作を確認できます。</p>
      {ABSTRACT_COMPONENTS.map(c => (
        <AbstractComponentCard key={c.inputType} {...c} />
      ))}
    </div>
  )
}
