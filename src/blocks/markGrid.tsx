'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { type MarkListItem, type MarkDefinition, DEFAULT_MARKS, defaultItems, getMarkStyle } from './markListShared'
import { ColorPicker } from './colorPicker'

export { DEFAULT_MARKS, defaultItems }

type MarkMap = Record<number, string>
type CustomItem = { label: string; mark: string }
type MarkGridValue = { marks: MarkMap; custom: CustomItem[]; removed?: number[] }
type ConfigItem = { label: string; required?: boolean }

export const markGridComponent: ComponentDef<MarkGridValue> = {
  key: 'mark-grid',
  defaultValue: { marks: {}, custom: [] },
  variants: ['default', 'white'],
  CardItem({ value, ctx, variant, blockConfig }) {
    const markDefs = (blockConfig?.marks as MarkDefinition[] | undefined) ?? DEFAULT_MARKS
    const cols = typeof blockConfig?.cols === 'number' ? blockConfig.cols : 3
    const configItems = Array.isArray(blockConfig?.items) ? blockConfig!.items as ConfigItem[] : []
    const markMap: MarkMap = (value?.marks && typeof value.marks === 'object') ? value.marks : {}
    const customItems: CustomItem[] = Array.isArray(value?.custom) ? value.custom : []
    const removed: number[] = Array.isArray(value?.removed) ? value.removed : []

    const rows = typeof blockConfig?.rows === 'number' ? blockConfig.rows : undefined

    const dataItems: { label: string; mark: string }[] = [
      ...configItems
        .map((item, i) => ({ label: item.label, mark: markMap[i] ?? '-', idx: i }))
        .filter(item => !removed.includes(item.idx)),
      ...customItems,
    ]

    // cols/rows が指定されている場合は固定スロット数を確保
    const fixedSlotCount = rows !== undefined ? cols * rows : undefined
    const allItems = fixedSlotCount !== undefined
      ? Array.from({ length: fixedSlotCount }, (_, i) => dataItems[i] ?? { label: '', mark: '-' })
      : dataItems

    const fs = ctx.fontSize.xs
    const markFs = ctx.fontSize.md
    const isWhite = variant === 'white'
    const gap = isWhite ? 1 : 4
    const gridRows = rows !== undefined ? `repeat(${rows}, 1fr)` : undefined
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, ...(gridRows ? { gridTemplateRows: gridRows } : {}), gap, width: '100%' }}>
        {allItems.map((slot, i) => {
          const isDash = slot.mark === '-'
          const style = getMarkStyle(slot.mark, markDefs)
          const cellBg = isWhite
            ? 'rgba(255,255,255,0.85)'
            : slot.label ? 'rgba(255,255,255,0.85)' : 'transparent'
          return (
            <div key={i} style={{
              background: cellBg,
              borderRadius: ctx.cardWidth * 0.006,
              padding: '5px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}>
              {slot.label && <>
                <div style={{ fontSize: fs, color: '#6b7280', fontFamily: ctx.fontFamily, textAlign: 'center', wordBreak: 'break-all', lineHeight: 1.2 }}>{slot.label}</div>
                {!isDash && <div style={{ fontSize: markFs, fontWeight: 700, color: style.text, fontFamily: ctx.fontFamily }}>{slot.mark}</div>}
              </>}
            </div>
          )
        })}
      </div>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    const configMarks = blockConfig?.marks as MarkDefinition[] | undefined
    const hasMarks = configMarks && configMarks.length > 0
    const marks = hasMarks ? configMarks : DEFAULT_MARKS
    const maxItems = typeof blockConfig?.maxItems === 'number' ? blockConfig.maxItems : 0
    const configItems = Array.isArray(blockConfig?.items) ? blockConfig!.items as ConfigItem[] : []
    const markMap: MarkMap = (value?.marks && typeof value.marks === 'object') ? value.marks : {}
    const customItems: CustomItem[] = Array.isArray(value?.custom) ? value.custom : []
    const removed: number[] = Array.isArray(value?.removed) ? value.removed : []

    const visibleTemplateCount = configItems.length - removed.length
    const totalCount = visibleTemplateCount + customItems.length
    const canAdd = maxItems === 0 || totalCount < maxItems

    const setMark = (i: number, mark: string) => onChange({ ...value, marks: { ...markMap, [i]: mark } })
    const removeTemplate = (i: number) => {
      const next = [...removed, i]
      const nextMarkMap = { ...markMap }
      delete nextMarkMap[i]
      onChange({ ...value, marks: nextMarkMap, removed: next })
    }
    const setCustom = (i: number, patch: Partial<CustomItem>) =>
      onChange({ ...value, custom: customItems.map((c, idx) => idx === i ? { ...c, ...patch } : c) })
    const addCustom = () => onChange({ ...value, custom: [...customItems, { label: '', mark: '-' }] })
    const removeCustom = (i: number) => onChange({ ...value, custom: customItems.filter((_, idx) => idx !== i) })

    if (!configItems.length) {
      return <p className="text-xs text-gray-400">blockConfig に items を設定してください</p>
    }
    return (
      <div className="flex flex-col gap-1.5">
        {configItems.map((item, i) => {
          if (removed.includes(i)) return null
          const mark = markMap[i] ?? '-'
          const style = hasMarks ? getMarkStyle(mark, marks) : { bg: 'transparent', text: '#6b7280', border: undefined }
          return (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: style.bg, border: `1px solid ${style.border ?? 'transparent'}` }}>
              {hasMarks && (
                <select value={mark} onChange={e => setMark(i, e.target.value)}
                  className="w-14 py-1 rounded-md text-sm font-semibold focus:outline-none bg-transparent border-0"
                  style={{ color: style.text }}>
                  <option value="-">―</option>
                  {marks.map(m => <option key={m.symbol} value={m.symbol}>{m.symbol}</option>)}
                </select>
              )}
              <span className="flex-1 text-sm text-gray-600">{item.label}</span>
              {!item.required && (
                <button onClick={() => removeTemplate(i)}
                  className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none shrink-0">✕</button>
              )}
            </div>
          )
        })}
        {customItems.map((item, i) => {
          const style = hasMarks ? getMarkStyle(item.mark, marks) : { bg: 'transparent', text: '#6b7280', border: undefined }
          return (
            <div key={`c${i}`} className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: style.bg, border: `1px solid ${style.border ?? 'transparent'}` }}>
              {hasMarks && (
                <select value={item.mark} onChange={e => setCustom(i, { mark: e.target.value })}
                  className="w-14 py-1 rounded-md text-sm font-semibold focus:outline-none bg-transparent border-0"
                  style={{ color: style.text }}>
                  <option value="-">―</option>
                  {marks.map(m => <option key={m.symbol} value={m.symbol}>{m.symbol}</option>)}
                </select>
              )}
              <input type="text" value={item.label} placeholder="カスタム項目"
                onChange={e => setCustom(i, { label: e.target.value })}
                className="flex-1 px-2 py-1 text-sm bg-transparent border-0 focus:outline-none"
                style={{ color: style.text }} />
              <button onClick={() => removeCustom(i)}
                className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none shrink-0">✕</button>
            </div>
          )
        })}
        {canAdd && (
          <button onClick={addCustom}
            className="mt-1 text-sm text-sky-500 hover:text-sky-700 font-medium text-left transition-colors">
            + カスタム項目を追加
          </button>
        )}
      </div>
    )
  },
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    type MarkRow = { symbol: string; color: string; bg: string }
    const marks: MarkRow[] = Array.isArray(blockConfig.marks) ? blockConfig.marks as MarkRow[] : []
    const configItems: ConfigItem[] = Array.isArray(blockConfig.items) ? blockConfig.items as ConfigItem[] : []
    const cols = typeof blockConfig.cols === 'number' ? blockConfig.cols : ''
    const rows = typeof blockConfig.rows === 'number' ? blockConfig.rows : ''
    const maxItems = typeof blockConfig.maxItems === 'number' ? blockConfig.maxItems : ''

    const updateMark = (i: number, patch: Partial<MarkRow>) =>
      onChange({ ...blockConfig, marks: marks.map((m, idx) => idx === i ? { ...m, ...patch } : m) })
    const addMark = () => onChange({ ...blockConfig, marks: [...marks, { symbol: '', color: '#6b7280', bg: '#f9fafb' }] })
    const removeMark = (i: number) => onChange({ ...blockConfig, marks: marks.filter((_, idx) => idx !== i) })

    const updateItem = (i: number, patch: Partial<ConfigItem>) =>
      onChange({ ...blockConfig, items: configItems.map((v, idx) => idx === i ? { ...v, ...patch } : v) })
    const addItem = () => onChange({ ...blockConfig, items: [...configItems, { label: '' }] })
    const removeItem = (i: number) => onChange({ ...blockConfig, items: configItems.filter((_, idx) => idx !== i) })

    return (
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 shrink-0">列数</span>
            <input type="number" min={1} max={6} value={cols} placeholder="3"
              onChange={e => onChange({ ...blockConfig, cols: e.target.value ? Number(e.target.value) : undefined })}
              className="w-16 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 shrink-0">行数</span>
            <input type="number" min={1} max={6} value={rows} placeholder="3"
              onChange={e => onChange({ ...blockConfig, rows: e.target.value ? Number(e.target.value) : undefined })}
              className="w-16 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-28 shrink-0">最大件数（合計）</span>
          <input type="number" min={0} value={maxItems} placeholder="制限なし"
            onChange={e => onChange({ ...blockConfig, maxItems: e.target.value ? Number(e.target.value) : undefined })}
            className="w-20 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-[10px] text-gray-400">グリッド項目（items）</p>
          {configItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 w-4 shrink-0">{i + 1}</span>
              <input type="text" value={item.label} placeholder="例: 触る"
                onChange={e => updateItem(i, { label: e.target.value })}
                className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
              <label className="flex items-center gap-1 text-[10px] text-gray-500 shrink-0">
                <input type="checkbox" checked={item.required === true}
                  onChange={e => updateItem(i, { required: e.target.checked || undefined })} />
                必須
              </label>
              <button type="button" onClick={() => removeItem(i)} className="text-xs text-red-400 hover:text-red-600">×</button>
            </div>
          ))}
          <button type="button" onClick={addItem} className="text-xs text-sky-500 hover:text-sky-700 mt-1">+ 追加</button>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-[10px] text-gray-400">マーク記号（marks）</p>
          {marks.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={m.symbol} placeholder="◎"
                onChange={e => updateMark(i, { symbol: e.target.value })}
                className="w-12 text-xs border border-gray-200 rounded px-2 py-1 bg-white text-center" />
              <ColorPicker value={m.color} onChange={v => updateMark(i, { color: v })} />
              <button type="button" onClick={() => removeMark(i)} className="text-xs text-red-400 hover:text-red-600">×</button>
            </div>
          ))}
          <button type="button" onClick={addMark} className="text-xs text-sky-500 hover:text-sky-700 mt-1">+ 追加</button>
        </div>
      </div>
    )
  },
}
