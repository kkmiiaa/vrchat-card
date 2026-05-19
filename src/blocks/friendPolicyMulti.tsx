'use client'
import type { Block } from './types'

const POLICY_KEYS = [
  'frPolicyAnyone',
  'frPolicyAfterGettingToKnow',
  'frPolicyIfInterested',
  'frPolicyMutualsOnX',
  'frPolicyNo',
] as const

export const friendPolicyMultiBlock: Block<string[]> = {
  key: 'friendPolicy',
  defaultValue: [],
  CardItem({ value, fontFamily }) {
    const selected = Array.isArray(value) ? value : [value].filter(Boolean)
    const LABELS: Record<string, string> = {
      frPolicyAnyone: 'だれでもOK',
      frPolicyAfterGettingToKnow: '仲良くなってから',
      frPolicyIfInterested: '気になったら',
      frPolicyMutualsOnX: 'Twitter相互',
      frPolicyNo: '送らないで',
    }
    if (!selected.length) return null
    return (
      <div className="flex flex-wrap gap-1">
        {selected.map(k => (
          <span key={k} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
            {LABELS[k] ?? k}
          </span>
        ))}
      </div>
    )
  },
  FormItem({ value, onChange, t }) {
    const selected = Array.isArray(value) ? value : [value].filter(Boolean)
    function toggle(key: string) {
      if (selected.includes(key)) onChange(selected.filter(k => k !== key))
      else onChange([...selected, key])
    }
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.friendRequestPolicy}</h2>
        <div className="flex flex-col gap-1.5">
          {POLICY_KEYS.map(key => {
            const isSelected = selected.includes(key)
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm border font-medium transition-all ${
                  isSelected
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
    )
  },
}
