'use client'
import type { Block, SnsValue } from './types'

const POLICY_KEYS = [
  'frPolicyAnyone',
  'frPolicyAfterGettingToKnow',
  'frPolicyIfInterested',
  'frPolicyMutualsOnX',
  'frPolicyNo',
] as const

export const snsWithFriendPolicyBlock: Block<SnsValue> = {
  key: 'sns',
  defaultValue: { vrchatId: '', twitterId: '', discordId: '', friendPolicy: '' },
  FormItem({ value, onChange, t }) {
    const update = (key: keyof SnsValue) => (v: string) =>
      onChange({ ...value, [key]: v })
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.snsInfo}</h2>
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-gray-700">VRChat ID</span>
            <input type="text" value={value.vrchatId} onChange={e => update('vrchatId')(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200" />
          </label>
          <div className="flex flex-col gap-1 pl-3 border-l-2 border-sky-100">
            <span className="text-xs font-medium text-gray-400">{t.friendRequestPolicy}</span>
            <div className="flex flex-col gap-1">
              {POLICY_KEYS.map(key => {
                const selected = value.friendPolicy === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => update('friendPolicy')(selected ? '' : key)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm border font-medium transition-all ${
                      selected
                        ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {t[key as keyof typeof t] as string}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
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
