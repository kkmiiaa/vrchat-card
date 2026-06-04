'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  onClose?: () => void // モーダルとして使う場合に渡す
}

export default function UpgradeContent({ onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      if (res.status === 401) {
        router.push('/auth/login?next=/upgrade')
        return
      }
      const json = await res.json()
      if (json.url) {
        window.location.href = json.url
      } else {
        alert('エラーが発生しました。もう一度お試しください。')
        setLoading(false)
      }
    } catch {
      alert('エラーが発生しました。もう一度お試しください。')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full">
      {!onClose && (
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-black tracking-tight text-[#00AADB]">vaacard</a>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Proプランにアップグレード</h1>
          <p className="mt-2 text-gray-500 text-sm">もっと自由に、あなたらしいカードを。</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {onClose && (
          <div className="text-center pt-6 px-6">
            <a href="/" className="text-2xl font-black tracking-tight text-[#00AADB]">vaacard</a>
            <p className="mt-3 text-2xl font-bold text-gray-900">Proプランにアップグレード</p>
            <p className="mt-1 text-gray-500 text-sm">もっと自由に、あなたらしいカードを。</p>
          </div>
        )}
        {/* Freeプラン */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Free</span>
            <span className="text-2xl font-bold text-gray-900">¥0</span>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> カード最大5枚
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 全テンプレート利用可能
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 画像ダウンロード
            </li>
            <li className="flex items-center gap-2">
              <span className="text-gray-300">✗</span> <span className="text-gray-400">ユーザー検索（最新20件のみ）</span>
            </li>
          </ul>
        </div>

        {/* Proプラン */}
        <div className="p-6 bg-gradient-to-br from-sky-50 to-white">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-[#00AADB] uppercase tracking-wider">Pro</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">¥500</span>
              <span className="text-sm text-gray-500">/月</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-4">いつでもキャンセル可能</p>
          <ul className="space-y-2 text-sm text-gray-700 mb-6">
            <li className="flex items-center gap-2">
              <span className="text-[#00AADB]">✓</span> <strong>カード枚数無制限</strong>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#00AADB]">✓</span> 全テンプレート利用可能
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#00AADB]">✓</span> 画像ダウンロード
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#00AADB]">✓</span> <strong>ユーザー検索・フィルター機能解放</strong>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#00AADB]">✓</span> <strong>このサービスが来月も生き残れるよう支援できる</strong>
            </li>
          </ul>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#00AADB] to-[#00C9B8] hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60"
          >
            {loading ? '処理中...' : 'Proにアップグレードする'}
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-gray-400">
        決済は Stripe により安全に処理されます。
      </p>
      <div className="mt-3 text-center">
        {onClose ? (
          <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← 戻る
          </button>
        ) : (
          <button onClick={() => router.back()} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← 戻る
          </button>
        )}
      </div>
    </div>
  )
}
