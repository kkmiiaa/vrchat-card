'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

import type { CardTemplate, BlockValues, BackgroundValue, GalleryValue, TemplateSectionBlock, FormSection, ComponentDef } from '@/blocks/types'
import { createCard, updateCard } from '@/lib/saveCard'
import { createClient } from '@/lib/supabase/client'
import { uploadCardImage, ImageTooLargeError } from '@/lib/uploadImage'
import type { FontKey } from '@/components/FontSelector'
import FontSelector from '@/components/FontSelector'
import { fontMap } from '@/lib/fontMap'
import { getCroppedImg } from '@/utils/cropUtils'
import { getBackgroundStyle, CARD_BG_FALLBACK } from '@/utils/backgroundUtils'
import { translations } from '@/utils/translations'
import { useCardValues } from '@/hooks/useCardValues'
import { useCardExport } from '@/hooks/useCardExport'
import AccordionSection from '@/components/AccordionSection'
import HeaderAuth from '@/components/HeaderAuth'
import OnboardingBanner from '@/components/OnboardingBanne'
import FloatingButtons from '@/components/FloatingButtons'
import PostTimeline from '@/components/PostTimeline'
import CardScaledView from '@/components/CardScaledView'
import { trackEvent } from '@/lib/gtag'
import { migrateLegacyCardData } from '@/lib/legacyCardDataMigration'

const STORAGE_KEY = 'vrchat-card-cache'

type Props = {
  template: CardTemplate
  cardId?: string
  initialValues?: Record<string, unknown>
  initialBackground?: BackgroundValue | null
  readOnly?: boolean
  formSections?: FormSection[]
  ogpVersion?: number
}

export default function CardEditor({ template, cardId: initialCardId, initialValues, initialBackground, readOnly = false, formSections: propFormSections, ogpVersion: initialOgpVersion = 0 }: Props) {
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
  const { values, updateValue, initialized } = useCardValues(template.blocks, initialValues, template.id)

  // --- Background（card_data とは分離） ---
  const DEFAULT_BG: BackgroundValue = { type: 'image', value: '/backgrounds/bg_1.webp' }
  const [background, setBackground] = useState<BackgroundValue>(initialBackground ?? DEFAULT_BG)
  const bgInitialized = useRef(false)

  // 新規カード（initialBackground なし）かつ localStorage に background が入っていた場合に同期
  useEffect(() => {
    if (bgInitialized.current || !initialized || initialBackground) return
    const storedBg = (values as Record<string, unknown>).background as BackgroundValue | undefined
    if (storedBg?.type) {
      setBackground(storedBg)
    }
    bgInitialized.current = true
  }, [initialized, initialBackground, values])

  // --- Profile image (special: cropper) ---
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImageBase64, setProfileImageBase64] = useState<string | null>(null)
  const [showCropModal, setShowCropModal] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  // --- Export ---
  const { exportRef: cardExportRef, downloading, generatePng: getCardDataUrl, downloadPng: _downloadPng } = useCardExport()

  const [showSaveNudge, setShowSaveNudge] = useState(false)
  const [currentOgpVersion, setCurrentOgpVersion] = useState(initialOgpVersion)
  const [publishConfirming, setPublishConfirming] = useState(false)

  const handleDownload = async () => {
    const dataUrl = await getCardDataUrl()
    if (!dataUrl) return
    if (cardId) await updateCard({ cardId, imageBase64: dataUrl })
    await _downloadPng()
    setShowSaveNudge(true)
    setTimeout(() => setShowSaveNudge(false), 8000)
  }

  // --- card scale ---
  const [cardScale, setCardScale] = useState(1)

  // --- UI state ---
  const [previewOpen, setPreviewOpen]       = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [currentUrlDisplay, setCurrentUrlDisplay] = useState('')
  const [saveModalLoading, setSaveModalLoading] = useState(false)

  // --- Backend state ---
  const [cardId, setCardId] = useState<string | null>(initialCardId ?? null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // --- Visibility ---
  const [visibility, setVisibility] = useState<'public' | 'limited' | 'private'>('public')



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

  // debounced auto-save card_data（下書き保存）
  useEffect(() => {
    if (!isLoggedIn || !cardId || !initialized) return
    setDraftStatus('saving')
    const timer = setTimeout(async () => {
      const { background: _bg, ...cardDataWithoutBg } = values as Record<string, unknown>
      await updateCard({ cardId, cardData: cardDataWithoutBg, background })
      setDraftStatus('saved')
    }, 1500)
    return () => clearTimeout(timer)
  }, [values, background, cardId, isLoggedIn, initialized])

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
  const bg = background
  const gallery    = (values.gallery     as GalleryValue)    ?? { enabled: false, images: [null,null,null], base64: [null,null,null] }
  const fontKey    = (values.font        as FontKey)         ?? 'rounded'
  const fontFamily = fontMap[fontKey]?.style?.fontFamily ?? 'sans-serif'

  // URL表示
  useEffect(() => {
    setCurrentUrlDisplay(window.location.origin + pathname + (systemLanguage === 'en' ? '?lang=en' : ''))
  }, [pathname, systemLanguage])

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
      reader.onload = e => setBackground({ ...bg, base64: e.target?.result as string })
      reader.readAsDataURL(bg.imageFile)
    } else if (typeof bg.value === 'string' && bg.value && !bg.base64) {
      const controller = new AbortController()
      fetch(bg.value, { signal: controller.signal })
        .then(r => r.blob())
        .then(blob => {
          const reader = new FileReader()
          reader.onload = e => setBackground({ ...bg, base64: e.target?.result as string })
          reader.readAsDataURL(blob)
        })
        .catch(() => {})
      return () => controller.abort()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, bg.type, bg.value, bg.imageFile])

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

  function hasEmptyFields(): boolean {
    for (const [k, v] of Object.entries(values as Record<string, unknown>)) {
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

  const handleShareByUrl = useCallback(async (skipEmptyCheck = false) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const currentUrl = window.location.pathname + window.location.search
      window.location.href = `/auth/login?next=${encodeURIComponent(currentUrl)}`
      return
    }

    if (!skipEmptyCheck && hasEmptyFields()) {
      setPublishConfirming(true)
      return
    }

    setSaveModalLoading(true)

    const dataUrl = await getCardDataUrl()
    let currentCardId = cardId

    // 旧メーカー（/card/vrchat）由来の localStorage データを新フォーマットに変換してから保存
    const migratedRaw = migrateLegacyCardData(template.id, values as Record<string, unknown>)
    // background は card_data から分離したカラムで管理するため除外
    const { background: migratedBg, ...migratedValues } = migratedRaw as Record<string, unknown> & { background?: BackgroundValue }
    // localStorage に background があれば background state より優先（初期化が間に合わない場合の保険）
    // background は card_data 分離カラムで管理するため、migratedBg（values 由来）は使わず background state を使う
    const saveBackground = background

    if (!currentCardId) {
      const result = await createCard({
        templateId: template.id,
        cardData: migratedValues as BlockValues,
        background: saveBackground,
        title: (migratedValues.name as string) || 'My Card',
      })
      if ('error' in result) {
        setSaveModalLoading(false)
        if (result.error === 'card_limit_reached') {
          window.location.href = '/upgrade'
        } else {
          alert('保存に失敗しました: ' + result.error)
        }
        return
      }
      currentCardId = result.cardId
      setCardId(currentCardId)
      trackEvent('card_created', { template_id: template.id })
    }

    const newVersion = currentOgpVersion + 1
    if (dataUrl) {
      await updateCard({ cardId: currentCardId, imageBase64: dataUrl, cardData: migratedValues as BlockValues, background: saveBackground, ogp_version: newVersion })
      setCurrentOgpVersion(newVersion)
    }

    await updateCard({ cardId: currentCardId, visibility: 'public' })
    setVisibility('public')
    setSaveModalLoading(false)
    window.location.href = `/card/${currentCardId}?created=1`
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId, values, background, template.id, supabase])


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
    if (!cardId) {
      // 未保存でもXシェア可能（テキストのみ）。ログイン不要。
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t.tweetText)}`, '_blank')
      setShowSaveNudge(true)
      setTimeout(() => setShowSaveNudge(false), 8000)
      return
    }
    const newVersion = currentOgpVersion + 1
    const dataUrl = await getCardDataUrl()
    if (dataUrl) {
      await updateCard({ cardId, imageBase64: dataUrl, ogp_version: newVersion })
      setCurrentOgpVersion(newVersion)
    }
    const base = `${window.location.origin}/card/${cardId}`
    const shareUrl = newVersion > 0 ? `${base}?v=${newVersion}` : base
    const tweetText = `${t.tweetText}\n${shareUrl}`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank')
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
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md shadow-sm h-12 sm:h-14 px-4 border-b border-white/30 flex justify-between items-center">
        <div className="flex items-center gap-2 min-w-0">
          <a href="/" className="text-xl font-black tracking-tight text-[#00AADB] shrink-0">vaacard</a>
          <span className="hidden sm:inline text-gray-300 text-sm">/</span>
          <span className="hidden sm:inline text-sm text-gray-500 truncate">{template.title}</span>
          {isLoggedIn && cardId && draftStatus !== 'idle' && (
            <span className="hidden sm:inline text-[11px] text-gray-300 shrink-0">
              {draftStatus === 'saving' ? '保存中...' : '下書き保存済み'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* PC のみヘッダーにボタン表示 */}
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={handleDownload}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t.save}
            </button>
            <button onClick={handlePostToX}
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-black rounded-lg px-3 py-1.5 hover:bg-gray-800 transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              {t.share}
            </button>
            <button onClick={() => handleShareByUrl()}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#00AADB] to-[#00C9B8] rounded-full px-4 py-1.5 hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-sky-200">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {isLoggedIn ? 'マイページに保存' : 'マイページを作成'}
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

      <div className="flex flex-col lg:flex-1 lg:flex-row lg:pt-0 lg:overflow-hidden mt-12 sm:mt-14">
        {/* カードプレビュー */}
        <section
          className="w-full max-w-full flex items-center justify-center lg:flex-1 lg:min-w-0 lg:h-full lg:px-6 lg:static fixed top-12 sm:top-14 lg:top-auto z-10 sm:h-auto cursor-zoom-in sm:cursor-default active:brightness-95 transition-[filter] duration-100"
          onClick={e => { if (window.innerWidth < 768) { e.preventDefault(); handlePreviewOpen() } }}
          style={{
            background: getBackgroundStyle(bg.type, bg.value as string | [string, string], bg.base64 ?? null, CARD_BG_FALLBACK) ?? undefined,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {!debugMode && <CardScaledView template={template} values={values} background={background} scale={cardScale} fontFamily={fontFamily} t={t} isInteractive />}
        </section>

        {/* エクスポート専用（フルサイズ、画面外に配置） */}
        <div style={debugMode
          ? { overflow: 'hidden', margin: '16px auto', outline: '2px dashed red' }
          : { position: 'fixed', top: -9999, left: -9999, overflow: 'hidden', pointerEvents: 'none' }}>
          <CardScaledView innerRef={cardExportRef} template={template} values={values} background={background} scale={1} fontFamily={fontFamily} t={t} />
        </div>

        {/* フォームサイドバー */}
        <aside className="lg:w-[400px] lg:min-w-[400px] lg:max-w-[500px] lg:flex-none w-full overflow-y-auto flex-1 p-2 pb-24 sm:pb-2 lg:border-t-0 lg:border-l bg-white text-gray-800 isolate">

          {/* モバイルでfixedカードプレビューの下にフォームが来るためのスペーサー */}
          <div className="lg:hidden" style={{ height: 'calc(100vw * 9 / 16 + 16px)' }} />

          <OnboardingBanner t={t} />

{/* formSections がある場合はそちらを優先、なければ template.sections にフォールバック */}
          {propFormSections && propFormSections.length > 0 ? (
            propFormSections.map((section, si) => (
              <AccordionSection key={si} title={section.title} defaultOpen={section.defaultOpen} t={t}>
                <div className="flex flex-col divide-y divide-gray-100">
                  {section.items.map((item, ii) => {
                    if (item.type === 'font') {
                      return (
                        <div key={ii} className="pt-4 first:pt-2 pb-4">
                          <FontSelector
                            fontKey={fontKey}
                            setFontKey={fk => updateValue('font', fk)}
                            t={t}
                          />
                        </div>
                      )
                    }
                    if (item.type === 'text') {
                      return item.style === 'heading'
                        ? <p key={ii} className="pt-4 first:pt-2 text-sm font-semibold text-gray-700">{item.content}</p>
                        : <p key={ii} className="pt-2 text-xs text-gray-500">{item.content}</p>
                    }
                    const block = blockMap[item.dataKey]
                    if (!block) return null
                    if (item.hideWhenEmpty) {
                      const isEmpty = block.isEmpty
                        ? block.isEmpty(values[item.dataKey])
                        : JSON.stringify(values[item.dataKey]) === JSON.stringify(block.defaultValue)
                      if (isEmpty) return null
                    }
                    const blockExt = block as ComponentDef<unknown> & { formLabel?: string; blockConfig?: Record<string, unknown> }
                    const formLabel = item.formLabel ?? blockExt.formLabel
                    return (
                      <div key={ii} className="pt-4 first:pt-2 pb-4">
                        {formLabel && <p className="text-sm font-semibold text-gray-700 mb-1">{formLabel}</p>}
                        <block.FormItem
                          value={item.dataKey === 'background' ? background : values[item.dataKey]}
                          onChange={v => item.dataKey === 'background' ? setBackground(v as BackgroundValue) : updateValue(item.dataKey, v)}
                          t={t} blockConfig={blockExt.blockConfig} formLabel={formLabel} />
                      </div>
                    )
                  })}
                </div>
              </AccordionSection>
            ))
          ) : (
          template.sections.map(section => {
            const isProfile = section.titleKey === 'プロフィール情報'
            return (
              <AccordionSection key={section.titleKey} title={section.titleKey} defaultOpen={section.defaultOpen} t={t}>
                <div className="flex flex-col divide-y divide-gray-100">
                  {isProfile && (
                    <div className="pt-4 first:pt-2 pb-2 flex flex-col gap-2">
                      <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.profileImage}</h2>
                      <label className="flex items-center gap-3">
                        <input type="file" accept="image/*" onChange={handleProfileImageUpload} className="hidden" id="profile-image-upload" />
                        <label htmlFor="profile-image-upload" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-1.5 px-3 rounded-lg cursor-pointer transition-colors flex-shrink-0">
                          {t.chooseFile}
                        </label>
                        <span className="text-sm text-gray-500 truncate">{profileImageFile ? profileImageFile.name : t.noFileChosen}</span>
                      </label>
                    </div>
                  )}
                  {section.blockKeys.map(entry => {
                    const key = typeof entry === 'string' ? entry : entry.key
                    const sectionBlock = typeof entry === 'object' ? entry as TemplateSectionBlock : undefined
                    const block = blockMap[key]
                    if (!block) return null
                    if (sectionBlock?.hideWhenEmpty) {
                      const isEmpty = block.isEmpty
                        ? block.isEmpty(values[key])
                        : JSON.stringify(values[key]) === JSON.stringify(block.defaultValue)
                      if (isEmpty) return null
                    }
                    const blockExtB = blockMap[key] as (ComponentDef<unknown> & { formLabel?: string; blockConfig?: Record<string, unknown> }) | undefined
                    const formLabel = sectionBlock?.formLabel ?? blockExtB?.formLabel
                    return (
                      <div key={key} className="pt-4 first:pt-2 pb-4">
                        {formLabel && <p className="text-sm font-semibold text-gray-700 mb-1">{formLabel}</p>}
                        <block.FormItem
                          value={key === 'background' ? background : values[key]}
                          onChange={v => key === 'background' ? setBackground(v as BackgroundValue) : updateValue(key, v)}
                          t={t} blockConfig={blockExtB?.blockConfig} formLabel={formLabel} />
                      </div>
                    )
                  })}
                </div>
              </AccordionSection>
            )
          })
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

      <FloatingButtons onSave={() => handleShareByUrl()} onShare={handlePostToX} onDownload={handleDownload} t={t} />

      {/* ダウンロード後の保存誘導トースト */}
      {showSaveNudge && (
        <div className="fixed bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-max z-50 bg-white border border-sky-100 rounded-2xl shadow-xl px-5 py-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-sm text-gray-700 font-medium">マイページに保存して、URLで共有できるようにしませんか？</span>
            <button onClick={() => setShowSaveNudge(false)} className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors text-xs">
              閉じる
            </button>
          </div>
          <button
            onClick={() => { setShowSaveNudge(false); handleShareByUrl() }}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            className="w-full text-sm font-bold text-white bg-gradient-to-r from-[#00AADB] to-[#00C9B8] px-4 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all"
          >
            保存する
          </button>
        </div>
      )}

      {/* 保存中オーバーレイ */}
      {publishConfirming && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setPublishConfirming(false)} />
          <div className="fixed inset-x-0 top-1/2 -translate-y-1/2 z-50 flex justify-center px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
              <div className="px-6 pt-6 pb-4 text-center">
                <div className="text-2xl mb-2">⚠️</div>
                <h2 className="text-base font-bold text-gray-900 mb-1">未入力の項目があります</h2>
                <p className="text-xs text-gray-400">このまま保存しますか？</p>
              </div>
              <div className="px-6 pb-5 flex flex-col gap-2">
                <button
                  onClick={() => { setPublishConfirming(false); handleShareByUrl(true) }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  このまま保存する
                </button>
                <button
                  onClick={() => setPublishConfirming(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {saveModalLoading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl px-8 py-6 text-sm text-gray-600 font-medium shadow-xl">
            保存中...
          </div>
        </div>
      )}

    </main>
    </>
  )
}
