'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import NotificationBell from './NotificationBell'

type UserInfo = { slug: string; avatarUrl: string | null; displayName: string | null }

export default function HeaderAuth({ variant = 'default', hideMyPage = false }: { variant?: 'default' | 'white'; hideMyPage?: boolean }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase
          .from('users')
          .select('username_slug, avatar_url, display_name')
          .eq('id', data.user.id)
          .single()
          .then(({ data: u }) => {
            setUser({
              slug: u?.username_slug ?? '',
              avatarUrl: u?.avatar_url ?? null,
              displayName: u?.display_name ?? null,
            })
            setLoading(false)
          })
      } else {
        setLoading(false)
      }
    })
  }, [])

  if (loading) return <div className="w-8 h-8" />

  if (user?.slug && !hideMyPage) {
    const initials = (user.displayName || user.slug).slice(0, 2).toUpperCase()
    return (
      <div className="flex items-center gap-2">
        <NotificationBell />
        <Link href={`/u/${user.slug}`} className="block rounded-full hover:opacity-80 transition-opacity" title="マイページ">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt={initials} className="w-8 h-8 rounded-full object-cover border-2 border-sky-100" />
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
              variant === 'white'
                ? 'bg-white/90 text-[#00AADB] border-white/60'
                : 'bg-gradient-to-br from-[#00AADB] to-[#00C9B8] text-white border-sky-100'
            }`}>
              {initials}
            </div>
          )}
        </Link>
      </div>
    )
  }

  if (user?.slug) return <NotificationBell />

  return (
    <Link
      href="/auth/login"
      className={
        variant === 'white'
          ? 'text-xs font-semibold text-white/80 hover:text-white transition-colors'
          : 'text-xs font-semibold text-gray-400 hover:text-[#00AADB] transition-colors'
      }
    >
      ログイン
    </Link>
  )
}
