'use client'
import { Suspense } from 'react';

import { fabric } from 'fabric';
import { FiMessageCircle } from 'react-icons/fi';
import { useCallback, useEffect, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

import OnboardingBanner from '@/components/OnboardingBanne';
import AccordionSection from '@/components/AccordionSection';
import FontSelector from '@/components/FontSelector';
import PostTimeline from '@/components/PostTimeline';
import BalloonToggle from '@/components/BaloonToggle';
import FloatingButtons from '@/components/FloatingButtons';
import UpgradeModal from '@/components/UpgradeModal';
import HeaderAuth from '@/components/HeaderAuth';
import CardV2 from '@/components/CardV2';
import { CanvasRenderer, fontMap } from '@/components/CanvasRenderer';
import SupportBanner from '@/components/SupportBanner';
import LanguageToggle from '@/components/LanguageToggle';
import { translations } from '@/utils/translations';

import { useCanvas } from '@/hooks/useCanvas';
import { MaruMinya, Uzura, Kawaii } from '@/app/fonts';
import { calculateLayout } from '@/utils/layout';
import { getCroppedImg } from '@/utils/cropUtils';

type LocalStorageCache = {
  name: string
  language: string[]
  gender: string
  playEnv: string[]
  micOnRate: number
  selfIntro: string
  vrchatId: string
  twitterId: string
  discordId: string
  statusBlue: string
  statusGreen: string
  statusYellow: string
  statusRed: string
  friendPolicy: string[]
  interactions: InteractionItem[]
  backgroundType: "color" | "gradient" | "image"
  backgroundValue: string | [string, string]
  fontFamily: string
  showBalloon: boolean
  ageDisplay: string
  trustRank: string
  weekdayStart: string
  weekdayEnd: string
  holidayStart: string
  holidayEnd: string
}

export default function VRChatCardGenerator({ forcedTemplate }: { forcedTemplate?: 'v1' | 'v2' } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialLang = searchParams.get('lang') === 'en' ? 'en' : 'ja';
  const [systemLanguage, setSystemLanguageState] = useState<'ja' | 'en'>(initialLang);

  const setSystemLanguage = useCallback((lang: 'ja' | 'en') => {
    setSystemLanguageState(lang);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (lang === 'en') {
      newSearchParams.set('lang', 'en');
    } else {
      newSearchParams.delete('lang');
    }
    router.replace(`${pathname}?${newSearchParams.toString()}`);
  }, [pathname, router, searchParams]);

  useEffect(() => {
    // URLのlangパラメータとstateが一致しない場合、stateをURLに合わせる
    const currentLangInUrl = searchParams.get('lang') === 'en' ? 'en' : 'ja';
    if (currentLangInUrl !== systemLanguage) {
      setSystemLanguageState(currentLangInUrl);
    }
  }, [searchParams, systemLanguage]);

  const t = translations[systemLanguage];

  const STORAGE_KEY = 'vrchat-card-cache'

  const canvasEl = useRef<HTMLCanvasElement | null>(null)
  const rendererRef = useRef<CanvasRenderer | null>(null)

  const [hasMounted, setHasMounted] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const [name, setName] = useState('')
  const [language, setLanguage] = useState<string[]>([])
  const [customLanguageInput, setCustomLanguageInput] = useState('')
  const [gender, setGender] = useState('')
  const [playEnv, setPlayEnv] = useState<string[]>([])
  const [micOnRate, setMicOnRate] = useState<number>(0)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [selfIntro, setSelfIntro] = useState('')

  const [vrchatId, setVrchatId] = useState('')
  const [twitterId, setTwitterId] = useState('')
  const [discordId, setDiscordId] = useState('')

  const [statusBlue, setStatusBlue] = useState('')
  const [statusGreen, setStatusGreen] = useState('')
  const [statusYellow, setStatusYellow] = useState('')
  const [statusRed, setStatusRed] = useState('')

  const [friendPolicy, setFriendPolicy] = useState<string[]>([])
  const [ageDisplay, setAgeDisplay] = useState('')
  const [ageMode, setAgeMode] = useState<'18歳未満' | '18+' | '非公開' | '自由入力' | ''>('')
  const [trustRank, setTrustRank] = useState('')
  const [activeDays, setActiveDays] = useState<boolean[]>([true, true, true, true, true, false, false])
  const [weekdayStart, setWeekdayStart] = useState('')
  const [weekdayEnd, setWeekdayEnd] = useState('')
  const [holidayStart, setHolidayStart] = useState('')
  const [holidayEnd, setHolidayEnd] = useState('')


  const defaultItems = translations.ja.okNgDefaults; // Use a fixed language for default keys
  const [interactions, setInteractions] = useState<InteractionItem[]>(
    Object.keys(defaultItems).map(key => ({
      label: key, // Store the key, not the translated text
      mark: '-',
      isCustom: false,
    }))
  )

  const [backgroundType, setBackgroundType] = useState<'color' | 'gradient' | 'image'>('image')
  const [backgroundValue, setBackgroundValue] = useState<string | [string, string] | File>('/backgrounds/bg_1.webp')

  const [galleryEnabled, setGalleryEnabled] = useState(false)
  const [galleryImages, setGalleryImages] = useState<(File | null)[]>([null, null, null])
  const [galleryImagesBase64, setGalleryImagesBase64] = useState<(string | null)[]>([null, null, null])

  const [showCropModal, setShowCropModal] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [fontKey, setFontKey] = useState<FontKey>('rounded')
  const [showBalloon, setShowBalloon] = useState(true);
  const initialTemplate = forcedTemplate ?? (searchParams.get('template') === 'v2' ? 'v2' : 'v1')
  const [cardTemplate] = useState<'v1' | 'v2'>(initialTemplate);
  const cardV2Ref = useRef<HTMLDivElement | null>(null)
  const cardV2WrapRef = useRef<HTMLDivElement | null>(null)
  const previewSectionRef = useRef<HTMLElement | null>(null)
  const [profileImageBase64, setProfileImageBase64] = useState<string | null>(null)
  const [backgroundImageBase64, setBackgroundImageBase64] = useState<string | null>(null)
  const [v2Scale, setV2Scale] = useState(1)

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [currentUrlDisplay, setCurrentUrlDisplay] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (t.title) {
      document.title = t.title;
    }
  }, [t.title]);

  useEffect(() => {
    // URLをクライアントサイドでのみ生成
    if (typeof window !== 'undefined') {
      setCurrentUrlDisplay(window.location.origin + pathname + (systemLanguage === 'en' ? '?lang=en' : ''));
    }
  }, [pathname, systemLanguage]);

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // v2 スケール計算
  useEffect(() => {
    if (cardTemplate !== 'v2') return
    const update = () => {
      const isLg = window.innerWidth >= 1024
      const available = window.innerWidth - (isLg ? 400 : 0) - (isLg ? 48 : 32)
      setV2Scale(available / 900)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [cardTemplate])

  // profileImage → base64
  useEffect(() => {
    if (!profileImage) { setProfileImageBase64(null); return }
    const reader = new FileReader()
    reader.onload = (e) => setProfileImageBase64(e.target?.result as string)
    reader.readAsDataURL(profileImage)
  }, [profileImage])

  // background image → base64
  useEffect(() => {
    if (backgroundType !== 'image') { setBackgroundImageBase64(null); return }
    if (backgroundValue instanceof File) {
      const reader = new FileReader()
      reader.onload = (e) => setBackgroundImageBase64(e.target?.result as string)
      reader.readAsDataURL(backgroundValue)
    } else if (typeof backgroundValue === 'string') {
      fetch(backgroundValue)
        .then(r => r.blob())
        .then(blob => {
          const reader = new FileReader()
          reader.onload = (e) => setBackgroundImageBase64(e.target?.result as string)
          reader.readAsDataURL(blob)
        })
        .catch(() => setBackgroundImageBase64(null))
    }
  }, [backgroundType, backgroundValue])

  // galleryImages → base64
  useEffect(() => {
    Promise.all(
      galleryImages.map(file =>
        file
          ? new Promise<string>(resolve => {
              const reader = new FileReader()
              reader.onload = e => resolve(e.target?.result as string)
              reader.readAsDataURL(file)
            })
          : Promise.resolve(null)
      )
    ).then(results => setGalleryImagesBase64(results))
  }, [galleryImages])

  useEffect(() => {
    if (!hasMounted || initialized) return
    const cache = loadFromLocalStorage()

    if (cache.name) setName(cache.name)
    if (cache.selfIntro) setSelfIntro(cache.selfIntro)
    if (cache.language) {
      setLanguage(cache.language)
      const preset = [translations.ja.japanese, translations.ja.english, translations.ja.korean] // Use fixed keys for comparison
      const custom = cache.language.filter(l => !preset.includes(l))
      if (custom.length > 0) {
        setCustomLanguageInput(custom.join(', '))
      }
    }
    if (cache.gender) setGender(cache.gender)
    if (cache.playEnv) setPlayEnv(cache.playEnv)
    if (cache.micOnRate) setMicOnRate(cache.micOnRate)
    if (cache.vrchatId) setVrchatId(cache.vrchatId)
    if (cache.twitterId) setTwitterId(cache.twitterId)
    if (cache.discordId) setDiscordId(cache.discordId)
    if (cache.statusBlue) setStatusBlue(cache.statusBlue)
    if (cache.statusGreen) setStatusGreen(cache.statusGreen)
    if (cache.statusYellow) setStatusYellow(cache.statusYellow)
    if (cache.statusRed) setStatusRed(cache.statusRed)
    if (cache.friendPolicy) {
      const validKeys = [
        'frPolicyAnyone',
        'frPolicyAfterGettingToKnow',
        'frPolicyIfInterested',
        'frPolicyMutualsOnX',
        'frPolicyNo',
      ];
      const filteredPolicies = cache.friendPolicy.filter(policy => validKeys.includes(policy));
      setFriendPolicy(filteredPolicies);
    }

    if (cache.interactions) {
      const interactionsCache = cache.interactions;
      const defaultKeys = Object.keys(translations.ja.okNgDefaults);
      
      // Restore default items, preserving their order and marks from cache
      const restoredDefaults = defaultKeys.map(key => {
        const cachedItem = interactionsCache.find(item => !item.isCustom && item.label === key);
        return cachedItem || { label: key, mark: '-', isCustom: false };
      });

      // Restore custom items from cache
      const customItems = interactionsCache.filter(item => item.isCustom);

      // Combine them
      setInteractions([...restoredDefaults, ...customItems]);
    }

    if (cache.backgroundType) setBackgroundType(cache.backgroundType)
    if (cache.backgroundValue) setBackgroundValue(cache.backgroundValue)
    if (cache.ageDisplay) {
      setAgeDisplay(cache.ageDisplay)
      const presets = ['18歳未満', '18+', '非公開'] as const
      if (presets.includes(cache.ageDisplay as typeof presets[number])) {
        setAgeMode(cache.ageDisplay as typeof presets[number])
      } else {
        setAgeMode('自由入力')
      }
    }
    if (cache.trustRank) setTrustRank(cache.trustRank)
    if (cache.weekdayStart) setWeekdayStart(cache.weekdayStart)
    if (cache.weekdayEnd) setWeekdayEnd(cache.weekdayEnd)
    if (cache.holidayStart) setHolidayStart(cache.holidayStart)
    if (cache.holidayEnd) setHolidayEnd(cache.holidayEnd)
    console.log("initialization!")

    setInitialized(true)
  }, [hasMounted, initialized, t.japanese, t.english, t.korean]) // Add t.japanese, t.english, t.korean to dependencies

  useEffect(() => {
    const canvasElement = canvasEl.current
    if (!canvasElement) return
  
    let currentCanvas: fabric.Canvas | null = null
  
    const resizeAndRender = () => {
      // 🔹 先にレンダラーを無効化しておく
      rendererRef.current = null
  
      // 🔹 canvas を一旦強制クリア（Fabric の内部バグ対策）
      canvasElement.width = 0
      canvasElement.height = 0
  
      // 🔹 前 canvas を dispose
      currentCanvas?.dispose()
  
      // 🔹 新しいサイズを再設定
      const width = canvasElement.clientWidth
      const height = width * 9 / 16
      canvasElement.width = width
      canvasElement.height = height
  
      // 🔹 Canvas & Renderer 再生成
      const canvas = new fabric.Canvas(canvasElement, { width, height })
      currentCanvas = canvas
  
      const renderer = new CanvasRenderer(canvas, { ...t, lang: systemLanguage })
      rendererRef.current = renderer

      const fontFamily = fontMap[fontKey]?.style?.fontFamily ?? 'sans-serif'
  
      // 🔹 描画実行（画像読み込みが非同期なので try-catch 推奨）
      try {
        const renderProps = {
          name,
          language,
          gender,
          playEnv,
          micOnRate,
          profileImage,
          selfIntro,
          vrchatId,
          twitterId,
          discordId,
          statusBlue,
          statusGreen,
          statusYellow,
          statusRed,
          friendPolicy,
          interactions,
          backgroundType,
          backgroundValue,
          galleryEnabled,
          galleryImages,
          fontFamily,
          showBalloon,
        }
        if (cardTemplate === 'v2') {
          renderer.renderV2(renderProps)
        } else {
          renderer.render(renderProps)
        }
      } catch (err) {
        console.error('レンダリングエラー:', err)
      }
    }
  
    resizeAndRender()
    window.addEventListener('resize', resizeAndRender)
  
    return () => {
      rendererRef.current = null
      currentCanvas?.dispose()
      window.removeEventListener('resize', resizeAndRender)
    }
  }, [
    name,
    language,
    gender,
    playEnv,
    micOnRate,
    profileImage,
    selfIntro,
    vrchatId,
    twitterId,
    discordId,
    statusBlue,
    statusGreen,
    statusYellow,
    statusRed,
    friendPolicy,
    interactions,
    backgroundType,
    backgroundValue,
    galleryEnabled,
    galleryImages,
    fontKey,
    showBalloon,
    previewOpen,
    previewImageUrl,
    systemLanguage
  ])

  useEffect(() => {
    if (!initialized) return
    const fontFamily = fontMap[fontKey]?.style?.fontFamily ?? 'sans-serif'
    const data = {
      name,
      language,
      gender,
      playEnv,
      micOnRate,
      selfIntro,
      vrchatId,
      twitterId,
      discordId,
      statusBlue,
      statusGreen,
      statusYellow,
      statusRed,
      friendPolicy,
      interactions,
      backgroundType,
      backgroundValue,
      galleryEnabled,
      galleryImages,
      fontFamily,
      showBalloon,
      ageDisplay,
      trustRank,
      weekdayStart,
      weekdayEnd,
      holidayStart,
      holidayEnd,
    }
    saveToLocalStorage(data)
  }, [
    name, language, gender, playEnv, micOnRate, selfIntro,
    vrchatId, twitterId, discordId,
    statusBlue, statusGreen, statusYellow, statusRed,
    friendPolicy, interactions, backgroundType, backgroundValue, fontKey, showBalloon, cardTemplate,
    ageDisplay, trustRank, weekdayStart, weekdayEnd, holidayStart, holidayEnd,
  ])

  const saveToLocalStorage = (data: Record<string, unknown>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.warn('保存失敗:', e)
    }
  }

  const loadFromLocalStorage = (): Partial<LocalStorageCache> => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch (e) {
      console.warn('読み込み失敗:', e)
      return {}
    }
  }
  
  const getCardDataUrl = async (): Promise<string | null> => {
    if (cardTemplate === 'v2') {
      if (!cardV2Ref.current) return null
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardV2Ref.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
      })
      return canvas.toDataURL('image/png')
    }
    if (!rendererRef.current) return null
    return rendererRef.current.canvas.toDataURL({
      format: 'png',
      multiplier: 1920 / rendererRef.current.canvas.getWidth(),
    })
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

  const handlePostToX = () => {
    if (!rendererRef.current) return;
  
    const canvas = rendererRef.current.canvas;
    const highResUrl = rendererRef.current.canvas.toDataURL({
      format: 'png',
      multiplier: 1920 / rendererRef.current.canvas.getWidth(),
    })

    const tweetText = encodeURIComponent(t.tweetText);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

    const isMobile = window.innerWidth < 768;
  
    if (isMobile) {
      // モバイル：画像だけ表示 → 手動で保存して添付してね
      const win = window.open();
      if (win) {
        win.document.write(`
          <div style="text-align:center;font-family:sans-serif;padding:1rem">
            <p>{t.pressAndHoldToSave}</p>
            <img src="${highResUrl}" style="max-width:100%;height:auto;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.2)" />
            <p style="margin-top:1rem;">
              <a href="${tweetUrl}" target="_blank" style="display:inline-block;padding:0.5rem 1rem;background:#1d9bf0;color:#fff;border-radius:6px;text-decoration:none">
                {t.openPostScreenOnX}
              </a>
            </p>
          </div>
        `);
      }
    } else {
      // PC：画像を即DL
      const link = document.createElement("a");
      link.href = highResUrl;
      link.download = "vrchat_card.png";
      link.click();
    }
  
    window.open(tweetUrl, "_blank");
  };

  const handlePreviewOpen = () => {
    if (!rendererRef.current) return
    const canvas = document.querySelector("canvas"); // ←id指定でもOK
    if (canvas instanceof HTMLCanvasElement) {
      const highResUrl = rendererRef.current.canvas.toDataURL({
        format: 'png',
        multiplier: 1920 / rendererRef.current.canvas.getWidth(),
      })
      setPreviewImageUrl(highResUrl);
      setPreviewOpen(true);
    }
  };
  
  // Data URL を Blob に変換
  const dataURLtoBlob = (dataURL: string) => {
    const byteString = atob(dataURL.split(',')[1])
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
    return new Blob([ab], { type: mimeString })
  }

  const handleShowDownloadPage = () => {
    if (!rendererRef.current) return
    const highResUrl = rendererRef.current.canvas.toDataURL({
      format: 'png',
      multiplier: 1920 / rendererRef.current.canvas.getWidth(),
    })
    const win = window.open()
    if (win) {
      win.document.write(`
        <p>{t.pressAndHoldToAdd}</p>
        <img src="${highResUrl}" style="max-width:100%;"/>
      `)
    }
  }

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
  
    const croppedBlob = await getCroppedImg(uploadedImage, croppedAreaPixels)
    const croppedFile = new File([croppedBlob], 'cropped.png', { type: 'image/png' })
    
    setProfileImage(croppedFile)
    setShowCropModal(false)
  }

  return (
    <>
    <main className="w-screen h-screen flex flex-col bg-gray-50 text-gray-800">
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-sm h-12 sm:h-14 px-4 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-semibold text-gray-900">自己紹介カード</span>
          <span className="hidden sm:inline text-xs text-gray-400 font-medium border border-gray-200 rounded px-1.5 py-0.5">VRChat Card</span>
          <span className="text-xs text-gray-400 font-medium">by <span className="font-black text-gray-700">vaacard</span></span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://x.com/yota3d"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t.requests}
          >
            <FiMessageCircle className="w-5 h-5" />
          </a>
          <LanguageToggle language={systemLanguage} setSystemLanguage={setSystemLanguage} />
          <HeaderAuth />
        </div>
      </header>

      {showCropModal && uploadedImage && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg w-[90vw] max-w-[400px] h-[90vw] max-h-[400px] relative">
            <Cropper
              image={uploadedImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="rect"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
              style={{
                containerStyle: {
                  width: '100%',
                  height: '100%',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  position: 'relative',
                }
              }}
            />
            <div className="absolute bottom-2 right-2 flex gap-2">
              <button
                onClick={handleCropDone}
                className="bg-green-600 text-white px-3 py-1 text-sm rounded"
              >
                {t.done}
              </button>
              <button
                onClick={() => setShowCropModal(false)}
                className="bg-gray-300 text-black px-3 py-1 text-sm rounded"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewOpen && previewImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center"
          onClick={() => setPreviewOpen(false)}
        >
          <img
            src={previewImageUrl}
            alt={t.enlargedCardPreview}
            className="max-w-[90%] max-h-[90%] rounded shadow-lg"
          />
        </div>
      )}

      <div className="
        flex 
        flex-col 
        lg:flex-1 
        lg:flex-row 
        lg:pt-0
        lg:overflow-hidden
        mt-12 sm:mt-16"
      >
        <section
          ref={previewSectionRef}
          className="
            w-full max-w-full
            flex items-center justify-center
            lg:flex-1 lg:min-w-0 lg:h-full
            lg:px-6
            lg:static
            fixed
            lg:top-auto
            z-10
            sm:h-auto
            cursor-zoom-in sm:cursor-default
          "
          onClick={(e) => {
            if (window.innerWidth < 768) {
              e.preventDefault();
              handlePreviewOpen();
            }
          }}
        >
          {cardTemplate === 'v2' ? (
            <div
              className="shadow-md"
              style={{ width: 900 * v2Scale, height: 506 * v2Scale, position: 'relative', overflow: 'hidden', flexShrink: 0 }}
            >
              <div style={{
                transform: `scale(${v2Scale})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
              }}>
                <CardV2
                  ref={cardV2Ref}
                  name={name}
                  profileImageBase64={profileImageBase64}
                  gender={gender}
                  language={language}
                  playEnv={playEnv}
                  micOnRate={micOnRate}
                  selfIntro={selfIntro}
                  vrchatId={vrchatId}
                  twitterId={twitterId}
                  discordId={discordId}
                  statusBlue={statusBlue}
                  statusGreen={statusGreen}
                  statusYellow={statusYellow}
                  statusRed={statusRed}
                  interactions={interactions}
                  backgroundType={backgroundType}
                  backgroundValue={typeof backgroundValue !== 'object' || Array.isArray(backgroundValue) ? backgroundValue as string | [string, string] : undefined}
                  backgroundImageBase64={backgroundImageBase64}
                  fontFamily={fontMap[fontKey]?.style?.fontFamily ?? 'sans-serif'}
                  okNgLabels={t.okNgDefaults}
                  ageDisplay={ageDisplay}
                  trustRank={trustRank}
                  activeDays={activeDays}
                  weekdayStart={weekdayStart}
                  weekdayEnd={weekdayEnd}
                  holidayStart={holidayStart}
                  holidayEnd={holidayEnd}

                  friendPolicy={friendPolicy}
                  friendPolicyLabels={{
                    frPolicyAnyone: t.frPolicyAnyone,
                    frPolicyAfterGettingToKnow: t.frPolicyAfterGettingToKnow,
                    frPolicyIfInterested: t.frPolicyIfInterested,
                    frPolicyMutualsOnX: t.frPolicyMutualsOnX,
                    frPolicyNo: t.frPolicyNo,
                  }}
                  galleryImages={galleryEnabled ? galleryImagesBase64 : undefined}
                />
              </div>
            </div>
          ) : (
            <canvas
              ref={canvasEl}
              className="w-full max-w-[1920px] aspect-[16/9] border-none shadow-md"
            />
          )}
        </section>
        <aside 
          className="
            lg:w-[400px] lg:min-w-[400px] lg:max-w-[500px] lg:flex-none
            w-full overflow-y-auto flex-1 p-2
            lg:border-t-0 lg:border-l mt-[calc(100vw*9/16+16px)] pt-0 lg:mt-4"
        >
          <SupportBanner t={t} />
          <AccordionSection title={t.cardDesign} defaultOpen t={t}>
            <div className="flex flex-col gap-4 pt-2 pb-2 ">

              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.backgroundSettings}</h2>

              {/* {t.solidColorBg} */}
              <div>
                <span className="font-semibold">{t.solidColorBg}</span>
                <div className="flex gap-2 mt-1">
                  {[
                    '#f87171', 
                    '#fcd5ce',
                    '#60a5fa', 
                    '#e0f7fa',
                    '#34d399', 
                    '#facc15', 
                    '#a78bfa', 
                    '#e6e6fa',
                    '#f3f4f6', 
                    '#333333',
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setBackgroundType('color')
                        setBackgroundValue(color)
                      }}
                      className="w-8 h-8 rounded-lg border border-black/10 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* {t.gradientBg} */}
              <div>
                <span className="font-semibold">{t.gradientBg}</span>
                <div className="flex gap-2 mt-1">
                  {[
                    { id: 'blue-purple', from: '#60a5fa', to: '#a78bfa' },
                    { id: 'pink-red', from: '#f472b6', to: '#ef4444' },
                    { id: 'pastel-sky', from: '#fcd5ce', to: '#e0f7fa' },
                    { id: 'mint-lavender', from: '#34d399', to: '#e6e6fa' },
                    { id: 'neutral-dark', from: '#f3f4f6', to: '#333333' },
                  ].map(({ id, from, to }) => (
                    <button
                      key={id}
                      onClick={() => {
                        setBackgroundType('gradient')
                        setBackgroundValue([from, to])
                      }}
                      className="w-16 h-8 rounded"
                      style={{ backgroundImage: `linear-gradient(to right, ${from}, ${to})` }}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <span className="font-semibold">{t.handwrittenBg}</span>
                <div className="flex gap-2 mt-1">
                  {[
                    { id: 'bg1', src: '/backgrounds/bg_1.webp' },
                    { id: 'bg2', src: '/backgrounds/bg_2.webp' },
                    { id: 'bg3', src: '/backgrounds/bg_3.webp' },
                    { id: 'bg4', src: '/backgrounds/bg_4.webp' },
                    { id: 'bg5', src: '/backgrounds/bg_5.webp' },
                  ].map(({ id, src }) => (
                    <button
                      key={id}
                      onClick={() => {
                        setBackgroundType('image')
                        setBackgroundValue(src)
                      }}
                      className="w-16 h-8 rounded bg-cover bg-center"
                      style={{ backgroundImage: `url(${src})` }}
                    />
                  ))}
                </div>
              </div>

              {/* {t.imageBg} */}
              <div>
                <span className="font-semibold">{t.imageBg}</span>
                <label className="flex items-center mt-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setBackgroundType('image')
                        setBackgroundValue(file)
                      }
                    }}
                    className="hidden" // Hide the native input
                    id="image-bg-upload"
                  />
                  <span className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-1.5 px-3 rounded-lg cursor-pointer transition-colors">
                    {t.chooseFile}
                  </span>
                  <span className="ml-2 text-gray-600 text-sm">
                    {backgroundValue instanceof File ? backgroundValue.name : t.noFileChosen}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-2 pb-2">
              <FontSelector fontKey={fontKey} setFontKey={setFontKey} t={t} />
            </div>
            
            <div className="flex flex-col gap-4 pt-2 pb-2">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.speechBubble}</h2>
              <BalloonToggle showBalloon={showBalloon} setShowBalloon={setShowBalloon} t={t} />
            </div>
          </AccordionSection>

          <AccordionSection title={t.profileInfo} t={t}>
            <div className="flex flex-col gap-4 pt-2 pb-2">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.profileImage}</h2>
              <input type="file" accept="image/*" onChange={handleProfileImageUpload} />
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.name}</h2>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300" />
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.gender}</h2>
              <input type="text" value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300" />
            </div>
          </AccordionSection>

          <AccordionSection title={t.envAndLang} t={t}>
            <div className="flex flex-col gap-4 mt-2">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.environment}</h2>
              <div className="flex gap-3 mt-1">
                {['PCVR', 'Quest', 'Desktop'].map((opt) => (
                  <label key={opt} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      value={opt}
                      checked={playEnv.includes(opt)}
                      onChange={(e) => {
                        if (e.target.checked) setPlayEnv([...playEnv, opt])
                        else setPlayEnv(playEnv.filter((v) => v !== opt))
                      }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.languages}</h2>
              <label className="flex flex-col">
                <div className="flex flex-wrap gap-3 mt-1">
                  {[t.japanese, t.english, t.korean].map((lang) => (
                    <label key={lang} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        value={lang}
                        checked={language.includes(lang)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setLanguage([...language, lang])
                          } else {
                            setLanguage(language.filter((l) => l !== lang))
                          }
                        }}
                      />
                      {lang}
                    </label>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder={t.otherLanguages}
                  className="p-2 border rounded mt-2"
                  value={customLanguageInput}
                  onChange={(e) => {
                    const customInput = e.target.value
                    setCustomLanguageInput(customInput)
                    const customLangs = customInput
                      .split(',')
                      .map((l) => l.trim())
                      .filter((l) => l)
                    setLanguage([...new Set([
                      ...language.filter(l => ['日本語', 'English', 'Korean'].includes(l)),
                      ...customLangs
                    ])])
                  }}
                  />
              </label>
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.micOnRate}</h2>
              <label className="flex flex-col">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={micOnRate}
                  onChange={(e) => setMicOnRate(Number(e.target.value))}
                />
                <span>{micOnRate}%</span>
              </label>
            </div>
          </AccordionSection>

          <AccordionSection title={t.snsContact} t={t}>
            <div className="flex flex-col gap-4 pt-2">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.snsInfo}</h2>
              <label className="flex flex-col">
                <span className="font-semibold">VRChat ID</span>
                <input
                  type="text"
                  value={vrchatId}
                  onChange={(e) => setVrchatId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </label>
              <label className="flex flex-col">
                <span className="font-semibold">{t.xFormerTwitter}</span>
                <input
                  type="text"
                  value={twitterId}
                  onChange={(e) => setTwitterId(e.target.value)}
                  placeholder="@yourhandle"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </label>
              <label className="flex flex-col">
                <span className="font-semibold">Discord</span>
                <input
                  type="text"
                  value={discordId}
                  onChange={(e) => setDiscordId(e.target.value)}
                  placeholder="YourName#1234"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </label>
            </div>
          </AccordionSection>
          
          <AccordionSection title={t.howToInteract} t={t}>
            <div className="flex flex-col gap-4 mt-2">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.statusDescription}</h2>
              {[
                { label: t.statusBlue, value: statusBlue, setValue: setStatusBlue },
                { label: t.statusGreen, value: statusGreen, setValue: setStatusGreen },
                { label: t.statusYellow, value: statusYellow, setValue: setStatusYellow },
                { label: t.statusRed, value: statusRed, setValue: setStatusRed },
              ].map(({ label, value, setValue }) => (
                <label key={label} className="flex flex-col">
                  <span className="font-semibold">{label}</span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                </label>
              ))}
            </div>

            {cardTemplate === 'v2' && <div className="flex flex-col gap-4 mt-6">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.friendRequestPolicy}</h2>
              {[
                'frPolicyAnyone',
                'frPolicyAfterGettingToKnow',
                'frPolicyIfInterested',
                'frPolicyMutualsOnX',
                'frPolicyNo',
              ].map((key) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="friendPolicy"
                    value={key}
                    checked={friendPolicy[0] === key}
                    onChange={() => setFriendPolicy([key])}
                  />
                  {t[key as keyof typeof t] as string}
                </label>
              ))}
            </div>}

            {/* 年齢表示 */}
            <div className="flex flex-col gap-2 mt-6">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">年齢</h2>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                {(['18歳未満', '18+', '非公開', '自由入力'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setAgeMode(opt)
                      if (opt !== '自由入力') setAgeDisplay(opt)
                      else setAgeDisplay('')
                    }}
                    className={`flex-1 py-2 text-center transition-colors ${
                      ageMode === opt
                        ? 'bg-gray-900 text-white font-semibold'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {ageMode === '自由入力' && (
                <input
                  type="text"
                  value={ageDisplay}
                  onChange={e => setAgeDisplay(e.target.value)}
                  placeholder="例: 20代, 社会人"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              )}
            </div>

            {/* V2専用: Trust Rank・年齢・活動時間 */}
            {cardTemplate === 'v2' && <>

            {/* TRUST RANK */}
            <div className="flex flex-col gap-2 mt-6">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Trust Rank</h2>
              <div className="flex flex-wrap gap-1.5">
                {([
                  { rank: 'Visitor',      color: '#9ca3af' },
                  { rank: 'New User',     color: '#3b82f6' },
                  { rank: 'User',         color: '#22c55e' },
                  { rank: 'Known User',   color: '#f97316' },
                  { rank: 'Trusted User', color: '#a855f7' },
                ] as const).map(({ rank, color }) => (
                  <button
                    key={rank}
                    type="button"
                    onClick={() => setTrustRank(trustRank === rank ? '' : rank)}
                    style={trustRank === rank ? { borderColor: color, backgroundColor: color, color: '#fff' } : { borderColor: color + '60', color }}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors border font-semibold ${
                      trustRank === rank ? '' : 'bg-white hover:opacity-80'
                    }`}
                  >
                    {rank}
                  </button>
                ))}
              </div>
            </div>

            {/* 活動時間 */}
            <div className="flex flex-col gap-3 mt-6">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">活動時間</h2>
              {/* 曜日選択 */}
              <div className="flex gap-1.5">
                {['月','火','水','木','金','土','日'].map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveDays(prev => prev.map((v, j) => j === i ? !v : v))}
                    className="w-8 h-8 rounded-full text-xs font-bold transition-colors"
                    style={{
                      background: activeDays[i]
                        ? (i >= 5 ? 'rgba(251,191,36,0.85)' : 'rgba(96,165,250,0.85)')
                        : '#f3f4f6',
                      color: activeDays[i] ? '#fff' : '#9ca3af',
                    }}
                  >{d}</button>
                ))}
              </div>
              {([
                { label: '平日', start: weekdayStart, end: weekdayEnd, setStart: setWeekdayStart, setEnd: setWeekdayEnd, color: '#60a5fa' },
                { label: '休日', start: holidayStart, end: holidayEnd, setStart: setHolidayStart, setEnd: setHolidayEnd, color: '#f59e0b' },
              ]).map(({ label, start, end, setStart, setEnd, color }) => {
                const sh = start ? parseInt(start) : null
                const eh = end   ? parseInt(end)   : null
                const hasRange = sh !== null && eh !== null
                const leftPct  = hasRange ? (sh / 24) * 100 : 0
                const widthPct = hasRange
                  ? (eh > sh ? (eh - sh) / 24 * 100 : (24 - sh + eh) / 24 * 100)
                  : 0
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className="text-xs text-gray-400">
                        {hasRange ? `${sh}:00 〜 ${eh}:00` : '未設定'}
                      </span>
                    </div>
                    {/* バー */}
                    <div className="relative h-2 rounded-full bg-gray-100 mb-2">
                      {hasRange && (
                        <div
                          className="absolute h-full rounded-full"
                          style={{ left: `${leftPct}%`, width: `${widthPct}%`, background: color }}
                        />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input type="range" min={0} max={23} value={sh ?? 0}
                          onChange={e => setStart(`${String(e.target.value).padStart(2,'0')}:00`)}
                          className="w-full accent-gray-500 h-1.5 cursor-pointer" />
                        <div className="text-center text-xs text-gray-400 mt-0.5">から {sh !== null ? `${sh}時` : '-'}</div>
                      </div>
                      <div className="flex-1">
                        <input type="range" min={0} max={23} value={eh ?? 0}
                          onChange={e => setEnd(`${String(e.target.value).padStart(2,'0')}:00`)}
                          className="w-full accent-gray-500 h-1.5 cursor-pointer" />
                        <div className="text-center text-xs text-gray-400 mt-0.5">まで {eh !== null ? `${eh}時` : '-'}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setStart(''); setEnd('') }}
                      className="text-xs text-gray-400 hover:text-gray-600 mt-1"
                    >
                      クリア
                    </button>
                  </div>
                )
              })}
            </div>


            </>}

            <div className="flex flex-col gap-4 mt-6">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.okNg}</h2>
              {interactions.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={item.mark}
                      onChange={(e) => {
                        const updated = [...interactions]
                        updated[index].mark = e.target.value as MarkOption
                        setInteractions(updated)
                      }}
                      className="w-16 p-1 border rounded"
                    >
                      <option value="-">―</option>
                      <option value="◎">◎</option>
                      <option value="◯">◯</option>
                      <option value="△">△</option>
                      <option value="✗">✗</option>
                    </select>

                    <input
                      type="text"
                      value={item.isCustom ? item.label : t.okNgDefaults[item.label as keyof typeof t.okNgDefaults]}
                      disabled={!item.isCustom}
                      placeholder={t.customItem}
                      className="flex-1 p-1 border rounded"
                      onChange={(e) => {
                        const updated = [...interactions]
                        updated[index].label = e.target.value
                        setInteractions(updated)
                      }}
                    />

                    {item.isCustom && (
                      <button
                        onClick={() => {
                          const updated = interactions.filter((_, i) => i !== index)
                          setInteractions(updated)
                        }}
                        className="text-red-500 hover:underline text-sm"
                        title={t.delete}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}

                {interactions.filter(i => i.isCustom).length < 3 && (
                  <button
                    onClick={() => setInteractions([...interactions, { label: '', mark: '-', isCustom: true }])}
                    className="mt-2 text-blue-600 underline text-sm"
                  >
                    {t.addCustomItem}
                  </button>
                )}
            </div>
          </AccordionSection>

          <AccordionSection title={t.aboutMeAndImages} t={t}>
            <div className="flex flex-col gap-4 mt-2">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.aboutMeText}</h2>
              <textarea
                value={selfIntro}
                onChange={(e) => setSelfIntro(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            {cardTemplate === 'v2' && <div className="flex flex-col gap-4 mt-6 border-t pt-4 mb-6">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.galleryImages}</h2>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={galleryEnabled}
                  onChange={(e) => setGalleryEnabled(e.target.checked)}
                />
                {t.showGallery}
              </label>
              {galleryEnabled && (
                <div className="flex flex-col gap-2">
                  {[0, 1, 2].map((index) => (
                    <label key={index} className="flex flex-col">
                      <span className="font-semibold">{t.galleryImage} {index + 1}</span>
                      <label className="flex items-center mt-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null
                            const updated = [...galleryImages]
                            updated[index] = file
                            setGalleryImages(updated)
                          }}
                          className="hidden"
                          id={`gallery-image-upload-${index}`}
                        />
                        <span className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-1.5 px-3 rounded-lg cursor-pointer transition-colors">
                          {t.chooseFile}
                        </span>
                        <span className="ml-2 text-gray-600 text-sm">
                          {galleryImages[index] instanceof File ? galleryImages[index]?.name : t.noFileChosen}
                        </span>
                      </label>
                    </label>
                  ))}
                </div>
              )}
            </div>}
          </AccordionSection>

          <PostTimeline t={t} />

          <div className="w-full max-w-screen-md mx-auto mt-4 mb-4">
            <div className="border border-gray-300 rounded-xl bg-gray-50 p-4 text-sm text-gray-700 text-center shadow-sm">
              <p className="text-xs text-gray-600 mb-2 leading-snug">
                {t.currentLanguageUrl}
              </p>
              <p className="text-sm font-medium text-blue-600 break-all">
                {currentUrlDisplay}
              </p>
            </div>
          </div>
        </aside>
      </div>
      <FloatingButtons
        onSave={() => setShowUpgradeModal(true)}
        onShare={handlePostToX}
        onDownload={handleDownload}
        t={t}
      />
      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          localStorageKey={STORAGE_KEY}
          getCanvasDataUrl={getCardDataUrl}
        />
      )}
    </main>
    <OnboardingBanner t={t} />
    </>
  )
}

