'use client'

import { useState, useRef, useEffect, useTransition, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import HeaderAuth from '@/components/HeaderAuth'
import { relativeDate } from '@/utils/relativeDate'
import type { TemplateLayoutRow } from '@/lib/templateLayout'
import { buildCardTemplateFromDefinition } from '@/lib/buildCardTemplate'
import { createCard } from '@/lib/saveCard'
import { translations } from '@/utils/translations'

type BackgroundValue = { type: string; value: string | string[]; base64?: string | null } | null

type Card = {
  id: string
  title: string | null
  image_url: string | null
  card_data: Record<string, unknown>
  background: BackgroundValue
  created_at: string
  template_id: string
  profile: { display_name: string | null; avatar_url: string | null } | null
}

type Props = {
  templateId: string
  templateRow: TemplateLayoutRow
  initialCards: Card[]
  siblingTemplates: { id: string; label: string }[]
  isPro: boolean
  isLoggedIn: boolean
}

function cardBgStyle(bg: BackgroundValue): string {
  if (!bg) return 'linear-gradient(135deg, rgba(0,170,219,0.12), rgba(0,201,184,0.10))'
  if (bg.type === 'color' && typeof bg.value === 'string') return bg.value
  if (bg.type === 'gradient' && Array.isArray(bg.value)) return `linear-gradient(135deg, ${bg.value[0]}, ${bg.value[1]})`
  if (bg.type === 'image' && bg.base64) return `url(${bg.base64}) center/cover no-repeat`
  if (bg.type === 'image' && typeof bg.value === 'string') return `url(${bg.value}) center/cover no-repeat`
  return 'linear-gradient(135deg, rgba(0,170,219,0.12), rgba(0,201,184,0.10))'
}

function getName(card: Card): string {
  return (card.card_data?.name as string | undefined)
    ?? card.profile?.display_name
    ?? card.title
    ?? 'vaacard User'
}

/** テンプレートのサンプルカードを縮小表示 */
function SamplePreview({ row }: { row: TemplateLayoutRow }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const { template } = buildCardTemplateFromDefinition(null, row)
  const W = template.cardWidth
  const H = template.cardHeight

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      if (w > 0) setScale(w / W)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [W])

  const values = row.sample_card_data ?? {}

  return (
    <div ref={containerRef} style={{ width: '100%', height: H * scale, overflow: 'hidden', borderRadius: 12 }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: W, height: H, pointerEvents: 'none' }}>
        <template.CardRenderer values={values} fontFamily="" t={translations.ja} />
      </div>
    </div>
  )
}

export default function TemplateCardsClient({
  templateId, templateRow, initialCards, siblingTemplates, isPro, isLoggedIn,
}: Props) {
  const router = useRouter()
  const [cards, setCards] = useState<Card[]>(initialCards)
  const [hasMore, setHasMore] = useState(initialCards.length === (isPro ? 24 : 20))
  const [isPending, startTransition] = useTransition()
  const [creating, setCreating] = useState(false)

  const loadMore = useCallback(() => {
    startTransition(async () => {
      const last = cards[cards.length - 1]
      if (!last) return
      const res = await fetch(
        `/api/cards/explore?template=${templateId}&cursor=${last.created_at}&community=vrchat`
      )
      if (!res.ok) return
      const { cards: more } = await res.json()
      if (!more?.length) { setHasMore(false); return }
      setCards(prev => [...prev, ...more])
      if (more.length < (isPro ? 24 : 20)) setHasMore(false)
    })
  }, [cards, templateId, isPro])

  async function handleCreate() {
    setCreating(true)
    if (!isLoggedIn) {
      router.push(`/auth/login?next=/card/new`)
      return
    }
    const result = await createCard({ templateId })
    if ('error' in result) {
      alert('カードの作成に失敗しました')
      setCreating(false)
      return
    }
    router.push(`/card/${result.cardId}/edit`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-sm h-14 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
          <Link href="/" className="font-black text-[#00AADB] shrink-0">vaacard</Link>
          <span className="text-gray-300">/</span>
          <Link href="/c/vrchat" className="hover:text-[#00AADB] transition-colors truncate">VRChat</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium truncate">{templateRow.label}</span>
        </div>
        <HeaderAuth />
      </header>

      <main className="flex-1 pt-14">
        {/* テンプレートヘッダー */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-start">
              {/* サンプルプレビュー */}
              <div className="w-full sm:w-72 shrink-0 rounded-2xl overflow-hidden shadow-lg shadow-gray-100 border border-gray-100">
                <SamplePreview row={templateRow} />
              </div>

              {/* テンプレート情報 */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-sky-500 font-semibold mb-1">テンプレート</p>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">{templateRow.label}</h1>
                {templateRow.description && (
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">{templateRow.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleCreate}
                    disabled={creating}
                    className="tap-spring inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white text-sm font-bold rounded-full shadow-md shadow-sky-200 hover:opacity-90 disabled:opacity-60 transition-opacity"
                  >
                    {creating ? '作成中...' : 'このテンプレートで作る'}
                    {!creating && (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* テンプレート切り替えタブ */}
          {siblingTemplates.length > 1 && (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-0">
              <div className="flex gap-1 overflow-x-auto">
                {siblingTemplates.map(t => (
                  <Link
                    key={t.id}
                    href={`/c/vrchat/${t.id}`}
                    className={`shrink-0 px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors ${
                      t.id === templateId
                        ? 'border-[#00AADB] text-[#00AADB] bg-sky-50/50'
                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
                    }`}
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* カードグリッド */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {cards.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-gray-400 text-sm mb-4">まだカードがありません</p>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="tap-spring inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white text-sm font-bold rounded-full shadow-md shadow-sky-200 hover:opacity-90 disabled:opacity-60"
              >
                最初のカードを作る
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-4">{cards.length}件{!isPro && '（最新20件）'}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {cards.map(card => (
                  <Link
                    key={card.id}
                    href={`/card/${card.id}`}
                    className="group block bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-sky-200 hover:shadow-md transition-all"
                  >
                    {card.image_url ? (
                      <div className="aspect-video overflow-hidden bg-gray-100">
                        <img
                          src={card.image_url}
                          alt={getName(card)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div
                        className="aspect-video flex flex-col items-center justify-center gap-1"
                        style={{ background: cardBgStyle(card.background) }}
                      >
                        <span className="text-3xl font-black text-white/30 drop-shadow">vc</span>
                        <span className="text-[10px] font-semibold text-white/50 px-2 text-center truncate max-w-full drop-shadow">{getName(card)}</span>
                      </div>
                    )}
                    <div className="p-2">
                      <p className="text-xs font-semibold text-gray-700 truncate">{getName(card)}</p>
                      <p className="text-[10px] text-gray-300 mt-0.5">{relativeDate(card.created_at)}</p>
                    </div>
                  </Link>
                ))}
              </div>

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
          )}
        </div>
      </main>
    </div>
  )
}
