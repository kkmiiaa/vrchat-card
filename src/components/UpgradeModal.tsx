'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { saveCardToProfile } from '@/lib/saveCard'

type Props = {
  onClose: () => void
  localStorageKey: string
  getCanvasDataUrl: () => string | null
}

export default function UpgradeModal({ onClose, localStorageKey, getCanvasDataUrl }: Props) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [slug, setSlug] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setIsLoggedIn(true)
        supabase
          .from('users')
          .select('username_slug')
          .eq('id', data.user.id)
          .single()
          .then(({ data: u }) => {
            if (u) setSlug(u.username_slug)
          })
      }
    })
  }, [])

  async function handleSave() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const currentUrl = window.location.pathname + window.location.search
      router.push(`/auth/login?next=${encodeURIComponent(currentUrl)}`)
      setLoading(false)
      return
    }

    const dataUrl = getCanvasDataUrl()
    if (!dataUrl) { setLoading(false); return }

    const raw = localStorage.getItem(localStorageKey)
    const cardData = raw ? JSON.parse(raw) : {}

    const result = await saveCardToProfile({
      canvasDataUrl: dataUrl,
      cardData,
      title: 'VRChat Card',
    })

    setLoading(false)

    if ('error' in result) {
      alert('保存に失敗しました: ' + result.error)
      return
    }

    setDone(true)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8">
        {done ? (
          <>
            <div className="text-3xl mb-3 text-center">✅</div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">保存しました</h2>
            <p className="text-gray-500 text-sm text-center mb-6">
              プロフィールページにカードが追加されました。
            </p>
            <button
              onClick={() => slug && router.push(`/u/${slug}`)}
              className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-700 transition-colors mb-3"
            >
              プロフィールページを見る
            </button>
            <button onClick={onClose} className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition-colors">
              閉じる
            </button>
          </>
        ) : isLoggedIn ? (
          <>
            <div className="text-3xl mb-3 text-center">🔗</div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">プロフィールに保存する</h2>
            <p className="text-gray-500 text-sm text-center mb-6">
              このカードを <span className="font-mono text-gray-700">vaa3d.studio/u/{slug}</span> に追加します。あとから編集・削除できます。
            </p>
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 mb-3"
            >
              {loading ? '保存中...' : 'プロフィールに保存する'}
            </button>
            <button onClick={onClose} className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition-colors">
              今はしない
            </button>
          </>
        ) : (
          <>
            <div className="text-3xl mb-3 text-center">✨</div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">URLで共有しませんか？</h2>
            <p className="text-gray-500 text-sm text-center mb-6">
              ログインするとカードがプロフィールページに追加されます。あとから編集もできます。
            </p>
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 mb-3"
            >
              ログインして保存する
            </button>
            <button onClick={onClose} className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition-colors">
              今はしない
            </button>
          </>
        )}
      </div>
    </div>
  )
}
