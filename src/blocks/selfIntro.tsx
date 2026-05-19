'use client'
import type { Block } from './types'

export const selfIntroBlock: Block<string> = {
  key: 'selfIntro',
  defaultValue: '',
  variants: ['default'],
  CardItem({ value, ctx }) {
    if (!value) return null
    const fs = ctx.cardWidth * 0.015
    return (
      <p style={{ fontSize: fs, color: ctx.theme.text, lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: ctx.fontFamily, margin: 0 }}>{value as string}</p>
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
