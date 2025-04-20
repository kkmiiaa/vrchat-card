'use client'

import { useEffect, useRef, useState } from 'react'
import { fabric } from 'fabric'
import { CanvasRenderer } from '@/components/CanvasRenderer'

export default function Home() {
  const canvasEl = useRef<HTMLCanvasElement | null>(null)
  const rendererRef = useRef<CanvasRenderer | null>(null)

  const [name, setName] = useState('')
  const [language, setLanguage] = useState('')
  const [playEnv, setPlayEnv] = useState<string[]>([])
  const [microphone, setMicrophone] = useState<string[]>([])
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [selfIntro, setSelfIntro] = useState('')

  const [vrchatId, setVrchatId] = useState('')
  const [twitterId, setTwitterId] = useState('')
  const [discordId, setDiscordId] = useState('')

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setProfileImage(file)
  }

  useEffect(() => {
    const canvasElement = canvasEl.current
    if (!canvasElement) return
  
    let currentCanvas: fabric.Canvas | null = null
  
    const resizeAndRender = () => {
      // dispose 前に renderer を無効化
      rendererRef.current = null
      currentCanvas?.dispose()
  
      const width = canvasElement.clientWidth
      const height = width * 9 / 16
      canvasElement.width = width
      canvasElement.height = height
  
      const canvas = new fabric.Canvas(canvasElement, { width, height })
      currentCanvas = canvas
  
      const renderer = new CanvasRenderer(canvas)
      rendererRef.current = renderer
  
      renderer.render({
        name,
        language,
        playEnv,
        microphone,
        profileImage,
        selfIntro,
        vrchatId,
        twitterId,
        discordId,
      })
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
    playEnv, microphone, 
    profileImage, 
    selfIntro,  
    vrchatId,
    twitterId,
    discordId,
  ])
  
  const handleDownload = () => {
    rendererRef.current?.download()
  }

  return (
    <main className="font-rounded w-screen h-screen flex flex-col bg-gray-50 text-gray-800">
      <header className="p-4 text-xl font-bold border-b">VRChat自己紹介カードメーカー</header>
      <div className="flex flex-1 overflow-hidden">
        <section className="flex-1 flex items-center justify-center p-4">
          <canvas
            ref={canvasEl}
            className="w-full max-w-[1920px] aspect-[16/9] border shadow-md"
          />
        </section>
        <aside className="w-[400px] min-w-[300px] max-w-[500px] overflow-y-auto p-4 border-l">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col">
              <span className="font-semibold">プロフィール画像</span>
              <input type="file" accept="image/*" onChange={handleProfileImageUpload} className="p-1" />
            </label>
            <label className="flex flex-col">
              <span className="font-semibold">名前</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="p-2 border rounded" />
            </label>
            <label className="flex flex-col">
              <span className="font-semibold">言語</span>
              <input type="text" value={language} onChange={(e) => setLanguage(e.target.value)} className="p-2 border rounded" />
            </label>
            <div className="flex flex-col">
              <span className="font-semibold">性別（プレイ環境）</span>
              <div className="flex gap-3 mt-1">
                {['PCVR', 'quest', 'Desktop'].map((opt) => (
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
            <div className="flex flex-col">
              <span className="font-semibold">マイク</span>
              <div className="flex gap-3 mt-1">
                {['ON', 'OFF'].map((opt) => (
                  <label key={opt} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      value={opt}
                      checked={microphone.includes(opt)}
                      onChange={(e) => {
                        if (e.target.checked) setMicrophone([...microphone, opt])
                        else setMicrophone(microphone.filter((v) => v !== opt))
                      }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col gap-4 border-t pt-4">
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

            <label className="flex flex-col">
              <span className="font-semibold">自己紹介</span>
              <textarea
                value={selfIntro}
                onChange={(e) => setSelfIntro(e.target.value)}
                rows={5}
                className="p-2 border rounded"
              />
            </label>
          </div>
        </aside>
      </div>
      <footer className="p-4 flex justify-between items-center border-t bg-white">
        <div className="flex gap-4">
          <button onClick={handleDownload} className="bg-green-600 text-white px-4 py-2 rounded">ダウンロード</button>
        </div>
        <div className="text-sm text-gray-500">ⓘ 広告スペース or サポートリンクなど</div>
      </footer>
    </main>
  )
}
