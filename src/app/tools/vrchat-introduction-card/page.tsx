'use client'

import { useEffect, useRef, useState } from 'react'
import { fabric } from 'fabric'
import { CanvasRenderer, InteractionItem, MarkOption } from '@/components/CanvasRenderer'
import Cropper, { Area } from 'react-easy-crop'
import { getCroppedImg } from '@/utils/cropUtils'
import OnboardingBanner from '@/components/OnboardingBanne'
import AccordionSection from '@/components/AccordionSection'
import FloatingButtons from '@/components/FloatingButtons'
import FontSelector from '@/components/FontSelector';
import PostTimeline from '@/components/PostTimeline'
import BalloonToggle from '@/components/BaloonToggle'
import { FiMessageCircle } from "react-icons/fi"


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
  backgroundValue: string | [string, string], 
  fontFamily: string,
  showBalloon: boolean  
}

export default function Home() {
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

  const defaultItems = ['触る', '近距離', 'お砂糖', '武器', '暴言/暴力', '下ネタ']
  const [interactions, setInteractions] = useState<InteractionItem[]>(
    defaultItems.map(label => ({ label, mark: '-' }))
  )

  const [backgroundType, setBackgroundType] = useState<'color' | 'gradient' | 'image'>('color')
  const [backgroundValue, setBackgroundValue] = useState<string | [string, string] | File>('#f87171')

  const [galleryEnabled, setGalleryEnabled] = useState(false)
  const [galleryImages, setGalleryImages] = useState<(File | null)[]>([null, null, null])

  const [showCropModal, setShowCropModal] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [fontFamily, setFontFamily] = useState('"Rounded Mplus 1c", sans-serif');
  const [showBalloon, setShowBalloon] = useState(true);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (!hasMounted || initialized) return
    const cache = loadFromLocalStorage()

    if (cache.name) setName(cache.name)
    if (cache.selfIntro) setSelfIntro(cache.selfIntro)
    if (cache.language) {
      setLanguage(cache.language)
      const preset = ['日本語', 'English', 'Korean']
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
    if (cache.friendPolicy) setFriendPolicy(cache.friendPolicy)
    if (cache.interactions) setInteractions(cache.interactions)
    if (cache.backgroundType) setBackgroundType(cache.backgroundType)
    if (cache.backgroundValue) setBackgroundValue(cache.backgroundValue)
    
    console.log("initialization!")

    setInitialized(true)
  }, [hasMounted])

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
  
      const renderer = new CanvasRenderer(canvas)
      rendererRef.current = renderer
  
      // 🔹 描画実行（画像読み込みが非同期なので try-catch 推奨）
      try {
        renderer.render({
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
          showBalloon
        })
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
    fontFamily,
    showBalloon,
    previewOpen,
    previewImageUrl
  ])

  useEffect(() => {
    if (!initialized) return
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
      showBalloon
      // 🔴 profileImage は File オブジェクトのため保存できない
    }
    saveToLocalStorage(data)
  }, [
    name, language, gender, playEnv, micOnRate, selfIntro,
    vrchatId, twitterId, discordId,
    statusBlue, statusGreen, statusYellow, statusRed,
    friendPolicy, interactions, backgroundType, backgroundValue, fontFamily, showBalloon
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
  
  const handleDownload = () => {
    if (!rendererRef.current) return
    const highResUrl = rendererRef.current.canvas.toDataURL({
      format: 'png',
      multiplier: 1920 / rendererRef.current.canvas.getWidth(),
    })

    if (window.innerWidth < 768) {
      // モバイル：新しいタブで画像表示
      const win = window.open()
      if (win) {
        win.document.write(`<img src="${highResUrl}" style="width:100%;height:auto;" />`)
      }
    } else {
      // PC：通常のダウンロード処理
      const link = document.createElement("a")
      link.href = highResUrl
      link.download = "vrchat-introduction-card.png"
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

    const tweetText = encodeURIComponent("自己紹介カードを作りました！\n#VRChat自己紹介カード\n#VRChat自己紹介カードメーカー");
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

    const isMobile = window.innerWidth < 768;
  
    if (isMobile) {
      // モバイル：画像だけ表示 → 手動で保存して添付してね
      const win = window.open();
      if (win) {
        win.document.write(`
          <div style="text-align:center;font-family:sans-serif;padding:1rem">
            <p>画像を長押しで保存して、投稿時に添付してください📎</p>
            <img src="${highResUrl}" style="max-width:100%;height:auto;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.2)" />
            <p style="margin-top:1rem;">
              <a href="${tweetUrl}" target="_blank" style="display:inline-block;padding:0.5rem 1rem;background:#1d9bf0;color:#fff;border-radius:6px;text-decoration:none">
                Xで投稿画面を開く →
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
        <p>下の画像を長押しして「写真に追加」してください。</p>
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
    <main className="font-rounded w-screen h-screen flex flex-col bg-gray-50 text-gray-800">
      <header className="fixed top-0 left-0 right-0 z-30 bg-white h-12 sm:h-16 px-4 py-2 lg:shadow flex justify-between items-center">
        <div className="text-base sm:text-xl font-bold">
          VRChat自己紹介カードメーカー
        </div>
        <div className="text-sm text-gray-600">
          <span className="hidden sm:inline">
            質問・要望・コメントなどは{' '}
            <a
              href="https://x.com/yota3d"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              @yota3d
            </a>{' '}
            まで！
          </span>

          <a
            href="https://x.com/yota3d"
            target="_blank"
            rel="noopener noreferrer"
            className="inline text-sm sm:hidden text-blue-600"
            aria-label="@yota3dへ連絡"
          >
            要望<FiMessageCircle className="w-6 h-6" />
          </a>
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
                完了
              </button>
              <button
                onClick={() => setShowCropModal(false)}
                className="bg-gray-300 text-black px-3 py-1 text-sm rounded"
              >
                キャンセル
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
            alt="拡大カードプレビュー"
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
          className="
            w-full max-w-full
            flex items-center justify-center
            lg:p-4
            lg:static
            fixed 
            lg:top-auto
            z-10
            lg:static
            w-full sm:h-auto
            cursor-zoom-in sm:cursor-default
          "
          onClick={(e) => {
            if (window.innerWidth < 768) {
              e.preventDefault();
              handlePreviewOpen();
            }
          }}
        >
          <canvas
            ref={canvasEl}
            className="w-full max-w-[1920px] aspect-[16/9] border-none shadow-md"
          />
        </section>
        <aside 
          className="
            lg:w-[400px] lg:min-w-[400px] lg:max-w-[500px] 
            w-full overflow-y-auto flex-1 p-2 
            lg:border-t-0 lg:border-l mt-[calc(100vw*9/16+16px)] pt-0 lg:mt-4"
        >
          <AccordionSection title="カードデザイン" defaultOpen>
            <div className="flex flex-col gap-4 pt-2 pb-2 ">
              <h2 className="text-lg font-bold">背景の設定</h2>

              {/* 単色選択 */}
              <div>
                <span className="font-semibold">単色背景</span>
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
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* グラデーション選択 */}
              <div>
                <span className="font-semibold">グラデーション背景</span>
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
              
              {/* ヒツジ電気さん */}
              <div>
                <span className="font-semibold">ヒツジ電気さんVer背景</span>
                <p className="text-xs text-gray-600 pt-1 pb-1">
                  ※背景画像はヒツジ電気さんの公開バージョンとは異なりますが、似た背景を使用しています。
                  元のバージョンもぜひご覧ください → <a className="text-blue-600 underline" target="_blank" rel="noopener noreferrer" href="https://booth.pm/ja/items/4028321">Booth</a>
                </p>
                <div className="flex gap-2 mt-1">
                  {[
                    { id: 'bg1', src: '/backgrounds/bg_1.png' },
                    { id: 'bg2', src: '/backgrounds/bg_2.png' },
                    { id: 'bg3', src: '/backgrounds/bg_3.png' },
                    { id: 'bg4', src: '/backgrounds/bg_4.png' },
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

              {/* 背景画像アップロード */}
              <div>
                <span className="font-semibold">画像背景</span>
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
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-2 pb-2">
              <FontSelector fontFamily={fontFamily} setFontFamily={setFontFamily} />
            </div>
            
            <div className="flex flex-col gap-4 pt-2 pb-2">
              <h2 className="text-lg font-bold">吹き出し</h2>
              <BalloonToggle showBalloon={showBalloon} setShowBalloon={setShowBalloon} />
            </div>
          </AccordionSection>

          <AccordionSection title="プロフィール情報">
            <div className="flex flex-col gap-4 pt-2 pb-2">
              <h2 className="text-lg font-bold">プロフィール画像</h2>
              <input type="file" accept="image/*" onChange={handleProfileImageUpload} />
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <h2 className="text-lg font-bold">名前</h2>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="p-2 border rounded" />
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <h2 className="text-lg font-bold">性別（4文字まで）</h2>
              <input type="text" value={gender} onChange={(e) => setGender(e.target.value)} className="p-2 border rounded" />
            </div>
          </AccordionSection>

          <AccordionSection title="使用環境・言語">
            <div className="flex flex-col gap-4 mt-2">
              <h2 className="text-lg font-bold">使用環境</h2>
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
              <h2 className="text-lg font-bold">使用言語</h2>
              <label className="flex flex-col">
                <div className="flex flex-wrap gap-3 mt-1">
                  {['日本語', 'English', 'Korean'].map((lang) => (
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
                  placeholder="その他の言語（カンマ区切り）"
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
              <h2 className="text-lg font-bold">マイクON率</h2>
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

          <AccordionSection title="SNS・コンタクト情報">
            <div className="flex flex-col gap-4 pt-2">
              <h2 className="text-lg font-bold">SNS情報</h2>
              <label className="flex flex-col">
                <span className="font-semibold">VRChat ID</span>
                <input
                  type="text"
                  value={vrchatId}
                  onChange={(e) => setVrchatId(e.target.value)}
                  className="p-2 border rounded"
                />
              </label>
              <label className="flex flex-col">
                <span className="font-semibold">X（旧Twitter）</span>
                <input
                  type="text"
                  value={twitterId}
                  onChange={(e) => setTwitterId(e.target.value)}
                  placeholder="@yourhandle"
                  className="p-2 border rounded"
                />
              </label>
              <label className="flex flex-col">
                <span className="font-semibold">Discord</span>
                <input
                  type="text"
                  value={discordId}
                  onChange={(e) => setDiscordId(e.target.value)}
                  placeholder="YourName#1234"
                  className="p-2 border rounded"
                />
              </label>
            </div>
          </AccordionSection>
          
          <AccordionSection title="関わり方">
            <div className="flex flex-col gap-4 mt-2">
              <h2 className="text-lg font-bold">ステータスの説明</h2>
              {[
                { label: '青ステータス', value: statusBlue, setValue: setStatusBlue },
                { label: '緑ステータス', value: statusGreen, setValue: setStatusGreen },
                { label: '黄ステータス', value: statusYellow, setValue: setStatusYellow },
                { label: '赤ステータス', value: statusRed, setValue: setStatusRed },
              ].map(({ label, value, setValue }) => (
                <label key={label} className="flex flex-col">
                  <span className="font-semibold">{label}</span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="p-2 border rounded"
                  />
                </label>
              ))}
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <h2 className="text-lg font-bold">フレンド申請ポリシー</h2>
              {[
                'だれでもOK',
                '仲良くなってから許可',
                '気になったら許可',
                'Twitter相互は申請OK',
                '送らないでください',
              ].map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={option}
                    checked={friendPolicy.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFriendPolicy([...friendPolicy, option])
                      } else {
                        setFriendPolicy(friendPolicy.filter((v) => v !== option))
                      }
                    }}
                  />
                  {option}
                </label>
              ))}
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <h2 className="text-lg font-bold">OKなこと・NGなこと</h2>
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
                      value={item.label}
                      disabled={!item.isCustom}
                      placeholder="カスタム項目"
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
                        title="削除"
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
                    + カスタム項目を追加
                  </button>
                )}
            </div>
          </AccordionSection>

          <AccordionSection title="自己紹介・画像">
            <div className="flex flex-col gap-4 mt-2">
              <h2 className="text-lg font-bold">自己紹介テキスト</h2>
              <textarea
                value={selfIntro}
                onChange={(e) => setSelfIntro(e.target.value)}
                rows={5}
                className="p-2 border rounded"
              />
            </div>

            <div className="flex flex-col gap-4 mt-6 border-t pt-4 mb-6">
              <h2 className="text-lg font-bold">ギャラリー画像（３枚まで）</h2>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={galleryEnabled}
                  onChange={(e) => setGalleryEnabled(e.target.checked)}
                />
                ギャラリーを表示する（自己紹介エリアが小さくなります）
              </label>
              {galleryEnabled && (
                <div className="flex flex-col gap-2">
                  {[0, 1, 2].map((index) => (
                    <label key={index} className="flex flex-col">
                      <span className="font-semibold">ギャラリー画像 {index + 1}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null
                          const updated = [...galleryImages]
                          updated[index] = file
                          setGalleryImages(updated)
                        }}
                        className="p-1"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          </AccordionSection>

          <PostTimeline />
        </aside>
      </div>

      {/* <footer className="p-4 flex justify-between items-center border-t bg-white fixed bottom-0 left-0 w-full z-20">
        <div className="text-sm text-gray-500">ⓘ 広告スペース or サポートリンクなど</div>
      </footer> */}

      <FloatingButtons
        onSave={handleDownload}
        onShare={handlePostToX}
      />
    </main>
    <OnboardingBanner />
    </>
  )
}
