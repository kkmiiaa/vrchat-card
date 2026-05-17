'use client'
import type { Block } from './types'
import { PiGenderMaleBold, PiGenderFemaleBold, PiGenderIntersexBold } from 'react-icons/pi'

export type GenderTag = 'male' | 'female' | 'nonbinary' | 'none'

export const GENDER_TAG_OPTIONS: { value: GenderTag; label: string; icon: React.ReactNode }[] = [
  { value: 'male',      label: '男性',       icon: <PiGenderMaleBold size={14} /> },
  { value: 'female',    label: '女性',       icon: <PiGenderFemaleBold size={14} /> },
  { value: 'nonbinary', label: 'ノンバイナリ', icon: <PiGenderIntersexBold size={14} /> },
  { value: 'none',      label: '回答しない',  icon: null },
]

export const genderTagBlock: Block<GenderTag> = {
  key: 'genderTag',
  defaultValue: 'none',
  FormItem({ value, onChange, t }) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.gender}</h2>
        <div className="flex gap-2 flex-wrap">
          {GENDER_TAG_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                value === opt.value
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
