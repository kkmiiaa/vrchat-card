'use client'

import { useState, useEffect, useRef } from 'react'
import type { TemplateDefinition, BlockValues } from '@/blocks/types'
import GenericCardRenderer from '@/components/GenericCardRenderer'

type Orientation = 'landscape' | 'portrait'

type Props = {
  definition: TemplateDefinition
  values: BlockValues
}

const ZOOM_STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 1.0]

export default function TemplatePreview({ definition, values }: Props) {
  const [orientation, setOrientation] = useState<Orientation>('landscape')
  const [zoom, setZoom] = useState<number | 'fit'>('fit')
  const containerRef = useRef<HTMLDivElement>(null)
  const [fitScale, setFitScale] = useState(0.5)

  const o = definition[orientation]

  // コンテナ幅に合わせた fit スケールを計算
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return
      const available = containerRef.current.clientWidth - 48
      setFitScale(Math.min(1, available / o.cardWidth))
    }
    update()
    const observer = new ResizeObserver(update)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [o.cardWidth, orientation])

  const scale = zoom === 'fit' ? fitScale : zoom
  const displayW = o.cardWidth  * scale
  const displayH = o.cardHeight * scale

  return (
    <div className="flex flex-col h-full">
      {/* ツールバー */}
      <div className="flex items-center gap-3 flex-wrap px-4 py-3 border-b bg-white flex-shrink-0">
        {/* orientation トグル */}
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {(['landscape', 'portrait'] as const).map(ori => (
            <button
              key={ori}
              onClick={() => setOrientation(ori)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                orientation === ori ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {ori === 'landscape' ? '横（900×506）' : '縦（900×1125）'}
            </button>
          ))}
        </div>

        {/* zoom コントロール */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setZoom('fit')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              zoom === 'fit' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Fit
          </button>
          {ZOOM_STEPS.map(z => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                zoom === z ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {Math.round(z * 100)}%
            </button>
          ))}
        </div>

        {/* グリッド情報 */}
        <span className="text-[11px] text-gray-400 font-mono ml-auto">
          {o.grid.cellSize}px/cell gap:{o.grid.gap}
          　{Math.round(scale * 100)}%
        </span>
      </div>

      {/* カードプレビューエリア */}
      <div
        ref={containerRef}
        className="flex-1 bg-gray-100 flex items-center justify-center overflow-auto p-6"
      >
        <div
          style={{
            width: displayW,
            height: displayH,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 8,
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            flexShrink: 0,
          }}
        >
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: o.cardWidth, height: o.cardHeight }}>
            <GenericCardRenderer
              definition={definition}
              orientation={orientation}
              values={values}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
