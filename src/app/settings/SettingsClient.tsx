'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Props = {
  email: string
  isPro: boolean
  planExpiresAt: string | null
  hasStripeCustomer: boolean
  slug: string | null
}

export default function SettingsClient({ email, isPro, planExpiresAt, hasStripeCustomer, slug }: Props) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handlePortal = async () => {
    setPortalLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const json = await res.json()
    if (json.url) {
      window.location.href = json.url
    } else {
      setPortalLoading(false)
    }
  }

  const expiresLabel = planExpiresAt
    ? new Date(planExpiresAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        {slug && (
          <Link href={`/u/${slug}`} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        )}
        <h1 className="text-base font-semibold text-gray-800">設定</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">

        {/* アカウント */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">アカウント</h2>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-gray-500">メールアドレス</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">{email}</p>
          </div>
        </section>

        {/* プラン */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">プラン</h2>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              {isPro ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">Pro プラン</span>
                  </div>
                  {expiresLabel && (
                    <p className="text-xs text-gray-400 mt-0.5">次回更新: {expiresLabel}</p>
                  )}
                </>
              ) : (
                <span className="text-sm font-medium text-gray-800">フリープラン</span>
              )}
            </div>
            {isPro ? (
              hasStripeCustomer ? (
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors disabled:opacity-50"
                >
                  {portalLoading ? '移動中...' : '解約・管理'}
                </button>
              ) : null
            ) : (
              <Link
                href="/upgrade"
                className="text-xs font-semibold text-[#00AADB] hover:underline"
              >
                アップグレード →
              </Link>
            )}
          </div>
        </section>

        {/* ログアウト */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full px-5 py-4 text-left text-sm font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {loggingOut ? 'ログアウト中...' : 'ログアウト'}
          </button>
        </section>

      </div>
    </div>
  )
}
