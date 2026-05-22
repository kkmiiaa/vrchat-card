'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { BG_VARIANT_STYLE } from './types'

type GaugeConfig = {
  barColor?: string
  barGradient?: string[]
  barHeight?: number
  showLabel?: boolean
}

export const gaugeComponent: ComponentDef<number> = {
  key: 'gauge',
  defaultValue: 0,
  variants: ['default'],

  CardItem({ value, ctx, bgVariant, blockConfig }) {
    const cfg = (blockConfig ?? {}) as GaugeConfig
    const rate = typeof value === 'number' ? value : 0
    const fs = ctx.fontSize.sm

    const barHeight = cfg.barHeight ?? 8
    const showLabel = cfg.showLabel !== false

    const barFill = cfg.barGradient && cfg.barGradient.length >= 2
      ? `linear-gradient(to right, ${cfg.barGradient.join(', ')})`
      : cfg.barColor ?? ctx.theme.accent

    const bgStyle = BG_VARIANT_STYLE[bgVariant ?? 'transparent']

    return (
      <div style={{
        width: '100%',
        background: bgStyle.background,
        border: bgStyle.border,
        borderRadius: ctx.cardWidth * 0.006,
        padding: `${ctx.cardWidth * 0.006 * ctx.paddingScale}px ${ctx.cardWidth * 0.008 * ctx.paddingScale}px`,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: ctx.fontFamily,
      }}>
        <div style={{
          flex: 1,
          height: barHeight,
          background: '#e5e7eb',
          borderRadius: barHeight / 2,
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${rate}%`,
            background: barFill,
            borderRadius: barHeight / 2,
          }} />
        </div>
        {showLabel && (
          <span style={{
            fontSize: fs,
            color: ctx.theme.text,
            fontWeight: 600,
            flexShrink: 0,
            minWidth: ctx.cardWidth * 0.032,
            textAlign: 'right',
          }}>
            {rate}%
          </span>
        )}
      </div>
    )
  },

  FormItem({ value, onChange, blockConfig }) {
    const maxValue = typeof blockConfig?.maxValue === 'number' ? blockConfig.maxValue : 100
    const step = typeof blockConfig?.step === 'number' ? blockConfig.step : 1
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={maxValue}
            step={step}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            className="flex-1 accent-[#00AADB] h-1.5"
          />
          <span className="text-sm font-semibold text-gray-700 w-10 text-right">{value}%</span>
        </div>
      </div>
    )
  },
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const maxValue = typeof blockConfig.maxValue === 'number' ? blockConfig.maxValue : ''
    const step = typeof blockConfig.step === 'number' ? blockConfig.step : ''
    const unit = typeof blockConfig.unit === 'string' ? blockConfig.unit : ''
    const barColor = typeof blockConfig.barColor === 'string' ? blockConfig.barColor : ''
    const barHeight = typeof blockConfig.barHeight === 'number' ? blockConfig.barHeight : ''
    return (
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 shrink-0">最大値</span>
          <input type="number" min={1} value={maxValue} placeholder="100"
            onChange={e => onChange({ ...blockConfig, maxValue: e.target.value ? Number(e.target.value) : undefined })}
            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-200" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 shrink-0">ステップ</span>
          <input type="number" min={1} value={step} placeholder="1"
            onChange={e => onChange({ ...blockConfig, step: e.target.value ? Number(e.target.value) : undefined })}
            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-200" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 shrink-0">単位</span>
          <input type="text" value={unit} placeholder="% など"
            onChange={e => onChange({ ...blockConfig, unit: e.target.value || undefined })}
            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-200" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 shrink-0">バー色</span>
          <input type="color" value={barColor || '#00AADB'}
            onChange={e => onChange({ ...blockConfig, barColor: e.target.value })}
            className="w-7 h-7 rounded border border-gray-200 cursor-pointer p-0.5" />
          {barColor && <button type="button" onClick={() => onChange({ ...blockConfig, barColor: undefined })} className="text-xs text-gray-300 hover:text-gray-500">reset</button>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 shrink-0">バー高さ(px)</span>
          <input type="number" min={1} value={barHeight} placeholder="8"
            onChange={e => onChange({ ...blockConfig, barHeight: e.target.value ? Number(e.target.value) : undefined })}
            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-200" />
        </div>
      </div>
    )
  },
}
