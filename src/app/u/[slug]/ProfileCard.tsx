'use client'

import type { ProfileRow } from '@/lib/types'
import Link from 'next/link'

const SNS_CONFIG: Record<string, { label: string; url: (v: string) => string; icon: React.ReactNode }> = {
  x: {
    label: 'X',
    url: (v) => `https://x.com/${v.replace('@', '')}`,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  discord: {
    label: 'Discord',
    url: (v) => `https://discord.com/users/${v}`,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
      </svg>
    ),
  },
  vrchat: {
    label: 'VRChat',
    url: (v) => `https://vrchat.com/home/user/${v}`,
    icon: <span className="text-xs font-bold">VR</span>,
  },
  instagram: {
    label: 'Instagram',
    url: (v) => `https://instagram.com/${v.replace('@', '')}`,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  github: {
    label: 'GitHub',
    url: (v) => `https://github.com/${v}`,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
}

type Props = {
  profile: ProfileRow
  slug: string
}

export default function ProfileCard({ profile, slug }: Props) {
  const sns = profile.sns_links ?? {}
  const hasSns = Object.values(sns).some(v => v)
  const initials = (profile.display_name ?? slug).slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-100 h-14 px-6 flex items-center justify-between">
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

          {/* SNSリンク */}
          {hasSns && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 space-y-2">
              {Object.entries(sns).map(([key, value]) => {
                if (!value) return null
                const config = SNS_CONFIG[key]
                if (!config) return null
                return (
                  <a
                    key={key}
                    href={config.url(value)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-800"
                  >
                    <span className="text-gray-500">{config.icon}</span>
                    <span>{value}</span>
                  </a>
                )
              })}
            </div>
          )}

          {/* VRChat固有情報 */}
          {profile.template === 'vrchat' && profile.platform_data && (
            <VRChatSection data={profile.platform_data} />
          )}

          <p className="text-center text-xs text-gray-300 mt-8">
            by <span className="font-semibold">vaacard</span>
          </p>
        </div>
      </main>
    </div>
  )
}

function VRChatSection({ data }: { data: Record<string, unknown> }) {
  const items = [
    { label: '言語', value: Array.isArray(data.language) ? (data.language as string[]).join(' / ') : null },
    { label: '使用環境', value: Array.isArray(data.playEnv) ? (data.playEnv as string[]).join(' / ') : null },
    { label: 'マイクON率', value: typeof data.micOnRate === 'number' ? `${data.micOnRate}%` : null },
    { label: '性別', value: typeof data.gender === 'string' ? data.gender : null },
  ].filter(i => i.value)

  if (items.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">VRChat</p>
      <div className="space-y-2">
        {items.map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-800">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
