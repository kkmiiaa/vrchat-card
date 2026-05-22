'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { BG_VARIANT_STYLE } from './types'

export type DateItemValue = { display: string; iso?: string }

function formatIso(iso: string): string {
  if (!iso) return ''
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return iso
  return `${m[1]}/${m[2]}/${m[3]}`
}

export const dateItemComponent: ComponentDef<DateItemValue> = {
  key: 'dateItem',
  defaultValue: { display: '', iso: '' },
  variants: ['default', 'compact', 'badge'],
  CardItem({ value, ctx, variant = 'default', bgVariant }) {
    const safe: DateItemValue = (value && typeof value === 'object' && 'display' in value)
      ? value as DateItemValue
      : { display: '', iso: '' }
    const text = safe.display || formatIso(safe.iso ?? '') || '—'

    if (variant === 'compact') {
      const fs = ctx.fontSize.xs
      const bgStyle = BG_VARIANT_STYLE[bgVariant ?? 'transparent']
      return (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: bgStyle.background,
          border: bgStyle.border,
          borderRadius: ctx.cardWidth * 0.004,
          padding: `${ctx.cardWidth * 0.003 * ctx.paddingScale}px ${ctx.cardWidth * 0.005 * ctx.paddingScale}px`,
          fontFamily: ctx.fontFamily,
          overflow: 'hidden',
        }}>
          <span style={{
            fontSize: fs,
            color: ctx.theme.subText,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {text}
          </span>
        </div>
      )
    }

    if (variant === 'badge') {
      const fs = ctx.fontSize.xs
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: ctx.theme.accent + '22',
          border: `1px solid ${ctx.theme.accent}66`,
          borderRadius: 999,
          padding: `${ctx.cardWidth * 0.003 * ctx.paddingScale}px ${ctx.cardWidth * 0.009 * ctx.paddingScale}px`,
          fontFamily: ctx.fontFamily,
          fontSize: fs,
          color: ctx.theme.accent,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {text}
        </span>
      )
    }

    // default
    const fs = ctx.fontSize.md
    const bgStyleDefault = BG_VARIANT_STYLE[bgVariant ?? 'transparent']
    return (
      <div style={{
        width: '100%',
        height: '100%',
        background: bgStyleDefault.background,
        border: bgStyleDefault.border,
        borderRadius: ctx.cardWidth * 0.006,
        padding: `${ctx.cardWidth * 0.006 * ctx.paddingScale}px ${ctx.cardWidth * 0.008 * ctx.paddingScale}px`,
        display: 'flex',
        alignItems: 'center',
        fontFamily: ctx.fontFamily,
        overflow: 'hidden',
      }}>
        <span style={{
          fontSize: fs,
          color: ctx.theme.text,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {text}
        </span>
      </div>
    )
  },
  FormItem({ value, onChange }) {
    const safe: DateItemValue = (value && typeof value === 'object' && 'display' in value)
      ? value as DateItemValue
      : { display: '', iso: '' }

    return (
      <div className="flex flex-col gap-2">
        <input
          type="date"
          value={safe.iso ?? ''}
          onChange={e => onChange({ ...safe, iso: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
        <input
          type="text"
          value={safe.display}
          onChange={e => onChange({ ...safe, display: e.target.value })}
          placeholder="表示テキスト（空の場合は日付を自動フォーマット）"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
      </div>
    )
  },
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const format = typeof blockConfig.format === 'string' ? blockConfig.format : ''
    const min = typeof blockConfig.min === 'string' ? blockConfig.min : ''
    const max = typeof blockConfig.max === 'string' ? blockConfig.max : ''
    return (
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-20 shrink-0">フォーマット</span>
          <input type="text" value={format} placeholder="YYYY/MM/DD"
            onChange={e => onChange({ ...blockConfig, format: e.target.value || undefined })}
            className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-20 shrink-0">最小日付</span>
          <input type="date" value={min}
            onChange={e => onChange({ ...blockConfig, min: e.target.value || undefined })}
            className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-20 shrink-0">最大日付</span>
          <input type="date" value={max}
            onChange={e => onChange({ ...blockConfig, max: e.target.value || undefined })}
            className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
        </div>
      </div>
    )
  },
}
