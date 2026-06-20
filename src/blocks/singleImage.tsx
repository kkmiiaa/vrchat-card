'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { useImageUpload } from '@/lib/ImageUploadContext'

export type SingleImageValue = {
  url: string | null
  base64: string | null
}

const ASPECT_RATIO_OPTIONS = [
  { value: '3/4',  label: '3:4（縦長）' },
  { value: '2/3',  label: '2:3（縦長）' },
  { value: '1/1',  label: '1:1（正方形）' },
  { value: '4/3',  label: '4:3（横長）' },
  { value: '16/9', label: '16:9（横長）' },
]

export const singleImageComponent: ComponentDef<SingleImageValue> = {
  key: 'single-image',
  defaultValue: { url: null, base64: null },
  variants: ['simple'],
  isEmpty: v => !v?.url && !v?.base64,
  surfaceMode: 'internal',

  CardItem({ value, ctx, blockConfig }) {
    const src = value?.url ?? value?.base64 ?? null
    const aspectRatio = typeof blockConfig?.aspectRatio === 'string' ? blockConfig.aspectRatio : '3/4'
    const borderRadius = ctx.cardWidth * 0.012

    return (
      <div style={{
        width: '100%',
        aspectRatio,
        borderRadius,
        overflow: 'hidden',
        background: '#e5e7eb',
        flexShrink: 0,
      }}>
        {src
          ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: ctx.cardWidth * 0.02, fontFamily: ctx.fontFamily }}>Image</div>
        }
      </div>
    )
  },

  FormItem({ value, onChange }) {
    const uploadCtx = useImageUpload()
    const src = value?.url ?? value?.base64 ?? null

    const handleFile = async (file: File | null) => {
      if (!file) { onChange({ url: null, base64: null }); return }
      const reader = new FileReader()
      reader.onload = e => onChange({ url: null, base64: e.target?.result as string })
      reader.readAsDataURL(file)
      if (uploadCtx) {
        const url = await uploadCtx.upload('single-image', file).catch(() => null)
        if (url) onChange({ url, base64: null })
      }
    }

    return (
      <div className="flex flex-col gap-2">
        <input type="file" accept="image/*" onChange={e => handleFile(e.target.files?.[0] ?? null)}
          className="hidden" id="single-image-upload" />
        <label htmlFor="single-image-upload" className="cursor-pointer flex items-center gap-2">
          {src
            ? <img src={src} alt="" className="h-24 w-auto object-contain rounded border border-gray-200 bg-gray-50" />
            : <div className="h-24 w-16 flex items-center justify-center rounded border-2 border-dashed border-gray-200 text-gray-300 text-xs bg-white">画像</div>
          }
          <span className="text-xs text-gray-400">画像を選択</span>
        </label>
        {src && (
          <button type="button" onClick={() => onChange({ url: null, base64: null })}
            className="text-xs text-red-400 hover:text-red-600 text-left">削除</button>
        )}
      </div>
    )
  },

  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const aspectRatio = typeof blockConfig.aspectRatio === 'string' ? blockConfig.aspectRatio : '3/4'
    return (
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-20 shrink-0">縦横比</span>
          <select
            value={aspectRatio}
            onChange={e => onChange({ ...blockConfig, aspectRatio: e.target.value })}
            className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
          >
            {ASPECT_RATIO_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    )
  },
}
