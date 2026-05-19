'use client'

import { useState } from 'react'
import { DEFAULT_CARD_RENDER_CONTEXT } from '@/blocks/types'
import { genderTagBlock, GENDER_TAG_OPTIONS } from '@/blocks/gender'
import { playEnvBlock } from '@/blocks/playEnv'
import { trustRankBlock } from '@/blocks/trustRank'
import { selfIntroBlock } from '@/blocks/selfIntro'
import { micOnRateBlock } from '@/blocks/micOnRate'
import { snsBlock } from '@/blocks/sns'
import { activityBlock } from '@/blocks/activity'
import { interactionsBlock } from '@/blocks/interactions'
import type { GenderValue } from '@/blocks/gender'
import type { SnsValue, ActivityValue } from '@/blocks/types'
import type { InteractionItem } from '@/blocks/interactions'

const ctx = DEFAULT_CARD_RENDER_CONTEXT

const SUB_STYLE: React.CSSProperties = {
  fontSize: ctx.cardWidth * 0.011,
  color: ctx.theme.subText,
  fontFamily: ctx.fontFamily,
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
// expressive-select → genderTagBlock.CardItem
// ─────────────────────────────────────────
function ExpressiveSelectDemo({ variant }: { variant: string }) {
  const [value, setValue] = useState<GenderValue>({ tag: 'none', display: '' })

  return (
    <div className="grid grid-cols-2 divide-x divide-gray-100">
      <div className="px-5 py-5 space-y-3">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
        <div className="flex flex-wrap gap-2">
          {GENDER_TAG_OPTIONS.map(o => (
            <button key={o.value} type="button"
              onClick={() => setValue(v => ({ ...v, tag: o.value }))}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${value.tag === o.value ? 'bg-sky-500 border-sky-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-sky-300'}`}>
              {o.icon}{o.label}
            </button>
          ))}
        </div>
        {value.tag !== 'none' && (
          <input type="text" value={value.display}
            onChange={e => setValue(v => ({ ...v, display: e.target.value }))}
            placeholder="表示テキスト（任意）"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200" />
        )}
      </div>
      <div className="px-5 py-5">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
        <div className="min-h-[40px]">
          {genderTagBlock.CardItem
            ? <genderTagBlock.CardItem value={value} ctx={ctx} variant={variant} />
            : <span style={SUB_STYLE}>—</span>
          }
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// multi-select → playEnvBlock.CardItem
// ─────────────────────────────────────────
function MultiSelectDemo({ variant }: { variant: string }) {
  const OPTIONS = ['選択肢A', '選択肢B', '選択肢C', '選択肢D']
  const [selected, setSelected] = useState<string[]>([])
  const toggle = (o: string) => setSelected(s => s.includes(o) ? s.filter(x => x !== o) : [...s, o])

  return (
    <div className="grid grid-cols-2 divide-x divide-gray-100">
      <div className="px-5 py-5 space-y-3">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
        <div className="flex flex-wrap gap-2">
          {OPTIONS.map(o => (
            <button key={o} type="button" onClick={() => toggle(o)}
              className={`px-4 py-1.5 rounded-lg text-sm border font-medium transition-all ${selected.includes(o) ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
              {o}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 py-5">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
        <div className="min-h-[40px]">
          {playEnvBlock.CardItem
            ? <playEnvBlock.CardItem value={selected} ctx={ctx} variant={variant} />
            : <span style={SUB_STYLE}>—</span>
          }
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// select → trustRankBlock.CardItem
// ─────────────────────────────────────────
const RANK_OPTIONS = ['Visitor', 'New User', 'User', 'Known User', 'Trusted User']

function SelectDemo({ variant }: { variant: string }) {
  const [selected, setSelected] = useState('')

  return (
    <div className="grid grid-cols-2 divide-x divide-gray-100">
      <div className="px-5 py-5 space-y-3">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
        <div className="flex flex-col gap-1.5">
          {RANK_OPTIONS.map(o => (
            <button key={o} type="button" onClick={() => setSelected(s => s === o ? '' : o)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm border font-medium transition-all ${selected === o ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
              {o}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 py-5">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
        <div className="min-h-[40px]">
          {trustRankBlock.CardItem
            ? <trustRankBlock.CardItem value={selected} ctx={ctx} variant={variant} />
            : <span style={SUB_STYLE}>—</span>
          }
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// text → selfIntroBlock.CardItem
// ─────────────────────────────────────────
function TextDemo() {
  const [value, setValue] = useState('')
  return (
    <div className="grid grid-cols-2 divide-x divide-gray-100">
      <div className="px-5 py-5 space-y-3">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
        <textarea value={value} onChange={e => setValue(e.target.value)} rows={4}
          placeholder="テキストを入力..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200 resize-none" />
      </div>
      <div className="px-5 py-5">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
        <div className="min-h-[40px]">
          {selfIntroBlock.CardItem
            ? <selfIntroBlock.CardItem value={value} ctx={ctx} />
            : <span style={SUB_STYLE}>—</span>
          }
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// number → micOnRateBlock.CardItem
// ─────────────────────────────────────────
function NumberDemo({ variant }: { variant: string }) {
  const [value, setValue] = useState(50)
  return (
    <div className="grid grid-cols-2 divide-x divide-gray-100">
      <div className="px-5 py-5 space-y-3">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
        <div className="flex items-center gap-3">
          <input type="range" min={0} max={100} value={value} onChange={e => setValue(Number(e.target.value))}
            className="flex-1 accent-[#00AADB] h-1.5" />
          <span className="text-sm font-semibold text-gray-700 w-10 text-right">{value}%</span>
        </div>
      </div>
      <div className="px-5 py-5">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
        <div className="min-h-[40px]">
          {micOnRateBlock.CardItem
            ? <micOnRateBlock.CardItem value={value} ctx={ctx} variant={variant} />
            : <span style={SUB_STYLE}>—</span>
          }
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// boolean（該当ブロックなし・仮実装）
// ─────────────────────────────────────────
function BooleanDemo() {
  const [value, setValue] = useState(false)
  const fs = ctx.cardWidth * 0.012
  return (
    <div className="grid grid-cols-2 divide-x divide-gray-100">
      <div className="px-5 py-5 space-y-3">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
        <button type="button" onClick={() => setValue(v => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${value ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]' : 'border-gray-200 bg-white text-gray-500'}`}>
          <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${value ? 'border-[#00AADB] bg-[#00AADB]' : 'border-gray-300'}`}>
            {value && <span className="text-white text-[10px]">✓</span>}
          </span>
          {value ? 'ON' : 'OFF'}
        </button>
      </div>
      <div className="px-5 py-5">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
        <span style={{ fontSize: fs, color: value ? '#22c55e' : ctx.theme.subText, background: (value ? '#22c55e' : ctx.theme.subText) + '18', padding: '2px 10px', borderRadius: 999, border: `1px solid ${(value ? '#22c55e' : ctx.theme.subText)}40`, fontFamily: ctx.fontFamily }}>
          {value ? 'ON' : 'OFF'}
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// sns → snsBlock.CardItem
// ─────────────────────────────────────────
const SNS_PLATFORMS: { key: keyof SnsValue; label: string; placeholder: string; color: string }[] = [
  { key: 'vrchatId',  label: 'VRChat',  placeholder: 'ID',       color: '#00AADB' },
  { key: 'twitterId', label: 'X',       placeholder: '@handle',  color: '#1a1a1a' },
  { key: 'discordId', label: 'Discord', placeholder: 'username', color: '#5865f2' },
]

function SnsDemo({ variant }: { variant: string }) {
  const [value, setValue] = useState<SnsValue>({ vrchatId: '', twitterId: '', discordId: '' })

  return (
    <div className="grid grid-cols-2 divide-x divide-gray-100">
      <div className="px-5 py-5 space-y-2">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
        {SNS_PLATFORMS.map(p => (
          <div key={p.key} className="flex items-center gap-2">
            <span className="text-xs font-semibold w-16 shrink-0" style={{ color: p.color }}>{p.label}</span>
            <input type="text" value={value[p.key] ?? ''}
              onChange={e => setValue(v => ({ ...v, [p.key]: e.target.value }))}
              placeholder={p.placeholder}
              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200" />
          </div>
        ))}
      </div>
      <div className="px-5 py-5">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
        <div className="min-h-[40px]">
          {snsBlock.CardItem
            ? <snsBlock.CardItem value={value} ctx={ctx} variant={variant} />
            : <span style={SUB_STYLE}>—</span>
          }
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// weekly-activity → activityBlock.CardItem
// ─────────────────────────────────────────
function WeeklyActivityDemo() {
  const DAYS = ['月', '火', '水', '木', '金', '土', '日']
  const [value, setValue] = useState<ActivityValue>({
    days: [true, true, true, true, true, false, false],
    weekdayStart: '22:00', weekdayEnd: '02:00',
    holidayStart: '', holidayEnd: '',
  })

  return (
    <div className="grid grid-cols-2 divide-x divide-gray-100">
      <div className="px-5 py-5 space-y-3">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
        <div className="flex gap-1.5">
          {DAYS.map((d, i) => (
            <button key={i} type="button"
              onClick={() => setValue(v => ({ ...v, days: v.days.map((x, j) => j === i ? !x : x) }))}
              className="w-8 h-8 rounded-full text-xs font-bold transition-colors"
              style={{ background: value.days[i] ? (i >= 5 ? 'rgba(251,191,36,0.85)' : 'rgba(96,165,250,0.85)') : '#f3f4f6', color: value.days[i] ? '#fff' : '#9ca3af' }}>
              {d}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 text-xs">平日</span>
          <input type="text" value={value.weekdayStart}
            onChange={e => setValue(v => ({ ...v, weekdayStart: e.target.value }))}
            className="w-20 px-2 py-1 border border-gray-200 rounded text-sm" />
          <span className="text-gray-400">〜</span>
          <input type="text" value={value.weekdayEnd}
            onChange={e => setValue(v => ({ ...v, weekdayEnd: e.target.value }))}
            className="w-20 px-2 py-1 border border-gray-200 rounded text-sm" />
        </div>
      </div>
      <div className="px-5 py-5">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
        <div className="min-h-[40px]">
          {activityBlock.CardItem
            ? <activityBlock.CardItem value={value} ctx={ctx} />
            : <span style={SUB_STYLE}>—</span>
          }
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// mark-list → interactionsBlock.CardItem
// ─────────────────────────────────────────
const MARKS = ['—', '◎', '◯', '△', '✗'] as const
const DEFAULT_ITEMS: InteractionItem[] = [
  { label: '項目A', mark: '◎' },
  { label: '項目B', mark: '◯' },
  { label: '項目C', mark: '△' },
  { label: '項目D', mark: '✗' },
  { label: '項目E', mark: '—' },
  { label: '項目F', mark: '—' },
]

function markStyle(m: string): { bg: string; border: string; text: string } {
  if (m === '◎' || m === '◯') return { bg: 'rgba(220,252,231,0.6)', border: '#86efac', text: '#15803d' }
  if (m === '△') return { bg: 'rgba(254,243,199,0.6)', border: '#fcd34d', text: '#92400e' }
  if (m === '✗') return { bg: 'rgba(254,226,226,0.6)', border: '#fca5a5', text: '#b91c1c' }
  return { bg: '#f9fafb', border: '#e5e7eb', text: '#9ca3af' }
}

function MarkListDemo({ variant }: { variant: string }) {
  const [items, setItems] = useState<InteractionItem[]>(DEFAULT_ITEMS)
  const update = (i: number, mark: string) =>
    setItems(list => list.map((item, j) => j === i ? { ...item, mark } : item))

  return (
    <div className="grid grid-cols-2 divide-x divide-gray-100">
      <div className="px-5 py-5 space-y-2">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
        {items.map((item, i) => {
          const s = markStyle(item.mark)
          return (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <select value={item.mark} onChange={e => update(i, e.target.value)}
                className="w-14 py-1 rounded text-sm font-semibold focus:outline-none bg-transparent border-0"
                style={{ color: s.text }}>
                {MARKS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
          )
        })}
      </div>
      <div className="px-5 py-5">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
        <div className="min-h-[40px]">
          {interactionsBlock.CardItem
            ? <interactionsBlock.CardItem value={items} ctx={ctx} variant={variant} />
            : <span style={SUB_STYLE}>—</span>
          }
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// gallery（該当ブロックなし・仮実装）
// ─────────────────────────────────────────
function GalleryDemo() {
  return (
    <div className="grid grid-cols-2 divide-x divide-gray-100">
      <div className="px-5 py-5 space-y-3">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex-1 aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-300">
              {i + 1}
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 py-5">
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
// 抽象コンポーネント一覧
// ─────────────────────────────────────────
const ABSTRACT_COMPONENTS: AbstractComponent[] = [
  { inputType: 'expressive-select', description: 'タグ（検索用）＋自由テキスト（表示用）の二層構造',   variants: ['default', 'icon'],     Demo: ExpressiveSelectDemo },
  { inputType: 'multi-select',      description: '複数選択。配列で保存。バッジ or スラッシュ区切り',  variants: ['default', 'slash'],    Demo: MultiSelectDemo },
  { inputType: 'select',            description: '単一選択。文字列で保存。',                          variants: ['default', 'badge'],    Demo: SelectDemo },
  { inputType: 'text',              description: '自由テキスト。全文検索のみ対応。',                   variants: ['default'],             Demo: ({ variant: _ }) => <TextDemo /> },
  { inputType: 'number',            description: '数値（0〜100）。プログレスバーで表示。',             variants: ['default', 'gradient'], Demo: NumberDemo },
  { inputType: 'boolean',           description: 'ON/OFF の二値。',                                  variants: ['default'],             Demo: ({ variant: _ }) => <BooleanDemo /> },
  { inputType: 'sns',               description: 'SNS情報のセット。ラベル or アイコン付きで表示。',    variants: ['default', 'icon'],     Demo: SnsDemo },
  { inputType: 'weekly-activity',   description: '曜日＋時間帯。平日/休日を個別設定可能。',            variants: ['default'],             Demo: ({ variant: _ }) => <WeeklyActivityDemo /> },
  { inputType: 'mark-list',         description: 'ラベル＋記号（◎◯△✗）の汎用リスト。順序性なし。',  variants: ['default', 'grid'],     Demo: MarkListDemo },
  { inputType: 'gallery',           description: '画像ギャラリー（最大3枚）。',                       variants: ['default'],             Demo: ({ variant: _ }) => <GalleryDemo /> },
]

const INPUT_TYPE_COLORS: Record<string, string> = {
  'expressive-select': 'bg-purple-100 text-purple-700 border-purple-200',
  'multi-select':      'bg-blue-100 text-blue-700 border-blue-200',
  'select':            'bg-sky-100 text-sky-700 border-sky-200',
  'text':              'bg-gray-100 text-gray-600 border-gray-200',
  'number':            'bg-orange-100 text-orange-700 border-orange-200',
  'boolean':           'bg-green-100 text-green-700 border-green-200',
  'sns':               'bg-pink-100 text-pink-700 border-pink-200',
  'weekly-activity':   'bg-teal-100 text-teal-700 border-teal-200',
  'mark-list':         'bg-rose-100 text-rose-700 border-rose-200',
  'gallery':           'bg-yellow-100 text-yellow-700 border-yellow-200',
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
      <p className="text-sm text-gray-400">input_type ごとの抽象的な FormItem / CardItem パターン。CardItemは実ブロックの実装を使用しています。</p>
      {ABSTRACT_COMPONENTS.map(c => (
        <AbstractComponentCard key={c.inputType} {...c} />
      ))}
    </div>
  )
}
