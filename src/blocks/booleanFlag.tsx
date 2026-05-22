'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { BG_VARIANT_STYLE } from './types'

export const booleanFlagComponent: ComponentDef<boolean> = {
  key: 'booleanFlag',
  defaultValue: false,
  variants: ['default', 'badge'],
  CardItem({ value, ctx, variant, bgVariant, blockConfig }) {
    const on = typeof value === 'boolean' ? value : false
    const fs = ctx.fontSize.md
    const trueIcon = typeof blockConfig?.trueIcon === 'string' ? blockConfig.trueIcon : null
    const falseIcon = typeof blockConfig?.falseIcon === 'string' ? blockConfig.falseIcon : null

    if (variant === 'badge') {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `${ctx.cardWidth * 0.004 * ctx.paddingScale}px ${ctx.cardWidth * 0.012 * ctx.paddingScale}px`,
            borderRadius: 9999,
            background: on ? ctx.theme.accent : '#9ca3af',
            fontSize: fs,
            color: '#fff',
            fontFamily: ctx.fontFamily,
            fontWeight: 600,
          }}>
            {on ? 'ON' : 'OFF'}
          </div>
        </div>
      )
    }

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
        gap: 6,
        fontFamily: ctx.fontFamily,
      }}>
        {(on ? trueIcon : falseIcon)
          ? <span style={{ fontSize: fs * 1.3 }}>{on ? trueIcon : falseIcon}</span>
          : <span style={{ fontSize: fs * 1.1, color: on ? '#16a34a' : '#ef4444' }}>{on ? '✓' : '✗'}</span>
        }
        <span style={{ fontSize: fs, color: ctx.theme.text, fontWeight: 600 }}>{on ? 'ON' : 'OFF'}</span>
      </div>
    )
  },
  FormItem({ value, onChange }) {
    const on = typeof value === 'boolean' ? value : false
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={on}
          onClick={() => onChange(!on)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-300 ${on ? 'bg-sky-500' : 'bg-gray-300'}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
        <span className="text-sm font-medium text-gray-700">{on ? 'ON' : 'OFF'}</span>
      </div>
    )
  },
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const trueLabel = typeof blockConfig.trueLabel === 'string' ? blockConfig.trueLabel : ''
    const falseLabel = typeof blockConfig.falseLabel === 'string' ? blockConfig.falseLabel : ''
    const trueColor = typeof blockConfig.trueColor === 'string' ? blockConfig.trueColor : ''
    const falseColor = typeof blockConfig.falseColor === 'string' ? blockConfig.falseColor : ''
    return (
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 shrink-0">ONラベル</span>
          <input type="text" value={trueLabel} placeholder="ON"
            onChange={e => onChange({ ...blockConfig, trueLabel: e.target.value || undefined })}
            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-200" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 shrink-0">OFFラベル</span>
          <input type="text" value={falseLabel} placeholder="OFF"
            onChange={e => onChange({ ...blockConfig, falseLabel: e.target.value || undefined })}
            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-200" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 shrink-0">ON色</span>
          <input type="color" value={trueColor || '#16a34a'}
            onChange={e => onChange({ ...blockConfig, trueColor: e.target.value })}
            className="w-7 h-7 rounded border border-gray-200 cursor-pointer p-0.5" />
          {trueColor && <button type="button" onClick={() => onChange({ ...blockConfig, trueColor: undefined })} className="text-xs text-gray-300 hover:text-gray-500">reset</button>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 shrink-0">OFF色</span>
          <input type="color" value={falseColor || '#ef4444'}
            onChange={e => onChange({ ...blockConfig, falseColor: e.target.value })}
            className="w-7 h-7 rounded border border-gray-200 cursor-pointer p-0.5" />
          {falseColor && <button type="button" onClick={() => onChange({ ...blockConfig, falseColor: undefined })} className="text-xs text-gray-300 hover:text-gray-500">reset</button>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 shrink-0">ONアイコン</span>
          <input type="text" value={typeof blockConfig.trueIcon === 'string' ? blockConfig.trueIcon : ''} placeholder="例: 💖"
            onChange={e => onChange({ ...blockConfig, trueIcon: e.target.value || undefined })}
            className="w-20 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-200" />
          <span className="text-[10px] text-gray-400">プリセット: 💖 ✓ 🌟</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 shrink-0">OFFアイコン</span>
          <input type="text" value={typeof blockConfig.falseIcon === 'string' ? blockConfig.falseIcon : ''} placeholder="例: 💔"
            onChange={e => onChange({ ...blockConfig, falseIcon: e.target.value || undefined })}
            className="w-20 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-200" />
          <span className="text-[10px] text-gray-400">プリセット: 💔 ✗ ⭐</span>
        </div>
      </div>
    )
  },
}
