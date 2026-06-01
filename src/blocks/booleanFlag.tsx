'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { SURFACE_STYLE } from './types'
import { renderIcon, IconPicker } from './iconRegistry'
import { ColorPicker } from './colorPicker'

export const booleanFlagComponent: ComponentDef<boolean> = {
  key: 'booleanFlag',
  defaultValue: false,
  variants: ['simple', 'badge'],
  supportsSurface: true,
  CardItem({ value, ctx, variant, surface, blockConfig, label }) {
    const on = typeof value === 'boolean' ? value : false
    const fs = ctx.fontSize.md
    const trueIcon = typeof blockConfig?.trueIcon === 'string' ? blockConfig.trueIcon : null
    const falseIcon = typeof blockConfig?.falseIcon === 'string' ? blockConfig.falseIcon : null
    const trueLabel = typeof blockConfig?.trueLabel === 'string' ? blockConfig.trueLabel : 'ON'
    const falseLabel = typeof blockConfig?.falseLabel === 'string' ? blockConfig.falseLabel : 'OFF'
    const trueColor = typeof blockConfig?.trueColor === 'string' ? blockConfig.trueColor : '#16a34a'
    const falseColor = typeof blockConfig?.falseColor === 'string' ? blockConfig.falseColor : '#ef4444'
    const displayLabel = on ? trueLabel : falseLabel

    if (variant === 'badge') {
      const badgeColor = on
        ? (typeof blockConfig?.trueColor === 'string' ? blockConfig.trueColor : ctx.theme.accent)
        : (typeof blockConfig?.falseColor === 'string' ? blockConfig.falseColor : '#9ca3af')
      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `${ctx.cardWidth * 0.004 * ctx.paddingScale}px ${ctx.cardWidth * 0.012 * ctx.paddingScale}px`,
            borderRadius: 9999,
            background: badgeColor,
            fontSize: fs,
            color: '#fff',
            fontFamily: ctx.fontFamily,
            fontWeight: 600,
          }}>
            {displayLabel}
          </div>
        </div>
      )
    }

    const effectiveSurface = (label && (surface === 'transparent' || surface === undefined))
       ? 'simple'
      : (surface ?? 'transparent')
    const surfaceStyle = SURFACE_STYLE[effectiveSurface]
    const iconColor = on ? trueColor : falseColor

    return (
      <div style={{
        width: '100%',
        height: '100%',
        background: surfaceStyle.background,
        border: surfaceStyle.border,
        boxShadow: surfaceStyle.boxShadow,
        borderRadius: ctx.cardWidth * 0.006,
        padding: `${ctx.cardWidth * 0.006 * ctx.paddingScale}px ${ctx.cardWidth * 0.008 * ctx.paddingScale}px`,
        display: 'flex',
        flexDirection: (label?.dir === 'row') ? 'row' : 'column',
        alignItems: (label?.dir === 'row') ? 'center' : 'stretch',
        gap: label ? ctx.cardWidth * 0.003 : 6,
        fontFamily: ctx.fontFamily,
      }}>
        {label && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: ctx.cardWidth * 0.003, flexShrink: 0 }}>
            <span style={{ fontSize: ctx.fontSize.sm * (label.fontScale ?? 1), fontWeight: 700, color: label.color ?? ctx.theme.text, fontFamily: ctx.fontFamily }}>{label.text}</span>
            {label.subText && <span style={{ fontSize: ctx.fontSize.xs * (label.fontScale ?? 1), color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>{label.subText}</span>}
          </div>
        )}
        {(on ? trueIcon : falseIcon)
          ? <span style={{ fontSize: fs * 1.3, display: 'inline-flex', alignItems: 'center' }}>{renderIcon(on ? trueIcon : falseIcon, fs * 1.3)}</span>
          : <span style={{ fontSize: fs * 1.1, color: iconColor }}>{on ? '✓' : '✗'}</span>
        }
        <span style={{ fontSize: fs, color: ctx.theme.text, fontWeight: 600 }}>{displayLabel}</span>
      </div>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    const on = typeof value === 'boolean' ? value : false
    const trueLabel = typeof blockConfig?.trueLabel === 'string' ? blockConfig.trueLabel : 'ON'
    const falseLabel = typeof blockConfig?.falseLabel === 'string' ? blockConfig.falseLabel : 'OFF'
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={on}
          onClick={() => onChange(!on)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-300 ${on ? 'bg-sky-500' : 'bg-gray-300'}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
        <span className="text-sm font-medium text-gray-700">{on ? trueLabel : falseLabel}</span>
      </div>
    )
  },
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const trueLabel = typeof blockConfig.trueLabel === 'string' ? blockConfig.trueLabel : ''
    const falseLabel = typeof blockConfig.falseLabel === 'string' ? blockConfig.falseLabel : ''
    const trueColor = typeof blockConfig.trueColor === 'string' ? blockConfig.trueColor : ''
    const falseColor = typeof blockConfig.falseColor === 'string' ? blockConfig.falseColor : ''
    return (
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 shrink-0">ONラベル</span>
          <input type="text" value={trueLabel} placeholder="ON"
            onChange={e => onChange({ ...blockConfig, trueLabel: e.target.value || undefined })}
            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-200" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 shrink-0">OFFラベル</span>
          <input type="text" value={falseLabel} placeholder="OFF"
            onChange={e => onChange({ ...blockConfig, falseLabel: e.target.value || undefined })}
            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-200" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 shrink-0">ON色</span>
          <ColorPicker value={trueColor ?? ''} onChange={v => onChange({ ...blockConfig, trueColor: v || undefined })} defaultColor="#16a34a" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 shrink-0">OFF色</span>
          <ColorPicker value={falseColor ?? ''} onChange={v => onChange({ ...blockConfig, falseColor: v || undefined })} defaultColor="#ef4444" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-500">ONアイコン</span>
          <IconPicker value={typeof blockConfig.trueIcon === 'string' ? blockConfig.trueIcon : ''} onChange={v => onChange({ ...blockConfig, trueIcon: v || undefined })} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-500">OFFアイコン</span>
          <IconPicker value={typeof blockConfig.falseIcon === 'string' ? blockConfig.falseIcon : ''} onChange={v => onChange({ ...blockConfig, falseIcon: v || undefined })} />
        </div>
      </div>
    )
  },
}
