'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import NotificationBell from './NotificationBell'

type AuthState =
  | { status: 'loading' }
  | { status: 'guest' }
  | { status: 'loggedIn'; slug: string; avatarUrl: string | null; displayName: string | null }

export default function HeaderAuth({ variant = 'default', hideMyPage = false }: { variant?: 'default' | 'white'; hideMyPage?: boolean }) {
  const [auth, setAuth] = useState<AuthState>({ status: 'loading' })
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { setAuth({ status: 'guest' }); return }
      supabase
        .from('users')
        .select('username_slug, profiles(avatar_url, display_name)')
        .eq('id', data.user.id)
        .single()
        .then(({ data: u }) => {
          const profile = Array.isArray(u?.profiles) ? u.profiles[0] : u?.profiles
          setAuth({
            status: 'loggedIn',
            slug: u?.username_slug ?? '',
            avatarUrl: profile?.avatar_url ?? null,
            displayName: profile?.display_name ?? null,
          })
        })
    })
  }, [pathname])

  if (auth.status === 'loading') return <div className="w-8 h-8" />

  // 未ログイン
  if (auth.status === 'guest') {
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

  // ログイン済み
  const { slug, avatarUrl, displayName } = auth
  const initials = (displayName || slug).slice(0, 2).toUpperCase() || null

  if (hideMyPage) return <NotificationBell />

  const myPageHref = slug ? `/u/${slug}` : '/u/me'

  return (
    <div className="flex items-center gap-2">
      <NotificationBell />
      <Link href={myPageHref} className="block rounded-full hover:opacity-80 transition-opacity" title="マイページ">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={initials ?? 'マイページ'} className="w-8 h-8 rounded-full object-cover border-2 border-sky-100" />
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            variant === 'white'
              ? 'bg-white/90 text-[#00AADB] border-white/60'
              : 'bg-gradient-to-br from-[#00AADB] to-[#00C9B8] text-white border-sky-100'
          }`}>
            {initials
              ? <span className="text-[10px] font-bold">{initials}</span>
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            }
          </div>
        )}
      </Link>
    </div>
  )
}
