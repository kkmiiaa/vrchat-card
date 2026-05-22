'use client'
import type { ComponentDef } from './types'
import { BG_VARIANT_STYLE } from './types'

export type GenderValue = {
  tag: string
  display?: string
}

const GENDER_OPTIONS = [
  { value: 'male',   label: '男性',   icon: '♂' },
  { value: 'female', label: '女性',   icon: '♀' },
  { value: 'other',  label: 'その他', icon: '⚧' },
  { value: 'none',   label: '非公開', icon: '—'  },
]

const DEFAULT_GENDER_VALUE: GenderValue = { tag: '', display: '' }

export const genderComponent: ComponentDef<GenderValue> = {
  key: 'gender',
  global: true,
  defaultValue: DEFAULT_GENDER_VALUE,
  variants: ['default', 'compact'],
  CardItem({ value, ctx, bgVariant }) {
    const safe: GenderValue = (value && typeof value === 'object' && 'tag' in value)
      ? value as GenderValue
      : DEFAULT_GENDER_VALUE

    if (!safe.tag || safe.tag === 'none') return null

    const option = GENDER_OPTIONS.find(o => o.value === safe.tag)
    const display = safe.display || option?.label || safe.tag
    const icon = option?.icon
    const fs = ctx.fontSize.md
    const bgStyle = BG_VARIANT_STYLE[bgVariant ?? 'transparent']

    return (
      <div style={{
        width: '100%',
        height: '100%',
        background: bgStyle.background,
        border: bgStyle.border,
        borderRadius: ctx.cardWidth * 0.006,
        padding: `${ctx.cardWidth * 0.006 * ctx.paddingScale}px ${ctx.cardWidth * 0.008 * ctx.paddingScale}px`,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        overflow: 'hidden',
      }}>
        {icon && (
          <span style={{ fontSize: fs, color: ctx.theme.subText, fontFamily: ctx.fontFamily, flexShrink: 0 }}>
            {icon}
          </span>
        )}
        <span style={{ fontSize: fs, color: ctx.theme.text, fontFamily: ctx.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {display}
        </span>
      </div>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    const safe: GenderValue = (value && typeof value === 'object' && 'tag' in value)
      ? value as GenderValue
      : DEFAULT_GENDER_VALUE

    const allowedTags: string[] | undefined = Array.isArray(blockConfig?.allowedTags)
      ? blockConfig!.allowedTags as string[]
      : undefined
    const visibleOptions = allowedTags
      ? GENDER_OPTIONS.filter(o => allowedTags.includes(o.value))
      : GENDER_OPTIONS

    return (
      <div className="flex flex-col gap-3">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
          {visibleOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ tag: opt.value, display: '' })}
              className={`flex-1 py-2 flex items-center justify-center gap-1 transition-colors ${
                safe.tag === opt.value
                  ? 'bg-gray-900 text-white font-semibold'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
        {safe.tag && safe.tag !== 'none' && (
          <input
            type="text"
            value={safe.display ?? ''}
            onChange={e => onChange({ ...safe, display: e.target.value })}
            placeholder="表示テキスト（任意）"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        )}
      </div>
    )
  },
}
