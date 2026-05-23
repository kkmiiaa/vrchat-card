'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { type MarkDefinition, DEFAULT_MARKS, getMarkStyle } from './markListShared'
import { ColorPicker } from './colorPicker'

export type { MarkDefinition }
export type { MarkListItem } from './markListShared'
export { DEFAULT_MARKS } from './markListShared'

type ConfigItem = { label: string; required?: boolean }
type MarkMap = Record<number, string>
type CustomItem = { label: string; mark: string }

export const markListComponent: ComponentDef<{ marks: MarkMap; custom: CustomItem[] }> = {
  key: 'mark-list',
  defaultValue: { marks: {}, custom: [] },
  variants: ['default'],
  CardItem({ value, ctx, blockConfig }) {
    const markDefs = (blockConfig?.marks as MarkDefinition[] | undefined) ?? DEFAULT_MARKS
    const configItems: ConfigItem[] = Array.isArray(blockConfig?.items) ? blockConfig!.items as ConfigItem[] : []
    const markMap: MarkMap = (value?.marks && typeof value.marks === 'object') ? value.marks : {}
    const customItems: CustomItem[] = Array.isArray(value?.custom) ? value.custom : []

    const allItems: { label: string; mark: string }[] = [
      ...configItems.map((item, i) => ({ label: item.label, mark: markMap[i] ?? '-' })),
      ...customItems,
    ].filter(item => item.mark !== '-' && item.mark !== '―' && item.label)

    if (!allItems.length) return null
    const fs = ctx.fontSize.sm
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignSelf: 'flex-start', alignContent: 'flex-start' }}>
        {allItems.map((item, i) => {
          const style = getMarkStyle(item.mark, markDefs)
          return (
            <span key={i} style={{ fontSize: fs, padding: '2px 8px', borderRadius: 999, background: style.bg, color: style.text, fontFamily: ctx.fontFamily }}>
              {item.mark} {item.label}
            </span>
          )
        })}
      </div>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    const configMarks = blockConfig?.marks as MarkDefinition[] | undefined
    const hasMarks = configMarks && configMarks.length > 0
    const markDefs = hasMarks ? configMarks : DEFAULT_MARKS
    const configItems: ConfigItem[] = Array.isArray(blockConfig?.items) ? blockConfig!.items as ConfigItem[] : []
    const maxCustomItems = typeof blockConfig?.maxCustomItems === 'number' ? blockConfig.maxCustomItems : 0
    const markMap: MarkMap = (value?.marks && typeof value.marks === 'object') ? value.marks : {}
    const customItems: CustomItem[] = Array.isArray(value?.custom) ? value.custom : []

    const setMark = (i: number, mark: string) => onChange({ ...value, marks: { ...markMap, [i]: mark } })
    const setCustom = (i: number, patch: Partial<CustomItem>) =>
      onChange({ ...value, custom: customItems.map((c, idx) => idx === i ? { ...c, ...patch } : c) })
    const addCustom = () => onChange({ ...value, custom: [...customItems, { label: '', mark: '-' }] })
    const removeCustom = (i: number) => onChange({ ...value, custom: customItems.filter((_, idx) => idx !== i) })

    if (!configItems.length) {
      return <p className="text-xs text-gray-400">blockConfig に items を設定してください</p>
    }
    return (
      <div className="flex flex-col gap-2">
        {configItems.map((item, i) => {
          const mark = markMap[i] ?? '-'
          const style = hasMarks ? getMarkStyle(mark, markDefs) : { bg: 'transparent', text: '#6b7280', border: undefined }
          return (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: style.bg, border: `1px solid ${style.border ?? 'transparent'}` }}>
              {hasMarks && (
                <select value={mark} onChange={e => setMark(i, e.target.value)}
                  className="w-14 py-1 rounded-md text-sm font-semibold focus:outline-none bg-transparent border-0"
                  style={{ color: style.text }}>
                  <option value="-">―</option>
                  {markDefs.map(m => <option key={m.symbol} value={m.symbol}>{m.symbol}</option>)}
                </select>
              )}
              <span className="flex-1 text-sm text-gray-600">{item.label}</span>
            </div>
          )
        })}
        {customItems.map((item, i) => {
          const style = hasMarks ? getMarkStyle(item.mark, markDefs) : { bg: 'transparent', text: '#6b7280', border: undefined }
          return (
            <div key={`c${i}`} className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: style.bg, border: `1px solid ${style.border ?? 'transparent'}` }}>
              {hasMarks && (
                <select value={item.mark} onChange={e => setCustom(i, { mark: e.target.value })}
                  className="w-14 py-1 rounded-md text-sm font-semibold focus:outline-none bg-transparent border-0"
                  style={{ color: style.text }}>
                  <option value="-">―</option>
                  {markDefs.map(m => <option key={m.symbol} value={m.symbol}>{m.symbol}</option>)}
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
        {maxCustomItems > 0 && customItems.length < maxCustomItems && (
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
    const maxCustomItems = typeof blockConfig.maxCustomItems === 'number' ? blockConfig.maxCustomItems : ''

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
        <div className="flex flex-col gap-1">
          <p className="text-[10px] text-gray-400">リスト項目（items）</p>
          {configItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 w-4 shrink-0">{i + 1}</span>
              <input type="text" value={item.label} placeholder="例: ボイチャ"
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
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-28 shrink-0">カスタム最大件数</span>
          <input type="number" min={0} value={maxCustomItems} placeholder="0"
            onChange={e => onChange({ ...blockConfig, maxCustomItems: e.target.value ? Number(e.target.value) : undefined })}
            className="w-20 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
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
