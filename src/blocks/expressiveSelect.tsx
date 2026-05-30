'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { BG_VARIANT_STYLE } from './types'
import { IconPicker } from './iconRegistry'
import { ColorPicker } from './colorPicker'

export type ExpressiveSelectValue = {
  tag: string
  display: string
}

export const DEFAULT_EXPRESSIVE_SELECT_VALUE: ExpressiveSelectValue = { tag: '', display: '' }

export const expressiveSelectComponent: ComponentDef<ExpressiveSelectValue> = {
  key: 'expressive-select',
  defaultValue: DEFAULT_EXPRESSIVE_SELECT_VALUE,
  variants: ['default'],
  supportsBgVariant: true,
  CardItem({ value, ctx, bgVariant, blockConfig, label }) {
    const safe: ExpressiveSelectValue = (value && typeof value === 'object' && 'tag' in value)
      ? value as ExpressiveSelectValue
      : DEFAULT_EXPRESSIVE_SELECT_VALUE

    type OptionRow = { value: string; label: string }
    const options: OptionRow[] = Array.isArray(blockConfig?.options) ? blockConfig.options as OptionRow[] : []
    const optionLabel = options.find(o => o.value === safe.tag)?.label
    const display = safe.display || optionLabel
    const fs = ctx.fontSize.md
    const effectiveBgVariant = (label && (bgVariant === 'transparent' || bgVariant === undefined))
      ? 'default'
      : (bgVariant ?? 'transparent')
    const bgStyle = BG_VARIANT_STYLE[effectiveBgVariant]

    return (
      <div style={{
        width: '100%',
        height: '100%',
        background: bgStyle.background,
        border: bgStyle.border,
        boxShadow: bgStyle.boxShadow,
        borderRadius: ctx.cardWidth * 0.006,
        padding: `${ctx.cardWidth * 0.006 * ctx.paddingScale}px ${ctx.cardWidth * 0.008 * ctx.paddingScale}px`,
        display: 'flex',
        flexDirection: (label?.dir === 'row') ? 'row' : 'column',
        alignItems: (label?.dir === 'row') ? 'center' : 'stretch',
        gap: label ? ctx.cardWidth * 0.003 : 4,
        overflow: 'hidden',
      }}>
        {label && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: ctx.cardWidth * 0.003, flexShrink: 0 }}>
            <span style={{ fontSize: ctx.fontSize.sm * (label.fontScale ?? 1), fontWeight: 700, color: label.color ?? ctx.theme.text, fontFamily: ctx.fontFamily }}>{label.text}</span>
            {label.subText && <span style={{ fontSize: ctx.fontSize.xs * (label.fontScale ?? 1), color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>{label.subText}</span>}
          </div>
        )}
        <span style={{ fontSize: fs, color: (safe.tag && display) ? ctx.theme.text : ctx.theme.subText, fontFamily: ctx.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {(safe.tag && display) ? display : '-'}
        </span>
      </div>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    const safe: ExpressiveSelectValue = (value && typeof value === 'object' && 'tag' in value)
      ? value as ExpressiveSelectValue
      : DEFAULT_EXPRESSIVE_SELECT_VALUE

    type OptionRow = { value: string; label: string }
    const options: OptionRow[] = Array.isArray(blockConfig?.options) ? blockConfig.options as OptionRow[] : []
    const allowNone = blockConfig?.allowNone === true

    return (
      <div className="flex flex-col gap-3">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ tag: opt.value, display: '' })}
              className={`flex-1 py-2 flex items-center justify-center gap-1 transition-colors ${
                safe.tag === opt.value
                  ? 'bg-gray-900 text-white font-semibold'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
          {allowNone && (
            <button
              type="button"
              onClick={() => onChange({ tag: '', display: '' })}
              className={`flex-1 py-2 flex items-center justify-center gap-1 transition-colors ${
                safe.tag === ''
                  ? 'bg-gray-900 text-white font-semibold'
                  : 'bg-white text-gray-400 hover:bg-gray-50'
              }`}
            >
              回答なし
            </button>
          )}
        </div>
        {safe.tag && (
          <input
            type="text"
            value={safe.display}
            onChange={e => onChange({ ...safe, display: e.target.value })}
            placeholder="表示テキスト（任意）"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        )}
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
        <div className="flex items-center gap-2 mt-1">
          <input type="checkbox" checked={blockConfig.allowNone === true} id="expressive-allowNone"
            onChange={e => onChange({ ...blockConfig, allowNone: e.target.checked || undefined })}
            className="rounded" />
          <label htmlFor="expressive-allowNone" className="text-[10px] text-gray-500">「回答なし」選択肢を表示する（allowNone）</label>
        </div>
      </div>
    )
  },
}
