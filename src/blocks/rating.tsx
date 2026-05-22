'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { BG_VARIANT_STYLE } from './types'

export const ratingComponent: ComponentDef<number> = {
  key: 'rating',
  defaultValue: 0,
  variants: ['default', 'compact'],
  CardItem({ value, ctx, variant, bgVariant }) {
    const rating = typeof value === 'number' ? Math.min(5, Math.max(0, value)) : 0
    const isCompact = variant === 'compact'
    const starSize = isCompact ? ctx.fontSize.sm * 1.2 : ctx.fontSize.lg * 1.2
    const bgStyle = BG_VARIANT_STYLE[bgVariant ?? 'transparent']

    return (
      <div style={{
        width: '100%',
        height: '100%',
        background: bgStyle.background,
        border: bgStyle.border,
        borderRadius: ctx.cardWidth * 0.006,
        padding: `${ctx.cardWidth * 0.006 * ctx.paddingScale}px ${ctx.cardWidth * 0.008 * ctx.paddingScale}px`,
        display: 'flex',
        alignItems: 'center',
        gap: isCompact ? 2 : 3,
        fontFamily: ctx.fontFamily,
      }}>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            style={{
              fontSize: starSize,
              color: i < rating ? ctx.theme.accent : '#d1d5db',
              lineHeight: 1,
            }}
          >
            ★
          </span>
        ))}
      </div>
    )
  },
  FormItem({ value, onChange }) {
    const rating = typeof value === 'number' ? value : 0
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i + 1 === rating ? 0 : i + 1)}
              className="text-2xl leading-none transition-colors focus:outline-none"
              style={{ color: i < rating ? '#f59e0b' : '#d1d5db' }}
            >
              ★
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-500">{rating} / 5</span>
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
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-20 shrink-0">アイコン</span>
          <input type="text" value={icon} placeholder="★"
            onChange={e => onChange({ ...blockConfig, icon: e.target.value || undefined })}
            className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-20 shrink-0">色</span>
          <input type="color" value={color || '#f59e0b'}
            onChange={e => onChange({ ...blockConfig, color: e.target.value })}
            className="w-8 h-7 rounded border border-gray-200 cursor-pointer" />
          {color && <button type="button" onClick={() => onChange({ ...blockConfig, color: undefined })} className="text-xs text-gray-300 hover:text-gray-500">reset</button>}
        </div>
      </div>
    )
  },
}
