'use client'
import { useState } from 'react'
import type { Block, AgeValue } from './types'

const MODES = ['18歳未満', '18+', '非公開', '自由入力'] as const

export const ageBlock: Block<AgeValue> = {
  key: 'age',
  defaultValue: { mode: '', display: '' },
  FormItem({ value, onChange }) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">年齢</h2>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
          {MODES.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange({
                mode: opt,
                display: opt !== '自由入力' ? opt : '',
              })}
              className={`flex-1 py-2 text-center transition-colors ${
                value.mode === opt
                  ? 'bg-gray-900 text-white font-semibold'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        {value.mode === '自由入力' && (
          <input
            type="text"
            value={value.display}
            onChange={e => onChange({ ...value, display: e.target.value })}
            placeholder="例: 20代, 社会人"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        )}
      </div>
    )
  },
}
