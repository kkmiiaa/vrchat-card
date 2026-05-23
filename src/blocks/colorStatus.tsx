'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { BG_VARIANT_STYLE } from './types'
import { ColorPicker } from './colorPicker'

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
  variants: ['default', 'compact', 'cards'],
  supportsBgVariant: true,
  CardItem({ value, ctx, variant = 'default', bgVariant, blockConfig, label }) {
    const safe = (value && typeof value === 'object') ? value as Record<string, string> : {}
    const fields = getFields(blockConfig)

    if (variant === 'cards') {
      const fs = ctx.fontSize.sm
      const dotSize = ctx.cardWidth * 0.006
      const cardBgStyle = BG_VARIANT_STYLE[bgVariant ?? 'glass']
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', height: '100%' }}>
          {fields.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: ctx.cardWidth * 0.005,
              border: `1px solid ${f.color}40`,
              borderLeft: `3px solid ${f.color}`,
              borderRadius: ctx.cardWidth * 0.006,
              background: cardBgStyle.background,
              padding: `${ctx.cardWidth * 0.002 * ctx.paddingScale}px ${ctx.cardWidth * 0.007 * ctx.paddingScale}px ${ctx.cardWidth * 0.002 * ctx.paddingScale}px ${ctx.cardWidth * 0.005 * ctx.paddingScale}px`,
              flex: 1, minHeight: 0, overflow: 'hidden',
            }}>
              <div style={{ width: dotSize, height: dotSize, borderRadius: '50%', background: f.color, flexShrink: 0, boxShadow: `0 0 4px ${f.color}` }} />
              <span style={{ fontSize: fs, color: safe[f.key] ? ctx.theme.text : ctx.theme.subText, fontFamily: ctx.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {safe[f.key] || '—'}
              </span>
            </div>
          ))}
        </div>
      )
    }

    if (variant === 'compact') {
      const dotSize = ctx.cardWidth * 0.008
      const activeFields = fields.filter(f => safe[f.key])
      return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: ctx.cardWidth * 0.005, flexWrap: 'wrap' }}>
          {activeFields.map((f, i) => (
            <span
              key={i}
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
      <div style={{ display: 'flex', flexDirection: label?.dir === 'row' ? 'row' : 'column', gap: label ? (label.dir === 'row' ? ctx.cardWidth * 0.005 : ctx.cardWidth * 0.003) : 4, width: '100%', height: '100%', alignItems: label?.dir === 'row' ? 'center' : 'stretch' }}>
        {label && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: ctx.cardWidth * 0.003, flexShrink: 0 }}>
            <span style={{ fontSize: ctx.fontSize.sm * (label.fontScale ?? 1), fontWeight: 700, color: label.color ?? ctx.theme.text, fontFamily: ctx.fontFamily }}>{label.text}</span>
            {label.subText && <span style={{ fontSize: ctx.fontSize.xs * (label.fontScale ?? 1), color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>{label.subText}</span>}
          </div>
        )}
        {fields.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'stretch', gap: 6, flex: 1, minHeight: 0 }}>
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
        {fields.map((f, i) => (
          <label key={i} className="flex flex-col gap-1">
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
    const keyCount = fields.reduce<Record<string, number>>((acc, f) => {
      if (f.key) acc[f.key] = (acc[f.key] ?? 0) + 1
      return acc
    }, {})

    return (
      <div className="flex flex-col gap-2 text-sm">
        <p className="text-[10px] text-gray-400">フィールド（fields）</p>
        {fields.map((f, i) => {
          const isDuplicateKey = f.key && keyCount[f.key] > 1
          return (
          <div key={i} className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <input type="text" value={f.key} placeholder="key"
              onChange={e => update(i, { key: e.target.value })}
              className={`w-16 text-xs border rounded px-2 py-1 bg-white font-mono ${isDuplicateKey ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
            <input type="text" value={f.label} placeholder="label"
              onChange={e => update(i, { label: e.target.value })}
              className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
            <ColorPicker value={f.color} onChange={v => update(i, { color: v })} />
            <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-600">×</button>
          </div>
          {isDuplicateKey && <p className="text-[10px] text-red-500 pl-1">キーが重複しています</p>}
          </div>
          )
        })}
        <button type="button" onClick={add} className="text-xs text-sky-500 hover:text-sky-700 mt-1">+ 追加</button>
      </div>
    )
  },
}
