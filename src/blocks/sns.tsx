'use client'
import type { Block, SnsValue } from './types'

export const snsBlock: Block<SnsValue> = {
  key: 'sns',
  defaultValue: { vrchatId: '', twitterId: '', discordId: '' },
  CardItem({ value, ctx }) {
    const safe: SnsValue = (value && typeof value === 'object') ? value as SnsValue : { vrchatId: '', twitterId: '', discordId: '' }
    const entries = [
      { label: 'VRC', val: safe.vrchatId },
      { label: 'X', val: safe.twitterId },
      { label: 'DC', val: safe.discordId },
    ].filter(e => e.val)
    if (!entries.length) return null
    const fs = ctx.cardWidth * 0.012
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {entries.map(({ label, val }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: fs * 0.85, color: ctx.theme.subText, fontWeight: 600, fontFamily: ctx.fontFamily, minWidth: '2em' }}>{label}</span>
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
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.snsInfo}</h2>
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
