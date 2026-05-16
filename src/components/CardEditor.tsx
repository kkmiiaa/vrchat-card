'use client'

import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

import type { CardTemplate, BlockValues, BackgroundValue, AgeValue, ActivityValue, SnsValue, StatusValue, GalleryValue } from '@/blocks/types'
import { createCard, updateCard } from '@/lib/saveCard'
import { createClient } from '@/lib/supabase/client'
import { uploadCardImage, ImageTooLargeError } from '@/lib/uploadImage'
import type { InteractionItem } from '@/blocks/interactions'
import type { FontKey } from '@/components/FontSelector'
import { fontMap } from '@/components/CanvasRenderer'
import { getCroppedImg } from '@/utils/cropUtils'
import { translations } from '@/utils/translations'
import AccordionSection from '@/components/AccordionSection'
import HeaderAuth from '@/components/HeaderAuth'
import OnboardingBanner from '@/components/OnboardingBanne'
import FloatingButtons from '@/components/FloatingButtons'
import PostTimeline from '@/components/PostTimeline'
import CardV2 from '@/components/CardV2'
import CardV1 from '@/components/CardV1'

const STORAGE_KEY = 'vrchat-card-cache'

// v1/v2 共通カードプレビューコンポーネント
const CardPreview = forwardRef<HTMLDivElement, {
  template: CardTemplate
  values: BlockValues
  scale: number
  profileImageBase64: string | null
  bg: BackgroundValue
  sns: SnsValue
  status: StatusValue
  age: AgeValue
  activity: ActivityValue
  gallery: GalleryValue
  interactions: InteractionItem[]
  fontFamily: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: Record<string, any>
  isInteractive?: boolean
}>(function CardPreview({ template, values, scale, profileImageBase64, bg, sns, status, age, activity, gallery, interactions, fontFamily, t, isInteractive }, ref) {
  const frLabels = {
    frPolicyAnyone: (t as Record<string, string>).frPolicyAnyone,
    frPolicyAfterGettingToKnow: (t as Record<string, string>).frPolicyAfterGettingToKnow,
    frPolicyIfInterested: (t as Record<string, string>).frPolicyIfInterested,
    frPolicyMutualsOnX: (t as Record<string, string>).frPolicyMutualsOnX,
    frPolicyNo: (t as Record<string, string>).frPolicyNo,
  }
  const bgValue = (bg.imageFile ? '' : bg.value) as string | [string, string]

  if (template.id === 'v2') {
    const W = 900, H = 506
    return (
      <div className={isInteractive ? '' : 'shadow-md'} style={{ width: W * scale, height: H * scale, position: 'relative', overflow: 'hidden', flexShrink: 0, borderRadius: isInteractive ? 0 : undefined }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
          <CardV2
            ref={ref}
            name={values.name as string ?? ''}
            profileImageBase64={profileImageBase64}
            profileImageUrl={values.profileImageUrl as string | null ?? null}
            gender={values.gender as string}
            language={values.language as string[]}
            playEnv={values.playEnv as string[]}
            micOnRate={values.micOnRate as number}
            selfIntro={values.selfIntro as string}
            vrchatId={sns.vrchatId}
            twitterId={sns.twitterId}
            discordId={sns.discordId}
            statusBlue={status.blue}
            statusGreen={status.green}
            statusYellow={status.yellow}
            statusRed={status.red}
            interactions={interactions}
            backgroundType={bg.type}
            backgroundValue={bgValue}
            backgroundImageBase64={bg.base64 ?? null}
            fontFamily={fontFamily}
            okNgLabels={(t as Record<string, Record<string, string>>).okNgDefaults}
            ageDisplay={age.display || age.mode}
            trustRank={values.trustRank as string}
            activeDays={activity.days}
            daysMode={activity.daysMode}
            weekdayTimesMode={activity.weekdayTimesMode}
            holidayTimesMode={activity.holidayTimesMode}
            weekdayStart={activity.weekdayStart}
            weekdayEnd={activity.weekdayEnd}
            holidayStart={activity.holidayStart}
            holidayEnd={activity.holidayEnd}
            friendPolicy={sns.friendPolicy ? [sns.friendPolicy] : []}
            friendPolicyLabels={frLabels}
            galleryImages={gallery.enabled ? gallery.base64 : undefined}
            isInteractive={isInteractive}
          />
        </div>
      </div>
    )
  }

  // v1
  const W = 900, H = 506
  return (
    <div className={isInteractive ? '' : 'shadow-md'} style={{ width: W * scale, height: H * scale, position: 'relative', overflow: 'hidden', flexShrink: 0, borderRadius: isInteractive ? 0 : undefined }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
        <CardV1
          ref={ref}
          name={values.name as string ?? ''}
          profileImageBase64={profileImageBase64}
          profileImageUrl={values.profileImageUrl as string | null ?? null}
          gender={values.gender as string}
          language={values.language as string[]}
          playEnv={values.playEnv as string[]}
          micOnRate={values.micOnRate as number}
          selfIntro={values.selfIntro as string}
          vrchatId={sns.vrchatId}
          twitterId={sns.twitterId}
          discordId={sns.discordId}
          statusBlue={status.blue}
          statusGreen={status.green}
          statusYellow={status.yellow}
          statusRed={status.red}
          interactions={interactions}
          backgroundType={bg.type}
          backgroundValue={bgValue}
          backgroundImageBase64={bg.base64 ?? null}
          fontFamily={fontFamily}
          showBalloon={values.showBalloon as boolean ?? true}
          friendPolicy={Array.isArray(values.friendPolicy) ? values.friendPolicy.filter(Boolean) : [values.friendPolicy as string].filter(Boolean)}
          friendPolicyLabels={frLabels}
          okNgLabels={(t as Record<string, Record<string, string>>).okNgDefaults}
          galleryEnabled={gallery.enabled}
          galleryImagesBase64={gallery.enabled ? gallery.base64 : undefined}
          isInteractive={isInteractive}
        />
      </div>
    </div>
  )
})

// --- localStorage 旧フォーマット → 新フォーマット変換 ---
function migrateFromOld(raw: Record<string, unknown>): BlockValues {
  if (raw.sns) return raw as BlockValues  // 既に新フォーマット
  const presets = ['18歳未満', '18+', '非公開']
  const ageDisplay = (raw.ageDisplay as string) ?? ''
  return {
    name:        raw.name        ?? '',
    gender:      raw.gender      ?? '',
    language:    raw.language    ?? [],
    playEnv:     raw.playEnv     ?? [],
    micOnRate:   raw.micOnRate   ?? 0,
    selfIntro:   raw.selfIntro   ?? '',
    sns: {
      vrchatId:  raw.vrchatId  ?? '',
      twitterId: raw.twitterId ?? '',
      discordId: raw.discordId ?? '',
    },
    status: {
      blue:   raw.statusBlue   ?? '',
      green:  raw.statusGreen  ?? '',
      yellow: raw.statusYellow ?? '',
      red:    raw.statusRed    ?? '',
    },
    friendPolicy: Array.isArray(raw.friendPolicy) ? raw.friendPolicy : (raw.friendPolicy ?? ''),
    interactions: raw.interactions ?? [],
    background: {
      type:  raw.backgroundType  ?? 'image',
      value: raw.backgroundValue ?? '/backgrounds/bg_1.webp',
    },
    age: {
      mode:    presets.includes(ageDisplay) ? ageDisplay : (ageDisplay ? '自由入力' : ''),
      display: ageDisplay,
    },
    trustRank: raw.trustRank ?? '',
    activity: {
      days:          [true, true, true, true, true, false, false],
      weekdayStart:  raw.weekdayStart  ?? '',
      weekdayEnd:    raw.weekdayEnd    ?? '',
      holidayStart:  raw.holidayStart  ?? '',
      holidayEnd:    raw.holidayEnd    ?? '',
    },
    font:        'rounded',
    showBalloon: raw.showBalloon ?? true,
  }
}

type Props = {
  template: CardTemplate
  cardId?: string
  initialValues?: Record<string, unknown>
  readOnly?: boolean
}

export default function CardEditor({ template, cardId: initialCardId, initialValues, readOnly = false }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const debugMode = searchParams.get('debug') === 'true'
  const initialLang = searchParams.get('lang') === 'en' ? 'en' : 'ja'
  const [systemLanguage, setSystemLanguageState] = useState<'ja' | 'en'>(initialLang)
  const t = translations[systemLanguage]

  const setSystemLanguage = useCallback((lang: 'ja' | 'en') => {
    setSystemLanguageState(lang)
    const p = new URLSearchParams(searchParams.toString())
    if (lang === 'en') p.set('lang', 'en'); else p.delete('lang')
    window.history.replaceState(null, '', `${pathname}?${p.toString()}`)
  }, [pathname, searchParams])

  // --- Block values ---
  const initValues = (): BlockValues => {
    const v: BlockValues = {}
    for (const b of template.blocks) v[b.key] = b.defaultValue
    return v
  }
  const [values, setValues] = useState<BlockValues>(initValues)
  const updateValue = (key: string, val: unknown) =>
    setValues(prev => ({ ...prev, [key]: val }))

  const [hasMounted, setHasMounted] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // --- Profile image (special: cropper) ---
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImageBase64, setProfileImageBase64] = useState<string | null>(null)
  const [showCropModal, setShowCropModal] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  // --- card ref & scale ---
  const cardRef       = useRef<HTMLDivElement | null>(null)
  const cardExportRef = useRef<HTMLDivElement | null>(null) // エクスポート専用（フルサイズ）
  const [cardScale, setCardScale] = useState(1)

  // --- UI state ---
  const [previewOpen, setPreviewOpen]       = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [currentUrlDisplay, setCurrentUrlDisplay] = useState('')

  // --- Backend state ---
  const [cardId, setCardId] = useState<string | null>(initialCardId ?? null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  // --- Visibility ---
  const [visibility, setVisibility] = useState<'public' | 'limited' | 'private'>('public')

  // テンプレートから自動取得
  const communities = template.communities ?? []


  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user)
      setUserId(data.user?.id ?? null)
    })
  }, [])

  // initialValues から visibility を初期化
  useEffect(() => {
    if (initialValues?.visibility) {
      setVisibility(initialValues.visibility as 'public' | 'limited' | 'private')
    }
  }, [initialValues])

  // visibility 変更時に即保存
  const handleVisibilityChange = useCallback(async (newVal: 'public' | 'limited' | 'private') => {
    setVisibility(newVal)
    if (cardId) {
      await updateCard({ cardId, visibility: newVal })
    }
  }, [cardId])

  // debounced auto-save card_data (ログイン済み & cardId がある場合のみ)
  useEffect(() => {
    if (!isLoggedIn || !cardId || !initialized) return
    const timer = setTimeout(() => {
      updateCard({ cardId, cardData: values as Record<string, unknown>, communities })
    }, 1500)
    return () => clearTimeout(timer)
  }, [values, communities, cardId, isLoggedIn, initialized])

  // 画像自動更新用フラグ
  const hasUnsavedImageRef = useRef(false)

  // values が変わったらフラグを立てる
  useEffect(() => {
    if (!initialized || !cardId || !isLoggedIn) return
    hasUnsavedImageRef.current = true
  }, [values, initialized, cardId, isLoggedIn])

  // 20秒 debounce で画像保存
  useEffect(() => {
    if (!isLoggedIn || !cardId || !initialized) return
    const timer = setTimeout(async () => {
      if (!hasUnsavedImageRef.current) return
      hasUnsavedImageRef.current = false
      const dataUrl = await getCardDataUrl()
      if (dataUrl) {
        await updateCard({ cardId, imageBase64: dataUrl })
      }
    }, 20000)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, cardId, isLoggedIn, initialized])

  // ギャラリー画像が変わったら Storage にアップロード
  const prevGalleryImages = useRef<(File | null)[]>([null, null, null])
  useEffect(() => {
    if (!userId || !cardId) return
    const gallery = (values.gallery as GalleryValue) ?? { images: [], base64: [] }
    gallery.images.forEach((file, i) => {
      if (!(file instanceof File)) return
      if (file === prevGalleryImages.current[i]) return
      prevGalleryImages.current[i] = file
      uploadCardImage(userId, cardId, `gallery-${i}`, file)
        .then(url => {
          const current = (values.gallery as GalleryValue) ?? { enabled: false, images: [], base64: [] }
          const urls = [...(current.base64 ?? [null, null, null])]
          urls[i] = url
          updateValue('gallery', { ...current, base64: urls })
        })
        .catch(e => { if (e instanceof ImageTooLargeError) alert(e.message) })
    })
  }, [(values.gallery as GalleryValue)?.images, userId, cardId])

  // helpers
  const bg         = (values.background  as BackgroundValue) ?? { type: 'image', value: '/backgrounds/bg_1.webp' }
  const sns        = (values.sns         as SnsValue)        ?? { vrchatId: '', twitterId: '', discordId: '' }
  const status     = (values.status      as StatusValue)     ?? { blue: '', green: '', yellow: '', red: '' }
  const age        = (values.age         as AgeValue)        ?? { mode: '', display: '' }
  const activity   = (values.activity    as ActivityValue)   ?? { days: [true,true,true,true,true,false,false], weekdayStart:'', weekdayEnd:'', holidayStart:'', holidayEnd:'' }
  const gallery    = (values.gallery     as GalleryValue)    ?? { enabled: false, images: [null,null,null], base64: [null,null,null] }
  const interactions = (values.interactions as InteractionItem[]) ?? []
  const fontKey    = (values.font        as FontKey)         ?? 'rounded'
  const fontFamily = fontMap[fontKey]?.style?.fontFamily ?? 'sans-serif'

  // URL表示
  useEffect(() => {
    setCurrentUrlDisplay(window.location.origin + pathname + (systemLanguage === 'en' ? '?lang=en' : ''))
  }, [pathname, systemLanguage])

  // hasMounted
  useEffect(() => { setHasMounted(true) }, [])

  // カードスケール（v1: 1200px幅, v2: 900px幅を基準）
  useEffect(() => {
    const cardNativeWidth = 900
    const update = () => {
      const isLg = window.innerWidth >= 1024
      const available = window.innerWidth - (isLg ? 400 : 0) - (isLg ? 48 : 8)
      setCardScale(available / cardNativeWidth)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [template.id])

  // profileImage → base64
  useEffect(() => {
    if (!profileImageFile) { setProfileImageBase64(null); return }
    const reader = new FileReader()
    reader.onload = e => setProfileImageBase64(e.target?.result as string)
    reader.readAsDataURL(profileImageFile)
  }, [profileImageFile])

  // background image → base64（初期化完了後のみ実行）
  useEffect(() => {
    if (!initialized) return
    if (bg.type !== 'image') { return }
    if (bg.imageFile instanceof File) {
      const reader = new FileReader()
      reader.onload = e => updateValue('background', { ...bg, base64: e.target?.result as string })
      reader.readAsDataURL(bg.imageFile)
    } else if (typeof bg.value === 'string' && bg.value && !bg.base64) {
      const controller = new AbortController()
      fetch(bg.value, { signal: controller.signal })
        .then(r => r.blob())
        .then(blob => {
          const reader = new FileReader()
          reader.onload = e => updateValue('background', { ...bg, base64: e.target?.result as string })
          reader.readAsDataURL(blob)
        })
        .catch(() => {})
      return () => controller.abort()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, bg.type, bg.value, bg.imageFile])

  // 初期値読み込み（バックエンド優先、なければ localStorage）
  useEffect(() => {
    if (!hasMounted || initialized) return
    const blockKeys = new Set(template.blocks.map(b => b.key))
    if (initialValues) {
      setValues(prev => {
        const next = { ...prev }
        for (const key of blockKeys) {
          if (initialValues[key] !== undefined) next[key] = initialValues[key]
        }
        // blockKeys 外のカスタムフィールドも復元
        if (initialValues.profileImageUrl) next.profileImageUrl = initialValues.profileImageUrl
        return next
      })
    } else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const raw = JSON.parse(saved)
          const migrated = migrateFromOld(raw)
          setValues(prev => {
            const next = { ...prev }
            for (const key of blockKeys) {
              if (migrated[key] !== undefined) next[key] = migrated[key]
            }
            return next
          })
        }
      } catch (e) {
        console.warn('localStorage 読み込み失敗:', e)
      }
    }
    setInitialized(true)
  }, [hasMounted, initialized, template.blocks, initialValues])

  // localStorage 保存
  useEffect(() => {
    if (!initialized) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
    } catch (e) {
      console.warn('localStorage 保存失敗:', e)
    }
  }, [values, initialized])


  // --- Profile image handlers ---
  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setUploadedImage(reader.result as string)
      setShowCropModal(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCropDone = async () => {
    if (!uploadedImage || !croppedAreaPixels) return
    const blob = await getCroppedImg(uploadedImage, croppedAreaPixels)
    const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' })
    setProfileImageFile(file)
    setShowCropModal(false)

    if (userId && cardId) {
      try {
        const url = await uploadCardImage(userId, cardId, 'profile', file)
        updateValue('profileImageUrl', url)
        setProfileImageBase64(URL.createObjectURL(blob))
      } catch (e) {
        if (e instanceof ImageTooLargeError) alert(e.message)
        else setProfileImageBase64(await blobToBase64(blob))
      }
    } else {
      setProfileImageBase64(await blobToBase64(blob))
    }
  }

  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target?.result as string)
      reader.readAsDataURL(blob)
    })
  }

  // --- Export ---
  const getCardDataUrl = async (): Promise<string | null> => {
    if (!cardExportRef.current) return null
    const { toPng } = await import('html-to-image')
    return await toPng(cardExportRef.current, { pixelRatio: 2 })
  }

  const handleDownload = async () => {
    const dataUrl = await getCardDataUrl()
    if (!dataUrl) return
    if (window.innerWidth < 768) {
      const win = window.open()
      if (win) win.document.write(`<img src="${dataUrl}" style="width:100%;height:auto;" />`)
    } else {
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = 'vrchat-introduction-card.png'
      link.click()
    }
  }

  const handleShareByUrl = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const currentUrl = window.location.pathname + window.location.search
      window.location.href = `/auth/login?next=${encodeURIComponent(currentUrl)}`
      return
    }

    const dataUrl = await getCardDataUrl()
    let currentCardId = cardId

    if (!currentCardId) {
      const result = await createCard({
        templateId: template.id,
        cardData: values as Record<string, unknown>,
        title: (values.name as string) || 'My Card',
        communities,
      })
      if ('error' in result) { alert('保存に失敗しました: ' + result.error); return }
      currentCardId = result.cardId
      setCardId(currentCardId)
    }

    if (dataUrl) {
      await updateCard({ cardId: currentCardId, imageBase64: dataUrl, cardData: values as Record<string, unknown> })
    }

    window.location.href = `/card/${currentCardId}`
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId, values, communities, template.id, supabase])

  // V1ログイン後の自動マイグレーション
  const autoMigrateRef = useRef(false)
  useEffect(() => {
    if (!isLoggedIn || !initialized || cardId) return
    if (autoMigrateRef.current) return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    autoMigrateRef.current = true
    handleShareByUrl()
  // cardId は意図的に依存配列から外す
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, initialized])

  const handlePostToX = async () => {
    const shareUrl = isLoggedIn && cardId ? `${window.location.origin}/card/${cardId}/view` : ''
    const tweetText = shareUrl ? `${t.tweetText}\n${shareUrl}` : t.tweetText
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
    const dataUrl = await getCardDataUrl()
    if (dataUrl) {
      if (window.innerWidth < 768) {
        const win = window.open()
        if (win) win.document.write(`<img src="${dataUrl}" style="max-width:100%;height:auto;" />`)
      } else {
        const link = document.createElement('a'); link.href = dataUrl; link.download = 'card.png'; link.click()
      }
    }
    window.open(tweetUrl, '_blank')
  }

  const handlePreviewOpen = async () => {
    const dataUrl = await getCardDataUrl()
    if (!dataUrl) return
    setPreviewImageUrl(dataUrl)
    setPreviewOpen(true)
  }

  // --- Render ---
  const blockMap = Object.fromEntries(template.blocks.map(b => [b.key, b]))

  return (
    <>
    <main className="w-screen h-screen flex flex-col text-gray-800">
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md h-12 sm:h-14 px-4 border-b border-white/30 flex justify-between items-center">
        <div className="flex items-center gap-2 min-w-0">
          <a href="/" className="text-xl font-black tracking-tight text-[#00AADB] shrink-0">vaacard</a>
          <span className="hidden sm:inline text-gray-300 text-sm">/</span>
          <span className="hidden sm:inline text-sm text-gray-500 truncate">{template.title}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* PC のみヘッダーにボタン表示 */}
          <div className="hidden sm:flex items-center gap-2">
            {!cardId && (
              <button onClick={handleShareByUrl}
                className="flex items-center gap-1.5 text-xs font-semibold text-sky-500 border border-sky-200 rounded-full px-4 py-1.5 hover:border-[#00AADB] hover:bg-sky-50 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {isLoggedIn ? 'プロフィールに保存' : 'マイページを作成して保存'}
              </button>
            )}
            <button onClick={handlePostToX}
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-black rounded-lg px-3 py-1.5 hover:bg-gray-800 transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              {t.share}
            </button>
            <button onClick={handleDownload}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#00AADB] to-[#00C9B8] rounded-full px-4 py-1.5 hover:opacity-90 transition-opacity shadow-sm shadow-sky-200">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t.save}
            </button>
          </div>
          <HeaderAuth />
        </div>
      </header>

      {/* クロップモーダル */}
      {showCropModal && uploadedImage && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg w-[90vw] max-w-[400px] h-[90vw] max-h-[400px] relative">
            <Cropper
              image={uploadedImage} crop={crop} zoom={zoom} aspect={1} cropShape="rect" showGrid={false}
              onCropChange={setCrop} onZoomChange={setZoom}
              onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
              style={{ containerStyle: { width: '100%', height: '100%', borderRadius: '0.5rem', overflow: 'hidden', position: 'relative' } }}
            />
            <div className="absolute bottom-2 right-2 flex gap-2">
              <button onClick={handleCropDone} className="bg-green-600 text-white px-3 py-1 text-sm rounded">{t.done}</button>
              <button onClick={() => setShowCropModal(false)} className="bg-gray-300 text-black px-3 py-1 text-sm rounded">{t.cancel}</button>
            </div>
          </div>
        </div>
      )}

      {/* プレビューモーダル */}
      {previewOpen && previewImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" onClick={() => setPreviewOpen(false)}>
          <img src={previewImageUrl} alt={t.enlargedCardPreview} className="max-w-[90%] max-h-[90%] rounded shadow-lg" />
        </div>
      )}

      <div className="flex flex-col lg:flex-1 lg:flex-row lg:pt-0 lg:overflow-hidden mt-12 sm:mt-16">
        {/* カードプレビュー */}
        <section
          className="w-full max-w-full flex items-center justify-center lg:flex-1 lg:min-w-0 lg:h-full lg:px-6 lg:static fixed lg:top-auto z-10 sm:h-auto cursor-zoom-in sm:cursor-default"
          onClick={e => { if (window.innerWidth < 768) { e.preventDefault(); handlePreviewOpen() } }}
          style={{
            background: (() => {
              if (bg.type === 'color' && typeof bg.value === 'string') return bg.value
              if (bg.type === 'gradient' && Array.isArray(bg.value)) return `linear-gradient(135deg, ${bg.value[0]}, ${bg.value[1]})`
              if (bg.type === 'image') return bg.base64 ? `url(${bg.base64}) center/cover no-repeat` : (typeof bg.value === 'string' ? `url(${bg.value}) center/cover no-repeat` : undefined)
              return 'linear-gradient(135deg, #c7d2fe, #fbcfe8, #fde68a)'
            })(),
            top: 48,
          }}
        >
          {!debugMode && <CardPreview ref={cardRef} template={template} values={values} scale={cardScale} profileImageBase64={profileImageBase64} bg={bg} sns={sns} status={status} age={age} activity={activity} gallery={gallery} interactions={interactions} fontFamily={fontFamily} t={t} isInteractive />}
        </section>

        {/* エクスポート専用（フルサイズ、画面外に配置） */}
        <div style={debugMode
          ? { overflow: 'hidden', margin: '16px auto', outline: '2px dashed red' }
          : { position: 'fixed', top: -9999, left: -9999, overflow: 'hidden', pointerEvents: 'none' }}>
          <CardPreview ref={cardExportRef} template={template} values={values} scale={1} profileImageBase64={profileImageBase64} bg={bg} sns={sns} status={status} age={age} activity={activity} gallery={gallery} interactions={interactions} fontFamily={fontFamily} t={t} />
        </div>

        {/* フォームサイドバー */}
        <aside className="lg:w-[400px] lg:min-w-[400px] lg:max-w-[500px] lg:flex-none w-full overflow-y-auto flex-1 p-2 lg:border-t-0 lg:border-l mt-[calc(100vw*9/16+16px)] pt-0 lg:mt-4 bg-white text-gray-800">

          {/* テンプレートの順番通りにセクションを描画 */}
          {template.sections.map(section => {
            const isProfile = section.titleKey === 'プロフィール情報'
            return (
              <AccordionSection key={section.titleKey} title={section.titleKey} defaultOpen={section.defaultOpen} t={t}>
                <div className="flex flex-col gap-6 pt-2 pb-2">
                  {/* プロフィール情報セクションのみ画像アップロードを先頭に挿入 */}
                  {isProfile && (
                    <div className="flex flex-col gap-2">
                      <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.profileImage}</h2>
                      <label className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageUpload}
                          className="hidden"
                          id="profile-image-upload"
                        />
                        <label
                          htmlFor="profile-image-upload"
                          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-1.5 px-3 rounded-lg cursor-pointer transition-colors flex-shrink-0"
                        >
                          {t.chooseFile}
                        </label>
                        <span className="text-sm text-gray-500 truncate">
                          {profileImageFile ? profileImageFile.name : t.noFileChosen}
                        </span>
                      </label>
                    </div>
                  )}
                  {section.blockKeys.map(key => {
                    const block = blockMap[key]
                      if (!block) return null
                      return (
                        <block.FormItem key={key} value={values[key]} onChange={v => updateValue(key, v)} t={t} />
                      )
                    })}
                  </div>
                </AccordionSection>
              )
            })}

          {/* 公開設定（cardId がある場合のみ表示） */}
          {cardId && (
            <div className="w-full max-w-screen-md mx-auto px-2 mt-4">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">公開設定</h2>
              <div className="flex gap-2">
                {([
                  { value: 'public', label: '公開', icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) },
                  { value: 'limited', label: 'URLのみ', icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  ) },
                  { value: 'private', label: '非公開', icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ) },
                ] as { value: 'public' | 'limited' | 'private'; label: string; icon: React.ReactNode }[]).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleVisibilityChange(opt.value)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                      visibility === opt.value
                        ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <PostTimeline t={t} />

          <div className="w-full max-w-screen-md mx-auto mt-4 mb-4">
            <div className="border border-gray-300 rounded-xl bg-gray-50 p-4 text-sm text-gray-700 text-center shadow-sm">
              <p className="text-xs text-gray-600 mb-2 leading-snug">{t.currentLanguageUrl}</p>
              <p className="text-sm font-medium text-blue-600 break-all">{currentUrlDisplay}</p>
            </div>
          </div>
        </aside>
      </div>

      <FloatingButtons onSave={handleDownload} onShare={handlePostToX} onUpgrade={handleShareByUrl} t={t} upgradeLabel={!cardId ? (isLoggedIn ? 'プロフィールに保存' : 'マイページを作成して保存') : undefined} />


    </main>
    <OnboardingBanner t={t} />
    </>
  )
}
