'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
  const supabase = useMemo(() => createClient(), [])
  const currentUserId = useRef<string | null>(null)

  // プロフィール取得（ユーザーIDが変わったとき、またはpathname変化時）
  const fetchProfile = useMemo(() => async (userId: string) => {
    const { data: u } = await supabase
      .from('users')
      .select('username_slug, profiles(avatar_url, display_name)')
      .eq('id', userId)
      .single()
    const profile = Array.isArray(u?.profiles) ? u.profiles[0] : u?.profiles
    setAuth({
      status: 'loggedIn',
      slug: u?.username_slug ?? '',
      avatarUrl: profile?.avatar_url ?? null,
      displayName: profile?.display_name ?? null,
    })
  }, [supabase])

  // onAuthStateChange でローカルセッションを即座に読む（ネットワーク不要）
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        currentUserId.current = null
        setAuth({ status: 'guest' })
      } else {
        currentUserId.current = session.user.id
        fetchProfile(session.user.id)
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile])

  // pathname 変化時にプロフィールを再取得（スラッグ設定後などに反映）
  useEffect(() => {
    if (currentUserId.current) fetchProfile(currentUserId.current)
  }, [pathname, fetchProfile])

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
      <Link href={myPageHref} className="block rounded-full hover:opacity-80 transition-opacity" aria-label="マイページ" title="マイページ">
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
