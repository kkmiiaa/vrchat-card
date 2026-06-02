'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { SURFACE_STYLE } from './types'
import { renderIcon, IconPicker } from './iconRegistry'
import { ColorPicker } from './colorPicker'

export const ratingComponent: ComponentDef<number> = {
  key: 'rating',
  defaultValue: 0,
  variants: ['simple', 'compact'],
  supportsSurface: true,
  surfaceFor: ['simple'],
  CardItem({ value, ctx, variant = 'simple', surface, blockConfig, label }) {
    const maxValue = typeof blockConfig?.maxValue === 'number' ? blockConfig.maxValue : 5
    const rating = typeof value === 'number' ? Math.min(maxValue, Math.max(0, value)) : 0
    const isCompact = variant === 'compact'
    const starSize = isCompact ? ctx.fontSize.sm * 1.2 : ctx.fontSize.lg * 1.2
    const effectiveSurface = surface ?? 'transparent'
    const surfaceStyle = SURFACE_STYLE[effectiveSurface]
    const icon = typeof blockConfig?.icon === 'string' ? blockConfig.icon : '★'
    const activeColor = typeof blockConfig?.color === 'string' ? blockConfig.color : ctx.theme.accent

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
        gap: label ? ctx.cardWidth * 0.003 : (isCompact ? 2 : 3),
        fontFamily: ctx.fontFamily,
      }}>
        {label && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: ctx.cardWidth * 0.003, flexShrink: 0 }}>
            <span style={{ fontSize: ctx.fontSize.sm * (label.fontScale ?? 1), fontWeight: 700, color: label.color ?? ctx.theme.text, fontFamily: ctx.fontFamily }}>{label.text}</span>
            {label.subText && <span style={{ fontSize: ctx.fontSize.xs * (label.fontScale ?? 1), color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>{label.subText}</span>}
          </div>
        )}
        {Array.from({ length: maxValue }, (_, i) => (
          <span
            key={i}
            style={{
              fontSize: starSize,
              color: i < rating ? activeColor : '#d1d5db',
              lineHeight: 1,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {renderIcon(icon, starSize) ?? icon}
          </span>
        ))}
      </div>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    const maxValue = typeof blockConfig?.maxValue === 'number' ? blockConfig.maxValue : 5
    const rating = typeof value === 'number' ? value : 0
    const icon = typeof blockConfig?.icon === 'string' ? blockConfig.icon : '★'
    const activeColor = typeof blockConfig?.color === 'string' ? blockConfig.color : '#f59e0b'
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: maxValue }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i + 1 === rating ? 0 : i + 1)}
              className="text-2xl leading-none transition-colors focus:outline-none"
              style={{ color: i < rating ? activeColor : '#d1d5db' }}
            >
              {renderIcon(icon, 20) ?? icon}
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-500">{rating} / {maxValue}</span>
        </div>
      </div>
    )
  },
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const maxValue = typeof blockConfig.maxValue === 'number' ? blockConfig.maxValue : ''
    const icon = typeof blockConfig.icon === 'string' ? blockConfig.icon : ''
    const color = typeof blockConfig.color === 'string' ? blockConfig.color : ''
    return (
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-20 shrink-0">最大値</span>
          <input type="number" min={1} value={maxValue} placeholder="5"
            onChange={e => onChange({ ...blockConfig, maxValue: e.target.value ? Number(e.target.value) : undefined })}
            className="w-20 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-500">アイコン</span>
          <IconPicker value={icon || '★'} onChange={v => onChange({ ...blockConfig, icon: v || undefined })} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-20 shrink-0">色</span>
          <ColorPicker value={color ?? ''} onChange={v => onChange({ ...blockConfig, color: v || undefined })} defaultColor="#f59e0b" />
        </div>
      </div>
    )
  },
}
