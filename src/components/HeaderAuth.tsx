'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function HeaderAuth({ variant = 'default', hideMyPage = false }: { variant?: 'default' | 'white'; hideMyPage?: boolean }) {
  const [slug, setSlug] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase
          .from('users')
          .select('username_slug')
          .eq('id', data.user.id)
          .single()
          .then(({ data: u }) => {
            setSlug(u?.username_slug ?? null)
            setLoading(false)
          })
      } else {
        setLoading(false)
      }
    })
  }, [])

  if (loading) return <div className="w-16 h-6" />

  if (slug && !hideMyPage) {
    return (
      <Link
        href={`/u/${slug}`}
        className={
          variant === 'white'
            ? 'text-xs font-semibold text-[#00AADB] bg-white/90 border border-white px-3 py-1.5 rounded-full hover:bg-white transition-colors shadow-sm'
            : 'text-xs font-semibold text-[#00AADB] border border-sky-200 px-3 py-1.5 rounded-full hover:bg-sky-50 transition-colors'
        }
      >
        マイページ
      </Link>
    )
  }

  if (slug) return null

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
