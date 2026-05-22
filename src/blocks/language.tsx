'use client'
import { useState } from 'react'
import type { ComponentDef, ComponentCardProps } from './types'
import { BG_VARIANT_STYLE } from './types'

export type LanguageValue = {
  preset: string[]
  custom: string[]
}

const PRESET_LANGUAGES = [
  '日本語', 'English', '한국어', '中文',
]

function LanguageCard({ value, ctx, variant, bgVariant }: ComponentCardProps<LanguageValue>) {
  const preset = Array.isArray(value?.preset) ? value.preset : []
  const custom = Array.isArray(value?.custom) ? value.custom : []
  const all = [...preset, ...custom]
  const fs = ctx.fontSize.sm

  if (variant === 'slash') {
    const bgStyle = BG_VARIANT_STYLE[bgVariant ?? 'transparent']
    return (
      <div style={{
        width: '100%',
        background: bgStyle.background,
        border: bgStyle.border,
        borderRadius: ctx.cardWidth * 0.006,
        padding: `0 ${ctx.cardWidth * 0.008 * ctx.paddingScale}px`,
        fontSize: fs,
        color: ctx.theme.text,
        fontFamily: ctx.fontFamily,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'flex',
        alignItems: 'center',
      }}>
        {all.join(' / ') || '—'}
      </div>
    )
  }

  if (!all.length) return (
    <span style={{ fontSize: fs, color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>—</span>
  )
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {preset.map(v => (
        <span key={v} style={{
          fontSize: fs,
          color: ctx.theme.accent,
          background: `${ctx.theme.accent}18`,
          padding: '2px 8px',
          borderRadius: 999,
          fontFamily: ctx.fontFamily,
        }}>{v}</span>
      ))}
      {custom.map(v => (
        <span key={v} style={{
          fontSize: fs,
          color: ctx.theme.subText,
          background: 'rgba(0,0,0,0.06)',
          padding: '2px 8px',
          borderRadius: 999,
          fontFamily: ctx.fontFamily,
        }}>{v}</span>
      ))}
    </div>
  )
}

export const languageComponent: ComponentDef<LanguageValue> = {
  key: 'language',
  global: true,
  defaultValue: { preset: [], custom: [] },
  variants: ['default', 'slash'],
  CardItem: LanguageCard,
  FormItem({ value, onChange, t }) {
    const preset = Array.isArray(value?.preset) ? value.preset : []
    const custom = Array.isArray(value?.custom) ? value.custom : []
    const [customInput, setCustomInput] = useState(custom.join(', '))

    const togglePreset = (lang: string) => {
      if (preset.includes(lang)) onChange({ ...value, preset: preset.filter(l => l !== lang) })
      else onChange({ ...value, preset: [...preset, lang] })
    }

    const handleCustomInput = (input: string) => {
      setCustomInput(input)
      const parsed = input.split(',').map(l => l.trim()).filter(Boolean)
      onChange({ ...value, custom: parsed })
    }

    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {PRESET_LANGUAGES.map(lang => {
            const selected = preset.includes(lang)
            return (
              <button
                key={lang}
                type="button"
                onClick={() => togglePreset(lang)}
                className={`px-3 py-1 rounded-lg text-sm border font-medium transition-all ${
                  selected
                    ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                {lang}
              </button>
            )
          })}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-400">{t.otherLanguages}（検索対象外）</span>
          <input
            type="text"
            placeholder="例: Tagalog, Català"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
            value={customInput}
            onChange={e => handleCustomInput(e.target.value)}
          />
        </div>
      </div>
    )
  },
}
