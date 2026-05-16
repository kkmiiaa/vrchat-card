'use client'

import { useState, useCallback, useTransition } from 'react'
import Link from 'next/link'
import HeaderAuth from '@/components/HeaderAuth'

type Card = {
  id: string
  title: string | null
  image_url: string | null
  card_data: Record<string, unknown>
  created_at: string
  template_id: string
}

type Filters = {
  q: string
  gender: string
  env: string
  lang: string
  friendPolicy: string
}

const ENV_OPTIONS = ['PCVR', 'Quest', 'Desktop']
const LANG_OPTIONS = ['日本語', 'English', 'Korean']
const POLICY_OPTIONS = [
  { value: 'frPolicyAnyone', label: 'だれでもOK' },
  { value: 'frPolicyAfterGettingToKnow', label: '仲良くなってから' },
  { value: 'frPolicyIfInterested', label: '気になったら' },
  { value: 'frPolicyMutualsOnX', label: 'Twitter相互' },
  { value: 'frPolicyNo', label: '送らないで' },
]

type Props = {
  initialCards: Card[]
  isPro: boolean
  isLoggedIn: boolean
}

export default function ExploreClient({ initialCards, isPro, isLoggedIn }: Props) {
  const [cards, setCards] = useState<Card[]>(initialCards)
  const [filters, setFilters] = useState<Filters>({ q: '', gender: '', env: '', lang: '', friendPolicy: '' })
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(isPro && initialCards.length === 24)
  const [isPending, startTransition] = useTransition()

  const buildQuery = useCallback((f: Filters, cur: string | null) => {
    const params = new URLSearchParams()
    if (f.q) params.set('q', f.q)
    if (f.gender) params.set('gender', f.gender)
    if (f.env) params.set('env', f.env)
    if (f.lang) params.set('lang', f.lang)
    if (f.friendPolicy) params.set('friendPolicy', f.friendPolicy)
    if (cur) params.set('cursor', cur)
    return `/api/cards/explore?${params.toString()}`
  }, [])

  const search = useCallback((newFilters: Filters) => {
    setFilters(newFilters)
    setCursor(null)
    startTransition(async () => {
      const res = await fetch(buildQuery(newFilters, null))
      const json = await res.json()
      setCards(json.cards ?? [])
      setHasMore((json.cards ?? []).length === 24)
    })
  }, [buildQuery])

  const loadMore = useCallback(() => {
    const last = cards[cards.length - 1]
    if (!last) return
    const cur = last.created_at
    startTransition(async () => {
      const res = await fetch(buildQuery(filters, cur))
      const json = await res.json()
      const newCards = json.cards ?? []
      setCards(prev => [...prev, ...newCards])
      setCursor(cur)
      setHasMore(newCards.length === 24)
    })
  }, [cards, filters, buildQuery])

  function updateFilter(key: keyof Filters, value: string) {
    const next = { ...filters, [key]: value }
    search(next)
  }

  function toggleFilter(key: keyof Filters, value: string) {
    const current = filters[key]
    updateFilter(key, current === value ? '' : value)
  }

  const getName = (card: Card) => (card.card_data?.name as string) || card.title || 'vaacard User'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md h-12 sm:h-14 px-4 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <a href="/" className="text-xl font-black tracking-tight text-[#00AADB]">vaacard</a>
          <span className="text-gray-300 text-sm">/</span>
          <span className="text-sm font-semibold text-gray-600">VRChat</span>
        </div>
        <HeaderAuth />
      </header>

      <main className="pt-16 px-4 pb-16 max-w-5xl mx-auto">
        {/* タイトル */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">VRChat カード一覧</h1>
          <p className="text-sm text-gray-500 mt-1">VRChatユーザーの自己紹介カードをまとめて見られます</p>
        </div>

        {/* フィルターエリア */}
        {isPro ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col gap-4">
            {/* フリーワード */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                placeholder="名前・自己紹介で検索..."
                value={filters.q}
                onChange={e => updateFilter('q', e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            {/* 性別 */}
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">性別</p>
              <div className="flex gap-2 flex-wrap">
                {['男性', '女性', 'その他'].map(g => (
                  <button
                    key={g}
                    onClick={() => toggleFilter('gender', g)}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                      filters.gender === g
                        ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {g}
                  </button>
                ))}
                {filters.gender && !['男性', '女性', 'その他'].includes(filters.gender) && (
                  <span className="px-3 py-1 text-xs font-medium rounded-full border border-[#00AADB] bg-sky-50 text-[#00AADB]">
                    {filters.gender}
                  </span>
                )}
              </div>
            </div>

            {/* 使用環境 */}
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">使用環境</p>
              <div className="flex gap-2 flex-wrap">
                {ENV_OPTIONS.map(e => (
                  <button
                    key={e}
                    onClick={() => toggleFilter('env', e)}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                      filters.env === e
                        ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* 言語 */}
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">言語</p>
              <div className="flex gap-2 flex-wrap">
                {LANG_OPTIONS.map(l => (
                  <button
                    key={l}
                    onClick={() => toggleFilter('lang', l)}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                      filters.lang === l
                        ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* フレンド申請ポリシー */}
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">フレンド申請</p>
              <div className="flex gap-2 flex-wrap">
                {POLICY_OPTIONS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => toggleFilter('friendPolicy', p.value)}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                      filters.friendPolicy === p.value
                        ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* リセット */}
            {Object.values(filters).some(Boolean) && (
              <button
                onClick={() => search({ q: '', gender: '', env: '', lang: '', friendPolicy: '' })}
                className="self-start text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕ フィルターをリセット
              </button>
            )}
          </div>
        ) : (
          /* Freeユーザー向けアップグレード誘導 */
          <div className="bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-100 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {isLoggedIn ? '🔍 Proプランで詳細検索が使えます' : '🔍 ログインすると検索機能が利用できます'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">性別・使用環境・言語・フレンドポリシーなどで絞り込み</p>
            </div>
            {isLoggedIn ? (
              <Link href="/upgrade" className="shrink-0 text-xs font-bold text-white bg-gradient-to-r from-[#00AADB] to-[#00C9B8] px-4 py-2 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap">
                Proにアップグレード
              </Link>
            ) : (
              <Link href="/auth/login" className="shrink-0 text-xs font-bold text-[#00AADB] border border-[#00AADB] px-4 py-2 rounded-full hover:bg-sky-50 transition-colors whitespace-nowrap">
                ログイン
              </Link>
            )}
          </div>
        )}

        {/* 件数 */}
        <p className="text-xs text-gray-400 mb-3">
          {isPending ? '検索中...' : `${cards.length}件`}
          {!isPro && <span className="ml-2 text-gray-300">（最新20件）</span>}
        </p>

        {/* カードグリッド */}
        {cards.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {cards.map(card => (
                <Link
                  key={card.id}
                  href={`/card/${card.id}/view`}
                  className="group block bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-sky-200 hover:shadow-md transition-all"
                >
                  {card.image_url ? (
                    <div className="aspect-[3/2] overflow-hidden bg-gray-100">
                      <img
                        src={card.image_url}
                        alt={getName(card)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[3/2] bg-gradient-to-br from-sky-100 to-cyan-50 flex items-center justify-center">
                      <span className="text-2xl font-black text-sky-200">vc</span>
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs font-semibold text-gray-700 truncate">{getName(card)}</p>
                    {isPro && (card.card_data?.playEnv as string[] | undefined)?.length ? (
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                        {(card.card_data.playEnv as string[]).join(' / ')}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>

            {/* もっと見る（Proのみ） */}
            {isPro && hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={isPending}
                  className="px-6 py-2.5 text-sm font-semibold text-[#00AADB] border border-[#00AADB] rounded-full hover:bg-sky-50 transition-colors disabled:opacity-50"
                >
                  {isPending ? '読み込み中...' : 'もっと見る'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-300 text-sm">
            {isPending ? '検索中...' : '該当するカードが見つかりませんでした'}
          </div>
        )}
      </main>
    </div>
  )
}
