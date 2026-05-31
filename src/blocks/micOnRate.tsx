// @ts-nocheck
'use client'
import type { ComponentDef } from './types'

export const micOnRateBlock: ComponentDef<any> = {
  key: 'micOnRate',
  defaultValue: 0,
  variants: ['default', 'gradient'],  // default=単色バー, gradient=グラデーションバー
  CardItem({ value, ctx }) {
    const rate = typeof value === 'number' ? value : 0
    const fs = ctx.cardWidth * 0.012
    const barWidth = ctx.cardWidth * 0.18
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: ctx.fontFamily }}>
        <div style={{ width: barWidth, height: 6, borderRadius: 999, background: `${ctx.theme.subText}30`, overflow: 'hidden' }}>
          <div style={{ width: `${rate}%`, height: '100%', borderRadius: 999, background: ctx.theme.accent }} />
        </div>
        <span style={{ fontSize: fs, color: ctx.theme.text, fontWeight: 600 }}>{rate}%</span>
      </div>
    )
  },
  FormItem({ value, onChange, t }) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-gray-500">{t.micOnRate}</h2>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            className="flex-1 accent-[#00AADB] h-1.5"
          />
          <span className="text-sm font-semibold text-gray-700 w-10 text-right">{value}%</span>
        </div>
      </div>
    )
  },
}
