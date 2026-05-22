'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'

export const selectComponent: ComponentDef<string> = {
  key: 'select',
  defaultValue: '',
  variants: ['default', 'badge', 'compact'],
  CardItem({ value, ctx, variant = 'default' }) {
    if (!value) return null
    const color = ctx.theme.subText

    if (variant === 'badge') {
      const fs = ctx.fontSize.sm
      return (
        <span style={{
          fontSize: fs,
          color: '#fff',
          fontWeight: 700,
          background: color,
          padding: `${ctx.cardWidth * 0.003 * ctx.paddingScale}px ${ctx.cardWidth * 0.012 * ctx.paddingScale}px`,
          borderRadius: ctx.cardWidth * 0.005,
          fontFamily: ctx.fontFamily,
          boxShadow: `0 2px 6px ${color}55`,
          display: 'inline-block',
          whiteSpace: 'nowrap',
        }}>
          {value}
        </span>
      )
    }

    if (variant === 'compact') {
      const fs = ctx.fontSize.xs
      return (
        <span style={{
          fontSize: fs,
          color,
          fontWeight: 600,
          background: color + '18',
          padding: `1px ${ctx.cardWidth * 0.006 * ctx.paddingScale}px`,
          borderRadius: 999,
          border: `1px solid ${color}50`,
          fontFamily: ctx.fontFamily,
          whiteSpace: 'nowrap',
          display: 'inline-block',
        }}>
          {value}
        </span>
      )
    }

    // default
    const fs = ctx.fontSize.sm
    return (
      <span style={{ fontSize: fs, color, fontWeight: 700, background: color + '20', padding: '2px 10px', borderRadius: 999, border: `1px solid ${color}60`, fontFamily: ctx.fontFamily }}>
        {value}
      </span>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    type OptionRow = { value: string; label: string; color?: string }
    const options: OptionRow[] = Array.isArray(blockConfig?.options) ? blockConfig.options as OptionRow[] : []
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          {options.map(({ value: optVal, label, color }) => (
            <button
              key={optVal}
              type="button"
              onClick={() => onChange(value === optVal ? '' : optVal)}
              style={value === optVal
                ? { borderColor: color ?? '#6b7280', backgroundColor: color ?? '#6b7280', color: '#fff' }
                : { borderColor: (color ?? '#6b7280') + '60', color: color ?? '#6b7280' }
              }
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors border font-semibold ${
                value === optVal ? '' : 'bg-white hover:opacity-80'
              }`}
            >
              {label || optVal}
            </button>
          ))}
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
