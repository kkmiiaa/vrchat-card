'use client'
import { useState } from 'react'
import type { ComponentDef, ComponentCardProps, BlockConfigFormProps } from './types'
import { SURFACE_STYLE } from './types'

export type LanguageValue = {
  preset: string[]
  custom: string[]
}

const PRESET_LANGUAGES = [
  '日本語', 'English', '한국어', '中文',
]

function LanguageCard({ value, ctx, variant = 'simple', surface, label, blockConfig }: ComponentCardProps<LanguageValue>) {
  const preset = Array.isArray(value?.preset) ? value.preset : []
  const custom = Array.isArray(value?.custom) ? value.custom : []
  const all = [...preset, ...custom]
  const fs = ctx.fontSize.sm

  if (variant === 'slash') {
    const effectiveSurface = (label && (surface === 'transparent' || surface === undefined))
       ? 'contained'
      : (surface ?? 'transparent')
    const surfaceStyle = SURFACE_STYLE[effectiveSurface]
    return (
      <div style={{
        width: '100%',
        background: surfaceStyle.background,
        border: surfaceStyle.border,
        boxShadow: surfaceStyle.boxShadow,
        borderRadius: ctx.cardWidth * 0.006,
        padding: `${label ? `${ctx.cardWidth * 0.006 * ctx.paddingScale}px` : '0'} ${ctx.cardWidth * 0.008 * ctx.paddingScale}px`,
        fontSize: fs,
        color: all.length ? ctx.theme.text : ctx.theme.subText,
        fontFamily: ctx.fontFamily,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'flex',
        flexDirection: (label?.dir === 'row') ? 'row' : 'column',
        alignItems: (label?.dir === 'row') ? 'center' : 'stretch',
        justifyContent: (label?.dir === 'row') ? undefined : 'center',
        gap: label ? (label.dir === 'row' ? ctx.cardWidth * 0.005 : ctx.cardWidth * 0.003) : 0,
      }}>
        {label && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: ctx.cardWidth * 0.003, flexShrink: 0 }}>
            <span style={{ fontSize: ctx.fontSize.sm * (label.fontScale ?? 1), fontWeight: 700, color: label.color ?? ctx.theme.text, fontFamily: ctx.fontFamily }}>{label.text}</span>
            {label.subText && <span style={{ fontSize: ctx.fontSize.xs * (label.fontScale ?? 1), color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>{label.subText}</span>}
          </div>
        )}
        {all.join(' / ') || '-'}
      </div>
    )
  }

  if (!all.length) {
    if (blockConfig?.hideWhenEmpty) return null
    return <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: fs, color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>-</span></div>
  }
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
  variants: ['simple', 'slash'],
  supportsSurface: true,
  surfaceFor: ['simple', 'slash'],
  CardItem: LanguageCard,
  FormItem({ value, onChange, t, blockConfig }) {
    const preset = Array.isArray(value?.preset) ? value.preset : []
    const custom = Array.isArray(value?.custom) ? value.custom : []
    const [customInput, setCustomInput] = useState(custom.join(', '))

    const allowedPresets: string[] | undefined = Array.isArray(blockConfig?.allowedPresets)
      ? blockConfig!.allowedPresets as string[]
      : undefined
    const visibleLanguages = allowedPresets
      ? PRESET_LANGUAGES.filter(l => allowedPresets.includes(l))
      : PRESET_LANGUAGES

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
          {visibleLanguages.map(lang => {
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
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const allowedPresets: string[] = Array.isArray(blockConfig.allowedPresets) ? blockConfig.allowedPresets as string[] : []
    const togglePreset = (lang: string) => {
      const next = allowedPresets.includes(lang)
        ? allowedPresets.filter(l => l !== lang)
        : [...allowedPresets, lang]
      onChange({ ...blockConfig, allowedPresets: next.length ? next : undefined })
    }
    return (
      <div className="flex flex-col gap-2 text-sm">
        <p className="text-[10px] text-gray-400">表示するプリセット（allowedPresets）— 未選択の場合は全て表示</p>
        <div className="flex flex-wrap gap-1">
          {PRESET_LANGUAGES.map(lang => (
            <button key={lang} type="button"
              onClick={() => togglePreset(lang)}
              className={`px-2 py-1 rounded text-xs border transition-colors ${
                allowedPresets.length === 0 || allowedPresets.includes(lang)
                  ? 'border-sky-300 bg-sky-50 text-sky-700'
                  : 'border-gray-200 bg-white text-gray-400'
              }`}
            >{lang}</button>
          ))}
        </div>
      </div>
    )
  },
}
