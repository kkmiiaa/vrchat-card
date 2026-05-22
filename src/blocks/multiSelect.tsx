'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { BG_VARIANT_STYLE } from './types'

export const multiSelectComponent: ComponentDef<string[]> = {
  key: 'multi-select',
  defaultValue: [],
  variants: ['default', 'slash', 'icon'],
  CardItem({ value, ctx, variant, bgVariant }) {
    const items = Array.isArray(value) ? value : []
    const fs = ctx.fontSize.sm

    if (variant === 'slash') {
      const bgStyle = BG_VARIANT_STYLE[bgVariant ?? 'transparent']
      return (
        <div style={{
          width: '100%',
          background: bgStyle.background,
          border: bgStyle.border,
          borderRadius: ctx.cardWidth * 0.006,
          padding: `0 ${ctx.cardWidth * 0.008 * ctx.paddingScale}px`,
          fontSize: fs,
          color: ctx.theme.text,
          fontFamily: ctx.fontFamily,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'flex',
          alignItems: 'center',
        }}>
          {items.join(' / ') || '—'}
        </div>
      )
    }

    // default: badges
    if (!items.length) return null
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {items.map(v => (
          <span key={v} style={{ fontSize: fs, color: ctx.theme.text, background: ctx.theme.bg, padding: '2px 8px', borderRadius: 999, fontFamily: ctx.fontFamily, border: `1px solid ${ctx.theme.accent}40` }}>{v}</span>
        ))}
      </div>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    type OptionRow = { value: string; label: string }
    const options: OptionRow[] = Array.isArray(blockConfig?.options) ? blockConfig.options as OptionRow[] : []
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {options.map(opt => {
            const selected = value.includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  if (selected) onChange(value.filter(v => v !== opt.value))
                  else onChange([...value, opt.value])
                }}
                className={`px-4 py-1.5 rounded-lg text-sm border font-medium transition-all ${
                  selected
                    ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                {opt.label || opt.value}
              </button>
            )
          })}
        </div>
      </div>
    )
  },
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    type OptionRow = { value: string; label: string; color?: string; icon?: string }
    const options: OptionRow[] = Array.isArray(blockConfig.options) ? blockConfig.options as OptionRow[] : []
    const updateOption = (i: number, patch: Partial<OptionRow>) => {
      const next = options.map((o, idx) => idx === i ? { ...o, ...patch } : o)
      onChange({ ...blockConfig, options: next })
    }
    const addOption = () => onChange({ ...blockConfig, options: [...options, { value: '', label: '' }] })
    const removeOption = (i: number) => onChange({ ...blockConfig, options: options.filter((_, idx) => idx !== i) })
    return (
      <div className="flex flex-col gap-2 text-sm">
        <p className="text-xs text-gray-400">選択肢（options）</p>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input type="text" value={opt.value} placeholder="value" onChange={e => updateOption(i, { value: e.target.value })}
              className="w-24 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-200" />
            <input type="text" value={opt.label} placeholder="label" onChange={e => updateOption(i, { label: e.target.value })}
              className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-200" />
            <input type="color" value={opt.color ?? '#9ca3af'} onChange={e => updateOption(i, { color: e.target.value })}
              className="w-7 h-7 rounded border border-gray-200 cursor-pointer p-0.5" title="color" />
            <input type="text" value={opt.icon ?? ''} placeholder="icon" onChange={e => updateOption(i, { icon: e.target.value || undefined })}
              className="w-16 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-200" />
            <button type="button" onClick={() => removeOption(i)} className="text-gray-300 hover:text-red-400 transition-colors">✕</button>
          </div>
        ))}
        <button type="button" onClick={addOption} className="text-sm text-sky-500 hover:text-sky-700 font-medium text-left transition-colors">+ 選択肢を追加</button>
      </div>
    )
  },
}
