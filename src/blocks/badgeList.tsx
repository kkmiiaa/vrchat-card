'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { ColorPicker } from './colorPicker'

export type BadgeItem = { label: string; color: string }

export const badgeListComponent: ComponentDef<BadgeItem[]> = {
  key: 'badge-list',
  defaultValue: [],
  variants: ['default'],
  CardItem({ value, ctx, blockConfig }) {
    const items = Array.isArray(value) ? value as BadgeItem[] : []
    const defaultColor = typeof blockConfig?.defaultColor === 'string' ? blockConfig.defaultColor : '#6b7280'
    const fs = ctx.fontSize.sm
    if (!items.length) {
      if (blockConfig?.hideWhenEmpty) return null
      return <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: fs, color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>-</span></div>
    }
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {items.map((item, i) => {
          const color = item.color || defaultColor
          return (
            <span key={i} style={{
              fontSize: fs,
              color: '#fff',
              fontWeight: 700,
              background: color,
              padding: `${ctx.cardWidth * 0.003 * ctx.paddingScale}px ${ctx.cardWidth * 0.012 * ctx.paddingScale}px`,
              borderRadius: ctx.cardWidth * 0.005,
              fontFamily: ctx.fontFamily,
              boxShadow: `0 2px 6px ${color}55`,
              display: 'inline-block',
              whiteSpace: 'nowrap',
            }}>
              {item.label}
            </span>
          )
        })}
      </div>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    const items = Array.isArray(value) ? value as BadgeItem[] : []
    const allowColorPicker = blockConfig?.allowColorPicker === true
    const defaultColor = typeof blockConfig?.defaultColor === 'string' ? blockConfig.defaultColor : '#6b7280'

    const addBadge = () => {
      onChange([...items, { label: '', color: defaultColor }])
    }

    const removeBadge = (index: number) => {
      onChange(items.filter((_, i) => i !== index))
    }

    const updateBadge = (index: number, patch: Partial<BadgeItem>) => {
      onChange(items.map((item, i) => i === index ? { ...item, ...patch } : item))
    }

    return (
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={item.label}
              onChange={e => updateBadge(i, { label: e.target.value })}
              placeholder="バッジラベル"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
            {allowColorPicker && (
              <ColorPicker value={item.color ?? ''} onChange={v => updateBadge(i, { color: v })} defaultColor={defaultColor || '#6b7280'} />
            )}
            <button
              type="button"
              onClick={() => removeBadge(i)}
              className="text-gray-300 hover:text-red-400 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addBadge}
          className="text-sm text-sky-500 hover:text-sky-700 font-medium text-left transition-colors"
        >
          + バッジを追加
        </button>
      </div>
    )
  },
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const allowColorPicker = blockConfig.allowColorPicker === true
    const defaultColor = typeof blockConfig.defaultColor === 'string' ? blockConfig.defaultColor : ''
    return (
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={allowColorPicker} id="badgelist-allowColorPicker" className="rounded"
            onChange={e => onChange({ ...blockConfig, allowColorPicker: e.target.checked || undefined })} />
          <label htmlFor="badgelist-allowColorPicker" className="text-[10px] text-gray-500">個別カラーピッカーを表示（allowColorPicker）</label>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-24 shrink-0">デフォルト色</span>
          <ColorPicker value={defaultColor ?? ''} onChange={v => onChange({ ...blockConfig, defaultColor: v || undefined })} defaultColor="#6b7280" />
        </div>
      </div>
    )
  },
}
