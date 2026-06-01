'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { createCard, updateCard } from '@/lib/saveCard'

type Visibility = 'public' | 'limited' | 'private'

type Props = {
  onClose: () => void
  localStorageKey: string
  getCanvasDataUrl: () => Promise<string | null> | string | null
}

const VISIBILITY_OPTIONS: { value: Visibility; label: string; desc: string }[] = [
  { value: 'public',  label: '公開',      desc: 'プロフィールページに表示されます' },
  { value: 'limited', label: '限定公開', desc: 'URLを知っている人だけ見られます。一覧には表示されません' },
  { value: 'private', label: '非公開',    desc: '自分だけ見られます' },
]

export default function UpgradeModal({ onClose, localStorageKey, getCanvasDataUrl }: Props) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [slug, setSlug] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
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

    const dataUrl = await getCanvasDataUrl()
    if (!dataUrl) { setLoading(false); return }

    const raw = localStorage.getItem(localStorageKey)
    const cardData = raw ? JSON.parse(raw) : {}

    const created = await createCard({ templateId: 'vrchat-glass', cardData, title: 'VRChat Card', visibility })

    if ('error' in created) {
      setLoading(false)
      alert('保存に失敗しました: ' + created.error)
      return
    }

    const updated = await updateCard({ cardId: created.cardId, imageBase64: dataUrl })

    setLoading(false)

    if ('error' in updated) {
      alert('画像の保存に失敗しました: ' + updated.error)
      return
    }

    setSavedImageUrl(`${window.location.origin}/card/${created.cardId}`)
    setDone(true)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8">
        {done ? (
          <>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-1">保存しました</h2>
            <p className="text-gray-400 text-xs text-center mb-6">
              vaacard.me/u/{slug}
            </p>

            {/* URLコピー */}
            <button
              onClick={() => {
                const url = `${window.location.origin}/u/${slug}`
                navigator.clipboard.writeText(url)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-700 transition-colors mb-2"
            >
              {copied ? 'コピーしました！' : 'プロフィールURLをコピー'}
            </button>

            {/* 画像ダウンロード */}
            {savedImageUrl && (
              <a
                href={savedImageUrl}
                download="vrchat-card.png"
                className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors mb-2 flex items-center justify-center"
              >
                画像をダウンロード
              </a>
            )}

            {/* X でシェア */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`自己紹介カードを作りました！\n${window.location.origin}/u/${slug}\n#VRChat #vaacard`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-black text-white font-medium text-sm hover:bg-gray-800 transition-colors mb-4 flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X でシェア
            </a>

            <button onClick={onClose} className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition-colors">
              閉じる
            </button>
          </>
        ) : isLoggedIn ? (
          <>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-1">プロフィールに保存する</h2>
            <p className="text-gray-400 text-xs text-center mb-6">
              vaacard.me/u/{slug}
            </p>

            {/* 公開設定 */}
            <div className="space-y-2 mb-6">
              {VISIBILITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setVisibility(opt.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-colors ${
                    visibility === opt.value
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                    <span className="text-xs text-gray-400 ml-2">{opt.desc}</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                    visibility === opt.value ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                  }`} />
                </button>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 mb-3"
            >
              {loading ? '保存中...' : '保存する'}
            </button>
            <button onClick={onClose} className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition-colors">
              今はしない
            </button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-2">vaacardに保存しませんか？</h2>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-0.5 text-[#00AADB]">✦</span>
                <span><span className="font-semibold text-gray-800">新デザインが使える</span> — メーカーとは違うテンプレートで作れます</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-0.5 text-[#00AADB]">✦</span>
                <span><span className="font-semibold text-gray-800">共有用ページが作れる</span> — <span className="text-gray-400">vaacard.me/u/あなたのID</span> というURLでいつでも共有できます</span>
              </li>
            </ul>
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
