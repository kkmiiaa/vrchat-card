'use client'
import type { ComponentDef, GalleryValue } from './types'

export const galleryComponent: ComponentDef<GalleryValue> = {
  key: 'gallery',
  defaultValue: { enabled: false, images: [null, null, null], base64: [null, null, null] },
  isEmpty: (v) => !v?.base64?.some(Boolean),
  variants: ['default', 'glass'],
  CardItem({ value, ctx, variant }) {
    if (!value?.base64?.some(Boolean)) return null
    const isGlass = variant === 'glass'
    // 入力済みのスロットだけ表示し、全体を埋める
    const filledSlots = [0, 1, 2].filter(i => value.base64[i])
    const thumbStyle = isGlass
      ? { flex: 1, height: '100%', borderRadius: ctx.cardWidth * 0.008, overflow: 'hidden' as const, background: '#e5e7eb', border: '1px solid rgba(255,255,255,0.75)', boxShadow: '0 0 12px rgba(0,0,0,0.08)' }
      : { flex: 1, height: '100%', borderRadius: 6, overflow: 'hidden' as const, background: '#e5e7eb' }
    return (
      <div style={{ display: 'flex', gap: 4, width: '100%', height: '100%' }}>
        {filledSlots.map(i => {
          const src = value.base64[i]
          return (
            <div key={i} style={thumbStyle}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src!} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          )
        })}
      </div>
    )
  },
  FormItem({ value, onChange, t }) {
    const update = (patch: Partial<GalleryValue>) => onChange({ ...value, ...patch })

    const handleFile = (index: number, file: File | null) => {
      const images = [...value.images]
      images[index] = file
      update({ images })
      if (file) {
        const reader = new FileReader()
        reader.onload = e => {
          const base64 = [...value.base64]
          base64[index] = e.target?.result as string
          update({ images, base64 })
        }
        reader.readAsDataURL(file)
      } else {
        const base64 = [...value.base64]
        base64[index] = null
        update({ images, base64 })
      }
    }

    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map(index => {
          const hasImage = !!value.base64[index]
          return (
            <div key={index} className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-700">{t.galleryImage} {index + 1}</span>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleFile(index, e.target.files?.[0] ?? null)}
                  className="hidden"
                  id={`gallery-image-${index}`}
                />
                <label
                  htmlFor={`gallery-image-${index}`}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-1.5 px-3 rounded-lg cursor-pointer transition-colors flex-shrink-0"
                >
                  {t.chooseFile}
                </label>
                <span className="text-sm text-gray-500 truncate flex-1">
                  {value.images[index] instanceof File ? (value.images[index] as File).name : hasImage ? '設定済み' : t.noFileChosen}
                </span>
                {hasImage && (
                  <button
                    type="button"
                    onClick={() => handleFile(index, null)}
                    className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 text-base leading-none"
                  >✕</button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  },
}
