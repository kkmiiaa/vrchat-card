'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { SURFACE_STYLE } from './types'
import { renderIcon, IconPicker } from './iconRegistry'
import { ColorPicker } from './colorPicker'

export const multiSelectComponent: ComponentDef<string[]> = {
  key: 'multi-select',
  defaultValue: [],
  variants: ['simple', 'slash', 'icon', 'icon-slash', 'chips'],
  supportsSurface: true,
  surfaceFor: ['slash'],
  CardItem({ value, ctx, variant = 'simple', surface, blockConfig, label }) {
    const items = Array.isArray(value) ? value : []
    const fs = ctx.fontSize.sm
    type OptionRow = { value: string; label: string; color?: string; icon?: string }
    const options: OptionRow[] = Array.isArray(blockConfig?.options) ? blockConfig!.options as OptionRow[] : []
    const getOption = (v: string) => options.find(o => o.value === v)

    if (variant === 'slash') {
      const effectiveSurface = surface ?? (label ? 'contained' : 'transparent')
      const surfaceStyle = SURFACE_STYLE[effectiveSurface]
      return (
        <div style={{
          width: '100%',
          background: surfaceStyle.background,
          border: surfaceStyle.border,
        boxShadow: surfaceStyle.boxShadow,
          borderRadius: ctx.cardWidth * 0.006,
          padding: `${label ? `${ctx.cardWidth * 0.006 * ctx.paddingScale}px` : '0'} ${ctx.cardWidth * 0.008 * ctx.paddingScale}px`,
          fontSize: fs,
          color: items.length ? ctx.theme.text : ctx.theme.subText,
          fontFamily: ctx.fontFamily,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'flex',
          flexDirection: (label?.dir === 'row') ? 'row' : 'column',
          alignItems: (label?.dir === 'row') ? 'center' : 'stretch',
          justifyContent: (label?.dir === 'row') ? undefined : 'center',
          gap: label ? (label.dir === 'row' ? ctx.cardWidth * 0.005 : ctx.cardWidth * 0.003) : 0,
        }}>
          {label && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: ctx.cardWidth * 0.003, flexShrink: 0 }}>
              <span style={{ fontSize: ctx.fontSize.sm * (label.fontScale ?? 1), fontWeight: 700, color: label.color ?? ctx.theme.text, fontFamily: ctx.fontFamily }}>{label.text}</span>
              {label.subText && <span style={{ fontSize: ctx.fontSize.xs * (label.fontScale ?? 1), color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>{label.subText}</span>}
            </div>
          )}
          {items.map(v => getOption(v)?.label || v).join(' / ') || '-'}
        </div>
      )
    }

    // icon-slash: [icon] text / [icon] text 形式でスラッシュ区切り
    if (variant === 'icon-slash') {
      const effectiveSurface = surface ?? (label ? 'contained' : 'transparent')
      const surfaceStyle = SURFACE_STYLE[effectiveSurface]
      const selectedOpts = items.map(v => getOption(v) ?? { value: v, label: v, icon: undefined, color: undefined })
      return (
        <div style={{
          width: '100%',
          background: surfaceStyle.background,
          border: surfaceStyle.border,
        boxShadow: surfaceStyle.boxShadow,
          borderRadius: ctx.cardWidth * 0.006,
          padding: `${label ? `${ctx.cardWidth * 0.006 * ctx.paddingScale}px` : '0'} ${ctx.cardWidth * 0.008 * ctx.paddingScale}px`,
          display: 'flex',
          flexDirection: (label?.dir === 'row') ? 'row' : 'column',
          alignItems: (label?.dir === 'row') ? 'center' : 'stretch',
          justifyContent: (label?.dir === 'row') ? undefined : 'center',
          gap: label ? (label.dir === 'row' ? ctx.cardWidth * 0.005 : ctx.cardWidth * 0.003) : 0,
          overflow: 'hidden',
        }}>
          {label && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: ctx.cardWidth * 0.003, flexShrink: 0 }}>
              <span style={{ fontSize: ctx.fontSize.sm * (label.fontScale ?? 1), fontWeight: 700, color: label.color ?? ctx.theme.text, fontFamily: ctx.fontFamily }}>{label.text}</span>
              {label.subText && <span style={{ fontSize: ctx.fontSize.xs * (label.fontScale ?? 1), color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>{label.subText}</span>}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: selectedOpts.length === 0 ? 'center' : undefined, gap: 6, flexShrink: 1, minWidth: 0, overflow: 'hidden', flexWrap: 'nowrap' }}>
            {selectedOpts.length === 0
              ? <span style={{ fontSize: fs, color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>-</span>
              : selectedOpts.map((opt, i) => (
                <span key={opt.value} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: fs, color: ctx.theme.text, fontFamily: ctx.fontFamily, flexShrink: 0 }}>
                  {i > 0 && <span style={{ color: ctx.theme.subText, opacity: 0.5 }}>/</span>}
                  {opt.icon && <span style={{ display: 'inline-flex', alignItems: 'center', color: opt.color ?? ctx.theme.subText }}>{renderIcon(opt.icon, fs)}</span>}
                  <span style={{ whiteSpace: 'nowrap' }}>{opt.label}</span>
                </span>
              ))
            }
          </div>
        </div>
      )
    }

    // chips: 全選択肢を並べ、選択済みをハイライト
    if (variant === 'chips') {
      const accentColor = blockConfig?.accentColor as string | undefined ?? ctx.theme.accent
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: ctx.cardWidth * 0.006, padding: `${ctx.cardWidth * 0.004}px 0` }}>
          {options.map(opt => {
            const selected = items.includes(opt.value)
            const color = opt.color ?? accentColor
            return (
              <span
                key={opt.value}
                style={{
                  fontSize: fs,
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
                {opt.icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{renderIcon(opt.icon, fs)}</span>}
                {opt.label || opt.value}
              </span>
            )
          })}
        </div>
      )
    }

    // simple & icon: selected items only as badges
    if (!items.length) {
      if (blockConfig?.hideWhenEmpty) return null
      return <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: ctx.fontSize.sm, color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>-</span></div>
    }
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {items.map(v => {
          const opt = getOption(v)
          const color = opt?.color ?? ctx.theme.accent
          const label = opt?.label || v
          return (
            <span key={v} style={{ fontSize: fs, color, background: `${color}18`, padding: '2px 8px', borderRadius: 999, fontFamily: ctx.fontFamily, border: `1px solid ${color}50`, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              {variant === 'icon' && opt?.icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{renderIcon(opt.icon, fs)}</span>}
              {label}
            </span>
          )
        })}
      </div>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    type OptionRow = { value: string; label: string; color?: string; icon?: string }
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
                style={{ WebkitTapHighlightColor: 'transparent' }}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm border font-medium transition-all active:scale-90 ${
                  selected
                    ? 'border-[#00AADB] bg-sky-50 text-[#00AADB] scale-105'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                {opt.icon && <span className="inline-flex items-center">{renderIcon(opt.icon, 13)}</span>}
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
