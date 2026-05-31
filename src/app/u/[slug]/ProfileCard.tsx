'use client'

import type { ProfileRow } from '@/lib/types'
import Link from 'next/link'

type Props = {
  profile: ProfileRow
  slug: string
}

export default function ProfileCard({ profile, slug }: Props) {
  const initials = (profile.display_name ?? slug).slice(0, 2).toUpperCase()
  const links = [...(profile.profile_links ?? [])].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm h-14 px-6 flex items-center justify-between">
        <Link href="/" className="text-lg font-black tracking-tight text-gray-900">vaacard</Link>
        <Link href="/auth/login" className="text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
          ログイン
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* アバター・名前 */}
          <div className="flex flex-col items-center mb-8">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name ?? slug}
                className="w-24 h-24 rounded-full object-cover mb-4 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-sm">
                {initials}
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.display_name || slug}
            </h1>
            {profile.bio && (
              <p className="text-gray-500 text-sm text-center mt-2 leading-relaxed max-w-xs">
                {profile.bio}
              </p>
            )}
          </div>

          {/* リンク一覧 */}
          {links.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 space-y-2">
              {links.map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-800"
                >
                  {link.label || link.url}
                </a>
              ))}
            </div>
          )}

          <p className="text-center text-xs text-gray-300 mt-8">
            by <span className="font-semibold">vaacard</span>
          </p>
        </div>
      </main>
    </div>
  )
}
