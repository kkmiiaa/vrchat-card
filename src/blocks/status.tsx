'use client'
import type { Block, StatusValue } from './types'

export const statusBlock: Block<StatusValue> = {
  key: 'status',
  defaultValue: { blue: '', green: '', yellow: '', red: '' },
  FormItem({ value, onChange, t }) {
    const fields: { key: keyof StatusValue; label: string; dot: string }[] = [
      { key: 'blue',   label: t.statusBlue,   dot: 'bg-blue-400' },
      { key: 'green',  label: t.statusGreen,  dot: 'bg-green-400' },
      { key: 'yellow', label: t.statusYellow, dot: 'bg-yellow-400' },
      { key: 'red',    label: t.statusRed,    dot: 'bg-red-400' },
    ]
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.statusDescription}</h2>
        {fields.map(({ key, label, dot }) => (
          <label key={key} className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <span className={`w-2 h-2 rounded-full ${dot}`} />
              {label}
            </span>
            <input
              type="text"
              value={value[key]}
              onChange={e => onChange({ ...value, [key]: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </label>
        ))}
      </div>
    )
  },
}
