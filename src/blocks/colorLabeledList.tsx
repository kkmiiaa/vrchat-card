'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { ColorPicker } from './colorPicker'

export type ColorLabeledListItem = {
  color: string
  label: string
}

export type ColorLabeledListValue = {
  items: ColorLabeledListItem[]
}

const DEFAULT_PALETTE = ['#60a5fa', '#4ade80', '#fbbf24', '#f87171']
const DEFAULT_MAX_ITEMS = 4

export const colorLabeledListComponent: ComponentDef<ColorLabeledListValue> = {
  key: 'colorLabeledList',
  defaultValue: { items: [] },
  variants: ['simple', 'compact'],
  CardItem({ value, ctx, blockConfig, variant = 'simple' }) {
    const palette = (blockConfig?.palette as string[] | undefined) ?? DEFAULT_PALETTE
    const maxItems = (blockConfig?.maxItems as number | undefined) ?? DEFAULT_MAX_ITEMS
    const items = (value?.items ?? []).slice(0, maxItems)
    if (!items.length) {
      if (blockConfig?.hideWhenEmpty) return null
      return <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: ctx.fontSize.sm, color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>-</span></div>
    }

    if (variant === 'compact') {
      const fs = ctx.fontSize.xs
      const dotSize = ctx.cardWidth * 0.006
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minHeight: 0 }}>
              <span style={{ width: dotSize, height: dotSize, borderRadius: '50%', background: item.color || palette[i % palette.length], flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontSize: fs, color: ctx.theme.subText, fontFamily: ctx.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.label || '-'}
              </span>
            </div>
          ))}
        </div>
      )
    }

    // default
    const fs = ctx.fontSize.sm
    const dotSize = ctx.cardWidth * 0.009
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minHeight: 0 }}>
            <span style={{ width: dotSize, height: dotSize, borderRadius: '50%', background: item.color || palette[i % palette.length], flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: fs, color: item.label ? ctx.theme.text : ctx.theme.subText, fontFamily: ctx.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.label || '-'}
            </span>
          </div>
        ))}
      </div>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    const palette = (blockConfig?.palette as string[] | undefined) ?? DEFAULT_PALETTE
    const maxItems = (blockConfig?.maxItems as number | undefined) ?? DEFAULT_MAX_ITEMS
    const items: ColorLabeledListItem[] = value?.items ?? []

    const update = (index: number, patch: Partial<ColorLabeledListItem>) => {
      const next = [...items]
      next[index] = { ...next[index], ...patch }
      onChange({ items: next })
    }

    const slots = Array.from({ length: maxItems }, (_, i) => items[i] ?? { color: palette[i % palette.length], label: '' })

    return (
      <div className="flex flex-col gap-2">
        {slots.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <ColorPicker value={item.color || ''} onChange={v => update(i, { color: v })} defaultColor={palette[i % palette.length]} />
            <input
              type="text"
              value={item.label}
              onChange={e => update(i, { label: e.target.value })}
              placeholder="-"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
        ))}
      </div>
    )
  },
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const maxItems = typeof blockConfig.maxItems === 'number' ? blockConfig.maxItems : DEFAULT_MAX_ITEMS
    const palette: string[] = Array.isArray(blockConfig.palette) ? blockConfig.palette as string[] : [...DEFAULT_PALETTE]

    const updatePalette = (i: number, color: string) => {
      const next = [...palette]
      next[i] = color
      onChange({ ...blockConfig, palette: next })
    }
    const addPaletteColor = () => onChange({ ...blockConfig, palette: [...palette, '#9ca3af'] })
    const removePaletteColor = (i: number) => onChange({ ...blockConfig, palette: palette.filter((_, idx) => idx !== i) })

    return (
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-20 shrink-0">最大件数</span>
          <input
            type="number" min={1} max={20}
            value={maxItems}
            onChange={e => onChange({ ...blockConfig, maxItems: e.target.value ? Number(e.target.value) : undefined })}
            className="w-20 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-200"
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[10px] text-gray-500">デフォルトカラーパレット</p>
          {palette.map((color, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 w-4 shrink-0">{i + 1}</span>
              <ColorPicker value={color} onChange={v => updatePalette(i, v)} defaultColor="#9ca3af" />
              <button type="button" onClick={() => removePaletteColor(i)} className="text-gray-300 hover:text-red-400 transition-colors text-xs">✕</button>
            </div>
          ))}
          <button type="button" onClick={addPaletteColor} className="text-xs text-sky-500 hover:text-sky-700 font-medium text-left transition-colors mt-1">+ 色を追加</button>
        </div>
      </div>
    )
  },
}
