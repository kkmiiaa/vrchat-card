'use client'

import type { ProfileRow } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'
import HeaderAuth from '@/components/HeaderAuth'

type Card = {
  id: string
  title: string
  image_url: string | null
  visibility: string
  created_at: string
}

type Props = {
  profile: ProfileRow
  slug: string
  cards: Card[]
  isOwner: boolean
}

const SNS_CONFIG: Record<string, { label: string; url: (v: string) => string }> = {
  x:         { label: 'X',        url: v => `https://x.com/${v.replace('@', '')}` },
  discord:   { label: 'Discord',  url: v => `https://discord.com/users/${v}` },
  vrchat:    { label: 'VRChat',   url: v => `https://vrchat.com/home/user/${v}` },
  instagram: { label: 'Instagram',url: v => `https://instagram.com/${v.replace('@', '')}` },
  github:    { label: 'GitHub',   url: v => `https://github.com/${v}` },
}

export default function ProfilePage({ profile, slug, cards, isOwner }: Props) {
  const sns = profile.sns_links ?? {}
  const hasSns = Object.values(sns).some(v => v)
  const initials = (profile.display_name ?? slug).slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-100 h-14 px-6 flex items-center justify-between">
        <Link href="/" className="text-lg font-black tracking-tight text-gray-900">Profy</Link>
        <div className="flex items-center gap-3">
          {isOwner && (
            <Link href="/profile/edit" className="text-xs text-gray-500 hover:text-gray-800 transition-colors">
              編集
            </Link>
          )}
          <HeaderAuth />
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        {/* アバター・名前 */}
        <div className="flex flex-col items-center mb-10">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.display_name ?? slug}
              className="w-20 h-20 rounded-full object-cover mb-4 shadow-sm" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-900 text-white flex items-center justify-center text-xl font-bold mb-4 shadow-sm">
              {initials}
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-900">{profile.display_name || slug}</h1>
          {profile.bio && (
            <p className="text-gray-500 text-sm text-center mt-2 leading-relaxed max-w-xs">{profile.bio}</p>
          )}

          {/* SNS */}
          {hasSns && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {Object.entries(sns).map(([key, value]) => {
                if (!value) return null
                const config = SNS_CONFIG[key]
                if (!config) return null
                return (
                  <a key={key} href={config.url(value)} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors">
                    {config.label}: {value}
                  </a>
                )
              })}
            </div>
          )}
        </div>

        {/* カード一覧 */}
        {cards.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">カード</h2>
            <div className="grid gap-4">
              {cards.map(card => (
                <div key={card.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {card.image_url ? (
                    <img
                      src={card.image_url}
                      alt={card.title}
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                      画像なし
                    </div>
                  )}
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{card.title}</span>
                    {isOwner && (
                      <Link href={`/card/${card.id}/edit`}
                        className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                        編集
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 text-sm py-16">
            カードがまだありません
          </div>
        )}

        <p className="text-center text-xs text-gray-300 mt-12">
          by <span className="font-semibold">Profy</span>
        </p>
      </main>
    </div>
  )
}
