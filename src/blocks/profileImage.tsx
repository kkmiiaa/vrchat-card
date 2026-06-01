'use client'
import type { ComponentDef, ComponentCardProps, ComponentFormProps } from './types'

type ProfileImageValue = {
  base64: string | null
  url: string | null
}

function ProfileImageCard({ value, ctx, variant }: ComponentCardProps<ProfileImageValue>) {
  const src = value.url ?? value.base64 ?? null
  const isCircle = variant === 'circle'
  const isGlass = variant === 'glass'
  const borderRadius = isCircle ? '50%' : ctx.cardWidth * 0.018

  const img = (
    <div style={{
      width: '100%',
      aspectRatio: '1',
      borderRadius,
      overflow: 'hidden',
      background: '#e5e7eb',
      flexShrink: 0,
    }}>
      {src
        ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: ctx.cardWidth * 0.022, fontFamily: ctx.fontFamily }}>Photo</div>
      }
    </div>
  )

  if (isGlass) {
    const glassRadius = ctx.cardWidth * 0.018
    return (
      <div style={{
        width: '100%',
        aspectRatio: '1',
        borderRadius: glassRadius,
        overflow: 'hidden',
        background: '#e5e7eb',
        border: '1px solid rgba(255,255,255,0.75)',
        boxShadow: '0 0 12px rgba(0,0,0,0.08)',
        flexShrink: 0,
      }}>
        {src
          ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: ctx.cardWidth * 0.022, fontFamily: ctx.fontFamily }}>Photo</div>
        }
      </div>
    )
  }

  return img
}

export const profileImageComponent: ComponentDef<ProfileImageValue> = {
  key: 'profileImage',
  defaultValue: { base64: null, url: null },
  variants: ['simple', 'circle', 'glass'],
  CardItem: ProfileImageCard,
  FormItem({ value, onChange, t }) {
    const hasImage = !!(value.base64 ?? value.url)

    const handleFile = (file: File | null) => {
      if (!file) { onChange({ base64: null, url: null }); return }
      const reader = new FileReader()
      reader.onload = e => onChange({ base64: e.target?.result as string, url: null })
      reader.readAsDataURL(file)
    }

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={e => handleFile(e.target.files?.[0] ?? null)}
            className="hidden"
            id="profile-image-upload"
          />
          <label
            htmlFor="profile-image-upload"
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-1.5 px-3 rounded-lg cursor-pointer transition-colors flex-shrink-0"
          >
            {t.chooseFile}
          </label>
          <span className="text-sm text-gray-500 truncate flex-1">
            {hasImage ? '設定済み' : t.noFileChosen}
          </span>
          {hasImage && (
            <button
              type="button"
              onClick={() => handleFile(null)}
              className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 text-base leading-none"
            >✕</button>
          )}
        </div>
      </div>
    )
  },
}
