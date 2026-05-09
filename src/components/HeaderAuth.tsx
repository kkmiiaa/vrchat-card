'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function HeaderAuth() {
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

  if (slug) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href={`/u/${slug}`}
          className="text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          マイページ
        </Link>
      </div>
    )
  }

  return (
    <Link
      href="/auth/login"
      className="text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
    >
      ログイン
    </Link>
  )
}
