'use client'
import type { ComponentDef } from './types'
import { BG_VARIANT_STYLE } from './types'

export type LinkItemValue = { label: string; url: string }

export const linkItemComponent: ComponentDef<LinkItemValue> = {
  key: 'linkItem',
  defaultValue: { label: '', url: '' },
  variants: ['default', 'compact'],
  CardItem({ value, ctx, variant = 'default', bgVariant, blockConfig }) {
    const safe: LinkItemValue = (value && typeof value === 'object' && 'label' in value)
      ? value as LinkItemValue
      : { label: '', url: '' }
    const label = safe.label || safe.url || '—'
    const icon = typeof blockConfig?.icon === 'string' ? blockConfig.icon : '🔗'

    if (variant === 'compact') {
      const fs = ctx.fontSize.xs
      return (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: 'rgba(255,255,255,0.85)',
          borderRadius: ctx.cardWidth * 0.004,
          padding: `${ctx.cardWidth * 0.003 * ctx.paddingScale}px ${ctx.cardWidth * 0.005 * ctx.paddingScale}px`,
          fontFamily: ctx.fontFamily,
          overflow: 'hidden',
        }}>
          <span style={{ fontSize: fs, flexShrink: 0 }}>{icon}</span>
        </div>
      )
    }

    // default
    const fs = ctx.fontSize.md
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
        gap: 6,
        fontFamily: ctx.fontFamily,
        overflow: 'hidden',
      }}>
        <span style={{ fontSize: fs, flexShrink: 0 }}>{icon}</span>
        <span style={{
          fontSize: fs,
          color: safe.url ? ctx.theme.accent : ctx.theme.text,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textDecoration: safe.url ? 'underline' : 'none',
        }}>
          {label}
        </span>
      </div>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    const safe: LinkItemValue = (value && typeof value === 'object' && 'label' in value)
      ? value as LinkItemValue
      : { label: '', url: '' }
    const icon = typeof blockConfig?.icon === 'string' ? blockConfig.icon : '🔗'

    return (
      <div className="flex flex-col gap-2">
        <span className="text-sm text-gray-500">{icon}</span>
        <input
          type="text"
          value={safe.label}
          onChange={e => onChange({ ...safe, label: e.target.value })}
          placeholder="ラベル（例: ポートフォリオ）"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
        <input
          type="url"
          value={safe.url}
          onChange={e => onChange({ ...safe, url: e.target.value })}
          placeholder="URL（例: https://example.com）"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
      </div>
    )
  },
}
