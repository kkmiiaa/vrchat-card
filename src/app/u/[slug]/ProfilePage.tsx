'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getBackgroundStyle } from '@/utils/backgroundUtils'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ProfileRow, ProfileLink } from '@/lib/types'
import type { CardTemplate } from '@/blocks/types'
import type { TemplateLayoutRow } from '@/lib/templateLayout'
import { buildCardTemplateFromDefinition } from '@/lib/buildCardTemplate'
import { migrateLegacyCardData } from '@/lib/legacyCardDataMigration'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import HeaderAuth from '@/components/HeaderAuth'
import AnnouncementBanner from '@/components/AnnouncementBanner'
import { trackEvent } from '@/lib/gtag'
import { deleteCard } from '@/lib/saveCard'
import { FREE_CARD_LIMIT } from '@/lib/plans'
import { fontMap } from '@/lib/fontMap'
import ProBadge from '@/components/ProBadge'
import SettingsModal from '@/components/SettingsModal'
import { IoSettingsOutline } from 'react-icons/io5'
import { translations } from '@/utils/translations'

import type { BackgroundValue } from '@/blocks/types'

type Card = {
  id: string
  title: string
  template_id: string
  card_data: Record<string, unknown> | null
  background: BackgroundValue | null
  image_url: string | null
  visibility: string
  created_at: string
}

function cardBg(background: BackgroundValue | null): string | null {
  if (!background) return null
  return getBackgroundStyle(background.type, background.value, background.base64 ?? null)
}

function cardBgType(background: BackgroundValue | null): string | null {
  return background?.type ?? null
}

function LiveCardPreview({
  templateId,
  templateDbRow,
  cardData,
  onOrientation,
  transparentBg,
}: {
  templateId: string
  templateDbRow?: TemplateLayoutRow | null
  cardData: Record<string, unknown> | null
  onOrientation?: (o: 'card' | 'web') => void
  transparentBg?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [template, setTemplate] = useState<CardTemplate | null>(null)

  useEffect(() => {
    const { template: t } = buildCardTemplateFromDefinition(null, templateDbRow ?? null)
    setTemplate(t)
    onOrientation?.(t.cardWidth >= t.cardHeight ? 'card' : 'web')
  }, [templateId, templateDbRow]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const values = migrateLegacyCardData(templateId, cardData ?? {})
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

type Announcement = { id: string; title: string; body: string; published_at: string }

type Props = {
  profile: ProfileRow
  slug: string
  userRowId: string
  cards: Card[]
  isOwner: boolean
  plan?: 'free' | 'pro'
  announcements?: Announcement[]
  templateDbRows?: Record<string, TemplateLayoutRow>
}

export default function ProfilePage({ profile, slug, userRowId, cards: initialCards, isOwner, plan = 'free', announcements = [], templateDbRows = {} }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // 新規登録直後のイベント
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      trackEvent('sign_up', { method: 'email' })
      router.replace(`/u/${slug}`)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // --- 表示状態 ---
  const [cards, setCards] = useState(initialCards)
  const [deletingId, setDeletingId] = useState<string | null>(null)
const [orientations, setOrientations] = useState<Record<string, 'card' | 'web'>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const setOrientation = useCallback((id: string, o: 'card' | 'web') => {
    setOrientations(prev => prev[id] === o ? prev : { ...prev, [id]: o })
  }, [])

  function handleCopyUrl(cardId: string) {
    const url = `${window.location.origin}/card/${cardId}`
    navigator.clipboard.writeText(url)
    setCopiedId(cardId)
    setTimeout(() => setCopiedId(null), 2000)
    trackEvent('card_url_shared', { card_id: cardId })
  }

  // --- 編集モード ---
  const [editMode, setEditMode] = useState(false)
  const [displayName, setDisplayName] = useState(profile.display_name ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [links, setLinks] = useState<(ProfileLink & { _id: number })[]>(
    (profile.profile_links ?? []).length > 0
      ? [...profile.profile_links].sort((a, b) => a.sort_order - b.sort_order).map(l => ({ ...l, _id: Math.random() }))
      : [newLink()]
  )
  const [currentSlug, setCurrentSlug] = useState(slug)
  const [slugInput, setSlugInput] = useState(slug)
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'ok' | 'taken' | 'invalid'>('idle')
  const slugTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url ?? null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      const cacheBusted = `${publicUrl}?t=${Date.now()}`
      await supabase.from('profiles').update({ avatar_url: cacheBusted }).eq('user_id', user.id)
      setAvatarUrl(cacheBusted)
    } catch (err) {
      console.error('avatar upload failed', err)
    } finally {
      setAvatarUploading(false)
    }
  }

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
    const cleanLinks = links.filter(l => l.url.trim()).map(({ url, label }, i) => ({
      user_id: userRowId,
      url: url.trim(),
      label: label.trim(),
      sort_order: i,
    }))

    // profile_links を差し替え（delete + insert）
    await supabase.from('profile_links').delete().eq('user_id', userRowId)
    if (cleanLinks.length > 0) {
      await supabase.from('profile_links').insert(cleanLinks)
    }

    const [profileRes, slugRes] = await Promise.all([
      supabase.from('profiles').update({ display_name: displayName, bio }).eq('user_id', userRowId),
      slugInput !== currentSlug
        ? supabase.from('users').update({ username_slug: slugInput }).eq('id', userRowId)
        : Promise.resolve({ error: null }),
    ])
    setSaving(false)
    const error = profileRes.error ?? (slugRes as { error: unknown }).error
    if (error) { alert('保存に失敗しました'); return }
    trackEvent('profile_edited')
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
    setLinks((profile.profile_links ?? []).length > 0
      ? [...profile.profile_links].sort((a, b) => a.sort_order - b.sort_order).map(l => ({ ...l, _id: Math.random() }))
      : [newLink()])
    setSlugInput(currentSlug)
    setSlugStatus('idle')
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
    <div className="min-h-screen flex flex-col" style={{ background: '#f8fafc' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full border-2 border-sky-100 opacity-50" />
        <div className="absolute bottom-20 -left-10 w-56 h-56 rounded-full border border-cyan-100 opacity-40" />
        <div className="absolute top-1/3 right-[6%] w-4 h-4 rounded-full bg-sky-200/50" />
        <div className="absolute bottom-1/3 left-[8%] w-3 h-3 rounded-full bg-cyan-200/60" />
        <div className="absolute top-0 right-0 w-96 h-60 bg-sky-50 rounded-full blur-[80px] opacity-50" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-20 border-b border-sky-100 shadow-sm h-14 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md">
        <Link href="/" className="text-xl font-black tracking-tight text-[#00AADB]">vaacard</Link>
        <div className="flex items-center gap-4">
          <Link href="/c/vrchat" className="text-xs font-semibold text-gray-500 hover:text-[#00AADB] transition-colors hidden sm:inline">ユーザーを探す</Link>
          <HeaderAuth hideMyPage={isOwner} />
        </div>
      </header>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}

      <main className="relative z-10 flex-1 w-full pt-[calc(3.5rem+3rem)] pb-12">
        <div className="max-w-xl mx-auto px-2 sm:px-4">
          <AnnouncementBanner announcements={announcements} />
        </div>

        {/* 編集モード全体ラッパー（プロフィール＋カード一覧を1つの枠で囲む） */}
        <div className={`transition-all ${editMode ? 'bg-sky-50/40 border-2 border-sky-200 rounded-2xl mx-4 py-4' : ''}`}>
        <div className={`max-w-xl mx-auto px-2 sm:px-4 mb-4`}>

        {/* アバター・名前・bio */}
        <div className={`relative flex flex-col items-center text-center mb-10 transition-all ${editMode ? 'pt-2 pb-2' : 'px-0 pt-8 pb-0'}`}>
          {isOwner && !editMode && (
            <div className="absolute top-0 right-0 flex items-center gap-2">
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-sky-200 text-xs font-semibold text-sky-400 hover:border-[#00AADB] hover:text-[#00AADB] hover:bg-sky-50 transition-all shadow-sm bg-white">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                編集
              </button>
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-400 hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all shadow-sm bg-white"
              >
                <IoSettingsOutline size={12} />
                設定
              </button>
            </div>
          )}
          <div className={`relative mb-4 group ${isOwner && !editMode ? 'mt-8' : ''}`}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName || currentSlug}
                className="w-20 h-20 rounded-full object-cover border-2 border-sky-100 shadow-md shadow-sky-100" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00AADB] to-[#00C9B8] text-white flex items-center justify-center text-xl font-bold shadow-md shadow-sky-200">
                {initials}
              </div>
            )}
            {isOwner && (
              <>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  {avatarUploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </>
            )}
          </div>

          {/* 表示名 */}
          {editMode ? (
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={30}
              placeholder="あなたの名前"
              className="text-lg font-bold text-gray-900 text-center bg-transparent border-b-2 border-[#00AADB] focus:outline-none w-full max-w-[200px]" />
          ) : (
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">{displayName || currentSlug}</h1>
              {plan === 'pro' && <ProBadge size={16} />}
            </div>
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
        </div>

        {/* カード一覧 */}
        <div className="max-w-5xl mx-auto px-2 sm:px-4">
            {isOwner && cards.length > 0 && (() => {
              const atLimit = plan === 'free' && cards.length >= FREE_CARD_LIMIT
              return (
                <div className="flex items-center justify-between mb-4 gap-3">
                  {atLimit ? (
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 flex-1 min-w-0">
                      <span>Freeプランはカード{FREE_CARD_LIMIT}枚まで</span>
                      <Link href="/upgrade" className="font-bold text-[#00AADB] hover:underline shrink-0">Proにアップグレード →</Link>
                    </div>
                  ) : <div className="flex-1" />}
                  <Link
                    href={atLimit ? '/upgrade' : '/card/new'}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition-opacity shadow-sm shrink-0 ${
                      atLimit
                        ? 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white hover:opacity-90 shadow-sky-200'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    カードを追加
                  </Link>
                </div>
              )
            })()}

            {cards.length > 0 ? (
              <div className="grid gap-x-4 gap-y-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))' }}>
                {cards.map(card => {
                  const isPortrait = orientations[card.id] === 'web'
                  const colSpan = 'col-span-1'
                  return (
                    <div key={card.id} className={`group ${colSpan}`}>
                      {/* カードプレビュー本体 */}
                      <div className="relative" style={{ padding: '32px 16px' }}>
                        {(() => {
                          const bg = cardBg(card.background) ?? 'linear-gradient(135deg, #c7d2fe, #bae6fd)'
                          const hasCustomBg = !!cardBg(card.background)
                          const bgType = cardBgType(card.background)
                          const isImage = bgType === 'image'
                          return (<>
                            {/* 近接層：カード背景をソリッドに表示 */}
                            <div aria-hidden style={{
                              position: 'absolute',
                              inset: '28px 16px',
                              background: bg,
                              borderRadius: 12,
                              opacity: hasCustomBg ? 1 : 0,
                              boxShadow: hasCustomBg ? 'inset 0 0 0 1px rgba(0,0,0,0.06)' : 'none',
                              pointerEvents: 'none',
                              zIndex: 0,
                            }} />
                            {/* halo：カード輪郭から外側にぼかして広がる */}
                            <div aria-hidden style={{
                              position: 'absolute',
                              inset: '10px 0px -18px',
                              background: bg,
                              borderRadius: 16,
                              filter: isImage ? 'blur(18px)' : 'blur(14px)',
                              opacity: hasCustomBg ? 0.25 : 0.12,
                              pointerEvents: 'none',
                              zIndex: 0,
                            }} />
                          </>)
                        })()}
                        <Link href={`/card/${card.id}`} className="profile-card-hover block cursor-pointer relative" style={{ zIndex: 1 }}>
                          <div style={{ borderRadius: 16, overflow: 'hidden', isolation: 'isolate' }}>
                            <LiveCardPreview
                              templateId={card.template_id}
                              templateDbRow={templateDbRows[card.template_id]}
                              cardData={card.card_data}
                              onOrientation={o => setOrientation(card.id, o)}
                              transparentBg
                            />
                          </div>

                          {/* 界隈タグ：左上に重ねる（テンプレート経由で界隈を表示） */}
                          {(card.templates as { community_templates?: { community_slug: string }[] } | null)?.community_templates?.length ? (
                            <div className="absolute top-1 left-2 flex gap-1 z-10 pointer-events-none">
                              {(card.templates as { community_templates: { community_slug: string }[] }).community_templates.map((ct, i) => (
                                <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-sky-200 text-sky-400 bg-white/80 backdrop-blur-sm whitespace-nowrap">
                                  {ct.community_slug}
                                </span>
                              ))}
                            </div>
                          ) : null}

                          {/* 下書きバッジ：image_url未保存のカードにオーナーのみ表示 */}
                          {isOwner && !card.image_url && (
                            <div className="absolute top-1 right-2 z-10 pointer-events-none">
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-500">
                                下書き
                              </span>
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
                            title="共有ページを確認"
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-sky-200 text-sky-400 hover:text-[#00AADB] hover:border-sky-400 transition-all bg-white shadow-md"
                            onClick={e => { e.stopPropagation(); e.preventDefault(); window.open(`/card/${card.id}`, '_blank') }}>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            title="編集"
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-sky-200 text-sky-400 hover:text-[#00AADB] hover:border-sky-400 transition-all bg-white shadow-md"
                            onClick={e => { e.stopPropagation(); e.preventDefault(); router.push(`/card/${card.id}/edit`) }}>
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
