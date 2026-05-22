'use client'
import type { ComponentDef } from './types'

export type SnsWithFriendPolicyValue = {
  platforms: Record<string, string>
  friendPolicy: string
}

const DEFAULT_VALUE: SnsWithFriendPolicyValue = { platforms: {}, friendPolicy: '' }

const ALL_POLICIES = [
  { value: 'anyone', label: '誰でも' },
  { value: 'mutual', label: '相互のみ' },
  { value: 'no', label: '申請しない' },
]

export const snsWithFriendPolicyComponent: ComponentDef<SnsWithFriendPolicyValue> = {
  key: 'sns-with-friend-policy',
  defaultValue: DEFAULT_VALUE,
  variants: ['default'],
  CardItem({ value, ctx }) {
    const safe: SnsWithFriendPolicyValue =
      (value && typeof value === 'object' && 'platforms' in value)
        ? value as SnsWithFriendPolicyValue
        : DEFAULT_VALUE
    const fs = ctx.fontSize.sm
    const platforms = safe.platforms ?? {}
    const policy = safe.friendPolicy

    const platformEntries = Object.entries(platforms).filter(([, v]) => v)
    if (!platformEntries.length && !policy) return null

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: ctx.fontFamily }}>
        {platformEntries.map(([key, val]) => (
          <span key={key} style={{ fontSize: fs, color: ctx.theme.text }}>
            {key}: {val}
          </span>
        ))}
        {policy && (
          <span style={{ fontSize: fs, color: ctx.theme.subText }}>
            フレポリ: {ALL_POLICIES.find(p => p.value === policy)?.label ?? policy}
          </span>
        )}
      </div>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    const safe: SnsWithFriendPolicyValue =
      (value && typeof value === 'object' && 'platforms' in value)
        ? value as SnsWithFriendPolicyValue
        : DEFAULT_VALUE
    const platforms = safe.platforms ?? {}

    const platformList: string[] = Array.isArray(blockConfig?.platforms)
      ? blockConfig!.platforms as string[]
      : ['x', 'discord', 'vrchat']

    const allowedPolicies: string[] = Array.isArray(blockConfig?.allowedPolicies)
      ? blockConfig!.allowedPolicies as string[]
      : ALL_POLICIES.map(p => p.value)

    const visiblePolicies = ALL_POLICIES.filter(p => allowedPolicies.includes(p.value))

    const updatePlatform = (key: string, val: string) => {
      onChange({ ...safe, platforms: { ...platforms, [key]: val } })
    }

    const selectPolicy = (policyValue: string) => {
      onChange({ ...safe, friendPolicy: safe.friendPolicy === policyValue ? '' : policyValue })
    }

    return (
      <div className="flex flex-col gap-3">
        {platformList.map(key => (
          <label key={key} className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-gray-700">{key}</span>
            <input
              type="text"
              value={platforms[key] ?? ''}
              onChange={e => updatePlatform(key, e.target.value)}
              placeholder={`${key} ID`}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </label>
        ))}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-gray-700">フレンドポリシー</span>
          <div className="flex flex-wrap gap-2">
            {visiblePolicies.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => selectPolicy(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs border font-medium transition-all ${
                  safe.friendPolicy === p.value
                    ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  },
}
