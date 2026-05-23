'use client'
import type { ComponentDef, AgeValue } from './types'
import { BG_VARIANT_STYLE } from './types'

const BUTTONS: { label: string; searchTag: AgeValue['searchTag'] }[] = [
  { label: '18歳未満', searchTag: '18歳未満' },
  { label: '18+',      searchTag: '18+'      },
  { label: '非公開',   searchTag: '非公開'   },
  { label: '自由入力', searchTag: ''         },
]

export const ageComponent: ComponentDef<AgeValue> = {
  key: 'age',
  global: true,
  defaultValue: { searchTag: '', display: '' },
  variants: ['default', 'badge'],
  supportsBgVariant: true,
  CardItem({ value, ctx, variant, bgVariant, label }) {
    const safe: AgeValue = (value && typeof value === 'object' && 'searchTag' in value)
      ? value as AgeValue
      : { searchTag: '', display: '' }
    if (!safe.searchTag && !safe.display) return null
    if (safe.searchTag === '非公開') return null
    const text = safe.display || safe.searchTag
    const fs = ctx.fontSize.md
    const bgStyle = BG_VARIANT_STYLE[bgVariant ?? 'transparent']
    return (
      <div style={{ width: '100%', height: '100%', background: bgStyle.background, border: bgStyle.border, borderRadius: ctx.cardWidth * 0.006, padding: `${ctx.cardWidth * 0.006 * ctx.paddingScale}px ${ctx.cardWidth * 0.008 * ctx.paddingScale}px`, display: 'flex', flexDirection: label ? 'column' : 'row', gap: label ? ctx.cardWidth * 0.003 : 0, alignItems: label ? 'stretch' : 'center', overflow: 'hidden' }}>
        {label && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: ctx.cardWidth * 0.003, flexShrink: 0 }}>
            <span style={{ fontSize: ctx.fontSize.sm * (label.fontScale ?? 1), fontWeight: 700, color: label.color ?? ctx.theme.text, fontFamily: ctx.fontFamily }}>{label.text}</span>
            {label.subText && <span style={{ fontSize: ctx.fontSize.xs * (label.fontScale ?? 1), color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>{label.subText}</span>}
          </div>
        )}
        <span style={{ fontSize: fs, color: ctx.theme.text, fontFamily: ctx.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</span>
      </div>
    )
  },
  FormItem({ value, onChange, t }) {
    const activeButton = BUTTONS.find(b =>
      b.searchTag === value.searchTag && (b.label !== '自由入力' || !value.searchTag)
    ) ?? (value.searchTag === '' && value.display ? BUTTONS[3] : null)

    return (
      <div className="flex flex-col gap-3">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
          {BUTTONS.map(btn => {
            const isSelected = btn.label === '自由入力'
              ? value.searchTag === '' && (value.display !== '' || activeButton?.label === '自由入力')
              : value.searchTag === btn.searchTag
            return (
              <button
                key={btn.label}
                type="button"
                onClick={() => onChange({ searchTag: btn.searchTag, display: '' })}
                className={`flex-1 py-2 text-center transition-colors ${
                  isSelected
                    ? 'bg-gray-900 text-white font-semibold'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {btn.label}
              </button>
            )
          })}
        </div>
        {value.searchTag === '' && (
          <input
            type="text"
            value={value.display}
            onChange={e => onChange({ ...value, display: e.target.value })}
            placeholder="例: 25歳, 20代, アラサー"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        )}
      </div>
    )
  },
}
