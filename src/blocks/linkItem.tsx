'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { renderIcon, IconPicker } from './iconRegistry'

export type LinkItemValue = { label: string; url: string }

export const linkItemComponent: ComponentDef<LinkItemValue> = {
  key: 'linkItem',
  defaultValue: { label: '', url: '' },
  variants: ['simple', 'compact'],
  CardItem({ value, ctx, variant = 'simple', blockConfig }) {
    const safe: LinkItemValue = (value && typeof value === 'object' && 'label' in value)
      ? value as LinkItemValue
      : { label: '', url: '' }
    const displayText = safe.label || safe.url || '-'
    const iconKey = typeof blockConfig?.icon === 'string' ? blockConfig.icon : '🔗'

    if (variant === 'compact') {
      const fs = ctx.fontSize.xs
      return (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontFamily: ctx.fontFamily,
          overflow: 'hidden',
        }}>
          <span style={{ fontSize: fs, flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}>
            {renderIcon(iconKey, fs)}
          </span>
        </div>
      )
    }

    const fs = ctx.fontSize.md
    return (
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 6,
        fontFamily: ctx.fontFamily,
        overflow: 'hidden',
      }}>
        <span style={{ fontSize: fs, flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}>
          {renderIcon(iconKey, fs)}
        </span>
        <span style={{
          fontSize: fs,
          color: safe.url ? ctx.theme.accent : (displayText === '-' ? ctx.theme.subText : ctx.theme.text),
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textDecoration: safe.url ? 'underline' : 'none',
        }}>
          {displayText}
        </span>
      </div>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    const safe: LinkItemValue = (value && typeof value === 'object' && 'label' in value)
      ? value as LinkItemValue
      : { label: '', url: '' }
    const iconKey = typeof blockConfig?.icon === 'string' ? blockConfig.icon : '🔗'

    return (
      <div className="flex flex-col gap-2">
        <span className="text-sm text-gray-500 flex items-center gap-1">
          {renderIcon(iconKey, 16)}
        </span>
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
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const icon = typeof blockConfig.icon === 'string' ? blockConfig.icon : ''
    return (
      <div className="flex flex-col gap-2 text-sm">
        <span className="text-[10px] text-gray-500">アイコン</span>
        <IconPicker value={icon} onChange={v => onChange({ ...blockConfig, icon: v || undefined })} />
      </div>
    )
  },
}
