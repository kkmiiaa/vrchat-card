'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ProfileRow, ProfileLink } from '@/lib/types'
import type { CardTemplate } from '@/blocks/types'
import { v1Template } from '@/templates/v1'
import { v2Template } from '@/templates/v2'

const templateMap: Record<string, CardTemplate> = { v1: v1Template, v2: v2Template }
import Link from 'next/link'
import HeaderAuth from '@/components/HeaderAuth'
import { deleteCard } from '@/lib/saveCard'
import { fontMap } from '@/lib/fontMap'
import { translations } from '@/utils/translations'

type Card = {
  id: string
  title: string
  template_id: string
  card_data: Record<string, unknown> | null
  image_url: string | null
  visibility: string
  created_at: string
  communities: string[]
}

function cardBg(cardData: Record<string, unknown> | null): string | null {
  const bg = cardData?.background as { type?: string; value?: string | [string, string]; base64?: string } | undefined
  if (!bg) return null
  if (bg.type === 'color' && typeof bg.value === 'string') return bg.value
  if (bg.type === 'gradient' && Array.isArray(bg.value)) return `linear-gradient(135deg, ${bg.value[0]}, ${bg.value[1]})`
  if (bg.type === 'image') return bg.base64 ? `url(${bg.base64}) center/cover no-repeat` : (typeof bg.value === 'string' ? `url(${bg.value}) center/cover no-repeat` : null)
  return null
}

function LiveCardPreview({
  templateId,
  cardData,
  onOrientation,
  transparentBg,
}: {
  templateId: string
  cardData: Record<string, unknown> | null
  onOrientation?: (o: 'landscape' | 'portrait') => void
  transparentBg?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [template, setTemplate] = useState<CardTemplate | null>(null)

  useEffect(() => {
    const t = templateMap[templateId]
    if (!t) return
    setTemplate(t)
    onOrientation?.(t.cardWidth >= t.cardHeight ? 'landscape' : 'portrait')
  }, [templateId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!template) return
    const winW = window.innerWidth
    const initialScale = winW / template.cardWidth
    console.log('[profile-scale-debug] cardWidth:', template.cardWidth, 'window.innerWidth:', winW, 'initialScale:', initialScale)
    setScale(initialScale)

    const el = containerRef.current
    console.log('[profile-scale-debug] containerRef width:', el?.getBoundingClientRect().width)
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      console.log('[profile-scale-debug] ResizeObserver width:', w)
      if (w > 0) setScale(w / template.cardWidth)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [template])

  if (!template) return <div className="w-full aspect-video bg-sky-50 animate-pulse" />

  const values = cardData ?? {}
  const fontKey = (values.font as string) ?? 'rounded'
  const fontFamily = (fontMap as Record<string, { style: { fontFamily: string } }>)[fontKey]?.style?.fontFamily ?? 'sans-serif'

  return (
    <div ref={containerRef} style={{ width: '100%', height: template.cardHeight * scale, overflow: 'hidden' }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: template.cardWidth, height: template.cardHeight, pointerEvents: 'none' }}>
        <template.CardRenderer values={values} fontFamily={fontFamily} t={translations.ja} noBackground={transparentBg} />
      </div>
    </div>
  )
}

const SERVICE_MAP: { pattern: RegExp; label: string; icon: string; color: string }[] = [
  { pattern: /x\.com|twitter\.com/i,   label: 'X',         icon: '𝕏',   color: '#000000' },
  { pattern: /vrchat\.com/i,            label: 'VRChat',    icon: 'VRC', color: '#1db4d4' },
  { pattern: /discord\.(gg|com)/i,      label: 'Discord',   icon: 'DC',  color: '#5865f2' },
  { pattern: /instagram\.com/i,         label: 'Instagram', icon: 'IG',  color: '#e1306c' },
  { pattern: /github\.com/i,            label: 'GitHub',    icon: 'GH',  color: '#333333' },
  { pattern: /youtube\.com|youtu\.be/i, label: 'YouTube',   icon: 'YT',  color: '#ff0000' },
  { pattern: /twitch\.tv/i,             label: 'Twitch',    icon: 'TW',  color: '#9146ff' },
  { pattern: /tiktok\.com/i,            label: 'TikTok',    icon: 'TK',  color: '#010101' },
  { pattern: /skeb\.jp/i,               label: 'Skeb',      icon: 'SK',  color: '#1d9bf0' },
  { pattern: /booth\.pm/i,              label: 'BOOTH',     icon: 'BO',  color: '#fc4d50' },
]

function detectService(url: string) {
  for (const s of SERVICE_MAP) if (s.pattern.test(url)) return s
  return null
}

function newLink(): ProfileLink & { _id: number } {
  return { url: '', label: '', _id: Date.now() + Math.random() }
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,29}$/

type Props = {
  profile: ProfileRow
  slug: string
  userRowId: string
  cards: Card[]
  isOwner: boolean
}

export default function ProfilePage({ profile, slug, userRowId, cards: initialCards, isOwner }: Props) {
  const router = useRouter()
  const supabase = createClient()

  // --- 表示状態 ---
  const [cards, setCards] = useState(initialCards)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [titleEdits, setTitleEdits] = useState<Record<string, string>>({})
  const [orientations, setOrientations] = useState<Record<string, 'landscape' | 'portrait'>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const setOrientation = useCallback((id: string, o: 'landscape' | 'portrait') => {
    setOrientations(prev => prev[id] === o ? prev : { ...prev, [id]: o })
  }, [])

  function handleCopyUrl(cardId: string) {
    const url = `${window.location.origin}/card/${cardId}/view`
    navigator.clipboard.writeText(url)
    setCopiedId(cardId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // --- 編集モード ---
  const [editMode, setEditMode] = useState(false)
  const [displayName, setDisplayName] = useState(profile.display_name ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [links, setLinks] = useState<(ProfileLink & { _id: number })[]>(
    (profile.links ?? []).length > 0
      ? (profile.links as (ProfileLink & { _id: number })[]).map(l => ({ ...l, _id: Math.random() }))
      : [newLink()]
  )
  const [currentSlug, setCurrentSlug] = useState(slug)
  const [slugInput, setSlugInput] = useState(slug)
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'ok' | 'taken' | 'invalid'>('idle')
  const slugTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function onSlugChange(val: string) {
    const v = val.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSlugInput(v)
    if (v === currentSlug) { setSlugStatus('idle'); return }
    if (!SLUG_RE.test(v)) { setSlugStatus('invalid'); return }
    setSlugStatus('checking')
    if (slugTimer.current) clearTimeout(slugTimer.current)
    slugTimer.current = setTimeout(async () => {
      const { data } = await supabase.from('users').select('id').eq('username_slug', v).single()
      setSlugStatus(data ? 'taken' : 'ok')
    }, 500)
  }

  function updateLink(id: number, field: 'url' | 'label', value: string) {
    setLinks(prev => prev.map(l => {
      if (l._id !== id) return l
      const updated = { ...l, [field]: value }
      if (field === 'url' && !l.label) {
        const service = detectService(value)
        if (service) updated.label = service.label
      }
      return updated
    }))
  }

  async function handleSave() {
    if (slugStatus === 'taken' || slugStatus === 'invalid') return
    setSaving(true)
    const cleanLinks = links.filter(l => l.url.trim()).map(({ url, label }) => ({ url: url.trim(), label: label.trim() }))
    const titleUpdates = cards
      .filter(c => titleEdits[c.id] !== undefined && titleEdits[c.id] !== (c.title ?? ''))
      .map(c => fetch(`/api/cards/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: titleEdits[c.id] }),
      }))
    const [profileRes, slugRes] = await Promise.all([
      supabase.from('profiles').update({ display_name: displayName, bio, links: cleanLinks }).eq('user_id', userRowId),
      slugInput !== currentSlug
        ? supabase.from('users').update({ username_slug: slugInput }).eq('id', userRowId)
        : Promise.resolve({ error: null }),
      ...titleUpdates,
    ])
    setSaving(false)
    const error = profileRes.error ?? (slugRes as { error: unknown }).error
    if (error) { alert('保存に失敗しました'); return }
    setCards(prev => prev.map(c => titleEdits[c.id] !== undefined ? { ...c, title: titleEdits[c.id] } : c))
    setSaved(true)
    if (slugInput !== currentSlug) {
      setCurrentSlug(slugInput)
      router.replace(`/u/${slugInput}`)
    }
    setEditMode(false)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleCancelEdit() {
    setDisplayName(profile.display_name ?? '')
    setBio(profile.bio ?? '')
    setLinks((profile.links ?? []).length > 0
      ? (profile.links as (ProfileLink & { _id: number })[]).map(l => ({ ...l, _id: Math.random() }))
      : [newLink()])
    setSlugInput(currentSlug)
    setSlugStatus('idle')
    setTitleEdits({})
    setEditMode(false)
  }

  async function handleDelete(cardId: string) {
    if (!confirm('このカードを削除しますか？この操作は取り消せません。')) return
    setDeletingId(cardId)
    const result = await deleteCard(cardId)
    if ('error' in result) alert('削除に失敗しました: ' + result.error)
    else setCards(prev => prev.filter(c => c.id !== cardId))
    setDeletingId(null)
  }

  const initials = (displayName || currentSlug).slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen flex flex-col overflow-hidden" style={{ background: '#f8fafc' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full border-2 border-sky-100 opacity-50" />
        <div className="absolute bottom-20 -left-10 w-56 h-56 rounded-full border border-cyan-100 opacity-40" />
        <div className="absolute top-1/3 right-[6%] w-4 h-4 rounded-full bg-sky-200/50" />
        <div className="absolute bottom-1/3 left-[8%] w-3 h-3 rounded-full bg-cyan-200/60" />
        <div className="absolute top-0 right-0 w-96 h-60 bg-sky-50 rounded-full blur-[80px] opacity-50" />
      </div>

      <header className="relative z-10 border-b border-sky-100 h-14 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md">
        <Link href="/" className="text-xl font-black tracking-tight text-[#00AADB]">vaacard</Link>
        <HeaderAuth hideMyPage={isOwner} />
      </header>

      <main className="relative z-10 flex-1 max-w-xl mx-auto w-full px-4 py-12">

        {/* 編集モード全体ラッパー */}
        <div className={`rounded-2xl transition-all mb-4 ${editMode ? 'border-2 border-sky-200 bg-sky-50/40 px-4 pt-4 pb-4' : ''}`}>

        {/* アバター・名前・bio */}
        <div className={`relative flex flex-col items-center text-center mb-10 transition-all ${editMode ? 'pt-2 pb-2' : 'px-0 pt-8 pb-0'}`}>
          {isOwner && !editMode && (
            <button
              onClick={() => {
                setTitleEdits(Object.fromEntries(cards.map(c => [c.id, c.title ?? ''])))
                setEditMode(true)
              }}
              className="absolute top-0 right-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-sky-200 text-xs font-semibold text-sky-400 hover:border-[#00AADB] hover:text-[#00AADB] hover:bg-sky-50 transition-all shadow-sm bg-white">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              編集
            </button>
          )}
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={displayName || currentSlug}
              className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-sky-100 shadow-md shadow-sky-100" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00AADB] to-[#00C9B8] text-white flex items-center justify-center text-xl font-bold mb-4 shadow-md shadow-sky-200">
              {initials}
            </div>
          )}

          {/* 表示名 */}
          {editMode ? (
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={30}
              placeholder="あなたの名前"
              className="text-lg font-bold text-gray-900 text-center bg-transparent border-b-2 border-[#00AADB] focus:outline-none w-full max-w-[200px]" />
          ) : (
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">{displayName || currentSlug}</h1>
          )}

          {/* スラッグ */}
          {editMode ? (
            <div className="mt-1">
              <div className="flex items-center gap-1 justify-center">
                <span className="text-xs text-sky-400 font-semibold">@</span>
                <input type="text" value={slugInput} onChange={e => onSlugChange(e.target.value)} maxLength={30}
                  className="text-xs text-sky-400 font-semibold font-mono bg-transparent border-b border-sky-300 focus:outline-none w-32 text-center" />
              </div>
              <div className="h-4 mt-0.5">
                {slugStatus === 'checking' && <p className="text-[10px] text-gray-400">確認中…</p>}
                {slugStatus === 'ok'       && <p className="text-[10px] text-green-500">✓ 使用できます</p>}
                {slugStatus === 'taken'    && <p className="text-[10px] text-red-400">すでに使われています</p>}
                {slugStatus === 'invalid'  && <p className="text-[10px] text-red-400">3〜30文字の英小文字・数字・ハイフンのみ</p>}
              </div>
            </div>
          ) : (
            <p className="text-xs text-sky-400 font-semibold mt-0.5">@{currentSlug}</p>
          )}

          {/* bio */}
          {editMode ? (
            <div className="w-full max-w-xs mt-3">
              <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={200} rows={3}
                placeholder="自己紹介を書いてください"
                className="w-full px-3 py-2 rounded-xl border-2 border-sky-100 text-sm text-gray-400 text-center placeholder-gray-300 focus:outline-none focus:border-[#00AADB] transition-colors resize-none leading-relaxed" />
              <p className="text-[10px] text-gray-300 text-right">{bio.length}/200</p>
            </div>
          ) : (
            bio && <p className="text-gray-400 text-sm mt-3 leading-relaxed max-w-xs">{bio}</p>
          )}

          {/* リンク */}
          {editMode ? (
            <div className="w-full max-w-sm mt-5 text-left">
              <div className="space-y-2">
                {links.map(link => {
                  const service = detectService(link.url)
                  return (
                    <div key={link._id} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[9px] font-bold"
                        style={{ background: service?.color ?? '#94a3b8' }}>
                        {service?.icon ?? '🔗'}
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <input type="url" value={link.url} onChange={e => updateLink(link._id, 'url', e.target.value)}
                          placeholder="https://..." className="w-full px-2 py-1.5 rounded-lg border-2 border-sky-100 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#00AADB] transition-colors" />
                        <input type="text" value={link.label} onChange={e => updateLink(link._id, 'label', e.target.value)}
                          placeholder="ラベル" maxLength={30} className="w-full px-2 py-1.5 rounded-lg border-2 border-sky-100 text-xs text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#00AADB] transition-colors" />
                      </div>
                      <button onClick={() => setLinks(prev => prev.filter(l => l._id !== link._id))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
              <button onClick={() => setLinks(prev => [...prev, newLink()])}
                className="mt-2 w-full py-2 rounded-xl border-2 border-dashed border-sky-100 text-xs text-sky-400 hover:border-[#00AADB] hover:text-[#00AADB] hover:bg-sky-50 transition-colors">
                + リンクを追加
              </button>
            </div>
          ) : (
            links.some(l => l.url.trim()) && (
              <div className="flex flex-wrap gap-2 mt-5 justify-center">
                {links.filter(l => l.url.trim()).map((link, i) => {
                  const service = detectService(link.url)
                  return (
                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold hover:opacity-70 active:scale-95 transition-all bg-white"
                      style={{ borderColor: service?.color ?? '#94a3b8', color: service?.color ?? '#94a3b8' }}>
                      <span className="opacity-80">{service?.icon ?? '🔗'}</span>
                      <span>{link.label || service?.label || link.url}</span>
                    </a>
                  )
                })}
              </div>
            )
          )}
        </div>

        {/* カード一覧 */}
        <div>
            {isOwner && cards.length > 0 && (
              <div className="flex justify-end mb-4">
                <Link href="/card/new"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity shadow-sm shadow-sky-200">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  カードを追加
                </Link>
              </div>
            )}

            {cards.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-8">
                {cards.map(card => {
                  const isPortrait = orientations[card.id] === 'portrait'
                  const colSpan = isPortrait ? 'col-span-1' : 'col-span-2'
                  return (
                    <div key={card.id} className={`group ${colSpan}`}>
                      {editMode && (
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <input
                            type="text"
                            value={titleEdits[card.id] ?? card.title ?? ''}
                            onChange={e => setTitleEdits(prev => ({ ...prev, [card.id]: e.target.value }))}
                            maxLength={40}
                            placeholder="タイトルを入力"
                            className="flex-1 text-sm font-bold text-gray-700 bg-transparent border-b border-[#00AADB] focus:outline-none py-0.5"
                          />
                        </div>
                      )}

                      {/* カードプレビュー本体 */}
                      <Link href={`/card/${card.id}/view`} className="block cursor-pointer relative" style={{ padding: '20px 12px' }}>
                        {cardBg(card.card_data) && (<>
                          {/* 中心 */}
                          <div aria-hidden style={{
                            position: 'absolute',
                            inset: '-12px -8px',
                            background: cardBg(card.card_data)!,
                            filter: 'blur(20px)',
                            maskImage: 'radial-gradient(ellipse 80% 75% at 50% 50%, black 0%, black 40%, transparent 85%)',
                            WebkitMaskImage: 'radial-gradient(ellipse 80% 75% at 50% 50%, black 0%, black 40%, transparent 85%)',
                            opacity: 0.6,
                            mixBlendMode: 'multiply',
                            pointerEvents: 'none',
                            zIndex: 0,
                          }} />
                          {/* 外側 */}
                          <div aria-hidden style={{
                            position: 'absolute',
                            inset: '-80px -60px',
                            background: cardBg(card.card_data)!,
                            filter: 'blur(100px)',
                            maskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, black 0%, transparent 75%)',
                            WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, black 0%, transparent 75%)',
                            opacity: 0.45,
                            mixBlendMode: 'multiply',
                            pointerEvents: 'none',
                            zIndex: 0,
                          }} />
                        </>)}
                        <div className="profile-card-hover" style={{ position: 'relative', zIndex: 1, borderRadius: 16, overflow: 'hidden', isolation: 'isolate' }}>
                          <LiveCardPreview
                            templateId={card.template_id}
                            cardData={card.card_data}
                            onOrientation={o => setOrientation(card.id, o)}
                            transparentBg
                          />
                        </div>

                        {/* 界隈タグ：左上に重ねる */}
                        {card.communities?.length > 0 && (
                          <div className="absolute top-1 left-2 flex gap-1 z-10 pointer-events-none">
                            {card.communities.map((c, i) => (
                              <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-sky-200 text-sky-400 bg-white/80 backdrop-blur-sm whitespace-nowrap">
                                {c}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* オーナー操作：右下に重ねる */}
                        {isOwner && (
                          <div className="absolute bottom-1 right-2 flex gap-1.5 z-10" onClick={e => e.preventDefault()}>
                            <button
                              onClick={() => handleCopyUrl(card.id)}
                              title="URLをコピー"
                              className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all bg-white shadow-md ${
                                copiedId === card.id
                                  ? 'border-green-300 text-green-500'
                                  : 'border-sky-200 text-sky-400 hover:text-[#00AADB] hover:border-sky-400'
                              }`}>
                              {copiedId === card.id
                                ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            }
                          </button>
                          <button
                            title="編集"
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-sky-200 text-sky-400 hover:text-[#00AADB] hover:border-sky-400 transition-all bg-white shadow-md"
                            onClick={e => { e.stopPropagation(); e.preventDefault(); router.push(`/card/${card.id}`) }}>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {editMode && (
                            <button onClick={() => handleDelete(card.id)} disabled={deletingId === card.id}
                              title="削除"
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-red-100 text-red-300 hover:text-red-500 hover:border-red-300 transition-all disabled:opacity-40 bg-white/80 backdrop-blur-sm">
                              {deletingId === card.id
                                ? <div className="w-3 h-3 border border-red-300 border-t-red-500 rounded-full animate-spin" />
                                : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                              }
                            </button>
                          )}
                          </div>
                        )}
                      </Link>
                    </div>
                  )
                })}
              </div>
            ) : isOwner ? (
              <div className="text-center py-16 border-2 border-dashed border-sky-100 rounded-2xl">
                <p className="text-gray-400 text-sm mb-4">カードがまだありません</p>
                <Link href="/card/new"
                  className="inline-flex items-center gap-2 text-xs font-semibold bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity shadow-sm shadow-sky-200">
                  カードを作成する →
                </Link>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-300 text-sm">カードがまだありません</div>
            )}
          </div>

        {/* 保存ボタンの高さ分のスペーサー */}
        {editMode && <div className="h-20" />}

        </div>{/* /編集モード全体ラッパー */}

        <p className="text-center text-xs text-gray-300 mt-16">
          by <span className="font-bold text-[#00AADB]">vaacard</span>
        </p>
      </main>

      {/* 保存・キャンセル 固定フローティング（編集モード時のみ） */}
      {editMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-md rounded-full px-3 py-2 shadow-lg shadow-sky-100 border border-sky-100">
          <button onClick={handleCancelEdit}
            className="px-4 py-1.5 rounded-full text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
            キャンセル
          </button>
          <button onClick={handleSave}
            disabled={saving || slugStatus === 'taken' || slugStatus === 'invalid' || slugStatus === 'checking'}
            className="px-5 py-1.5 rounded-full bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm">
            {saved ? '✓ 保存しました' : saving ? '保存中...' : '保存する'}
          </button>
        </div>
      )}
    </div>
  )
}
