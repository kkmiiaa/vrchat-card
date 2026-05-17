'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { IoClose } from 'react-icons/io5'

type PlanInfo = {
  email: string
  isPro: boolean
  planExpiresAt: string | null
  hasStripeCustomer: boolean
}

type Props = {
  onClose: () => void
}

export default function SettingsModal({ onClose }: Props) {
  const router = useRouter()
  const [info, setInfo] = useState<PlanInfo | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: u } = await supabase
        .from('users')
        .select('plan, plan_expires_at, stripe_customer_id')
        .eq('id', data.user.id)
        .single()

      const isPro = u?.plan === 'pro' &&
        (u.plan_expires_at == null || new Date(u.plan_expires_at) > new Date())

      setInfo({
        email: data.user.email ?? '',
        isPro,
        planExpiresAt: u?.plan_expires_at ?? null,
        hasStripeCustomer: !!u?.stripe_customer_id,
      })
    })
  }, [])

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
    if (json.url) window.location.href = json.url
    else setPortalLoading(false)
  }

  const expiresLabel = info?.planExpiresAt
    ? new Date(info.planExpiresAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* モーダル */}
      <div className="fixed inset-x-0 top-1/2 -translate-y-1/2 z-50 flex justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">

          {/* ヘッダー */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">設定</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <IoClose size={20} />
            </button>
          </div>

          <div className="flex flex-col divide-y divide-gray-100">

            {/* アカウント */}
            <div className="px-5 py-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">アカウント</p>
              <p className="text-sm text-gray-800">{info?.email ?? '...'}</p>
            </div>

            {/* プラン */}
            <div className="px-5 py-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">プラン</p>
              {info === null ? (
                <p className="text-sm text-gray-400">読み込み中...</p>
              ) : info.isPro ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Pro プラン</p>
                    {expiresLabel && (
                      <p className="text-xs text-gray-400 mt-0.5">次回更新: {expiresLabel}</p>
                    )}
                  </div>
                  {info.hasStripeCustomer && (
                    <button
                      onClick={handlePortal}
                      disabled={portalLoading}
                      className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors disabled:opacity-50"
                    >
                      {portalLoading ? '移動中...' : '解約・管理'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-800">フリープラン</p>
                  <Link
                    href="/upgrade"
                    onClick={onClose}
                    className="text-xs font-semibold text-[#00AADB] hover:underline"
                  >
                    アップグレード →
                  </Link>
                </div>
              )}
            </div>

            {/* ログアウト */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full px-5 py-4 text-left text-sm font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {loggingOut ? 'ログアウト中...' : 'ログアウト'}
            </button>

          </div>
        </div>
      </div>
    </>
  )
}
