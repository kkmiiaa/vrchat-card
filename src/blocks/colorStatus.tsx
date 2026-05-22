'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { BG_VARIANT_STYLE } from './types'

type ColorStatusField = { key: string; label: string; color: string }

const DEFAULT_FIELDS: ColorStatusField[] = [
  { key: 'a', label: 'A', color: '#60a5fa' },
  { key: 'b', label: 'B', color: '#4ade80' },
  { key: 'c', label: 'C', color: '#facc15' },
  { key: 'd', label: 'D', color: '#f87171' },
]

function getFields(blockConfig?: Record<string, unknown>): ColorStatusField[] {
  if (blockConfig?.fields && Array.isArray(blockConfig.fields) && blockConfig.fields.length > 0) {
    return blockConfig.fields as ColorStatusField[]
  }
  return DEFAULT_FIELDS
}

export const colorStatusComponent: ComponentDef<Record<string, string>> = {
  key: 'color-status',
  defaultValue: {},
  variants: ['default', 'compact'],
  CardItem({ value, ctx, variant = 'default', bgVariant, blockConfig }) {
    const safe = (value && typeof value === 'object') ? value as Record<string, string> : {}
    const fields = getFields(blockConfig)

    if (variant === 'compact') {
      const dotSize = ctx.cardWidth * 0.008
      const activeFields = fields.filter(f => safe[f.key])
      return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: ctx.cardWidth * 0.005, flexWrap: 'wrap' }}>
          {activeFields.map(f => (
            <span
              key={f.key}
              title={safe[f.key]}
              style={{
                width: dotSize,
                height: dotSize,
                borderRadius: '50%',
                background: f.color,
                flexShrink: 0,
                display: 'inline-block',
              }}
            />
          ))}
          {activeFields.length === 0 && (
            <span style={{ fontSize: ctx.fontSize.xs, color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>—</span>
          )}
        </div>
      )
    }

    // default
    const fs = ctx.fontSize.sm
    const bgStyle = BG_VARIANT_STYLE[bgVariant ?? 'transparent']
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', height: '100%' }}>
        {fields.map(f => (
          <div key={f.key} style={{ display: 'flex', alignItems: 'stretch', gap: 6, flex: 1, minHeight: 0 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: f.color, flexShrink: 0, alignSelf: 'center' }} />
            <div style={{
              flex: 1,
              background: bgStyle.background,
              border: bgStyle.border,
              borderRadius: ctx.cardWidth * 0.006,
              padding: `${ctx.cardWidth * 0.003 * ctx.paddingScale}px ${ctx.cardWidth * 0.007 * ctx.paddingScale}px`,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: fs, color: ctx.theme.text, fontFamily: ctx.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', width: '100%' }}>
                {safe[f.key] || '—'}
              </span>
            </div>
          </div>
        ))}
      </div>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    const safe = (value && typeof value === 'object') ? value as Record<string, string> : {}
    const fields = getFields(blockConfig)
    return (
      <div className="flex flex-col gap-3">
        {fields.map(f => (
          <label key={f.key} className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
              {f.label}
            </span>
            <input
              type="text"
              value={safe[f.key] ?? ''}
              onChange={e => onChange({ ...safe, [f.key]: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </label>
        ))}
      </div>
    )
  },
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const fields: ColorStatusField[] = getFields(blockConfig)
    const update = (i: number, patch: Partial<ColorStatusField>) => {
      const next = fields.map((f, idx) => idx === i ? { ...f, ...patch } : f)
      onChange({ ...blockConfig, fields: next })
    }
    const add = () => onChange({ ...blockConfig, fields: [...fields, { key: '', label: '', color: '#94a3b8' }] })
    const remove = (i: number) => onChange({ ...blockConfig, fields: fields.filter((_, idx) => idx !== i) })
    return (
      <div className="flex flex-col gap-2 text-sm">
        <p className="text-[10px] text-gray-400">フィールド（fields）</p>
        {fields.map((f, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input type="text" value={f.key} placeholder="key"
              onChange={e => update(i, { key: e.target.value })}
              className="w-16 text-xs border border-gray-200 rounded px-2 py-1 bg-white font-mono" />
            <input type="text" value={f.label} placeholder="label"
              onChange={e => update(i, { label: e.target.value })}
              className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
            <input type="color" value={f.color}
              onChange={e => update(i, { color: e.target.value })}
              className="w-7 h-7 rounded border border-gray-200 cursor-pointer p-0.5" />
            <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-600">×</button>
          </div>
        ))}
        <button type="button" onClick={add} className="text-xs text-sky-500 hover:text-sky-700 mt-1">+ 追加</button>
      </div>
    )
  },
}
