// @ts-nocheck
'use client'
import type { ComponentDef } from './types'
import { TbBadgeVr, TbDeviceDesktop, TbDeviceGamepad2 } from 'react-icons/tb'

const OPTIONS = ['PCVR', 'Quest', 'Desktop'] as const

// 各環境のアイコン
const ICONS: Record<string, React.ComponentType<{ style?: React.CSSProperties }>> = {
  PCVR:    TbBadgeVr,
  Quest:   TbDeviceGamepad2,
  Desktop: TbDeviceDesktop,
}

export const playEnvBlock: ComponentDef<any> = {
  key: 'playEnv',
  defaultValue: [],
  variants: ['simple', 'slash', 'icon'],  // default=バッジ, slash=スラッシュ区切り, icon=アイコン付きバッジ
  CardItem({ value, ctx, variant = 'simple', blockConfig }) {
    const items = Array.isArray(value) ? value : []
    if (!items.length) {
      if (blockConfig?.hideWhenEmpty) return null
      return <span style={{ fontSize: ctx.fontSize.md, color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>–</span>
    }
    const fs = ctx.fontSize.md

    // slash: "PCVR / Quest" スラッシュ区切りテキスト
    if (variant === 'slash') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          <span style={{ fontSize: fs, color: ctx.theme.text, fontFamily: ctx.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1 }}>
            {items.map((v, i) => (
              <span key={v}>
                {i > 0 && <span style={{ color: ctx.theme.subText, margin: '0 4px' }}>/</span>}
                {v}
              </span>
            ))}
          </span>
        </div>
      )
    }

    // icon: アイコン + ラベルのバッジ並び
    if (variant === 'icon') {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {items.map(v => {
            const Icon = ICONS[v]
            return (
              <span key={v} style={{ fontSize: fs, color: ctx.theme.text, background: ctx.theme.bg, padding: '2px 6px', borderRadius: 999, fontFamily: ctx.fontFamily, border: `1px solid ${ctx.theme.accent}40`, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                {Icon && <Icon style={{ fontSize: fs * 1.1 }} />}
                {v}
              </span>
            )
          })}
        </div>
      )
    }

    // default: テキストバッジ並び
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {items.map(v => (
          <span key={v} style={{ fontSize: fs, color: ctx.theme.text, background: ctx.theme.bg, padding: '2px 8px', borderRadius: 999, fontFamily: ctx.fontFamily, border: `1px solid ${ctx.theme.accent}40` }}>{v}</span>
        ))}
      </div>
    )
  },
  FormItem({ value, onChange, t }) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-gray-500">{t.environment}</h2>
        <div className="flex flex-wrap gap-2">
          {OPTIONS.map(opt => {
            const selected = value.includes(opt)
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  if (selected) onChange(value.filter(v => v !== opt))
                  else onChange([...value, opt])
                }}
                className={`px-4 py-1.5 rounded-lg text-sm border font-medium transition-all ${
                  selected
                    ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>
    )
  },
}
