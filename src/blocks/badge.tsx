'use client'

import type { ComponentDef } from './types'
import { BG_VARIANT_STYLE } from './types'

export type BadgeValue = {
  label: string
  color?: string  // hex — 未指定はアクセントカラー
}

export const DEFAULT_BADGE_VALUE: BadgeValue = { label: '', color: '' }

export const badgeComponent: ComponentDef<BadgeValue> = {
  key: 'badge',
  defaultValue: DEFAULT_BADGE_VALUE,
  variants: ['default', 'outline', 'subtle'],

  CardItem({ value, ctx, variant, bgVariant }) {
    const safe: BadgeValue = (value && typeof value === 'object' && 'label' in value)
      ? value as BadgeValue
      : DEFAULT_BADGE_VALUE

    const label = safe.label || '—'
    const color = safe.color || ctx.theme.accent
    const fs = ctx.fontSize.sm
    const radius = ctx.cardWidth * 0.025
    const px = `${ctx.cardWidth * 0.01 * ctx.paddingScale}px ${ctx.cardWidth * 0.018 * ctx.paddingScale}px`

    if (variant === 'outline') {
      return (
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          border: `1.5px solid ${color}`,
          borderRadius: radius,
          padding: px,
          background: 'transparent',
        }}>
          <span style={{ fontSize: fs, color, fontFamily: ctx.fontFamily, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {label}
          </span>
        </div>
      )
    }

    if (variant === 'subtle') {
      return (
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          background: `${color}22`,
          borderRadius: radius,
          padding: px,
        }}>
          <span style={{ fontSize: fs, color, fontFamily: ctx.fontFamily, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {label}
          </span>
        </div>
      )
    }

    // default: 塗りつぶし（bgVariant が glass/transparent/outline の場合も適用）
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center',
        background: color,
        borderRadius: radius,
        padding: px,
      }}>
        <span style={{ fontSize: fs, color: '#ffffff', fontFamily: ctx.fontFamily, fontWeight: 600, whiteSpace: 'nowrap' }}>
          {label}
        </span>
      </div>
    )
  },

  FormItem({ value, onChange }) {
    const safe: BadgeValue = (value && typeof value === 'object' && 'label' in value)
      ? value as BadgeValue
      : DEFAULT_BADGE_VALUE

    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">ラベル</label>
          <input
            type="text"
            value={safe.label}
            onChange={e => onChange({ ...safe, label: e.target.value })}
            placeholder="例: フレンド歓迎"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">カラー</label>
          <input
            type="color"
            value={safe.color || '#00AADB'}
            onChange={e => onChange({ ...safe, color: e.target.value })}
            className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0.5"
          />
          {safe.color && (
            <button type="button" onClick={() => onChange({ ...safe, color: '' })}
              className="text-[10px] text-gray-300 hover:text-gray-500">reset</button>
          )}
        </div>
      </div>
    )
  },
}
