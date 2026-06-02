'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { renderIcon, IconPicker } from './iconRegistry'
import { ColorPicker } from './colorPicker'

export const selectComponent: ComponentDef<string> = {
  key: 'select',
  defaultValue: '',
  variants: ['simple', 'badge', 'compact', 'chips'],
  CardItem({ value, ctx, variant = 'simple', blockConfig }) {
    if (!value) {
      if (blockConfig?.hideWhenEmpty) return null
      return (
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: ctx.fontSize.sm, color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>-</span>
        </div>
      )
    }
    type OptionRow = { value: string; label: string; color?: string; icon?: string }
    const options: OptionRow[] = Array.isArray(blockConfig?.options) ? blockConfig!.options as OptionRow[] : []
    const matchedOption = options.find(o => o.value === value)
    const displayValue = matchedOption?.label || value
    const optionColor = matchedOption?.color
    const color = optionColor ?? ctx.theme.subText
    const icon = matchedOption?.icon

    // chips: 全選択肢を並べ、選択済みをハイライト（単一選択版）
    if (variant === 'chips') {
      const accentColor = blockConfig?.accentColor as string | undefined ?? ctx.theme.accent
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: ctx.cardWidth * 0.006, padding: `${ctx.cardWidth * 0.004}px 0` }}>
          {options.map(opt => {
            const selected = value === opt.value
            const color = opt.color ?? accentColor
            return (
              <span
                key={opt.value}
                style={{
                  fontSize: ctx.fontSize.sm,
                  fontFamily: ctx.fontFamily,
                  fontWeight: selected ? 700 : 400,
                  padding: `${ctx.cardWidth * 0.004}px ${ctx.cardWidth * 0.012}px`,
                  borderRadius: 999,
                  border: `1.5px solid ${selected ? color : 'rgba(0,0,0,0.18)'}`,
                  background: selected ? color : 'rgba(255,255,255,0.0)',
                  color: selected ? '#fff' : ctx.theme.text,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  whiteSpace: 'nowrap',
                }}
              >
                {opt.icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{renderIcon(opt.icon, ctx.fontSize.sm)}</span>}
                {opt.label || opt.value}
              </span>
            )
          })}
        </div>
      )
    }

    if (variant === 'badge') {
      const fs = ctx.fontSize.sm
      return (
        <span style={{
          fontSize: fs,
          lineHeight: 1,
          color: '#fff',
          fontWeight: 700,
          background: color,
          padding: `${ctx.cardWidth * 0.003 * ctx.paddingScale}px ${ctx.cardWidth * 0.012 * ctx.paddingScale}px`,
          borderRadius: ctx.cardWidth * 0.005,
          fontFamily: ctx.fontFamily,
          boxShadow: `0 2px 6px ${color}55`,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          whiteSpace: 'nowrap',
        }}>
          {icon && renderIcon(icon, fs)}
          {displayValue}
        </span>
      )
    }

    if (variant === 'compact') {
      const fs = ctx.fontSize.xs
      return (
        <span style={{
          fontSize: fs,
          lineHeight: 1,
          color,
          fontWeight: 600,
          background: color + '18',
          padding: `1px ${ctx.cardWidth * 0.006 * ctx.paddingScale}px`,
          borderRadius: 999,
          border: `1px solid ${color}50`,
          fontFamily: ctx.fontFamily,
          whiteSpace: 'nowrap',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
        }}>
          {icon && renderIcon(icon, fs)}
          {displayValue}
        </span>
      )
    }

    // simple
    const fs = ctx.fontSize.md
    return (
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontFamily: ctx.fontFamily }}>
        <span style={{ fontSize: fs, lineHeight: 1, color, fontWeight: 700, fontFamily: ctx.fontFamily, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {icon && renderIcon(icon, fs)}
          {displayValue}
        </span>
      </div>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    type OptionRow = { value: string; label: string; color?: string; icon?: string }
    const options: OptionRow[] = Array.isArray(blockConfig?.options) ? blockConfig.options as OptionRow[] : []
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          {options.map(({ value: optVal, label, color, icon }) => (
            <button
              key={optVal}
              type="button"
              onClick={() => onChange(value === optVal ? '' : optVal)}
              style={value === optVal
                ? { borderColor: color ?? '#6b7280', backgroundColor: color ?? '#6b7280', color: '#fff' }
                : { borderColor: (color ?? '#6b7280') + '60', color: color ?? '#6b7280' }
              }
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors border font-semibold inline-flex items-center gap-1.5 ${
                value === optVal ? '' : 'bg-white hover:opacity-80'
              }`}
            >
              {icon && <span className="inline-flex items-center">{renderIcon(icon, 13)}</span>}
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
            <ColorPicker value={opt.color ?? ''} onChange={v => updateOption(i, { color: v || undefined })} defaultColor="#9ca3af" />
            <IconPicker value={opt.icon ?? ''} onChange={v => updateOption(i, { icon: v || undefined })} />
            <button type="button" onClick={() => removeOption(i)} className="text-gray-300 hover:text-red-400 transition-colors">✕</button>
          </div>
        ))}
        <button type="button" onClick={addOption} className="text-sm text-sky-500 hover:text-sky-700 font-medium text-left transition-colors">+ 選択肢を追加</button>
      </div>
    )
  },
}
