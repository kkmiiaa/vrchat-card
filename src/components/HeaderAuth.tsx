'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { IoSettingsOutline } from 'react-icons/io5'
import ProBadge from '@/components/ProBadge'

export default function HeaderAuth({ variant = 'default', hideMyPage = false }: { variant?: 'default' | 'white'; hideMyPage?: boolean }) {
  const [slug, setSlug] = useState<string | null>(null)
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase
          .from('users')
          .select('username_slug, plan, plan_expires_at')
          .eq('id', data.user.id)
          .single()
          .then(({ data: u }) => {
            setSlug(u?.username_slug ?? null)
            setIsPro(
              u?.plan === 'pro' &&
              (u.plan_expires_at == null || new Date(u.plan_expires_at) > new Date())
            )
            setLoading(false)
          })
      } else {
        setLoading(false)
      }
    })
  }, [])

  if (loading) return <div className="w-16 h-6" />

  if (slug) {
    const iconColor = variant === 'white' ? 'text-white/70 hover:text-white' : 'text-gray-400 hover:text-gray-600'
    return (
      <div className="flex items-center gap-3">
        {isPro && <ProBadge size={18} />}
        {!hideMyPage && (
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
        )}
        <Link href="/settings" className={`transition-colors ${iconColor}`} title="設定">
          <IoSettingsOutline size={18} />
        </Link>
      </div>
    )
  }

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
