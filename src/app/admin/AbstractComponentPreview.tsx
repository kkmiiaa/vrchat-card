'use client'

import { useState } from 'react'
import { DEFAULT_CARD_RENDER_CONTEXT } from '@/blocks/types'

const ctx = DEFAULT_CARD_RENDER_CONTEXT

// ─────────────────────────────────────────
// 共通スタイルヘルパー
// ─────────────────────────────────────────
const BADGE = (color: string): React.CSSProperties => ({
  fontSize: ctx.cardWidth * 0.012,
  color,
  background: color + '18',
  padding: '2px 10px',
  borderRadius: 999,
  border: `1px solid ${color}40`,
  fontFamily: ctx.fontFamily,
  display: 'inline-block',
})

const TEXT_STYLE: React.CSSProperties = {
  fontSize: ctx.cardWidth * 0.013,
  color: ctx.theme.text,
  fontFamily: ctx.fontFamily,
}

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
// expressive-select
// ─────────────────────────────────────────
function ExpressiveSelectDemo({ variant }: { variant: string }) {
  const OPTIONS = [
    { tag: 'option-a', label: '選択肢A' },
    { tag: 'option-b', label: '選択肢B' },
    { tag: 'option-c', label: '選択肢C' },
  ]
  const [tag, setTag] = useState('option-a')
  const [display, setDisplay] = useState('')
  const label = OPTIONS.find(o => o.tag === tag)?.label ?? ''
  const shown = display || label

  return (
    <div className="grid grid-cols-2 divide-x divide-gray-100">
      <div className="px-5 py-5 space-y-3">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
        <div className="flex flex-wrap gap-2">
          {OPTIONS.map(o => (
            <button key={o.tag} type="button" onClick={() => setTag(o.tag)}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${tag === o.tag ? 'bg-sky-500 border-sky-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-sky-300'}`}>
              {o.label}
            </button>
          ))}
        </div>
        <input type="text" value={display} onChange={e => setDisplay(e.target.value)}
          placeholder="表示テキスト（任意）"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200" />
      </div>
      <div className="px-5 py-5">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
        {variant === 'icon'
          ? <span style={{ ...TEXT_STYLE, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: ctx.theme.accent, display: 'inline-block' }} />
              {shown}
            </span>
          : <span style={BADGE(ctx.theme.accent)}>{shown}</span>
        }
        <pre className="mt-4 pt-3 border-t border-gray-50 text-[10px] text-gray-400 bg-gray-50 rounded px-2 py-1">
          {JSON.stringify({ tag, display }, null, 2)}
        </pre>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// multi-select
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
        {selected.length > 0
          ? variant === 'slash'
            ? <span style={TEXT_STYLE}>{selected.join(' / ')}</span>
            : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {selected.map(s => <span key={s} style={BADGE(ctx.theme.accent)}>{s}</span>)}
              </div>
          : <span style={SUB_STYLE}>—</span>
        }
        <pre className="mt-4 pt-3 border-t border-gray-50 text-[10px] text-gray-400 bg-gray-50 rounded px-2 py-1">
          {JSON.stringify(selected, null, 2)}
        </pre>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// select
// ─────────────────────────────────────────
function SelectDemo({ variant }: { variant: string }) {
  const OPTIONS = ['選択肢A', '選択肢B', '選択肢C']
  const [selected, setSelected] = useState('')

  return (
    <div className="grid grid-cols-2 divide-x divide-gray-100">
      <div className="px-5 py-5 space-y-3">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
        <div className="flex flex-col gap-1.5">
          {OPTIONS.map(o => (
            <button key={o} type="button" onClick={() => setSelected(s => s === o ? '' : o)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm border font-medium transition-all ${selected === o ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
              {o}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 py-5">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
        {selected
          ? variant === 'badge'
            ? <span style={BADGE(ctx.theme.accent)}>{selected}</span>
            : <span style={TEXT_STYLE}>{selected}</span>
          : <span style={SUB_STYLE}>—</span>
        }
        <pre className="mt-4 pt-3 border-t border-gray-50 text-[10px] text-gray-400 bg-gray-50 rounded px-2 py-1">
          {JSON.stringify(selected)}
        </pre>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// text
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
        <p style={{ ...TEXT_STYLE, lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>{value || '—'}</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// number
// ─────────────────────────────────────────
function NumberDemo({ variant }: { variant: string }) {
  const [value, setValue] = useState(50)
  const barW = ctx.cardWidth * 0.18
  const gradient = variant === 'gradient'
    ? 'linear-gradient(to right, #60a5fa, #a78bfa)'
    : ctx.theme.accent

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: barW, height: 6, borderRadius: 999, background: `${ctx.theme.subText}30`, overflow: 'hidden' }}>
            <div style={{ width: `${value}%`, height: '100%', borderRadius: 999, background: gradient }} />
          </div>
          <span style={{ ...TEXT_STYLE, fontWeight: 600 }}>{value}%</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// boolean
// ─────────────────────────────────────────
function BooleanDemo() {
  const [value, setValue] = useState(false)
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
        <span style={BADGE(value ? '#22c55e' : ctx.theme.subText)}>{value ? 'ON' : 'OFF'}</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// sns
// ─────────────────────────────────────────
function SnsDemo({ variant }: { variant: string }) {
  const [fields, setFields] = useState({ platform: '', handle: '', id: '' })
  const entries = Object.entries(fields).filter(([, v]) => v)
  const LABELS = ['Platform', 'Handle', 'ID']

  return (
    <div className="grid grid-cols-2 divide-x divide-gray-100">
      <div className="px-5 py-5 space-y-3">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
        {(['platform', 'handle', 'id'] as const).map((k, i) => (
          <label key={k} className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-gray-700">{LABELS[i]}</span>
            <input type="text" value={fields[k]} onChange={e => setFields(f => ({ ...f, [k]: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200" />
          </label>
        ))}
      </div>
      <div className="px-5 py-5">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
        {entries.length > 0
          ? <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {entries.map(([key, val]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {variant === 'icon'
                    ? <span style={{ width: 14, height: 14, borderRadius: 3, background: ctx.theme.accent + '30', display: 'inline-block', flexShrink: 0 }} />
                    : <span style={{ ...SUB_STYLE, fontWeight: 600, minWidth: '3em' }}>{key.toUpperCase()}</span>
                  }
                  <span style={TEXT_STYLE}>{val}</span>
                </div>
              ))}
            </div>
          : <span style={SUB_STYLE}>—</span>
        }
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// weekly-activity
// ─────────────────────────────────────────
function WeeklyActivityDemo() {
  const DAYS = ['月', '火', '水', '木', '金', '土', '日']
  const [days, setDays] = useState([true, true, true, true, true, false, false])
  const [start, setStart] = useState('22:00')
  const [end, setEnd] = useState('02:00')

  return (
    <div className="grid grid-cols-2 divide-x divide-gray-100">
      <div className="px-5 py-5 space-y-3">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
        <div className="flex gap-1.5">
          {DAYS.map((d, i) => (
            <button key={i} type="button" onClick={() => setDays(ds => ds.map((v, j) => j === i ? !v : v))}
              className="w-8 h-8 rounded-full text-xs font-bold transition-colors"
              style={{ background: days[i] ? (i >= 5 ? 'rgba(251,191,36,0.85)' : 'rgba(96,165,250,0.85)') : '#f3f4f6', color: days[i] ? '#fff' : '#9ca3af' }}>
              {d}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input type="text" value={start} onChange={e => setStart(e.target.value)} className="w-20 px-2 py-1 border border-gray-200 rounded text-sm" />
          <span className="text-gray-400">〜</span>
          <input type="text" value={end} onChange={e => setEnd(e.target.value)} className="w-20 px-2 py-1 border border-gray-200 rounded text-sm" />
        </div>
      </div>
      <div className="px-5 py-5">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', gap: 3 }}>
            {DAYS.map((d, i) => (
              <span key={i} style={{ ...SUB_STYLE, fontWeight: 700, color: days[i] ? (i >= 5 ? '#f59e0b' : ctx.theme.accent) : ctx.theme.subText, opacity: days[i] ? 1 : 0.4 }}>{d}</span>
            ))}
          </div>
          {start && <span style={TEXT_STYLE}>{start}〜{end}</span>}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// mark-list
// ─────────────────────────────────────────
const MARKS = ['—', '◎', '◯', '△', '✗'] as const
type Mark = typeof MARKS[number]

function markStyle(m: string): { bg: string; border: string; text: string } {
  if (m === '◎' || m === '◯') return { bg: 'rgba(220,252,231,0.6)', border: '#86efac', text: '#15803d' }
  if (m === '△') return { bg: 'rgba(254,243,199,0.6)', border: '#fcd34d', text: '#92400e' }
  if (m === '✗') return { bg: 'rgba(254,226,226,0.6)', border: '#fca5a5', text: '#b91c1c' }
  return { bg: '#f9fafb', border: '#e5e7eb', text: '#9ca3af' }
}

function MarkListDemo({ variant }: { variant: string }) {
  const ITEMS = ['項目A', '項目B', '項目C', '項目D', '項目E', '項目F']
  const [marks, setMarks] = useState<Record<string, string>>(Object.fromEntries(ITEMS.map(k => [k, '—'])))
  const visible = ITEMS.filter(k => marks[k] !== '—')

  return (
    <div className="grid grid-cols-2 divide-x divide-gray-100">
      <div className="px-5 py-5 space-y-2">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">FormItem</p>
        {ITEMS.map(item => {
          const s = markStyle(marks[item])
          return (
            <div key={item} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <select value={marks[item]} onChange={e => setMarks(m => ({ ...m, [item]: e.target.value }))}
                className="w-14 py-1 rounded text-sm font-semibold focus:outline-none bg-transparent border-0" style={{ color: s.text }}>
                {MARKS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <span className="text-sm text-gray-600">{item}</span>
            </div>
          )
        })}
      </div>
      <div className="px-5 py-5">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
        {visible.length > 0
          ? variant === 'grid'
            ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                {visible.map(item => {
                  const s = markStyle(marks[item])
                  return (
                    <div key={item} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 6, padding: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <span style={{ fontSize: 10, color: '#6b7280', textAlign: 'center' }}>{item}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: s.text }}>{marks[item]}</span>
                    </div>
                  )
                })}
              </div>
            : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {visible.map(item => {
                  const s = markStyle(marks[item])
                  return <span key={item} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>{marks[item]} {item}</span>
                })}
              </div>
          : <span style={SUB_STYLE}>—</span>
        }
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// gallery
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
            <div key={i} style={{ flex: 1, aspectRatio: '1', borderRadius: 6, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={SUB_STYLE}>{i + 1}</span>
            </div>
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
  {
    inputType: 'expressive-select',
    description: 'タグ（検索用）＋自由テキスト（表示用）の二層構造',
    variants: ['default', 'icon'],
    Demo: ExpressiveSelectDemo,
  },
  {
    inputType: 'multi-select',
    description: '複数選択。配列で保存。バッジ or スラッシュ区切り',
    variants: ['default', 'slash'],
    Demo: MultiSelectDemo,
  },
  {
    inputType: 'select',
    description: '単一選択。文字列で保存。',
    variants: ['default', 'badge'],
    Demo: SelectDemo,
  },
  {
    inputType: 'text',
    description: '自由テキスト。全文検索のみ対応。',
    variants: ['default'],
    Demo: ({ variant: _ }) => <TextDemo />,
  },
  {
    inputType: 'number',
    description: '数値（0〜100）。プログレスバーで表示。',
    variants: ['default', 'gradient'],
    Demo: NumberDemo,
  },
  {
    inputType: 'boolean',
    description: 'ON/OFF の二値。',
    variants: ['default'],
    Demo: ({ variant: _ }) => <BooleanDemo />,
  },
  {
    inputType: 'sns',
    description: 'SNS情報のセット。ラベル or アイコン付きで表示。',
    variants: ['default', 'icon'],
    Demo: SnsDemo,
  },
  {
    inputType: 'weekly-activity',
    description: '曜日＋時間帯。平日/休日を個別設定可能。',
    variants: ['default'],
    Demo: ({ variant: _ }) => <WeeklyActivityDemo />,
  },
  {
    inputType: 'mark-list',
    description: 'ラベル＋記号（◎◯△✗）の汎用リスト。順序性なし。',
    variants: ['default', 'grid'],
    Demo: MarkListDemo,
  },
  {
    inputType: 'gallery',
    description: '画像ギャラリー（最大3枚）。',
    variants: ['default'],
    Demo: ({ variant: _ }) => <GalleryDemo />,
  },
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
      <p className="text-sm text-gray-400">input_type ごとの抽象的な FormItem / CardItem パターン。variant を切り替えて表示スタイルを確認できます。</p>
      {ABSTRACT_COMPONENTS.map(c => (
        <AbstractComponentCard key={c.inputType} {...c} />
      ))}
    </div>
  )
}
