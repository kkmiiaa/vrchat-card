'use client'
import type { Block } from './types'

const OPTIONS = ['PCVR', 'Quest', 'Desktop'] as const

export const playEnvBlock: Block<string[]> = {
  key: 'playEnv',
  defaultValue: [],
  CardItem({ value }) {
    const items = Array.isArray(value) ? value : []
    if (!items.length) return null
    return (
      <div className="flex flex-wrap gap-1">
        {items.map(v => (
          <span key={v} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{v}</span>
        ))}
      </div>
    )
  },
  FormItem({ value, onChange, t }) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.environment}</h2>
        <div className="flex flex-wrap gap-2">
          {OPTIONS.map(opt => {
            const selected = value.includes(opt)
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  if (selected) onChange(value.filter(v => v !== opt))
                  else onChange([...value, opt])
                }}
                className={`px-4 py-1.5 rounded-lg text-sm border font-medium transition-all ${
                  selected
                    ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>
    )
  },
}
