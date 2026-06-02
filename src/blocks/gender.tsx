'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { SURFACE_STYLE } from './types'
import { TbGenderMale, TbGenderFemale, TbGenderBigender, TbEyeOff, TbMinus } from 'react-icons/tb'

export type GenderValue = {
  tag: string
  display?: string
}

const GENDER_OPTIONS = [
  { value: 'male',   label: '男性',   Icon: TbGenderMale },
  { value: 'female', label: '女性',   Icon: TbGenderFemale },
  { value: 'other',  label: 'その他', Icon: TbGenderBigender },
  { value: 'none',   label: '非公開', Icon: TbEyeOff },
]

const DEFAULT_GENDER_VALUE: GenderValue = { tag: '', display: '' }

export const genderComponent: ComponentDef<GenderValue> = {
  key: 'gender',
  global: true,
  defaultValue: DEFAULT_GENDER_VALUE,
  variants: ['simple', 'compact'],
  supportsSurface: true,
  surfaceFor: ['contained'],
  CardItem({ value, ctx, variant = 'simple', surface, label }) {
    const safe: GenderValue = (value && typeof value === 'object' && 'tag' in value)
      ? value as GenderValue
      : DEFAULT_GENDER_VALUE

    const option = GENDER_OPTIONS.find(o => o.value === safe.tag)
    const isNone = safe.tag === 'none'
    const isEmpty = !safe.tag
    const display = isEmpty ? '-' : (isNone ? '-' : (safe.display || option?.label || safe.tag))
    // 非公開: フラットなマイナスアイコン、それ以外: 性別アイコン（未設定はアイコンなし）
    const Icon = isEmpty ? null : (isNone ? TbMinus : option?.Icon)
    const effectiveSurface = (label && (surface === 'transparent' || surface === undefined))
       ? 'contained'
      : (surface ?? 'transparent')
    const surfaceStyle = SURFACE_STYLE[effectiveSurface]

    // compact: アイコン + 短縮テキストのみ（ラベルなし・背景なし）
    if (variant === 'compact') {
      const fs = ctx.fontSize.sm
      return (
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          overflow: 'hidden',
        }}>
          {Icon && <Icon style={{ fontSize: fs * 1.2, color: ctx.theme.subText, flexShrink: 0 }} />}
          <span style={{ fontSize: fs, color: isEmpty ? ctx.theme.subText : ctx.theme.text, fontFamily: ctx.fontFamily, whiteSpace: 'nowrap', lineHeight: 1 }}>
            {display}
          </span>
        </div>
      )
    }

    // default
    const fs = ctx.fontSize.md
    return (
      <div style={{
        width: '100%',
        background: surfaceStyle.background,
        border: surfaceStyle.border,
        boxShadow: surfaceStyle.boxShadow,
        borderRadius: ctx.cardWidth * 0.006,
        padding: `${ctx.cardWidth * 0.006 * ctx.paddingScale}px ${ctx.cardWidth * 0.008 * ctx.paddingScale}px`,
        display: 'flex',
        flexDirection: (label?.dir === 'row') ? 'row' : 'column',
        alignItems: (label?.dir === 'row') ? 'center' : 'stretch',
        justifyContent: (label?.dir === 'row') ? undefined : 'center',
        gap: label ? ctx.cardWidth * 0.003 : 4,
        overflow: 'hidden',
      }}>
        {label && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: ctx.cardWidth * 0.003, flexShrink: 0 }}>
            <span style={{ fontSize: ctx.fontSize.sm * (label.fontScale ?? 1), fontWeight: 700, color: label.color ?? ctx.theme.text, fontFamily: ctx.fontFamily }}>{label.text}</span>
            {label.subText && <span style={{ fontSize: ctx.fontSize.xs * (label.fontScale ?? 1), color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>{label.subText}</span>}
          </div>
        )}
        {/* アイコンとテキストは常に横並び */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 1, minWidth: 0, overflow: 'hidden' }}>
          {Icon && <Icon style={{ fontSize: fs, color: ctx.theme.subText, flexShrink: 0 }} />}
          <span style={{ fontSize: fs, color: isEmpty ? ctx.theme.subText : ctx.theme.text, fontFamily: ctx.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1 }}>
            {display}
          </span>
        </div>
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
              <opt.Icon size={14} />
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
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const allowedTags: string[] = Array.isArray(blockConfig.allowedTags) ? blockConfig.allowedTags as string[] : []
    const toggleTag = (tag: string) => {
      const next = allowedTags.includes(tag)
        ? allowedTags.filter(t => t !== tag)
        : [...allowedTags, tag]
      onChange({ ...blockConfig, allowedTags: next.length ? next : undefined })
    }
    return (
      <div className="flex flex-col gap-2 text-sm">
        <p className="text-[10px] text-gray-400">表示する選択肢（allowedTags）— 未選択の場合は全て表示</p>
        <div className="flex flex-wrap gap-1">
          {GENDER_OPTIONS.map(opt => (
            <button key={opt.value} type="button"
              onClick={() => toggleTag(opt.value)}
              className={`px-2 py-1 rounded text-xs border transition-colors flex items-center gap-1 ${
                allowedTags.length === 0 || allowedTags.includes(opt.value)
                  ? 'border-sky-300 bg-sky-50 text-sky-700'
                  : 'border-gray-200 bg-white text-gray-400'
              }`}
            ><opt.Icon size={12} /> {opt.label}</button>
          ))}
        </div>
      </div>
    )
  },
}
