'use client'
import { useState } from 'react'
import type { Block } from './types'

export const languageBlock: Block<string[]> = {
  key: 'language',
  defaultValue: [],
  FormItem({ value, onChange, t }) {
    const presets = [t.japanese, t.english, t.korean]
    const customLangs = value.filter(l => !presets.includes(l))
    const [customInput, setCustomInput] = useState(customLangs.join(', '))

    const handleCustomInput = (input: string) => {
      setCustomInput(input)
      const parsed = input.split(',').map(l => l.trim()).filter(Boolean)
      onChange([...new Set([...value.filter(l => presets.includes(l)), ...parsed])])
    }

    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.languages}</h2>
        <div className="flex flex-wrap gap-2">
          {presets.map(lang => {
            const selected = value.includes(lang)
            return (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  if (selected) onChange(value.filter(l => l !== lang))
                  else onChange([...value, lang])
                }}
                className={`px-4 py-1.5 rounded-lg text-sm border font-medium transition-all ${
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
        <input
          type="text"
          placeholder={t.otherLanguages}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
          value={customInput}
          onChange={e => handleCustomInput(e.target.value)}
        />
      </div>
    )
  },
}
