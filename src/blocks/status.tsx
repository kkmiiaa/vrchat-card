// @ts-nocheck
'use client'
import type { ComponentDef, StatusValue } from './types'

const STATUS_COLORS: Record<keyof StatusValue, string> = {
  blue: '#60a5fa',
  green: '#4ade80',
  yellow: '#fbbf24',
  red: '#f87171',
}

export const statusBlock: ComponentDef<any> = {
  key: 'status',
  defaultValue: { blue: '', green: '', yellow: '', red: '' },
  variants: ['simple'],  // default=カラードット+テキスト
  CardItem({ value, ctx, blockConfig }) {
    const safe: StatusValue = (value && typeof value === 'object') ? value as StatusValue : { blue: '', green: '', yellow: '', red: '' }
    const entries = (Object.entries(safe) as [keyof StatusValue, string][]).filter(([, v]) => v)
    if (!entries.length) {
      if (blockConfig?.hideWhenEmpty) return null
      return <span style={{ fontSize: ctx.fontSize.md, color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>–</span>
    }
    const fs = ctx.fontSize.md
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {entries.map(([key, text]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[key], flexShrink: 0 }} />
            <span style={{ fontSize: fs, color: ctx.theme.text, fontFamily: ctx.fontFamily }}>{text}</span>
          </div>
        ))}
      </div>
    )
  },
  FormItem({ value, onChange, t }) {
    const fields: { key: keyof StatusValue; label: string; dot: string }[] = [
      { key: 'blue',   label: t.statusBlue,   dot: 'bg-blue-400' },
      { key: 'green',  label: t.statusGreen,  dot: 'bg-green-400' },
      { key: 'yellow', label: t.statusYellow, dot: 'bg-yellow-400' },
      { key: 'red',    label: t.statusRed,    dot: 'bg-red-400' },
    ]
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-gray-500">{t.statusDescription}</h2>
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
