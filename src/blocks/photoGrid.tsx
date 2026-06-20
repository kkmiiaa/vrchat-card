'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { useImageUpload } from '@/lib/ImageUploadContext'

export type PhotoGridValue = Array<{ url: string | null; base64: string | null }>

const MAX_PHOTOS = 4

export const photoGridComponent: ComponentDef<PhotoGridValue> = {
  key: 'photo-grid',
  defaultValue: [],
  variants: ['simple'],
  isEmpty: v => !Array.isArray(v) || !v.some(item => item.url || item.base64),
  surfaceMode: 'internal',

  CardItem({ value, ctx, blockConfig }) {
    const items = Array.isArray(value) ? value.slice(0, MAX_PHOTOS) : []
    const filled = items.filter(item => item.url || item.base64)
    if (!filled.length) return (
      <span style={{ fontSize: ctx.fontSize.sm, color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>–</span>
    )

    const cols = typeof blockConfig?.columns === 'number' ? blockConfig.columns : 3
    const gap = ctx.cardWidth * 0.006
    const borderRadius = ctx.cardWidth * 0.008

    // gallery と同様、与えられた高さを満たすよう stretch
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(cols, filled.length)}, 1fr)`,
        gap,
        width: '100%',
        height: '100%',
      }}>
        {filled.map((item, i) => {
          const src = item.url ?? item.base64
          return (
            <div key={i} style={{ borderRadius, overflow: 'hidden', background: '#e5e7eb', minHeight: 0 }}>
              {src && <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
            </div>
          )
        })}
      </div>
    )
  },

  FormItem({ value, onChange }) {
    const items: PhotoGridValue = Array.isArray(value) ? value.slice(0, MAX_PHOTOS) : []
    const uploadCtx = useImageUpload()

    const update = (i: number, patch: { url: string | null; base64: string | null }) =>
      onChange(items.map((item, idx) => idx === i ? patch : item))
    const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))
    const add = () => { if (items.length < MAX_PHOTOS) onChange([...items, { url: null, base64: null }]) }

    const handleFile = async (i: number, file: File | null) => {
      if (!file) { update(i, { url: null, base64: null }); return }
      const reader = new FileReader()
      reader.onload = e => update(i, { url: null, base64: e.target?.result as string })
      reader.readAsDataURL(file)
      if (uploadCtx) {
        const url = await uploadCtx.upload(`photo-grid-${i}`, file).catch(() => null)
        if (url) update(i, { url, base64: null })
      }
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => {
            const src = item.url ?? item.base64
            return (
              <div key={i} className="relative">
                <input type="file" accept="image/*" onChange={e => handleFile(i, e.target.files?.[0] ?? null)}
                  className="hidden" id={`photo-grid-${i}`} />
                <label htmlFor={`photo-grid-${i}`} className="cursor-pointer block">
                  {src
                    ? <img src={src} alt="" className="h-16 w-16 object-cover rounded border border-gray-200 bg-gray-50" />
                    : <div className="h-16 w-16 flex items-center justify-center rounded border-2 border-dashed border-gray-200 text-gray-300 text-lg bg-white">+</div>
                  }
                </label>
                <button type="button" onClick={() => remove(i)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-red-400 text-[10px] leading-none flex items-center justify-center">
                  ✕
                </button>
              </div>
            )
          })}
          {items.length < MAX_PHOTOS && (
            <button type="button" onClick={add}
              className="h-16 w-16 flex items-center justify-center rounded border-2 border-dashed border-gray-200 text-gray-300 text-2xl hover:border-sky-300 hover:text-sky-300 transition-colors">
              +
            </button>
          )}
        </div>
        <p className="text-[10px] text-gray-400">最大{MAX_PHOTOS}枚</p>
      </div>
    )
  },

  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const columns = typeof blockConfig.columns === 'number' ? blockConfig.columns : 3
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[10px] text-gray-500 w-20 shrink-0">列数</span>
        <input type="number" min={2} max={4} value={columns}
          onChange={e => onChange({ ...blockConfig, columns: Number(e.target.value) })}
          className="w-16 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
      </div>
    )
  },
}
