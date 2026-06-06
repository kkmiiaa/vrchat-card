'use client'

import { useState, useRef, useEffect, useTransition, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import HeaderAuth from '@/components/HeaderAuth'
import { relativeDate } from '@/utils/relativeDate'
import type { TemplateLayoutRow } from '@/lib/templateLayout'
import { buildCardTemplateFromDefinition } from '@/lib/buildCardTemplate'
import { createCard } from '@/lib/saveCard'
import { translations } from '@/utils/translations'
import { getComponent } from '@/blocks/registry'

type BackgroundValue = { type: string; value: string | string[]; base64?: string | null } | null

type Card = {
  id: string
  title: string | null
  image_url: string | null
  card_data: Record<string, unknown>
  background: BackgroundValue
  created_at: string
  template_id: string
  like_count: number
  view_count: number
  profile: { display_name: string | null; avatar_url: string | null } | null
}

/** block_pool からテンプレート固有の検索可能フィルターを導出する */
type SearchableField = {
  dataKey: string
  label: string
  componentKey: string
  options: { value: string; label: string }[]
  isMulti: boolean
}

function deriveSearchableFields(blockPool: Record<string, unknown> | null | undefined): SearchableField[] {
  if (!blockPool) return []
  const fields: SearchableField[] = []
  for (const entry of Object.values(blockPool)) {
    if (!entry || typeof entry !== 'object') continue
    const e = entry as Record<string, unknown>
    const componentKey = e.componentKey as string
    const dataKey = e.dataKey as string
    if (!componentKey || !dataKey) continue
    const component = getComponent(componentKey)
    if (!component?.searchable || component.global) continue
    const rawOptions = (e.blockConfig as Record<string, unknown> | undefined)?.options
    if (!Array.isArray(rawOptions)) continue
    fields.push({
      dataKey,
      label: (e.label as string) || dataKey,
      componentKey,
      options: rawOptions.map((o: Record<string, unknown>) => ({
        value: String(o.value ?? o.label),
        label: String(o.label ?? o.value),
      })),
      isMulti: componentKey === 'multi-select',
    })
  }
  return fields
}

type TemplateFilters = Record<string, string>

type Props = {
  templateId: string
  templateRow: TemplateLayoutRow
  initialCards: Card[]
  siblingTemplates: TemplateLayoutRow[]
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

  const isEmpty = !row.sample_card_data || Object.keys(row.sample_card_data).length === 0

  if (isEmpty) {
    return (
      <div ref={containerRef} style={{ width: '100%', aspectRatio: `${W}/${H}`, borderRadius: 12, background: 'linear-gradient(135deg, #e0f2fe, #f0fdf4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>サンプル準備中</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: H * scale, overflow: 'hidden', borderRadius: 12 }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: W, height: H, pointerEvents: 'none' }}>
        <template.PreviewCard />
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

  const searchableFields = useMemo(() => deriveSearchableFields(templateRow.block_pool), [templateRow.block_pool])
  const initialFilters = useMemo(() => Object.fromEntries(searchableFields.map(f => [f.dataKey, ''])), [searchableFields])
  const [filters, setFilters] = useState<TemplateFilters>(() => Object.fromEntries(searchableFields.map(f => [f.dataKey, ''])))

  const buildQuery = useCallback((f: TemplateFilters, cursor: string | null) => {
    const params = new URLSearchParams({ template: templateId, community: 'vrchat' })
    for (const [key, val] of Object.entries(f)) {
      if (val) params.set(key, val)
    }
    if (cursor) params.set('cursor', cursor)
    return `/api/cards/explore?${params.toString()}`
  }, [templateId])

  const search = useCallback((newFilters: TemplateFilters) => {
    setFilters(newFilters)
    startTransition(async () => {
      const res = await fetch(buildQuery(newFilters, null))
      if (!res.ok) return
      const { cards: fetched } = await res.json()
      setCards(fetched ?? [])
      setHasMore((fetched ?? []).length === (isPro ? 24 : 20))
    })
  }, [buildQuery, isPro])

  function toggleFilter(dataKey: string, value: string) {
    const next = { ...filters, [dataKey]: filters[dataKey] === value ? '' : value }
    search(next)
  }

  const loadMore = useCallback(() => {
    startTransition(async () => {
      const last = cards[cards.length - 1]
      if (!last) return
      const res = await fetch(buildQuery(filters, last.created_at))
      if (!res.ok) return
      const { cards: more } = await res.json()
      if (!more?.length) { setHasMore(false); return }
      setCards(prev => [...prev, ...more])
      if (more.length < (isPro ? 24 : 20)) setHasMore(false)
    })
  }, [cards, filters, buildQuery, isPro])

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
        <div className="flex items-center gap-1 text-sm text-gray-500 min-w-0 overflow-hidden">
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

        </div>

        {/* テンプレート固有フィルター（Pro・searchable フィールドがある場合のみ） */}
        {isPro && searchableFields.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-4">
              {searchableFields.map(field => (
                <div key={field.dataKey}>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">{field.label}</p>
                  <div className="flex gap-2 flex-wrap">
                    {field.options.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => toggleFilter(field.dataKey, opt.value)}
                        className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                          filters[field.dataKey] === opt.value
                            ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {Object.values(filters).some(Boolean) && (
                <button
                  onClick={() => search(initialFilters)}
                  className="self-start text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕ フィルターをリセット
                </button>
              )}
            </div>
          </div>
        )}

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
              <p className="text-xs text-gray-400 mb-4">
                {!isPro && cards.length >= 20 ? `${cards.length}件` : `全${cards.length}件`}
                {!isPro && cards.length >= 20 && <span className="ml-2 text-gray-300">（最新20件）</span>}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {cards.map(card => (
                  <Link
                    key={card.id}
                    href={`/card/${card.id}`}
                    className="group block bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-sky-200 hover:shadow-md transition-all"
                  >
                    {card.image_url ? (
                      <div
                        className="aspect-video overflow-hidden"
                        style={{ background: cardBgStyle(card.background) }}
                      >
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
                      <div className="flex items-center justify-between mt-0.5 gap-1">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-0.5 text-[10px] text-pink-400 bg-pink-50 px-1.5 py-0.5 rounded-full">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                            {card.like_count}
                          </span>
                          <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            {card.view_count}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-300 shrink-0">{relativeDate(card.created_at)}</p>
                      </div>
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

        {/* 他のテンプレート */}
        {siblingTemplates.filter(t => t.id !== templateId).length > 0 && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
            <div className="border-t border-gray-100 pt-8">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">他のテンプレート</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {siblingTemplates.filter(t => t.id !== templateId).map(t => (
                  <Link
                    key={t.id}
                    href={`/c/vrchat/${t.id}`}
                    className="group block bg-white rounded-xl border border-gray-100 hover:border-sky-200 hover:shadow-md overflow-hidden transition-all"
                  >
                    <div className="overflow-hidden">
                      <SamplePreview row={t} />
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-xs font-semibold text-gray-700 group-hover:text-[#00AADB] transition-colors line-clamp-2">{t.label}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
