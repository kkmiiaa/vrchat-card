'use client'
import type { Block } from './types'

const OPTIONS = ['PCVR', 'Quest', 'Desktop'] as const

export const playEnvBlock: Block<string[]> = {
  key: 'playEnv',
  defaultValue: [],
  variants: ['default', 'slash', 'icon'],  // default=バッジ, slash=スラッシュ区切り, icon=アイコン付きバッジ
  CardItem({ value, ctx }) {
    const items = Array.isArray(value) ? value : []
    if (!items.length) return null
    const fs = ctx.cardWidth * 0.012
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {items.map(v => (
          <span key={v} style={{ fontSize: fs, color: ctx.theme.text, background: ctx.theme.bg, padding: '2px 8px', borderRadius: 999, fontFamily: ctx.fontFamily, border: `1px solid ${ctx.theme.accent}40` }}>{v}</span>
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
