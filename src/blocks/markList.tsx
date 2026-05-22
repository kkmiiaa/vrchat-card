'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { translations } from '@/utils/translations'

export type MarkListItem = {
  label: string
  mark: string
  isCustom?: boolean
}

export type MarkDefinition = {
  symbol: string
  color: string
  bg: string
}

export const DEFAULT_MARKS: MarkDefinition[] = [
  { symbol: '◎', color: '#15803d', bg: 'rgba(220,252,231,0.6)' },
  { symbol: '◯', color: '#15803d', bg: 'rgba(220,252,231,0.6)' },
  { symbol: '△', color: '#92400e', bg: 'rgba(254,243,199,0.6)' },
  { symbol: '✗', color: '#b91c1c', bg: 'rgba(254,226,226,0.6)' },
]

function getMarkDef(mark: string, marks: MarkDefinition[]): MarkDefinition | null {
  return marks.find(m => m.symbol === mark) ?? null
}

const defaultItems = (): MarkListItem[] =>
  Object.keys(translations.ja.okNgDefaults).map(key => ({ label: key, mark: '-' }))

export const markListComponent: ComponentDef<MarkListItem[]> = {
  key: 'mark-list',
  defaultValue: defaultItems(),
  variants: ['default', 'grid'],
  CardItem({ value, ctx, variant, bgVariant: _bgVariant, blockConfig }) {
    const items = Array.isArray(value) ? value : []
    const t = translations.ja
    const marks = (blockConfig?.marks as MarkDefinition[] | undefined) ?? DEFAULT_MARKS
    const iLabel = (item: MarkListItem) =>
      item.isCustom ? item.label : (t.okNgDefaults[item.label as keyof typeof t.okNgDefaults] ?? item.label)

    const getStyle = (mark: string) => {
      const def = getMarkDef(mark, marks)
      if (def) return { bg: def.bg, text: def.color }
      return { bg: '#f9fafb', border: '#e5e7eb', text: '#9ca3af' }
    }

    if (variant === 'grid') {
      const slots = Array.from({ length: 9 }, (_, i) => items[i] ?? null)
      const fs = ctx.fontSize.xs
      const markFs = ctx.fontSize.md
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: 4, width: '100%', height: '100%' }}>
          {slots.map((item, i) => {
            const style = item ? getStyle(item.mark) : { bg: 'transparent', text: 'transparent' }
            return (
              <div key={i} style={{
                background: style.bg,
                borderRadius: ctx.cardWidth * 0.006,
                padding: '5px 4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}>
                {item && <>
                  <div style={{ fontSize: fs, color: '#6b7280', fontFamily: ctx.fontFamily, textAlign: 'center', wordBreak: 'break-all', lineHeight: 1.2 }}>{iLabel(item)}</div>
                  <div style={{ fontSize: markFs, fontWeight: 700, color: style.text, fontFamily: ctx.fontFamily }}>{item.mark === '-' ? '―' : item.mark}</div>
                </>}
              </div>
            )
          })}
        </div>
      )
    }

    // default: tags
    const visible = items.filter(item => item.mark !== '-' && item.mark !== '―')
    if (!visible.length) return null
    const fs = ctx.fontSize.sm
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {visible.map((item, i) => {
          const style = getStyle(item.mark)
          return (
            <span key={i} style={{ fontSize: fs, padding: '2px 8px', borderRadius: 999, background: style.bg, color: style.text, fontFamily: ctx.fontFamily }}>
              {item.mark} {iLabel(item)}
            </span>
          )
        })}
      </div>
    )
  },
  FormItem({ value, onChange, t, blockConfig }) {
    const marks = (blockConfig?.marks as MarkDefinition[] | undefined) ?? DEFAULT_MARKS
    const update = (index: number, patch: Partial<MarkListItem>) => {
      const updated = value.map((item, i) => i === index ? { ...item, ...patch } : item)
      onChange(updated)
    }
    const getStyle = (mark: string) => {
      const def = getMarkDef(mark, marks)
      if (def) return { bg: def.bg, text: def.color }
      return { bg: '#f9fafb', border: '#e5e7eb', text: '#9ca3af' }
    }
    return (
      <div className="flex flex-col gap-2">
        {value.map((item, index) => {
          const style = getStyle(item.mark)
          return (
            <div
              key={index}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: style.bg, border: `1px solid ${style.border}` }}
            >
              <select
                value={item.mark}
                onChange={e => update(index, { mark: e.target.value })}
                className="w-14 py-1 rounded-md text-sm font-semibold focus:outline-none bg-transparent border-0"
                style={{ color: style.text }}
              >
                <option value="-">―</option>
                {marks.map(m => (
                  <option key={m.symbol} value={m.symbol}>{m.symbol}</option>
                ))}
              </select>
              <input
                type="text"
                value={item.isCustom ? item.label : t.okNgDefaults[item.label as keyof typeof t.okNgDefaults] ?? item.label}
                disabled={!item.isCustom}
                placeholder={t.customItem}
                className="flex-1 px-2 py-1 text-sm bg-transparent border-0 focus:outline-none disabled:text-gray-500"
                style={{ color: style.text }}
                onChange={e => update(index, { label: e.target.value })}
              />
              {item.isCustom && (
                <button
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none flex-shrink-0"
                  title={t.delete}
                >
                  ✕
                </button>
              )}
            </div>
          )
        })}
        {value.filter(i => i.isCustom).length < 3 && (
          <button
            onClick={() => onChange([...value, { label: '', mark: '-', isCustom: true }])}
            className="mt-1 text-sm text-sky-500 hover:text-sky-700 font-medium text-left transition-colors"
          >
            {t.addCustomItem}
          </button>
        )}
      </div>
    )
  },
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    type MarkRow = { value: string; label: string }
    type ItemRow = { label: string; required?: boolean }
    const marks: MarkRow[] = Array.isArray(blockConfig.marks) ? blockConfig.marks as MarkRow[] : []
    const items: ItemRow[] = Array.isArray(blockConfig.items) ? blockConfig.items as ItemRow[] : []

    const updateMark = (i: number, patch: Partial<MarkRow>) => {
      const next = marks.map((m, idx) => idx === i ? { ...m, ...patch } : m)
      onChange({ ...blockConfig, marks: next })
    }
    const addMark = () => onChange({ ...blockConfig, marks: [...marks, { value: '', label: '' }] })
    const removeMark = (i: number) => onChange({ ...blockConfig, marks: marks.filter((_, idx) => idx !== i) })

    const updateItem = (i: number, patch: Partial<ItemRow>) => {
      const next = items.map((it, idx) => idx === i ? { ...it, ...patch } : it)
      onChange({ ...blockConfig, items: next })
    }
    const addItem = () => onChange({ ...blockConfig, items: [...items, { label: '' }] })
    const removeItem = (i: number) => onChange({ ...blockConfig, items: items.filter((_, idx) => idx !== i) })

    return (
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] text-gray-400">マーク（marks）</p>
          {marks.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={m.value} placeholder="value"
                onChange={e => updateMark(i, { value: e.target.value })}
                className="w-20 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
              <input type="text" value={m.label} placeholder="label"
                onChange={e => updateMark(i, { label: e.target.value })}
                className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
              <button type="button" onClick={() => removeMark(i)} className="text-xs text-red-400 hover:text-red-600">×</button>
            </div>
          ))}
          <button type="button" onClick={addMark} className="text-xs text-sky-500 hover:text-sky-700 mt-1">+ 追加</button>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[10px] text-gray-400">項目（items）</p>
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={it.label} placeholder="label"
                onChange={e => updateItem(i, { label: e.target.value })}
                className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
              <label className="flex items-center gap-1 text-[10px] text-gray-500">
                <input type="checkbox" checked={!!it.required} className="rounded"
                  onChange={e => updateItem(i, { required: e.target.checked || undefined })} />
                必須
              </label>
              <button type="button" onClick={() => removeItem(i)} className="text-xs text-red-400 hover:text-red-600">×</button>
            </div>
          ))}
          <button type="button" onClick={addItem} className="text-xs text-sky-500 hover:text-sky-700 mt-1">+ 追加</button>
        </div>
      </div>
    )
  },
}
