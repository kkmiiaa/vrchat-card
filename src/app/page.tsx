'use client'

import { useEffect, useRef, useState } from 'react'
import { fabric } from 'fabric'

export default function Home() {
  const canvasRef = useRef<fabric.Canvas | null>(null)
  const canvasEl = useRef<HTMLCanvasElement>(null)
  const [name, setName] = useState('')

  useEffect(() => {
    if (!canvasEl.current) return

    const canvas = new fabric.Canvas(canvasEl.current, {
      width: 800,
      height: 450,
    })

    const bg = new fabric.Rect({
      left: 0,
      top: 0,
      width: 800,
      height: 450,
      fill: '#f3f4f6',
    })

    canvas.add(bg)
    canvasRef.current = canvas
  }, [])

  const handleRender = () => {
    const canvas = canvasRef.current
    if (!canvas) return
  
    canvas.clear()
  
    const gradient = new fabric.Gradient({
      type: 'linear',
      gradientUnits: 'pixels',
      coords: {x1: 0, y1: 0, x2: 800, y2: 450},
      colorStops: [
        { offset: 0, color: '#ec4899' }, // Tailwind pink-500
        { offset: 1, color: '#facc15' }, // Tailwind yellow-400
      ],
    })
  
    const bg = new fabric.Rect({
      left: 0,
      top: 0,
      width: 800,
      height: 450,
      fill: gradient,
    })
  
    const nameText = new fabric.Text(name || '名前未入力', {
      left: 100,
      top: 100,
      fontSize: 36,
      fill: '#1e293b',
    })
  
    canvas.add(bg)
    canvas.add(nameText)
  }
  

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
  
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
    })
  
    const link = document.createElement('a')
    link.href = dataURL
    link.download = 'vrchat_card.png'
    link.click()
  }

  return (
    <main className="font-rounded w-screen h-screen flex flex-col bg-gray-50 text-gray-800">
      <header className="p-4 text-xl font-bold border-b">
        VRChat自己紹介カードメーカー
      </header>

      {/* メインコンテンツ：横並び */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* 入力フォーム（左） */}
        <aside className="w-[400px] min-w-[300px] max-w-[500px] overflow-y-auto p-4 border-r">
          {/* フォーム内容：名前, SNS, ステータス etc. */}
        </aside>

        {/* カードCanvasプレビュー（右） */}
        <section className="flex-1 flex items-center justify-center p-4">
          <canvas
            ref={canvasEl}
            className="w-full max-w-[960px] aspect-[16/9] border shadow-md"
          />
        </section>
      </div>

      {/* 下部ボタンや広告スペース */}
      <footer className="p-4 flex justify-between items-center border-t bg-white">
        <div className="flex gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            カードに反映
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded">
            ダウンロード
          </button>
        </div>
        <div className="text-sm text-gray-500">
          vaa studio サポート中
        </div>
      </footer>
    </main>
  )
}
