'use client'

import { useEffect, useRef, useState } from 'react'
import { fabric } from 'fabric'

export default function Home() {
  const canvasRef = useRef<fabric.Canvas | null>(null)
  const canvasEl = useRef<HTMLCanvasElement | null>(null)

  const [name, setName] = useState('')
  const [language, setLanguage] = useState('')
  const [playEnv, setPlayEnv] = useState<string[]>([])
  const [microphone, setMicrophone] = useState<string[]>([])
  const [profileImage, setProfileImage] = useState<File | null>(null)

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
    }
  }

  const [vrchatId, setVrchatId] = useState('')
  const [twitterId, setTwitterId] = useState('')
  const [discordId, setDiscordId] = useState('')
  const [statusBlue, setStatusBlue] = useState('')
  const [statusGreen, setStatusGreen] = useState('')
  const [statusYellow, setStatusYellow] = useState('')
  const [statusRed, setStatusRed] = useState('')
  const [friendPolicy, setFriendPolicy] = useState<string[]>([])
  const [okayThings, setOkayThings] = useState('')
  const [notOkayThings, setNotOkayThings] = useState('')
  const [selfIntro, setSelfIntro] = useState('')

  useEffect(() => {
    if (!canvasEl.current) return

    const actualCanvasWidth = canvasEl.current.clientWidth
    const actualCanvasHeight = actualCanvasWidth * 9 / 16

    const canvas = new fabric.Canvas(canvasEl.current, {
      width: actualCanvasWidth,
      height: actualCanvasHeight,
    })

    canvas.selection = false
    canvas.skipTargetFind = true

    canvasRef.current = canvas
    canvas.setBackgroundColor('#fff', canvas.renderAll.bind(canvas))

    const handleResize = () => {
      const width = canvasEl.current!.clientWidth
      const height = width * 9 / 16
      canvas.setDimensions({ width, height })
      canvas.renderAll()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      canvas.dispose()
    }
  }, [])

  const handleRender = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.clear()

    const width = canvas.getWidth()
    const height = canvas.getHeight()
    const outerPadding = 20
    const stroke = 6
    const innerPadding = 40

    // グラデ背景
    const bg = new fabric.Rect({
      left: 0,
      top: 0,
      width,
      height,
      fill: new fabric.Gradient({
        type: 'linear',
        gradientUnits: 'pixels',
        coords: { x1: 0, y1: 0, x2: width, y2: 0 },
        colorStops: [
          { offset: 0, color: '#60a5fa' },
          { offset: 1, color: '#a78bfa' },
        ],
      }),
      selectable: false,
      evented: false,
    })
    canvas.add(bg)

    // 吹き出し
    const balloonPath = new fabric.Path(`
      M ${outerPadding + 30} ${outerPadding}
      H ${width - outerPadding - 30}
      A 30 30 0 0 1 ${width - outerPadding} ${outerPadding + 30}
      V ${height - outerPadding - 50}
      A 30 30 0 0 1 ${width - outerPadding - 30} ${height - outerPadding - 20}
      H ${(width / 2) + 30}
      L ${width / 2} ${height - outerPadding}
      L ${(width / 2) - 30} ${height - outerPadding - 20}
      H ${outerPadding + 30}
      A 30 30 0 0 1 ${outerPadding} ${height - outerPadding - 50}
      V ${outerPadding + 30}
      A 30 30 0 0 1 ${outerPadding + 30} ${outerPadding}
      Z
    `)
    balloonPath.set({
      fill: 'rgba(255,255,255,0.85)',
      stroke: '#000',
      strokeWidth: stroke,
      selectable: false,
      evented: false,
      originX: 'left',
      originY: 'top',
    })
    canvas.add(balloonPath)
    canvas.remove(balloonPath)

    const pathWidth = balloonPath.getScaledWidth()
    const pathHeight = balloonPath.getScaledHeight()
    const balloonLeft = (width - pathWidth) / 2
    const balloonTop = (height - pathHeight) / 2
    balloonPath.set({ left: balloonLeft, top: balloonTop })
    canvas.add(balloonPath)

    const imageSrc = profileImage
      ? URL.createObjectURL(profileImage)
      : '/default-profile.png'

    fabric.Image.fromURL(imageSrc, (img) => {
      const innerWidth = pathWidth - innerPadding * 2
      const imageSize = innerWidth / 4

      const imgLeft = balloonLeft + innerPadding
      const imgTop = balloonTop + innerPadding

      // スケーリング（正方形の中に収める）
      img.scaleToWidth(imageSize)
      img.scaleToHeight(imageSize)

      // 画像の角丸切り抜き
      const clip = new fabric.Rect({
        width: imageSize,
        height: imageSize,
        rx: imageSize * 0.15,
        ry: imageSize * 0.15,
        originX: 'left',
        originY: 'top',
      })

      img.set({
        left: imgLeft,
        top: imgTop,
        clipPath: clip,
        selectable: false,
        evented: false,
      })

      canvas.add(img)
      
      canvas.add(new fabric.Rect({
        left: imgLeft,
        top: imgTop,
        width: imageSize,
        height: imageSize,
        fill: 'rgba(0,0,0,0.1)',
        stroke: 'red',
        selectable: false,
        evented: false,
      }))
      handleTextRender(canvas, balloonLeft, balloonTop, pathWidth, pathHeight)
    }, { crossOrigin: 'anonymous' })
  }

  const handleTextRender = (
    canvas: fabric.Canvas,
    balloonLeft: number,
    balloonTop: number,
    pathWidth: number,
    pathHeight: number
  ) => {
    const width = canvas.getWidth()
    const height = canvas.getHeight()
    const innerPadding = 40
    const textStyle = {
      fontFamily: '"Rounded Mplus 1c"',
      fontSize: width * 0.022,
      fill: '#1f2937',
      selectable: false,
      evented: false,
      left: balloonLeft + innerPadding + 120,
    }
    let top = balloonTop + innerPadding
    const gap = height * 0.055

    const addLine = (label: string, value: string) => {
      const text = new fabric.Text(`${label}：${value || '（未入力）'}`, {
        ...textStyle,
        top,
      })
      canvas.add(text)
      top += gap
    }

    addLine('名前', name)
    addLine('言語', language)
    addLine('プレイ環境', playEnv.join(', '))
    addLine('マイク', microphone.join(', '))
    addLine('VRChat ID', vrchatId)
    addLine('Twitter', twitterId)
    addLine('Discord', discordId)
    addLine('ステータス（青）', statusBlue)
    addLine('ステータス（緑）', statusGreen)
    addLine('ステータス（黄）', statusYellow)
    addLine('ステータス（赤）', statusRed)
    addLine('フレンド申請', friendPolicy.join(' / '))
    addLine('大丈夫なこと', okayThings)
    addLine('嫌なこと', notOkayThings)

    const intro = new fabric.Textbox(selfIntro || '（自己紹介なし）', {
      ...textStyle,
      top: balloonTop + pathHeight - innerPadding - 120,
      width: pathWidth - innerPadding * 2,
      fontSize: width * 0.018,
    })
    canvas.add(intro)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const scale = 1920 / canvas.getWidth()
    const dataURL = canvas.toDataURL({ format: 'png', multiplier: scale })
    const link = document.createElement('a')
    link.href = dataURL
    link.download = 'vrchat_card.png'
    link.click()
  }

  return (
    <main className="font-rounded w-screen h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* ヘッダー */}
      <header className="p-4 text-xl font-bold border-b">
        VRChat 自己紹介カード作成ツール
      </header>

      {/* メイン：横並び（左：カード、右：フォーム） */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* カードCanvas（左） */}
        <section className="flex-1 flex items-center justify-center p-4">
        <canvas
          ref={canvasEl}
          className="w-full max-w-[1920px] aspect-[16/9] border shadow-md"
        />
        </section>

        {/* 入力フォーム（右） */}
        <aside className="w-[400px] min-w-[300px] max-w-[500px] overflow-y-auto p-4 border-l">
        <div className="flex flex-col gap-4">

          {/* プロフィール画像 */}
          <label className="flex flex-col">
            <span className="font-semibold">プロフィール画像</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageUpload}
              className="p-1"
            />
          </label>

          {/* 名前 */}
          <label className="flex flex-col">
            <span className="font-semibold">名前 <span className="text-red-500">*</span></span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-2 border rounded"
            />
          </label>

          {/* 性別（プレイ環境） */}
          <div className="flex flex-col">
            <span className="font-semibold">性別（プレイ環境）</span>
            <div className="flex flex-wrap gap-3 mt-1">
              {['PCVR', 'quest', 'Desktop'].map((option) => (
                <label key={option} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    value={option}
                    checked={playEnv.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPlayEnv([...playEnv, option])
                      } else {
                        setPlayEnv(playEnv.filter((env) => env !== option))
                      }
                    }}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* 言語 */}
          <label className="flex flex-col">
            <span className="font-semibold">使用言語</span>
            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="日本語, English"
              className="p-2 border rounded"
            />
          </label>

          {/* マイク */}
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
                      if (e.target.checked) {
                        setMicrophone([...microphone, opt])
                      } else {
                        setMicrophone(microphone.filter((v) => v !== opt))
                      }
                    }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          
          {/* SNS情報 */}
          <div className="flex flex-col gap-4 mt-6 border-t pt-4">

            <h2 className="text-lg font-bold">SNS情報</h2>

            {/* VRChat ID */}
            <label className="flex flex-col">
              <span className="font-semibold">VRChat ID</span>
              <input
                type="text"
                value={vrchatId}
                onChange={(e) => setVrchatId(e.target.value)}
                className="p-2 border rounded"
              />
            </label>

            {/* Twitter */}
            <label className="flex flex-col">
              <span className="font-semibold">Twitter</span>
              <input
                type="text"
                value={twitterId}
                onChange={(e) => setTwitterId(e.target.value)}
                placeholder="@username"
                className="p-2 border rounded"
              />
            </label>

            {/* Discord */}
            <label className="flex flex-col">
              <span className="font-semibold">Discord</span>
              <input
                type="text"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                placeholder="User#1234"
                className="p-2 border rounded"
              />
            </label>

          </div>

          {/* ステータス */}
          <div className="flex flex-col gap-4 mt-6 border-t pt-4">

            <h2 className="text-lg font-bold">ステータス</h2>

            {[
              { label: 'ステータス（青）', value: statusBlue, setValue: setStatusBlue },
              { label: 'ステータス（緑）', value: statusGreen, setValue: setStatusGreen },
              { label: 'ステータス（黄）', value: statusYellow, setValue: setStatusYellow },
              { label: 'ステータス（赤）', value: statusRed, setValue: setStatusRed },
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
          
          {/* フレンド申請 */}
          <div className="flex flex-col gap-4 mt-6 border-t pt-4">

            <h2 className="text-lg font-bold">フレンド申請ポリシー</h2>

            <div className="flex flex-col gap-2">
              {[
                '誰でもOK',
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

            

          </div>
            
          <div className="flex flex-col gap-4 mt-6 border-t pt-4">
            <h2 className="text-lg font-bold">大丈夫なこと・嫌なこと</h2>

            {/* 大丈夫なこと */}
            <label className="flex flex-col">
              <span className="font-semibold">大丈夫なこと</span>
              <textarea
                value={okayThings}
                onChange={(e) => setOkayThings(e.target.value)}
                placeholder="例：近づく、ハイタッチ、頭なでる など"
                rows={3}
                className="p-2 border rounded"
              />
            </label>

            {/* 嫌なこと */}
            <label className="flex flex-col">
              <span className="font-semibold">嫌なこと</span>
              <textarea
                value={notOkayThings}
                onChange={(e) => setNotOkayThings(e.target.value)}
                placeholder="例：武器を向ける、暴言、知らない人に触られる など"
                rows={3}
                className="p-2 border rounded"
              />
            </label>

          </div>

          <div className="flex flex-col gap-4 mt-6 border-t pt-4">

            <h2 className="text-lg font-bold">自己紹介</h2>

            {/* 自己紹介文 */}
            <label className="flex flex-col">
              <span className="font-semibold">自己紹介 <span className="text-red-500">*</span></span>
              <textarea
                value={selfIntro}
                onChange={(e) => setSelfIntro(e.target.value)}
                placeholder="例：VRChat歴2年、踊るのが好きです！お気軽に話しかけてください 😊"
                rows={5}
                className="p-2 border rounded"
              />
            </label>

          </div>

        </div>
        </aside>
      </div>

      {/* フッター：操作ボタン＆広告枠 */}
      <footer className="p-4 flex justify-between items-center border-t bg-white">
        <div className="flex gap-4">
          <button 
            onClick={handleRender}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            カードに反映
          </button>
          <button 
            onClick={handleDownload}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            ダウンロード
          </button>
        </div>
        <div className="text-sm text-gray-500">
          ⓘ 広告スペース or サポートリンクなど
        </div>
      </footer>
    </main>
  )
}
