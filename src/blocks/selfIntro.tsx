'use client'
import type { Block } from './types'

export const selfIntroBlock: Block<string> = {
  key: 'selfIntro',
  defaultValue: '',
  CardItem({ value }) {
    if (!value) return null
    return (
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{value as string}</p>
    )
  },
  FormItem({ value, onChange, t }) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.aboutMeText}</h2>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={5}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200 resize-none"
        />
      </div>
    )
  },
}
