'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'

const PLATFORM_ICONS: Record<string, string> = {
  vrchat:  '/icon_vrchat.png',
  x:       '/icon_x.png',
  discord: '/icon_discord.png',
}

const PLATFORM_LABELS: Record<string, string> = {
  vrchat:  'VRChat ID',
  x:       'X（旧Twitter）',
  discord: 'Discord',
}

const PLATFORM_PLACEHOLDERS: Record<string, string> = {
  vrchat:  '',
  x:       '@yourhandle',
  discord: 'YourName#1234',
}

function getPlatform(blockConfig?: Record<string, unknown>): string {
  return typeof blockConfig?.platform === 'string' ? blockConfig.platform : 'x'
}

export const simpleSnsComponent: ComponentDef<string> = {
  key: 'simple-sns',
  defaultValue: '',
  variants: ['default', 'glass'],
  CardItem({ value, ctx, variant, blockConfig }) {
    const platform = getPlatform(blockConfig)
    const icon = PLATFORM_ICONS[platform] ?? PLATFORM_ICONS['x']
    const id = typeof value === 'string' ? value : ''
    const fs = ctx.fontSize.md
    const iconSize = ctx.cardWidth * 0.018 * ctx.paddingScale
    const isGlass = variant === 'glass'

    if (isGlass) {
      return (
        <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: ctx.cardWidth * 0.006, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={icon} alt="" style={{ width: iconSize * 0.65, height: iconSize * 0.65, borderRadius: 3, flexShrink: 0 }} />
          <span style={{ fontSize: fs * 0.9, color: id ? ctx.theme.text : 'rgba(0,0,0,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0, fontFamily: ctx.fontFamily }}>
            {id || '—'}
          </span>
        </div>
      )
    }

    // default
    return (
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 6, width: '100%', flexGrow: 1, minHeight: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt="" style={{ width: iconSize, height: iconSize, borderRadius: ctx.cardWidth * 0.003, objectFit: 'contain', flexShrink: 0, alignSelf: 'center' }} />
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.85)', borderRadius: ctx.cardWidth * 0.005, padding: `${ctx.cardWidth * 0.004 * ctx.paddingScale}px ${ctx.cardWidth * 0.007 * ctx.paddingScale}px`, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: fs, color: ctx.theme.text, fontFamily: ctx.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', width: '100%' }}>
            {id || '—'}
          </span>
        </div>
      </div>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    const platform = getPlatform(blockConfig)
    const label = PLATFORM_LABELS[platform] ?? platform
    const placeholder = PLATFORM_PLACEHOLDERS[platform] ?? ''
    const id = typeof value === 'string' ? value : ''
    return (
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <input
          type="text"
          value={id}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
      </label>
    )
  },
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const platform = getPlatform(blockConfig)
    const clickable = blockConfig.clickable === true
    const platforms = ['vrchat', 'x', 'discord']
    return (
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-20 shrink-0">プラットフォーム</span>
          <select
            value={platform}
            onChange={e => onChange({ ...blockConfig, platform: e.target.value })}
            className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-white"
          >
            {platforms.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={clickable} className="rounded"
            onChange={e => onChange({ ...blockConfig, clickable: e.target.checked })} />
          <span className="text-[10px] text-gray-500">クリック可能（clickable）</span>
        </div>
      </div>
    )
  },
}
