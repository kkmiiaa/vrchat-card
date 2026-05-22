'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'

type SnsBundlePlatform = { key: string; label: string; platform: string }

const DEFAULT_PLATFORMS: SnsBundlePlatform[] = [
  { key: 'vrchatId',  label: 'VRChat ID',        platform: 'vrchat' },
  { key: 'twitterId', label: 'X（旧Twitter）',    platform: 'x' },
  { key: 'discordId', label: 'Discord',           platform: 'discord' },
]

const PLATFORM_ICONS: Record<string, string> = {
  vrchat:  '/icon_vrchat.png',
  x:       '/icon_x.png',
  discord: '/icon_discord.png',
}

const PLATFORM_PLACEHOLDERS: Record<string, string> = {
  x:       '@yourhandle',
  discord: 'YourName#1234',
}

function getPlatforms(blockConfig?: Record<string, unknown>): SnsBundlePlatform[] {
  if (blockConfig?.platforms && Array.isArray(blockConfig.platforms) && blockConfig.platforms.length > 0) {
    return blockConfig.platforms as SnsBundlePlatform[]
  }
  return DEFAULT_PLATFORMS
}

export const snsBundleComponent: ComponentDef<Record<string, string>> = {
  key: 'sns-bundle',
  defaultValue: {},
  variants: ['default', 'v2'],
  CardItem({ value, ctx, variant }) {
    const safe = (value && typeof value === 'object') ? value as Record<string, string> : {}
    const platforms = DEFAULT_PLATFORMS
    const fs = ctx.fontSize.md
    const iconSize = ctx.cardWidth * 0.018 * ctx.paddingScale

    if (variant === 'v2') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', flexGrow: 1 }}>
          {platforms.map(p => {
            const icon = PLATFORM_ICONS[p.platform] ?? ''
            const val = safe[p.key] ?? ''
            return (
              <div key={p.key} style={{ flex: 1, background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: ctx.cardWidth * 0.006, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={icon} alt="" style={{ width: iconSize * 0.65, height: iconSize * 0.65, borderRadius: 3, flexShrink: 0 }} />
                <span style={{ fontSize: fs * 0.9, color: val ? ctx.theme.text : 'rgba(0,0,0,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0, fontFamily: ctx.fontFamily }}>
                  {val || '—'}
                </span>
              </div>
            )
          })}
        </div>
      )
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', height: '100%' }}>
        {platforms.map(p => {
          const icon = PLATFORM_ICONS[p.platform] ?? ''
          const val = safe[p.key] ?? ''
          return (
            <div key={p.key} style={{ display: 'flex', alignItems: 'stretch', gap: 6, flex: 1, minHeight: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={icon} alt="" style={{ width: iconSize, height: iconSize, borderRadius: ctx.cardWidth * 0.003, objectFit: 'contain', flexShrink: 0, alignSelf: 'center' }} />
              <div style={{
                flex: 1,
                background: 'rgba(255,255,255,0.85)',
                borderRadius: ctx.cardWidth * 0.005,
                padding: `${ctx.cardWidth * 0.004 * ctx.paddingScale}px ${ctx.cardWidth * 0.007 * ctx.paddingScale}px`,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: fs, color: ctx.theme.text, fontFamily: ctx.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', width: '100%' }}>
                  {val || '—'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    const safe = (value && typeof value === 'object') ? value as Record<string, string> : {}
    const platforms = getPlatforms(blockConfig)
    return (
      <div className="flex flex-col gap-3">
        {platforms.map(p => (
          <label key={p.key} className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-gray-700">{p.label}</span>
            <input
              type="text"
              value={safe[p.key] ?? ''}
              onChange={e => onChange({ ...safe, [p.key]: e.target.value })}
              placeholder={PLATFORM_PLACEHOLDERS[p.platform] ?? ''}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </label>
        ))}
      </div>
    )
  },
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const platforms = getPlatforms(blockConfig)
    const update = (i: number, patch: Partial<SnsBundlePlatform>) => {
      const next = platforms.map((p, idx) => idx === i ? { ...p, ...patch } : p)
      onChange({ ...blockConfig, platforms: next })
    }
    const add = () => onChange({ ...blockConfig, platforms: [...platforms, { key: '', label: '', platform: '' }] })
    const remove = (i: number) => onChange({ ...blockConfig, platforms: platforms.filter((_, idx) => idx !== i) })
    return (
      <div className="flex flex-col gap-2 text-sm">
        <p className="text-[10px] text-gray-400">プラットフォーム（platforms）</p>
        {platforms.map((p, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input type="text" value={p.key} placeholder="key"
              onChange={e => update(i, { key: e.target.value })}
              className="w-20 text-xs border border-gray-200 rounded px-2 py-1 bg-white font-mono" />
            <input type="text" value={p.label} placeholder="label"
              onChange={e => update(i, { label: e.target.value })}
              className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
            <input type="text" value={p.platform} placeholder="platform"
              onChange={e => update(i, { platform: e.target.value })}
              className="w-20 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
            <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-600">×</button>
          </div>
        ))}
        <button type="button" onClick={add} className="text-xs text-sky-500 hover:text-sky-700 mt-1">+ 追加</button>
      </div>
    )
  },
}
