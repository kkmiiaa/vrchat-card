'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { SURFACE_STYLE } from './types'
import { ColorPicker } from './colorPicker'
import { useImageUpload } from '@/lib/ImageUploadContext'

export type ItemEntry = {
  category: string
  name: string
  url?: string
  imageUrl?: string  // アイテムサムネイル（Storage URL）
}

export type ItemListValue = ItemEntry[]

const EMPTY_ENTRY: ItemEntry = { category: '', name: '', url: '' }

function ExternalLinkIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function parseCategoryPresets(blockConfig?: Record<string, unknown>): string[] {
  const raw = blockConfig?.categoryPresets
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter((v): v is string => typeof v === 'string')
  if (typeof raw === 'string') return raw.split('\n').map(s => s.trim()).filter(Boolean)
  return []
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
    const thumbSize = isCompact ? ctx.cardWidth * 0.028 : ctx.cardWidth * 0.034
    const accentColor = typeof blockConfig?.accentColor === 'string' ? blockConfig.accentColor : ctx.theme.accent

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
              {entry.imageUrl && (
                <div style={{
                  width: thumbSize,
                  height: thumbSize,
                  borderRadius: ctx.cardWidth * 0.003,
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: '#f3f4f6',
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entry.imageUrl}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              )}
              {entry.category && (
                <span style={{
                  fontSize: catFs * 0.85,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: accentColor,
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
              {entry.url && (
                <span style={{ color: accentColor, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
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

  FormItem({ value, onChange, blockConfig }) {
    const items: ItemListValue = Array.isArray(value) ? value : []
    const uploadCtx = useImageUpload()
    const categoryPresets = parseCategoryPresets(blockConfig)

    const update = (i: number, patch: Partial<ItemEntry>) =>
      onChange(items.map((e, idx) => idx === i ? { ...e, ...patch } : e))
    const remove = (i: number) =>
      onChange(items.filter((_, idx) => idx !== i))
    const add = () =>
      onChange([...items, { ...EMPTY_ENTRY }])

    const handleImage = async (i: number, file: File | null) => {
      if (!file) { update(i, { imageUrl: undefined }); return }
      if (uploadCtx) {
        const url = await uploadCtx.upload(`item-${i}`, file).catch(() => null)
        if (url) update(i, { imageUrl: url })
      }
    }

    return (
      <div className="flex flex-col gap-3">
        {items.map((entry, i) => (
          <div key={i} className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-2">
              <input
                list={`item-list-category-presets-${i}`}
                value={entry.category}
                onChange={e => update(i, { category: e.target.value })}
                placeholder="カテゴリ（任意）"
                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-300 uppercase"
              />
              {categoryPresets.length > 0 && (
                <datalist id={`item-list-category-presets-${i}`}>
                  {categoryPresets.map(p => <option key={p} value={p} />)}
                </datalist>
              )}
              <button type="button" onClick={() => remove(i)}
                className="text-gray-300 hover:text-red-400 transition-colors text-sm leading-none shrink-0">
                ✕
              </button>
            </div>
            <input
              value={entry.name}
              onChange={e => update(i, { name: e.target.value })}
              placeholder="アイテム名"
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-300"
            />
            <div className="flex gap-2">
              <input
                type="url"
                value={entry.url ?? ''}
                onChange={e => update(i, { url: e.target.value || undefined })}
                placeholder="URL（任意）"
                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-300"
              />
            </div>
            {/* 画像: ファイルアップロード（CardEditor内）またはURL直接入力（テンプレートビルダー等） */}
            <div className="flex items-center gap-2">
              {uploadCtx ? (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImage(i, e.target.files?.[0] ?? null)}
                    className="hidden"
                    id={`item-image-${i}`}
                  />
                  <label htmlFor={`item-image-${i}`} className="cursor-pointer flex items-center gap-2">
                    {entry.imageUrl
                      ? <img src={entry.imageUrl} alt="" className="h-10 w-10 object-cover rounded border border-gray-200 bg-gray-50" />
                      : <div className="h-10 w-10 flex items-center justify-center rounded border-2 border-dashed border-gray-200 text-gray-300 text-lg bg-white">+</div>
                    }
                    <span className="text-xs text-gray-400">サムネイル（任意）</span>
                  </label>
                  {entry.imageUrl && (
                    <button type="button" onClick={() => update(i, { imageUrl: undefined })}
                      className="text-xs text-gray-300 hover:text-red-400">削除</button>
                  )}
                </>
              ) : (
                <input
                  type="url"
                  value={entry.imageUrl ?? ''}
                  onChange={e => update(i, { imageUrl: e.target.value || undefined })}
                  placeholder="サムネイル URL（任意）"
                  className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-300"
                />
              )}
            </div>
          </div>
        ))}
        <button type="button" onClick={add}
          className="text-sm text-sky-500 hover:text-sky-700 font-medium text-left transition-colors">
          + アイテムを追加
        </button>
      </div>
    )
  },

  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const presets = typeof blockConfig.categoryPresets === 'string'
      ? blockConfig.categoryPresets
      : Array.isArray(blockConfig.categoryPresets)
        ? (blockConfig.categoryPresets as string[]).join('\n')
        : ''
    const accentColor = typeof blockConfig.accentColor === 'string' ? blockConfig.accentColor : ''

    return (
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-500">カテゴリプリセット（1行1項目）</span>
          <textarea
            value={presets}
            onChange={e => onChange({ ...blockConfig, categoryPresets: e.target.value || undefined })}
            placeholder={'例:\nBASE AVATAR\nHAIR\nOUTFIT'}
            rows={4}
            className="text-xs border border-gray-200 rounded px-2 py-1 bg-white resize-none font-mono"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-28 shrink-0">アクセントカラー</span>
          <ColorPicker
            value={accentColor || '#00AADB'}
            onChange={v => onChange({ ...blockConfig, accentColor: v })}
          />
          {accentColor && (
            <button type="button" onClick={() => onChange({ ...blockConfig, accentColor: undefined })}
              className="text-[10px] text-gray-400 hover:text-red-400">
              リセット
            </button>
          )}
        </div>
      </div>
    )
  },
}
