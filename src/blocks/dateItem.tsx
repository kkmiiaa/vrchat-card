'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { SURFACE_STYLE } from './types'

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
  variants: ['simple', 'compact', 'badge'],
  supportsSurface: true,
  surfaceFor: ['simple'],
  CardItem({ value, ctx, variant = 'simple', surface, label }) {
    const safe: DateItemValue = (value && typeof value === 'object' && 'display' in value)
      ? value as DateItemValue
      : { display: '', iso: '' }
    const text = safe.display || formatIso(safe.iso ?? '') || '-'

    if (variant === 'compact') {
      const fs = ctx.fontSize.xs
      const surfaceStyle = SURFACE_STYLE[surface ?? 'transparent']
      return (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: surfaceStyle.background,
          border: surfaceStyle.border,
        boxShadow: surfaceStyle.boxShadow,
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
    const effectiveSurface = (label && (surface === 'transparent' || surface === undefined))
       ? 'contained'
      : (surface ?? 'transparent')
    const surfaceStyle = SURFACE_STYLE[effectiveSurface]
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
        justifyContent: (label?.dir === 'row') ? undefined : 'center',
        gap: label ? (label.dir === 'row' ? ctx.cardWidth * 0.005 : ctx.cardWidth * 0.003) : 0,
        fontFamily: ctx.fontFamily,
        overflow: 'hidden',
      }}>
        {label && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: ctx.cardWidth * 0.003, flexShrink: 0 }}>
            <span style={{ fontSize: ctx.fontSize.sm * (label.fontScale ?? 1), fontWeight: 700, color: label.color ?? ctx.theme.text, fontFamily: ctx.fontFamily }}>{label.text}</span>
            {label.subText && <span style={{ fontSize: ctx.fontSize.xs * (label.fontScale ?? 1), color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>{label.subText}</span>}
          </div>
        )}
        <span style={{
          fontSize: fs,
          color: text === '-' ? ctx.theme.subText : ctx.theme.text,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {text}
        </span>
      </div>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    const safe: DateItemValue = (value && typeof value === 'object' && 'display' in value)
      ? value as DateItemValue
      : { display: '', iso: '' }

    const minDate = typeof blockConfig?.minDate === 'string' ? blockConfig.minDate : undefined
    const maxDate = typeof blockConfig?.maxDate === 'string' ? blockConfig.maxDate : undefined

    const iso = safe.iso ?? ''
    const isInvalidFormat = iso && !/^\d{4}-\d{2}-\d{2}$/.test(iso)
    const isOutOfRange = iso && !isInvalidFormat && (
      (minDate && iso < minDate) || (maxDate && iso > maxDate)
    )

    return (
      <div className="flex flex-col gap-2">
        <input
          type="date"
          value={iso}
          min={minDate}
          max={maxDate}
          onChange={e => onChange({ ...safe, iso: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
        {isInvalidFormat && (
          <p className="text-xs text-red-500" role="alert">日付の形式が正しくありません（YYYY-MM-DD）</p>
        )}
        {isOutOfRange && !isInvalidFormat && (
          <p className="text-xs text-red-500" role="alert">入力可能な日付の範囲外です</p>
        )}
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
    const minDate = typeof blockConfig.minDate === 'string' ? blockConfig.minDate : ''
    const maxDate = typeof blockConfig.maxDate === 'string' ? blockConfig.maxDate : ''
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
          <input type="date" value={minDate}
            onChange={e => onChange({ ...blockConfig, minDate: e.target.value || undefined })}
            className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-20 shrink-0">最大日付</span>
          <input type="date" value={maxDate}
            onChange={e => onChange({ ...blockConfig, maxDate: e.target.value || undefined })}
            className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
        </div>
      </div>
    )
  },
}
