'use client'
import type { Block } from './types'

const POLICY_KEYS = [
  'frPolicyAnyone',
  'frPolicyAfterGettingToKnow',
  'frPolicyIfInterested',
  'frPolicyMutualsOnX',
  'frPolicyNo',
] as const

export const friendPolicyBlock: Block<string> = {
  key: 'friendPolicy',
  defaultValue: '',
  FormItem({ value, onChange, t }) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.friendRequestPolicy}</h2>
        <div className="flex flex-col gap-1.5">
          {POLICY_KEYS.map(key => {
            const selected = value === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange(selected ? '' : key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm border font-medium transition-all ${
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
    )
  },
}
