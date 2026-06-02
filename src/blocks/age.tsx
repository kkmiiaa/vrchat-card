'use client'
import type { ComponentDef, AgeValue } from './types'
import { SURFACE_STYLE } from './types'

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
  variants: ['simple', 'badge'],
  supportsSurface: true,
  surfaceFor: ['simple'],
  CardItem({ value, ctx, variant = 'simple', surface, label }) {
    const safe: AgeValue = (value && typeof value === 'object' && 'searchTag' in value)
      ? value as AgeValue
      : { searchTag: '', display: '' }
    const isPrivate = safe.searchTag === '非公開'
    const isEmpty = !safe.searchTag && !safe.display
    const text = (isPrivate || isEmpty) ? '-' : (safe.display || safe.searchTag)
    const effectiveSurface = (label && (surface === 'transparent' || surface === undefined))
       ? 'simple'
      : (surface ?? 'transparent')
    const surfaceStyle = SURFACE_STYLE[effectiveSurface]

    // badge: カラーバッジ形式（select/badge・dateItem/badge と同じスタイル）
    if (variant === 'badge') {
      const color = ctx.theme.accent
      const fs = ctx.fontSize.sm
      return (
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{
            fontSize: fs,
            color: '#ffffff',
            fontWeight: 700,
            background: color,
            padding: `${ctx.cardWidth * 0.003 * ctx.paddingScale}px ${ctx.cardWidth * 0.012 * ctx.paddingScale}px`,
            borderRadius: ctx.cardWidth * 0.005,
            fontFamily: ctx.fontFamily,
            whiteSpace: 'nowrap',
          }}>
            {text}
          </span>
        </div>
      )
    }

    // default
    const fs = ctx.fontSize.md
    return (
      <div style={{ width: '100%', background: surfaceStyle.background, border: surfaceStyle.border, boxShadow: surfaceStyle.boxShadow, borderRadius: ctx.cardWidth * 0.006, padding: `${ctx.cardWidth * 0.006 * ctx.paddingScale}px ${ctx.cardWidth * 0.008 * ctx.paddingScale}px`, display: 'flex', flexDirection: (label?.dir === 'row') ? 'row' : 'column', gap: label ? (label.dir === 'row' ? ctx.cardWidth * 0.005 : ctx.cardWidth * 0.003) : 0, alignItems: (label?.dir === 'row') ? 'center' : 'stretch', justifyContent: (label?.dir === 'row') ? undefined : 'center', overflow: 'hidden' }}>
        {label && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: ctx.cardWidth * 0.003, flexShrink: 0 }}>
            <span style={{ fontSize: ctx.fontSize.sm * (label.fontScale ?? 1), fontWeight: 700, color: label.color ?? ctx.theme.text, fontFamily: ctx.fontFamily }}>{label.text}</span>
            {label.subText && <span style={{ fontSize: ctx.fontSize.xs * (label.fontScale ?? 1), color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>{label.subText}</span>}
          </div>
        )}
        <span style={{ fontSize: fs, color: (isEmpty || isPrivate) ? ctx.theme.subText : ctx.theme.text, fontFamily: ctx.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</span>
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
