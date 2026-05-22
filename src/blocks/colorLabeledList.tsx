'use client'
import type { ComponentDef } from './types'

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
  variants: ['default', 'compact'],
  CardItem({ value, ctx, blockConfig, variant = 'default' }) {
    const palette = (blockConfig?.palette as string[] | undefined) ?? DEFAULT_PALETTE
    const maxItems = (blockConfig?.maxItems as number | undefined) ?? DEFAULT_MAX_ITEMS
    const items = (value?.items ?? []).slice(0, maxItems)
    if (!items.length) return null

    if (variant === 'compact') {
      const fs = ctx.fontSize.xs
      const dotSize = ctx.cardWidth * 0.006
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', height: '100%' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minHeight: 0 }}>
              <span style={{ width: dotSize, height: dotSize, borderRadius: '50%', background: item.color || palette[i % palette.length], flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontSize: fs, color: ctx.theme.subText, fontFamily: ctx.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.label || '—'}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', height: '100%' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minHeight: 0 }}>
            <span style={{ width: dotSize, height: dotSize, borderRadius: '50%', background: item.color || palette[i % palette.length], flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: fs, color: ctx.theme.text, fontFamily: ctx.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.label || '—'}
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
            <input
              type="color"
              value={item.color || palette[i % palette.length]}
              onChange={e => update(i, { color: e.target.value })}
              className="w-7 h-7 rounded cursor-pointer border-0 p-0 bg-transparent flex-shrink-0"
            />
            <input
              type="text"
              value={item.label}
              onChange={e => update(i, { label: e.target.value })}
              placeholder="—"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
        ))}
      </div>
    )
  },
}
