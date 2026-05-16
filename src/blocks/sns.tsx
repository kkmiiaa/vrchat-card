'use client'
import type { Block, SnsValue } from './types'

export const snsBlock: Block<SnsValue> = {
  key: 'sns',
  defaultValue: { vrchatId: '', twitterId: '', discordId: '' },
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
