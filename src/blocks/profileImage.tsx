'use client'
import type { ComponentDef, ComponentCardProps, ComponentFormProps } from './types'

type ProfileImageValue = {
  base64: string | null
  url: string | null
}

function ProfileImageCard({ value, ctx, variant }: ComponentCardProps<ProfileImageValue>) {
  const src = value.url ?? value.base64 ?? null
  const isCircle = variant === 'circle'
  const borderRadius = isCircle ? '50%' : ctx.cardWidth * 0.018

  return (
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
}

export const profileImageComponent: ComponentDef<ProfileImageValue> = {
  key: 'profileImage',
  defaultValue: { base64: null, url: null },
  variants: ['default', 'circle'],
  CardItem: ProfileImageCard,
  FormItem({ value, onChange }: ComponentFormProps<ProfileImageValue>) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">プロフィール画像</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => {
            const file = e.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = ev => onChange({ base64: ev.target?.result as string, url: null })
            reader.readAsDataURL(file)
          }}
          className="text-xs"
        />
      </div>
    )
  },
}
