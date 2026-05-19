'use client'
import type { Block } from './types'
import { PiGenderMaleBold, PiGenderFemaleBold, PiGenderIntersexBold } from 'react-icons/pi'

export type GenderTag = 'male' | 'female' | 'nonbinary' | 'none'

export type GenderValue = {
  tag: GenderTag
  display: string
}

export const GENDER_TAG_OPTIONS: { value: GenderTag; label: string; icon: React.ReactNode }[] = [
  { value: 'male',      label: '男性',       icon: <PiGenderMaleBold size={14} /> },
  { value: 'female',    label: '女性',       icon: <PiGenderFemaleBold size={14} /> },
  { value: 'nonbinary', label: 'ノンバイナリ', icon: <PiGenderIntersexBold size={14} /> },
  { value: 'none',      label: '回答しない',  icon: null },
]

export const DEFAULT_GENDER_VALUE: GenderValue = { tag: 'none', display: '' }

export const genderTagBlock: Block<GenderValue> = {
  key: 'genderTag',
  defaultValue: DEFAULT_GENDER_VALUE,
  variants: ['default', 'icon'],  // default=テキスト+アイコン, icon=アイコンのみ
  CardItem({ value, ctx }) {
    const safe: GenderValue = (value && typeof value === 'object' && 'tag' in value)
      ? value as GenderValue
      : DEFAULT_GENDER_VALUE
    const label = GENDER_TAG_OPTIONS.find(o => o.value === safe.tag)?.label
    const display = safe.display || label
    if (!display || safe.tag === 'none') return null
    const fs = ctx.cardWidth * 0.014
    const Icon = safe.tag === 'male' ? PiGenderMaleBold : safe.tag === 'female' ? PiGenderFemaleBold : safe.tag === 'nonbinary' ? PiGenderIntersexBold : null
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: fs, color: ctx.theme.text, fontFamily: ctx.fontFamily }}>
        {Icon && <Icon size={fs} style={{ color: ctx.theme.subText }} />}
        {display}
      </span>
    )
  },
  FormItem({ value, onChange, t }) {
    const safe: GenderValue = (value && typeof value === 'object' && 'tag' in value)
      ? value as GenderValue
      : DEFAULT_GENDER_VALUE

    return (
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{t.gender}</h2>
          <div className="flex gap-2 flex-wrap">
            {GENDER_TAG_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ ...safe, tag: opt.value })}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                  safe.tag === opt.value
                    ? 'bg-sky-500 border-sky-500 text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-sky-300'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {safe.tag !== 'none' && (
          <div>
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{t.genderDisplayText}</h2>
            <input
              type="text"
              value={safe.display}
              onChange={e => onChange({ ...safe, display: e.target.value })}
              placeholder="例: 男の娘、she/her、Nb ..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
            <p className="text-[11px] text-gray-400 mt-1">{t.genderDisplayTextHint}</p>
          </div>
        )}
      </div>
    )
  },
}

export const genderBlock: Block<string> = {
  key: 'gender',
  defaultValue: '',
  FormItem({ value, onChange, t }) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">性別テキスト</h2>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="例: 男の娘、she/her、Nb ..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
      </div>
    )
  },
}
