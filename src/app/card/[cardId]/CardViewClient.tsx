'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { CardTemplate } from '@/blocks/types'
import { fontMap } from '@/lib/fontMap'
import HeaderAuth from '@/components/HeaderAuth'
import { translations } from '@/utils/translations'
import { relativeDate } from '@/utils/relativeDate'
import { createClient } from '@/lib/supabase/client'

export type CardViewWrapperProps = {
  cardId: string
  templateId: string
  isOwner: boolean
  likeCount: number
  viewCount: number
  ownerSlug: string | null
  ownerName: string | null
  ownerAvatar: string | null
  createdAt: string | null
  imageUrl: string | null
}

type Props = CardViewWrapperProps

function CopyChip({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-white/80 bg-white/60 backdrop-blur-sm hover:border-sky-300 hover:bg-white/90 transition-all text-xs font-medium text-gray-600 hover:text-[#00AADB] group shadow-sm min-h-[44px]"
    >
      {icon}
      <span className="text-gray-400 text-[10px]">{label}</span>
      <span>{value}</span>
      {copied
        ? <span className="text-[10px] text-[#00AADB]">コピー済</span>
        : <svg className="w-3 h-3 text-gray-300 group-hover:text-[#00AADB] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
      }
    </button>
  )
}

function LinkChip({ label, value, href, icon }: { label: string; value: string; href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-white/80 bg-white/60 backdrop-blur-sm hover:border-sky-300 hover:bg-white/90 transition-all text-xs font-medium text-gray-600 hover:text-[#00AADB] shadow-sm group min-h-[44px]"
    >
      {icon}
      <span className="text-gray-400 text-[10px]">{label}</span>
      <span>{value}</span>
      <svg className="w-3 h-3 text-gray-300 group-hover:text-[#00AADB] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  )
}

export default function CardViewClient({ cardId, templateId, isOwner, likeCount: initialLikeCount, viewCount, ownerSlug, ownerName, ownerAvatar, createdAt, imageUrl: initialImageUrl }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showCreatedModal, setShowCreatedModal] = useState(false)

  useEffect(() => {
    if (searchParams.get('created') === '1') {
      setShowCreatedModal(true)
      router.replace(`/card/${cardId}`)
    }
  }, [])
  const [cardData, setCardData] = useState<Record<string, unknown> | null>(null)
  const [template, setTemplate] = useState<CardTemplate | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const tiltWrapRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape')
  const [downloading, setDownloading] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [liked, setLiked] = useState(false)
  const [liking, setLiking] = useState(false)
  const [sharing, setSharing] = useState(false)

  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragOrigin = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })

  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedImageUrlRef = useRef<string | null>(initialImageUrl)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 1800)
  }, [])

  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('cards').select('card_data').eq('id', cardId).single()
      .then(({ data, error }) => {
        if (error) { setLoadError('card:' + error.message); return }
        setCardData(data?.card_data ?? {})
      })

    const loaders: Record<string, () => Promise<CardTemplate>> = {
      v1: () => import('@/templates/v1').then(m => m.v1Template),
      v2: () => import('@/templates/v2').then(m => m.v2Template),
    }
    loaders[templateId]?.()
      .then(setTemplate)
      .catch(e => setLoadError('tmpl:' + String(e)))
  }, [cardId, templateId])

  useEffect(() => {
    const handler = (e: Event) => showToast((e as CustomEvent<string>).detail)
    window.addEventListener('vaacard:copied', handler)
    return () => window.removeEventListener('vaacard:copied', handler)
  }, [showToast])

  const cardW = template ? (orientation === 'portrait' && template.portraitWidth ? template.portraitWidth : template.cardWidth) : 900
  const cardH = template ? (orientation === 'portrait' && template.portraitHeight ? template.portraitHeight : template.cardHeight) : 506

  useEffect(() => {
    if (!template) return
    const padding = orientation === 'portrait' ? 8 : 32
    setScale(Math.min(1, (window.innerWidth - padding) / cardW))
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      if (w > 0) setScale(Math.min(1, w / cardW))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [cardW, orientation, template])

  useEffect(() => {
    if (!template) return
    const hasPortrait = !!(template.portraitWidth && template.portraitHeight)
    if (hasPortrait && window.innerWidth < 768) setOrientation('portrait')
  }, [template])

  useEffect(() => {
    fetch(`/api/cards/${cardId}/view`, { method: 'POST' })
    const likedCards: string[] = JSON.parse(localStorage.getItem('vaacard-liked') ?? '[]')
    setLiked(likedCards.includes(cardId))
  }, [cardId])


  useEffect(() => {
    function onEnd() {
      if (!dragging) return
      setDragging(false)
      setOffset({ x: 0, y: 0 })
    }
    window.addEventListener('mouseup', onEnd)
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('mouseup', onEnd)
      window.removeEventListener('touchend', onEnd)
    }
  }, [dragging])

  if (!template || cardData === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 border-4 border-sky-300 border-t-[#00AADB] rounded-full animate-spin" />
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#555', textAlign: 'center', maxWidth: '90vw', wordBreak: 'break-all' }}>
          tmpl:{template ? 'ok' : 'wait'} | data:{cardData === null ? 'wait' : 'ok'} | id:{templateId}
          {loadError && <div style={{ color: 'red', marginTop: 4 }}>{loadError}</div>}
        </div>
      </div>
    )
  }

  function applyTilt(clientX: number, clientY: number) {
    const rect = tiltWrapRef.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (clientX - cx) / (rect.width / 2)
    const dy = (clientY - cy) / (rect.height / 2)
    setTilt({ x: -dy * 6, y: dx * 6 })
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (dragging) {
      setOffset({
        x: e.clientX - dragOrigin.current.mx + dragOrigin.current.ox,
        y: e.clientY - dragOrigin.current.my + dragOrigin.current.oy,
      })
      return
    }
    applyTilt(e.clientX, e.clientY)
  }

  function handleMouseLeave() {
    if (dragging) return
    setTilt({ x: 0, y: 0 })
  }

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(true)
    dragOrigin.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const t = e.touches[0]
    setDragging(true)
    dragOrigin.current = { mx: t.clientX, my: t.clientY, ox: offset.x, oy: offset.y }
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    const t = e.touches[0]
    if (dragging) {
      setOffset({
        x: t.clientX - dragOrigin.current.mx + dragOrigin.current.ox,
        y: t.clientY - dragOrigin.current.my + dragOrigin.current.oy,
      })
    } else {
      applyTilt(t.clientX, t.clientY)
    }
  }

  async function handleLike() {
    if (liking) return
    setLiking(true)
    const delta = liked ? -1 : 1
    const res = await fetch(`/api/cards/${cardId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta }),
    })
    if (res.ok) {
      const { like_count } = await res.json()
      setLikeCount(like_count)
      const likedCards: string[] = JSON.parse(localStorage.getItem('vaacard-liked') ?? '[]')
      if (delta === 1) localStorage.setItem('vaacard-liked', JSON.stringify([...likedCards, cardId]))
      else localStorage.setItem('vaacard-liked', JSON.stringify(likedCards.filter(id => id !== cardId)))
      setLiked(!liked)
    }
    setLiking(false)
  }

  const values = cardData
  const fontKey = (values.font as string) ?? 'rounded'
  const fontFamily = (fontMap as Record<string, { style: { fontFamily: string } }>)[fontKey]?.style?.fontFamily ?? 'sans-serif'

  const tweetUrl = typeof window !== 'undefined' ? window.location.href : ''
  const tweetText = encodeURIComponent('VRChatの自己紹介カードを作りました！\n#VRChat自己紹介カード #vaacard')
  const xShareHref = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(tweetUrl)}`

  const displayName = ownerName || ownerSlug || 'vaacard ユーザー'
  const initials = displayName.slice(0, 2).toUpperCase()

  const sns = values.sns as { vrchatId?: string; twitterId?: string; discordId?: string } | undefined
  const vrchatId = sns?.vrchatId?.trim()
  const twitterId = sns?.twitterId?.trim().replace(/^@/, '')
  const discordId = sns?.discordId?.trim()

  async function saveImageIfNeeded(): Promise<void> {
    if (!isOwner || !exportRef.current) return
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(exportRef.current, { pixelRatio: 2 })
      await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl }),
      })
      savedImageUrlRef.current = dataUrl
    } catch {
      // 保存失敗してもシェアは続行
    }
  }

  async function handleXShare() {
    setSharing(true)
    if (!savedImageUrlRef.current) {
      await saveImageIfNeeded()
    }
    setSharing(false)
    window.open(xShareHref, '_blank', 'noopener,noreferrer')
  }

  async function handleDownload() {
    if (!exportRef.current) return
    setDownloading(true)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(exportRef.current, { pixelRatio: 2 })
      if (isOwner && !savedImageUrlRef.current) {
        await fetch(`/api/cards/${cardId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: dataUrl }),
        })
        savedImageUrlRef.current = dataUrl
      }
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = 'vaacard.png'
      link.click()
    } finally {
      setDownloading(false)
    }
  }

  const bg = values.background as { type?: string; value?: string | [string, string]; base64?: string } | undefined
  const pageBg = (() => {
    if (!bg) return 'linear-gradient(135deg, #c7d2fe, #fbcfe8, #fde68a)'
    if (bg.type === 'color' && typeof bg.value === 'string') return bg.value
    if (bg.type === 'gradient' && Array.isArray(bg.value)) return `linear-gradient(135deg, ${bg.value[0]}, ${bg.value[1]})`
    if (bg.type === 'image') return bg.base64 ? `url(${bg.base64}) center/cover no-repeat` : (typeof bg.value === 'string' ? `url(${bg.value}) center/cover no-repeat` : 'linear-gradient(135deg, #c7d2fe, #fbcfe8)')
    return 'linear-gradient(135deg, #c7d2fe, #fbcfe8, #fde68a)'
  })()

  const shadowX = -tilt.y * 4 + offset.x * 0.3
  const shadowY = tilt.x * 4 + offset.y * 0.3
  const shadowBlur = 60 + Math.abs(tilt.x) * 3 + Math.abs(tilt.y) * 3
  const cardShadow = `${shadowX}px ${shadowY + 16}px ${shadowBlur}px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.12)`

  const shareUrl = typeof window !== 'undefined' ? window.location.origin + `/card/${cardId}` : ''

  return (
    <div className="min-h-screen flex flex-col overflow-hidden" style={{ background: pageBg }}>
      <style>{`
        .vaacard-sns-item { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .vaacard-sns-item:hover { transform: scale(1.04); box-shadow: 0 2px 12px rgba(0,170,219,0.22); }
      `}</style>

      {/* カード作成完了モーダル */}
      {showCreatedModal && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowCreatedModal(false)} />
          <div className="fixed inset-x-0 top-1/2 -translate-y-1/2 z-50 flex justify-center px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
              <div className="px-6 pt-6 pb-4 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <h2 className="text-base font-bold text-gray-900 mb-1">カードを保存しました！</h2>
                <p className="text-xs text-gray-400">URLをシェアして、みんなに見てもらおう</p>
              </div>
              <div className="px-6 pb-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl)
                  }}
                  className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-500 hover:border-sky-200 hover:bg-sky-50 transition-colors"
                >
                  <span className="truncate">{shareUrl}</span>
                  <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div className="px-6 pb-4 flex flex-col gap-2 mt-2">
                <button
                  onClick={handleXShare}
                  disabled={sharing}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  {sharing ? '準備中...' : 'Xでシェアする'}
                </button>
                {ownerSlug && (
                  <Link
                    href={`/u/${ownerSlug}`}
                    onClick={() => setShowCreatedModal(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-sky-200 text-[#00AADB] text-sm font-semibold hover:bg-sky-50 transition-colors"
                  >
                    マイページを見る
                  </Link>
                )}
                <button
                  onClick={() => setShowCreatedModal(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-white opacity-10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-white opacity-[0.08] blur-[100px]" />
      </div>

      <header className="relative z-10 border-b border-white/30 h-14 px-6 flex items-center justify-between bg-white/20 backdrop-blur-md">
        <Link href="/" className="text-xl font-black tracking-tight text-white drop-shadow-md" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>vaacard</Link>
        <div className="flex items-center gap-2">
          {isOwner && (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href={`/card/${cardId}/edit`}
                className="text-xs font-medium text-gray-500 border border-white/80 bg-white/60 rounded-full px-3 py-1.5 hover:border-sky-300 hover:text-[#00AADB] hover:bg-white/90 transition-colors backdrop-blur-sm"
              >
                編集
              </Link>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#00AADB] to-[#00C9B8] rounded-full px-4 py-1.5 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm shadow-sky-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {downloading ? '...' : '画像で保存'}
              </button>
              <button
                onClick={handleXShare}
                disabled={sharing}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-black rounded-full px-4 py-1.5 hover:opacity-80 transition-opacity shadow-sm disabled:opacity-50"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                {sharing ? '...' : 'Xで共有'}
              </button>
            </div>
          )}
          <HeaderAuth variant="white" />
        </div>
      </header>

      <main className={['relative z-10 flex-1 flex flex-col items-center justify-center py-10 gap-5 overflow-x-hidden', orientation === 'portrait' ? 'px-1' : 'px-4'].join(' ')}>

        <div className="w-full flex justify-center" style={{ maxWidth: cardW }}>
          <div
            ref={tiltWrapRef}
            className="w-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: dragging ? 'none' : 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
              willChange: 'transform',
              cursor: dragging ? 'grabbing' : 'grab',
              position: 'relative',
              touchAction: 'none',
              filter: `drop-shadow(${cardShadow})`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: '50%',
                transform: `translateX(-50%) translateY(${toast ? 0 : -8}px)`,
                opacity: toast ? 1 : 0,
                transition: 'opacity 0.2s ease, transform 0.2s ease',
                zIndex: 20,
                pointerEvents: 'none',
                background: 'rgba(0,0,0,0.72)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                padding: '5px 14px',
                borderRadius: 999,
                whiteSpace: 'nowrap',
                backdropFilter: 'blur(4px)',
              }}
            >
              {toast}
            </div>

            <div className={orientation === 'portrait' ? 'flex justify-center' : ''}>
              <div
                ref={containerRef}
                style={{ width: '100%', maxWidth: orientation === 'portrait' ? 620 : undefined, overflow: 'hidden' }}
              >
                <div style={{ width: '100%', height: cardH * scale, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: cardW, height: cardH, position: 'absolute', top: 0, left: 0 }}>
                    <template.CardRenderer values={values} fontFamily={fontFamily} t={translations.ja} isInteractive orientation={orientation} cardUrl={shareUrl} userUrl={ownerSlug ? shareUrl.replace(/\/card\/.*$/, '') + `/u/${ownerSlug}` : undefined} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {template.portraitWidth && (
          <div className="flex items-center gap-1 bg-white/40 backdrop-blur-sm rounded-full p-1 border border-white/60">
            <button
              onClick={() => setOrientation('landscape')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${orientation === 'landscape' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="2" y="6" width="20" height="12" rx="2"/>
              </svg>
              横
            </button>
            <button
              onClick={() => setOrientation('portrait')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${orientation === 'portrait' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="6" y="2" width="12" height="20" rx="2"/>
              </svg>
              縦
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-2 px-5 py-3 rounded-full border text-sm font-semibold transition-all backdrop-blur-sm min-h-[44px] ${
              liked
                ? 'border-rose-300 bg-rose-50/90 text-rose-500 shadow-sm shadow-rose-100'
                : 'border-white/80 bg-white/70 text-gray-500 hover:border-rose-300 hover:bg-rose-50/80 hover:text-rose-400'
            }`}
          >
            <svg
              className={`w-4 h-4 transition-transform ${liking ? 'scale-125' : ''}`}
              fill={liked ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {likeCount}
          </button>
          <span className="flex items-center gap-2 px-4 py-3 rounded-full bg-white/60 backdrop-blur-sm border border-white/80 text-xs text-gray-500 min-h-[44px]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {viewCount + 1}
          </span>
          {createdAt && (
            <span className="flex items-center gap-1.5 px-4 py-3 rounded-full bg-white/60 backdrop-blur-sm border border-white/80 text-xs text-gray-400 min-h-[44px]">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {relativeDate(createdAt)}
            </span>
          )}
        </div>

        {(vrchatId || twitterId || discordId) && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {vrchatId && (
              <CopyChip
                label="VRChat"
                value={vrchatId}
                icon={
                  <svg className="w-3.5 h-3.5 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                  </svg>
                }
              />
            )}
            {twitterId && (
              <LinkChip
                label="X"
                value={`@${twitterId}`}
                href={`https://x.com/${twitterId}`}
                icon={
                  <svg className="w-3.5 h-3.5 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                }
              />
            )}
            {discordId && (
              <CopyChip
                label="Discord"
                value={discordId}
                icon={
                  <svg className="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/>
                  </svg>
                }
              />
            )}
          </div>
        )}

        {ownerSlug && (
          <Link href={`/u/${ownerSlug}`}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-white/80 bg-white/60 backdrop-blur-sm hover:border-sky-300 hover:bg-white/90 transition-all group shadow-sm">
            {ownerAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ownerAvatar} alt={displayName} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00AADB] to-[#00C9B8] flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                {initials}
              </div>
            )}
            <span className="text-xs text-gray-500 font-semibold group-hover:text-[#00AADB] transition-colors">
              {displayName} のプロフィールを見る
            </span>
            <svg className="w-3 h-3 text-gray-300 group-hover:text-[#00AADB] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        <p className="text-xs text-white/60 drop-shadow-sm">
          by <span className="font-bold text-white/80">vaacard</span>
        </p>

        <Link
          href="/c/vrchat"
          className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 hover:bg-white/90 hover:border-sky-200 transition-all shadow-sm group"
        >
          <div className="flex -space-x-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00AADB] to-[#00C9B8] border-2 border-white opacity-80" style={{ opacity: 1 - i * 0.2 }} />
            ))}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-gray-700 group-hover:text-[#00AADB] transition-colors">他のVRChatユーザーをみつける</p>
            <p className="text-[10px] text-gray-400">カード一覧を見る →</p>
          </div>
        </Link>
      </main>

      {isOwner && (
        <div className="sm:hidden fixed bottom-6 right-4 flex flex-col gap-2 z-50">
          <Link
            href={`/card/${cardId}/edit`}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-600 border border-white/80 rounded-full px-4 py-3 shadow-lg text-sm font-semibold"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            編集
          </Link>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white rounded-full px-4 py-3 shadow-lg shadow-sky-200 text-sm font-semibold disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {downloading ? '保存中...' : '画像で保存'}
          </button>
          <button
            onClick={handleXShare}
            disabled={sharing}
            className="flex items-center gap-2 bg-black text-white rounded-full px-4 py-3 shadow-lg text-sm font-semibold disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            {sharing ? '...' : 'Xで共有'}
          </button>
        </div>
      )}

      <div style={{ position: 'fixed', top: -9999, left: -9999, pointerEvents: 'none' }}>
        <div ref={exportRef}>
          <template.CardRenderer values={values} fontFamily={fontFamily} t={translations.ja} cardUrl={shareUrl} userUrl={ownerSlug ? shareUrl.replace(/\/card\/.*$/, '') + `/u/${ownerSlug}` : undefined} />
        </div>
      </div>
    </div>
  )
}
