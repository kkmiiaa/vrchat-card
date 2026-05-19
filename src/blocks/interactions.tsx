'use client'
import type { Block } from './types'
import { translations } from '@/utils/translations'

type MarkOption = '―' | '◎' | '◯' | '△' | '✗'

export type InteractionItem = {
  label: string
  mark: string
  isCustom?: boolean
}

const defaultItems = (): InteractionItem[] =>
  Object.keys(translations.ja.okNgDefaults).map(key => ({ label: key, mark: '-' }))

function markStyle(mark: string): { bg: string; border: string; text: string } {
  const isOk = mark === '◎' || mark === '◯'
  if (isOk)      return { bg: 'rgba(220,252,231,0.6)', border: '#86efac', text: '#15803d' }
  if (mark === '△') return { bg: 'rgba(254,243,199,0.6)', border: '#fcd34d', text: '#92400e' }
  if (mark === '✗') return { bg: 'rgba(254,226,226,0.6)', border: '#fca5a5', text: '#b91c1c' }
  return { bg: '#f9fafb', border: '#e5e7eb', text: '#9ca3af' }
}

export const interactionsBlock: Block<InteractionItem[]> = {
  key: 'interactions',
  defaultValue: defaultItems(),
  CardItem({ value, ctx }) {
    const items = Array.isArray(value) ? value : []
    const visible = items.filter(item => item.mark !== '-' && item.mark !== '―')
    if (!visible.length) return null
    const fs = ctx.cardWidth * 0.011
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {visible.map((item, i) => {
          const style = markStyle(item.mark)
          return (
            <span key={i} style={{ fontSize: fs, padding: '2px 8px', borderRadius: 999, background: style.bg, border: `1px solid ${style.border}`, color: style.text, fontFamily: ctx.fontFamily }}>
              {item.mark} {item.label}
            </span>
          )
        })}
      </div>
    )
  },
  FormItem({ value, onChange, t }) {
    const update = (index: number, patch: Partial<InteractionItem>) => {
      const updated = value.map((item, i) => i === index ? { ...item, ...patch } : item)
      onChange(updated)
    }
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.okNg}</h2>
        {value.map((item, index) => {
          const style = markStyle(item.mark)
          return (
            <div
              key={index}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: style.bg, border: `1px solid ${style.border}` }}
            >
              <select
                value={item.mark}
                onChange={e => update(index, { mark: e.target.value as MarkOption })}
                className="w-14 py-1 rounded-md text-sm font-semibold focus:outline-none bg-transparent border-0"
                style={{ color: style.text }}
              >
                <option value="-">―</option>
                <option value="◎">◎</option>
                <option value="◯">◯</option>
                <option value="△">△</option>
                <option value="✗">✗</option>
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
}
