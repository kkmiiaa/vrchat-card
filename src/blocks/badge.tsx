'use client'

import type { ComponentDef, BlockConfigFormProps } from './types'
import { SURFACE_STYLE } from './types'
import { ColorPicker } from './colorPicker'

export type BadgeValue = {
  label: string
  color?: string  // hex — 未指定はアクセントカラー
}

export const DEFAULT_BADGE_VALUE: BadgeValue = { label: '', color: '' }

export const badgeComponent: ComponentDef<BadgeValue> = {
  key: 'badge',
  defaultValue: DEFAULT_BADGE_VALUE,
  variants: ['simple', 'outline', 'subtle'],
  supportsSurface: true,

  CardItem({ value, ctx, variant, surface, blockConfig }) {
    const safe: BadgeValue = (value && typeof value === 'object' && 'label' in value)
      ? value as BadgeValue
      : DEFAULT_BADGE_VALUE

    const label = safe.label || '-'
    const defaultColor = typeof blockConfig?.defaultColor === 'string' ? blockConfig.defaultColor : ctx.theme.accent
    const color = safe.color || defaultColor
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

    // default: 塗りつぶし（surface が glass/transparent/outline の場合も適用）
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

  FormItem({ value, onChange, blockConfig }) {
    const safe: BadgeValue = (value && typeof value === 'object' && 'label' in value)
      ? value as BadgeValue
      : DEFAULT_BADGE_VALUE

    // allowColorPicker が明示的に false でない限り表示（デフォルト true）
    const allowColorPicker = blockConfig?.allowColorPicker !== false

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
        {allowColorPicker && (
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">カラー</label>
          <ColorPicker value={safe.color ?? ''} onChange={v => onChange({ ...safe, color: v })} defaultColor="#00AADB" />
        </div>
        )}
      </div>
    )
  },
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const allowColorPicker = blockConfig.allowColorPicker !== false
    const defaultColor = typeof blockConfig.defaultColor === 'string' ? blockConfig.defaultColor : ''
    return (
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={allowColorPicker} id="badge-allowColorPicker"
            onChange={e => onChange({ ...blockConfig, allowColorPicker: e.target.checked })}
            className="rounded" />
          <label htmlFor="badge-allowColorPicker" className="text-[10px] text-gray-500">ユーザーがカラーを自由に設定できる（allowColorPicker）</label>
        </div>
        {!allowColorPicker && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 w-28 shrink-0">デフォルトカラー</span>
            <ColorPicker value={defaultColor ?? ''} onChange={v => onChange({ ...blockConfig, defaultColor: v || undefined })} defaultColor="#00AADB" />
          </div>
        )}
      </div>
    )
  },
}
