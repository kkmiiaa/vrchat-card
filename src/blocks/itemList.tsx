'use client'
import type { ComponentDef } from './types'
import { SURFACE_STYLE } from './types'

export type ItemEntry = {
  category: string
  name: string
  code?: string
  url?: string
}

export type ItemListValue = ItemEntry[]

const PRESETS = ['BASE AVATAR', 'OUTFIT', 'SHOES', 'HAIR', 'ACCESSORY', 'SHADER', 'GIMMICK', 'WORLD']

const EMPTY_ENTRY: ItemEntry = { category: '', name: '', code: '', url: '' }

function ExternalLinkIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

export const itemListComponent: ComponentDef<ItemListValue> = {
  key: 'item-list',
  defaultValue: [],
  variants: ['simple', 'compact'],
  surfaceMode: 'internal',

  CardItem({ value, ctx, variant = 'simple', blockConfig, isInteractive }) {
    const items: ItemListValue = Array.isArray(value) ? value : []
    const visible = items.filter(e => e.name)

    if (!visible.length) {
      if (blockConfig?.hideWhenEmpty) return null
      return (
        <span style={{ fontSize: ctx.fontSize.sm, color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>
          –
        </span>
      )
    }

    const isCompact = variant === 'compact'
    const fs = isCompact ? ctx.fontSize.xs : ctx.fontSize.sm
    const catFs = ctx.fontSize.xs
    const gap = isCompact ? ctx.cardWidth * 0.005 : ctx.cardWidth * 0.008
    const ss = ctx.surface && ctx.surface !== 'transparent' ? SURFACE_STYLE[ctx.surface] : null

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap, width: '100%' }}>
        {visible.map((entry, i) => {
          const inner = (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: ctx.cardWidth * 0.006,
                width: '100%',
                padding: `${ctx.cardWidth * 0.004}px ${ctx.cardWidth * 0.006}px`,
                borderRadius: ctx.cardWidth * 0.005,
                background: ss ? ss.background : 'rgba(255,255,255,0.45)',
                border: ss ? ss.border : '0.5px solid rgba(0,0,0,0.08)',
                boxShadow: ss?.boxShadow,
                boxSizing: 'border-box',
                cursor: (isInteractive && entry.url) ? 'pointer' : 'default',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              {entry.category && (
                <span style={{
                  fontSize: catFs * 0.85,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: ctx.theme.accent,
                  fontFamily: ctx.fontFamily,
                  whiteSpace: 'nowrap',
                  minWidth: ctx.cardWidth * 0.07,
                  flexShrink: 0,
                }}>
                  {entry.category.toUpperCase()}
                </span>
              )}
              <span style={{
                fontSize: fs,
                color: ctx.theme.text,
                fontFamily: ctx.fontFamily,
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {entry.name}
              </span>
              {entry.code && (
                <span style={{
                  fontSize: catFs * 0.9,
                  color: ctx.theme.subText,
                  fontFamily: ctx.fontFamily,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {entry.code}
                </span>
              )}
              {entry.url && (
                <span style={{
                  color: ctx.theme.accent,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <ExternalLinkIcon size={catFs} />
                </span>
              )}
            </div>
          )

          if (isInteractive && entry.url) {
            return (
              <a key={i} href={entry.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                {inner}
              </a>
            )
          }
          return <div key={i}>{inner}</div>
        })}
      </div>
    )
  },

  FormItem({ value, onChange }) {
    const items: ItemListValue = Array.isArray(value) ? value : []

    const update = (i: number, patch: Partial<ItemEntry>) =>
      onChange(items.map((e, idx) => idx === i ? { ...e, ...patch } : e))
    const remove = (i: number) =>
      onChange(items.filter((_, idx) => idx !== i))
    const add = () =>
      onChange([...items, { ...EMPTY_ENTRY }])

    return (
      <div className="flex flex-col gap-3">
        {items.map((entry, i) => (
          <div key={i} className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-2">
              <input
                list={`item-list-category-presets-${i}`}
                value={entry.category}
                onChange={e => update(i, { category: e.target.value })}
                placeholder="カテゴリ（例: HAIR）"
                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-300 uppercase"
              />
              <datalist id={`item-list-category-presets-${i}`}>
                {PRESETS.map(p => <option key={p} value={p} />)}
              </datalist>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-gray-300 hover:text-red-400 transition-colors text-sm leading-none shrink-0"
              >
                ✕
              </button>
            </div>
            <input
              value={entry.name}
              onChange={e => update(i, { name: e.target.value })}
              placeholder="アイテム名（例: Ash Lilac Waves）"
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-300"
            />
            <div className="flex gap-2">
              <input
                value={entry.code ?? ''}
                onChange={e => update(i, { code: e.target.value })}
                placeholder="コード（例: #HA-12）"
                className="w-28 px-2 py-1 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-300"
              />
              <input
                type="url"
                value={entry.url ?? ''}
                onChange={e => update(i, { url: e.target.value })}
                placeholder="Booth URL"
                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-300"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="text-sm text-sky-500 hover:text-sky-700 font-medium text-left transition-colors"
        >
          + アイテムを追加
        </button>
      </div>
    )
  },
}
