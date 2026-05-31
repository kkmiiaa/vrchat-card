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
  username_slug: string
}

type Props = {
  onClose: () => void
}

export default function SettingsModal({ onClose }: Props) {
  const router = useRouter()
  const [info, setInfo] = useState<PlanInfo | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  // ID変更
  const [slugInput, setSlugInput] = useState('')
  const [slugStatus, setSlugStatus] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle')
  const [slugError, setSlugError] = useState('')

  // アカウント削除
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: u } = await supabase
        .from('users')
        .select('plan, plan_expires_at, stripe_customer_id, username_slug')
        .eq('id', data.user.id)
        .single()

      const isPro = u?.plan === 'pro' &&
        (u.plan_expires_at == null || new Date(u.plan_expires_at) > new Date())

      setInfo({
        email: data.user.email ?? '',
        isPro,
        planExpiresAt: u?.plan_expires_at ?? null,
        hasStripeCustomer: !!u?.stripe_customer_id,
        username_slug: u?.username_slug ?? '',
      })
      setSlugInput(u?.username_slug ?? '')
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

  const handleSlugSave = async () => {
    if (!slugInput || slugInput === info?.username_slug) return
    setSlugStatus('saving')
    setSlugError('')
    const res = await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username_slug: slugInput }),
    })
    const json = await res.json()
    if (res.ok) {
      setSlugStatus('ok')
      setInfo(prev => prev ? { ...prev, username_slug: json.username_slug } : prev)
      setTimeout(() => setSlugStatus('idle'), 2000)
    } else {
      setSlugStatus('error')
      setSlugError(json.error === 'already_taken' ? 'このIDはすでに使われています' : '保存に失敗しました')
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    const res = await fetch('/api/account', { method: 'DELETE' })
    if (res.ok) {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
    } else {
      alert('削除に失敗しました。しばらくしてから再試行してください。')
      setDeleting(false)
      setDeleteConfirm(false)
    }
  }

  const expiresLabel = info?.planExpiresAt
    ? new Date(info.planExpiresAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-x-0 top-1/2 -translate-y-1/2 z-50 flex justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">

          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">設定</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <IoClose size={20} />
            </button>
          </div>

          <div className="flex flex-col divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">

            {/* アカウント */}
            <div className="px-5 py-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">アカウント</p>
              <p className="text-sm text-gray-800 mb-3">{info?.email ?? '...'}</p>
              {/* ID変更 */}
              <p className="text-xs text-gray-500 mb-1.5">マイページID（URL）</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center flex-1 rounded-xl border-2 border-sky-100 overflow-hidden focus-within:border-[#00AADB] transition-colors text-sm">
                  <span className="text-gray-300 pl-3 shrink-0 text-xs">vaacard.com/u/</span>
                  <input
                    type="text"
                    value={slugInput}
                    onChange={e => { setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')); setSlugStatus('idle') }}
                    maxLength={30}
                    className="flex-1 py-2 pr-3 text-gray-800 bg-transparent focus:outline-none min-w-0"
                  />
                </div>
                <button
                  onClick={handleSlugSave}
                  disabled={slugStatus === 'saving' || !slugInput || slugInput === info?.username_slug}
                  className="shrink-0 text-xs font-semibold text-white bg-gradient-to-r from-[#00AADB] to-[#00C9B8] px-3 py-2 rounded-xl disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  {slugStatus === 'saving' ? '...' : slugStatus === 'ok' ? '✓' : '変更'}
                </button>
              </div>
              {slugStatus === 'error' && <p className="text-xs text-red-500 mt-1">{slugError}</p>}
              <p className="text-[10px] text-gray-300 mt-1">英数字・ハイフン・アンダースコア、3〜30文字</p>
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
                  <Link href="/upgrade" onClick={onClose} className="text-xs font-semibold text-[#00AADB] hover:underline">
                    アップグレード →
                  </Link>
                </div>
              )}
            </div>

            {/* ログアウト */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full px-5 py-4 text-left text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {loggingOut ? 'ログアウト中...' : 'ログアウト'}
            </button>

            {/* アカウント削除 */}
            <div className="px-5 py-4">
              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors underline underline-offset-2"
                >
                  アカウントを削除する
                </button>
              ) : (
                <div>
                  <p className="text-xs text-red-500 font-semibold mb-2">本当に削除しますか？この操作は取り消せません。</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleting ? '削除中...' : '削除する'}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
