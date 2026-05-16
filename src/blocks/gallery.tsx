'use client'
import { useEffect } from 'react'
import type { Block, GalleryValue } from './types'

export const galleryBlock: Block<GalleryValue> = {
  key: 'gallery',
  defaultValue: { enabled: false, images: [null, null, null], base64: [null, null, null] },
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
      <div className="flex flex-col gap-3 border-t pt-4">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.galleryImages}</h2>

        {/* トグルボタン */}
        <button
          type="button"
          onClick={() => update({ enabled: !value.enabled })}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm border font-medium transition-all ${
            value.enabled
              ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]'
              : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
          }`}
        >
          {t.showGallery}
        </button>

        {value.enabled && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map(index => (
              <div key={index} className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-700">{t.galleryImage} {index + 1}</span>
                <label className="flex items-center gap-3">
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
                  <span className="text-sm text-gray-500 truncate">
                    {value.images[index] instanceof File ? (value.images[index] as File).name : t.noFileChosen}
                  </span>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  },
}
