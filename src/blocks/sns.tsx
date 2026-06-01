// @ts-nocheck
'use client'
import type { ComponentDef, SnsValue } from './types'

const SNS_ICONS: Record<string, string> = {
  VRC: '/icon_vrchat.png',
  X:   '/icon_x.png',
  DC:  '/icon_discord.png',
}

export const snsBlock: ComponentDef<any> = {
  key: 'sns',
  defaultValue: { vrchatId: '', twitterId: '', discordId: '' },
  variants: ['default', 'icon'],  // default=テキストラベル+ID, icon=プラットフォームアイコン+ID
  CardItem({ value, ctx, variant = 'default', blockConfig }) {
    const isInteractive = ctx.isInteractive
    const safe: SnsValue = (value && typeof value === 'object') ? value as SnsValue : { vrchatId: '', twitterId: '', discordId: '' }
    const entries = [
      { key: 'VRC', val: safe.vrchatId },
      { key: 'X',   val: safe.twitterId },
      { key: 'DC',  val: safe.discordId },
    ].filter(e => e.val)
    if (!entries.length) {
      if (blockConfig?.hideWhenEmpty) return null
      return <span style={{ fontSize: ctx.fontSize.md, color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>–</span>
    }
    const fs = ctx.cardWidth * 0.012
    const iconSize = fs * 1.4

    function wrapInteractive(key: string, val: string, el: React.ReactNode) {
      if (!isInteractive || !val) return el
      if (key === 'X') {
        return <a key={key} href={`https://x.com/${val.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'contents' }}>{el}</a>
      }
      return (
        <div key={key} style={{ display: 'contents', cursor: 'pointer' }} onClick={() => {
          navigator.clipboard.writeText(val)
          window.dispatchEvent(new CustomEvent('vaacard:copied', { detail: `${val} をコピーしました` }))
        }}>{el}</div>
      )
    }

    // icon: プラットフォームアイコン画像 + テキスト
    if (variant === 'icon') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {entries.map(({ key, val }) => wrapInteractive(key, val,
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: isInteractive ? 'pointer' : 'default' }}>
              <img src={SNS_ICONS[key]} alt={key} style={{ width: iconSize, height: iconSize, objectFit: 'contain', flexShrink: 0 }} />
              <span style={{ fontSize: fs, color: ctx.theme.text, fontFamily: ctx.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{val}</span>
            </div>
          ))}
        </div>
      )
    }

    // default: テキストラベル + ID
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {entries.map(({ key, val }) => wrapInteractive(key, val,
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: isInteractive ? 'pointer' : 'default' }}>
            <span style={{ fontSize: fs * 0.85, color: ctx.theme.subText, fontWeight: 600, fontFamily: ctx.fontFamily, minWidth: '2em' }}>{key}</span>
            <span style={{ fontSize: fs, color: ctx.theme.text, fontFamily: ctx.fontFamily }}>{val}</span>
          </div>
        ))}
      </div>
    )
  },
  FormItem({ value, onChange, t }) {
    const update = (key: keyof SnsValue) => (v: string) =>
      onChange({ ...value, [key]: v })
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-gray-500">{t.snsInfo}</h2>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-gray-700">VRChat ID</span>
          <input type="text" value={value.vrchatId} onChange={e => update('vrchatId')(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-gray-700">{t.xFormerTwitter}</span>
          <input type="text" value={value.twitterId} onChange={e => update('twitterId')(e.target.value)}
            placeholder="@yourhandle"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-gray-700">Discord</span>
          <input type="text" value={value.discordId} onChange={e => update('discordId')(e.target.value)}
            placeholder="YourName#1234"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200" />
        </label>
      </div>
    )
  },
}
