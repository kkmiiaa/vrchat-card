'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { CardTemplate } from '@/blocks/types'
import type { TemplateLayoutRow } from '@/lib/templateLayout'
import { buildCardTemplateFromDefinition } from '@/lib/buildCardTemplate'
import { migrateLegacyCardData } from '@/lib/legacyCardDataMigration'
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
  ogpVersion: number
  templateDbRow?: TemplateLayoutRow | null
  background?: import('@/blocks/types').BackgroundValue | null
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

export default function CardViewClient({ cardId, templateId, isOwner, likeCount: initialLikeCount, viewCount, ownerSlug, ownerName, ownerAvatar, createdAt, imageUrl: initialImageUrl, ogpVersion: initialOgpVersion, templateDbRow, background: initialBackground }: Props) {
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

  const exportBackground = initialBackground

  const containerRef = useRef<HTMLDivElement>(null)
  const webContentRef = useRef<HTMLDivElement>(null)
  const [webContentHeight, setWebContentHeight] = useState<number | null>(null)
  const tiltWrapRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [orientation, setOrientation] = useState<'card' | 'web'>('card')
  const [downloading, setDownloading] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [liked, setLiked] = useState(false)
  const [liking, setLiking] = useState(false)
  const [currentOgpVersion, setCurrentOgpVersion] = useState(initialOgpVersion)
  // null=非表示 confirming=空フィールド確認 saving=保存中 done=保存完了
  const [publishState, setPublishState] = useState<null | 'confirming' | 'saving' | 'done'>(null)

  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragOrigin = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })
  const gyroPermissionAsked = useRef(false)
  const isMobile = useRef(typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches)
  const [cardEntered, setCardEntered] = useState<'hidden' | 'entering' | 'done'>('hidden')
  const [likeBurst, setLikeBurst] = useState(false)
  const [fabExpanded, setFabExpanded] = useState(true)
  const fabCollapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
        const raw = data?.card_data ?? {}
        setCardData(migrateLegacyCardData(templateId, raw))
      })

    // DB 定義から CardTemplate を構築
    const { template: builtTemplate } = buildCardTemplateFromDefinition(null, templateDbRow ?? null)
    setTemplate(builtTemplate)
  }, [cardId, templateId, templateDbRow])

  useEffect(() => {
    const handler = (e: Event) => showToast((e as CustomEvent<string>).detail)
    window.addEventListener('vaacard:copied', handler)
    return () => window.removeEventListener('vaacard:copied', handler)
  }, [showToast])

  // カードが表示されたら入場アニメを起動し、完了後にクラスを外す
  useEffect(() => {
    if (!template || cardData === null) return
    const t1 = setTimeout(() => { setCardEntered('entering') }, 50)
    const t2 = setTimeout(() => { setCardEntered('done') }, 50 + 700)
    // FABは3秒後に自動折りたたみ
    fabCollapseTimer.current = setTimeout(() => setFabExpanded(false), 3000)
    return () => {
      clearTimeout(t1); clearTimeout(t2)
      if (fabCollapseTimer.current) clearTimeout(fabCollapseTimer.current)
    }
  }, [template, cardData])

  const cardW = template ? (orientation === 'web' && template.webWidth ? template.webWidth : template.cardWidth) : 900
  const cardH = template ? (orientation === 'web' && template.webHeight ? template.webHeight : template.cardHeight) : 506

  useEffect(() => {
    if (!template) return
    const padding = orientation === 'web' ? 8 : 32
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

  // Webモード: コンテンツの自然な高さを計測してコンテナ高さを決定
  useEffect(() => {
    if (orientation !== 'web') return
    const el = webContentRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.height > 0) setWebContentHeight(entry.contentRect.height)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [orientation])

  useEffect(() => {
    if (!template) return
    const hasWeb = !!(template.webWidth && template.webHeight)
    if (hasWeb && window.innerWidth < 768) setOrientation('web')
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

  // モバイル: デバイス傾きでtilt
  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches
    if (!isMobile) return
    function onOrientation(e: DeviceOrientationEvent) {
      const beta = Math.max(-30, Math.min(30, (e.beta ?? 0) - 20))
      const gamma = Math.max(-30, Math.min(30, e.gamma ?? 0))
      setTilt({ x: beta * 0.3, y: gamma * 0.3 })
    }
    window.addEventListener('deviceorientation', onOrientation)
    return () => window.removeEventListener('deviceorientation', onOrientation)
  }, [])

  if (!template || cardData === null) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #e0e7ff 100%)' }}>
        <header className="fixed top-0 left-0 right-0 z-20 border-b border-white/30 shadow-sm h-14 px-6 flex items-center justify-between bg-white/20 backdrop-blur-md">
          <Link href="/" className="text-xl font-black tracking-tight text-white drop-shadow-md" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>vaacard</Link>
          <HeaderAuth variant="white" />
        </header>
        <main className="flex-1 flex items-center justify-center pt-14">
          {loadError
            ? <p className="text-sm text-red-500">{loadError}</p>
            : <div className="w-10 h-10 border-4 border-sky-300 border-t-[#00AADB] rounded-full animate-spin" />
          }
        </main>
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
    setTilt({ x: -dy * 10, y: dx * 10 })
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (isMobile.current) return
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
    if (isMobile.current || dragging) return
    setTilt({ x: 0, y: 0 })
  }

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(true)
    dragOrigin.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }
  }

  async function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const t = e.touches[0]
    setDragging(true)
    dragOrigin.current = { mx: t.clientX, my: t.clientY, ox: offset.x, oy: offset.y }

    // iOS 13+: ユーザーのタップを起点にジャイロ許可を要求（一度だけ）
    if (!gyroPermissionAsked.current) {
      gyroPermissionAsked.current = true
      const DevOri = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
      if (typeof DevOri.requestPermission === 'function') {
        await DevOri.requestPermission().catch(() => {})
      }
    }
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    const t = e.touches[0]
    if (dragging) {
      setOffset({
        x: t.clientX - dragOrigin.current.mx + dragOrigin.current.ox,
        y: t.clientY - dragOrigin.current.my + dragOrigin.current.oy,
      })
    }
    // モバイルではタッチ位置による傾きは行わない（ジャイロのみ）
  }

  async function handleLike() {
    if (liking) return
    setLiking(true)
    setLikeBurst(true)
    setTimeout(() => setLikeBurst(false), 400)
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

  const tweetText = encodeURIComponent('VRChatの自己紹介カードを作りました！\n#VRChat自己紹介カード #vaacard')
  function buildXShareHref(version: number) {
    const base = typeof window !== 'undefined' ? window.location.origin + `/card/${cardId}` : ''
    const url = version > 0 ? `${base}?v=${version}` : base
    return `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(url)}`
  }
  function versionedShareUrl(version: number) {
    const base = typeof window !== 'undefined' ? window.location.origin + `/card/${cardId}` : ''
    return version > 0 ? `${base}?v=${version}` : base
  }

  const displayName = ownerName || ownerSlug || 'vaacard ユーザー'
  const initials = displayName.slice(0, 2).toUpperCase()

  const sns = values.sns as { vrchatId?: string; twitterId?: string; discordId?: string } | undefined
  const vrchatId = sns?.vrchatId?.trim()
  const twitterId = sns?.twitterId?.trim().replace(/^@/, '')
  const discordId = sns?.discordId?.trim()

  function hasEmptyFields(): boolean {
    if (!cardData) return false
    for (const [k, v] of Object.entries(cardData)) {
      if (k === 'font') continue
      if (typeof v === 'string' && v.trim() === '') return true
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        for (const v2 of Object.values(v as object)) {
          if (typeof v2 === 'string' && v2.trim() === '') return true
        }
      }
    }
    return false
  }

  // OGP画像をStorageに保存してogp_versionをインクリメント
  // 成功時は新しいversionを返す、失敗時はnullを返す
  async function doPublish(): Promise<number | null> {
    if (!exportRef.current) return null
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(exportRef.current, { pixelRatio: 2 })
      const newVersion = currentOgpVersion + 1
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl, ogp_version: newVersion, visibility: 'public' }),
      })
      if (!res.ok) return null
      savedImageUrlRef.current = dataUrl
      setCurrentOgpVersion(newVersion)
      return newVersion
    } catch {
      return null
    }
  }

  // 「マイページに保存」ボタン
  async function handlePublish() {
    if (hasEmptyFields()) {
      setPublishState('confirming')
      return
    }
    setPublishState('saving')
    const newVersion = await doPublish()
    setPublishState(newVersion !== null ? 'done' : null)
  }

  // 「Xで共有」ボタン
  async function handleXShare() {
    if (savedImageUrlRef.current) {
      window.open(buildXShareHref(currentOgpVersion), '_blank', 'noopener,noreferrer')
      return
    }
    // image_urlがない場合は自動でマイページ保存してからXへ
    setPublishState('saving')
    const newVersion = await doPublish()
    setPublishState(null)
    if (newVersion !== null) {
      window.open(buildXShareHref(newVersion), '_blank', 'noopener,noreferrer')
    }
  }

  async function handleDownload() {
    if (!exportRef.current) return
    setDownloading(true)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(exportRef.current, { pixelRatio: 2 })
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = 'vaacard.png'
      link.click()
    } finally {
      setDownloading(false)
    }
  }

  const bg = initialBackground
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
  const publishedShareUrl = versionedShareUrl(currentOgpVersion)

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ background: pageBg }}>
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
                  disabled={publishState === 'saving'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  {publishState === 'saving' ? '準備中...' : 'Xでシェアする'}
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

      {/* 空フィールド確認モーダル */}
      {publishState === 'confirming' && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setPublishState(null)} />
          <div className="fixed inset-x-0 top-1/2 -translate-y-1/2 z-50 flex justify-center px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
              <div className="px-6 pt-6 pb-4 text-center">
                <div className="text-2xl mb-2">⚠️</div>
                <h2 className="text-base font-bold text-gray-900 mb-1">未入力の項目があります</h2>
                <p className="text-xs text-gray-400">このまま保存しますか？</p>
              </div>
              <div className="px-6 pb-5 flex flex-col gap-2">
                <button
                  onClick={async () => {
                    setPublishState('saving')
                    const newVersion = await doPublish()
                    setPublishState(newVersion !== null ? 'done' : null)
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  このまま保存する
                </button>
                <button
                  onClick={() => setPublishState(null)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 保存中モーダル */}
      {publishState === 'saving' && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <div className="fixed inset-x-0 top-1/2 -translate-y-1/2 z-50 flex justify-center px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
              <div className="px-6 py-8 flex flex-col items-center gap-4">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-300 via-violet-300 to-pink-300 animate-spin" style={{ maskImage: 'radial-gradient(transparent 55%, black 56%)' }} />
                  <div className="absolute inset-[3px] rounded-full bg-white" />
                  <div className="absolute inset-0 flex items-center justify-center text-2xl animate-bounce" style={{ animationDuration: '1.2s' }}>✨</div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-800">カードを仕上げています</p>
                  <p className="text-xs text-gray-400 mt-0.5">もうすぐ完成です...</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 保存完了モーダル */}
      {publishState === 'done' && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setPublishState(null)} />
          <div className="fixed inset-x-0 top-1/2 -translate-y-1/2 z-50 flex justify-center px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
              <div className="px-6 pt-6 pb-4 text-center">
                <div className="text-3xl mb-2">✅</div>
                <h2 className="text-base font-bold text-gray-900 mb-1">マイページに保存しました！</h2>
                <p className="text-xs text-gray-400">このURLをシェアしよう</p>
              </div>
              <div className="px-6 pb-2">
                <button
                  onClick={() => navigator.clipboard.writeText(publishedShareUrl)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-500 hover:border-sky-200 hover:bg-sky-50 transition-colors"
                >
                  <span className="truncate">{publishedShareUrl}</span>
                  <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div className="px-6 pb-5 flex flex-col gap-2 mt-2">
                <button
                  onClick={() => {
                    setPublishState(null)
                    window.open(buildXShareHref(currentOgpVersion), '_blank', 'noopener,noreferrer')
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:opacity-80 transition-opacity"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Xでシェアする
                </button>
                {ownerSlug && (
                  <Link
                    href={`/u/${ownerSlug}`}
                    onClick={() => setPublishState(null)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-sky-200 text-[#00AADB] text-sm font-semibold hover:bg-sky-50 transition-colors"
                  >
                    マイページを見る
                  </Link>
                )}
                <button
                  onClick={() => setPublishState(null)}
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

      <header className="fixed top-0 left-0 right-0 z-20 border-b border-white/30 shadow-sm h-14 px-6 flex items-center justify-between bg-white/20 backdrop-blur-md">
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
                disabled={publishState === 'saving'}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-black rounded-full px-4 py-1.5 hover:opacity-80 transition-opacity shadow-sm disabled:opacity-50"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                {publishState === 'saving' ? '...' : 'Xで共有'}
              </button>
            </div>
          )}
          <HeaderAuth variant="white" />
        </div>
      </header>

      <main className={['relative z-10 flex-1 flex flex-col items-center justify-center pt-24 pb-10 gap-5 overflow-x-hidden', orientation === 'web' ? 'px-1' : 'px-4'].join(' ')}>

        <div className="w-full flex justify-center" style={{ maxWidth: cardW }}>
          <div
            ref={tiltWrapRef}
            className={cardEntered === 'hidden' ? 'w-full opacity-0' : cardEntered === 'entering' ? 'w-full card-enter' : 'w-full'}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: dragging ? 'none' : 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
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

            <div className={orientation === 'web' ? 'flex justify-center' : ''}>
              <div
                ref={containerRef}
                style={{ width: '100%', maxWidth: orientation === 'web' ? 620 : undefined, overflow: 'hidden' }}
              >
                {orientation === 'web' ? (
                  // Web モード: transform: scale でiOSのテキスト自動拡大を回避
                  // 高さ計測前(webContentHeight=null)は通常フローで表示、計測後にabsoluteに切替
                  <div style={{
                    width: cardW * scale,
                    ...(webContentHeight != null ? { height: webContentHeight * scale, position: 'relative', overflow: 'hidden' } : {}),
                  }}>
                    <div ref={webContentRef} style={{
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                      width: cardW,
                      ...(webContentHeight != null ? { position: 'absolute', top: 0, left: 0 } : {}),
                    }}>
                      <template.CardRenderer values={values} background={initialBackground ?? undefined} fontFamily={fontFamily} t={translations.ja} isInteractive orientation="web" transparentBackground cardUrl={shareUrl} userUrl={ownerSlug ? shareUrl.replace(/\/card\/.*$/, '') + `/u/${ownerSlug}` : undefined} />
                    </div>
                  </div>
                ) : (
                  // カードモード: transform scale + fixed height
                  <div style={{ width: '100%', height: cardH * scale, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: cardW, height: cardH, position: 'absolute', top: 0, left: 0 }}>
                      <template.CardRenderer values={values} background={initialBackground ?? undefined} fontFamily={fontFamily} t={translations.ja} isInteractive orientation="card" transparentBackground cardUrl={shareUrl} userUrl={ownerSlug ? shareUrl.replace(/\/card\/.*$/, '') + `/u/${ownerSlug}` : undefined} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {template.webWidth && (
          <div className="flex items-center gap-1 bg-white/40 backdrop-blur-sm rounded-full p-1 border border-white/60">
            <button
              onClick={() => setOrientation('card')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${orientation === 'card' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="2" y="6" width="20" height="12" rx="2"/>
              </svg>
              カード
            </button>
            <button
              onClick={() => setOrientation('web')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${orientation === 'web' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="6" y="2" width="12" height="20" rx="2"/>
              </svg>
              Web
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
              className={`w-4 h-4 transition-transform ${likeBurst ? 'like-burst' : ''}`}
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

        {!isOwner && templateId && (
          <Link
            href={`/c/vrchat/${templateId}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white text-sm font-bold shadow-md shadow-sky-200 hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            このテンプレートで作る
          </Link>
        )}

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
        <div className="sm:hidden fixed bottom-6 right-4 flex flex-col items-end gap-2 z-50">
          {/* 展開時のボタン群 */}
          <div
            className="flex flex-col items-end gap-2 overflow-hidden transition-all duration-300"
            style={{ maxHeight: fabExpanded ? 200 : 0, opacity: fabExpanded ? 1 : 0 }}
          >
            <Link
              href={`/card/${cardId}/edit`}
              className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-600 border border-white/80 rounded-full px-4 py-2.5 shadow-lg text-sm font-semibold"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              編集
            </Link>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white rounded-full px-4 py-2.5 shadow-lg shadow-sky-200 text-sm font-semibold disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {downloading ? '✨ 保存中...' : '画像で保存'}
            </button>
            <button
              onClick={handleXShare}
              disabled={publishState === 'saving'}
              className="flex items-center gap-2 bg-black text-white rounded-full px-4 py-2.5 shadow-lg text-sm font-semibold disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Xで共有
            </button>
          </div>
          {/* トグルボタン */}
          <button
            onClick={() => {
              if (fabCollapseTimer.current) { clearTimeout(fabCollapseTimer.current); fabCollapseTimer.current = null }
              setFabExpanded(v => !v)
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white shadow-lg shadow-sky-200 flex items-center justify-center transition-transform duration-300"
            style={{ transform: fabExpanded ? 'rotate(45deg)' : 'rotate(0deg)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}

      <div style={{ position: 'fixed', top: -9999, left: -9999, pointerEvents: 'none' }}>
        <div ref={exportRef}>
          <template.CardRenderer values={values} background={exportBackground ?? undefined} fontFamily={fontFamily} t={translations.ja} cardUrl={shareUrl} userUrl={ownerSlug ? shareUrl.replace(/\/card\/.*$/, '') + `/u/${ownerSlug}` : undefined} />
        </div>
      </div>
    </div>
  )
}
