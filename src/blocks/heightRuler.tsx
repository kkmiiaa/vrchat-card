'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { ColorPicker } from './colorPicker'
import { useImageUpload } from '@/lib/ImageUploadContext'

export type HeightRulerValue = {
  height: number
  avatarImage: string | null      // 後方互換（base64 プレビュー用）
  avatarImageUrl?: string | null  // Storage URL（新形式、あれば優先）
  imageScale: number
  imageOffsetY: number
}

const DEFAULT_VALUE: HeightRulerValue = {
  height: 160,
  avatarImage: null,
  imageScale: 1,
  imageOffsetY: 0,
}

const RULER_STEP = 10

export const heightRulerComponent: ComponentDef<HeightRulerValue> = {
  key: 'height-ruler',
  defaultValue: DEFAULT_VALUE,
  variants: ['simple'],

  CardItem({ value, ctx, blockConfig }) {
    const v: HeightRulerValue = value && typeof value === 'object'
      ? { ...DEFAULT_VALUE, ...value }
      : DEFAULT_VALUE

    const rulerMax: number = typeof blockConfig?.maxHeight === 'number' && blockConfig.maxHeight > 0 ? blockConfig.maxHeight : 200
    const lineColor: string = typeof blockConfig?.lineColor === 'string' ? blockConfig.lineColor : ctx.theme.subText

    // 上下に fs 分のパディングを確保
    const fs = (ctx.fontSize?.xs > 0 ? ctx.fontSize.xs : ctx.cardWidth * 0.009)
    const padY = fs * 1.2
    const rulerH = ctx.cardWidth * 0.55
    const svgH = rulerH + padY * 2  // パディング込みのSVG高さ

    const lineX = ctx.cardWidth * 0.025
    const tickRight = ctx.cardWidth * 0.015
    const labelOffsetX = tickRight + ctx.cardWidth * 0.004
    const svgW = lineX + tickRight + ctx.cardWidth * 0.075
    const totalW = ctx.cardWidth * 0.22
    const accentColor = ctx.theme.accent

    // y座標変換: h=0 → svgH-padY, h=rulerMax → padY
    const toY = (h: number) => padY + rulerH * (1 - h / rulerMax)

    const heightRatio = Math.min(Math.max(v.height / rulerMax, 0), 1)
    const markerY = padY + rulerH * (1 - heightRatio)

    const ticks: { h: number; y: number; isMajor: boolean }[] = []
    for (let h = 0; h <= rulerMax; h += RULER_STEP) {
      ticks.push({ h, y: toY(h), isMajor: h % 50 === 0 })
    }

    const imgH = rulerH * (v.imageScale ?? 1)
    const imgW = imgH * 0.55
    const imgOffsetY = (v.imageOffsetY ?? 0) * rulerH * 0.1

    return (
      <div style={{
        position: 'relative',
        width: totalW,
        height: svgH,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'flex-start',
      }}>
        {/* アバター透過画像（Storage URL 優先、なければ base64 プレビュー） */}
        {(v.avatarImageUrl ?? v.avatarImage) && (
          <div style={{
            position: 'absolute',
            bottom: padY,
            left: svgW + ctx.cardWidth * 0.01,
            width: imgW,
            height: imgH,
            transform: `translateY(${imgOffsetY}px)`,
          }}>
            <img
              src={v.avatarImageUrl ?? v.avatarImage ?? undefined}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom center', display: 'block' }}
            />
          </div>
        )}

        {/* 目盛りSVG */}
        <svg width={svgW} height={svgH} style={{ flexShrink: 0, overflow: 'hidden' }}>
          {/* メインライン */}
          <line x1={lineX} y1={padY} x2={lineX} y2={padY + rulerH} stroke={lineColor} strokeWidth={1} />

          {/* 目盛り */}
          {ticks.map(({ h, y, isMajor }) => {
            const tickLen = isMajor ? tickRight : tickRight * 0.5
            return (
              <g key={h}>
                <line
                  x1={lineX} y1={y}
                  x2={lineX + tickLen} y2={y}
                  stroke={lineColor} strokeWidth={isMajor ? 1 : 0.5}
                />
                {isMajor && (
                  <text
                    x={lineX + labelOffsetX}
                    y={y + fs * 0.35}
                    textAnchor="start"
                    fontSize={fs * 0.85}
                    fill={lineColor}
                    fontFamily={ctx.fontFamily}
                  >
                    {h}
                  </text>
                )}
              </g>
            )
          })}

          {/* 身長マーカー */}
          <g>
            <line
              x1={lineX} y1={markerY}
              x2={svgW} y2={markerY}
              stroke={accentColor} strokeWidth={1.5} strokeDasharray="3 2"
            />
            <rect
              x={lineX + labelOffsetX}
              y={markerY - fs * 1.1}
              width={fs * 4.0}
              height={fs * 1.5}
              rx={fs * 0.3}
              fill={accentColor}
            />
            <text
              x={lineX + labelOffsetX + fs * 2.0}
              y={markerY - fs * 0.2}
              textAnchor="middle"
              fontSize={fs * 0.85}
              fill="#fff"
              fontFamily={ctx.fontFamily}
              fontWeight="bold"
            >
              {v.height} cm
            </text>
          </g>
        </svg>
      </div>
    )
  },

  FormItem({ value, onChange }) {
    const v: HeightRulerValue = value && typeof value === 'object'
      ? { ...DEFAULT_VALUE, ...value }
      : { ...DEFAULT_VALUE }

    const uploadCtx = useImageUpload()

    const handleFile = async (file: File | null) => {
      if (!file) {
        onChange({ ...v, avatarImage: null, avatarImageUrl: null })
        return
      }
      // base64 でプレビューを即時表示
      const reader = new FileReader()
      reader.onload = e => onChange({ ...v, avatarImage: e.target?.result as string, avatarImageUrl: null })
      reader.readAsDataURL(file)
      // Context があれば Storage にアップロードして URL で置換
      if (uploadCtx) {
        const url = await uploadCtx.upload('avatar', file).catch(() => null)
        if (url) onChange({ ...v, avatarImageUrl: url, avatarImage: null })
      }
    }

    const hasImage = !!(v.avatarImageUrl ?? v.avatarImage)
    const previewSrc = v.avatarImageUrl ?? v.avatarImage ?? undefined

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 w-20 shrink-0">身長</label>
          <input
            type="number"
            min={50} max={300}
            value={v.height}
            onChange={e => onChange({ ...v, height: Number(e.target.value) })}
            className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          <span className="text-sm text-gray-400">cm</span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">アバター画像（透過PNG推奨）</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => handleFile(e.target.files?.[0] ?? null)}
            className="hidden"
            id="height-ruler-image-upload"
          />
          <label htmlFor="height-ruler-image-upload" className="flex items-center gap-2 cursor-pointer">
            {hasImage
              ? <img src={previewSrc} alt="" className="h-20 w-auto object-contain rounded border border-gray-200 bg-gray-50" />
              : <div className="h-20 w-20 flex items-center justify-center rounded border-2 border-dashed border-gray-200 text-gray-400 text-xs bg-gray-50">画像を選択</div>
            }
          </label>
          {hasImage && (
            <button type="button" onClick={() => onChange({ ...v, avatarImage: null, avatarImageUrl: null })}
              className="text-xs text-red-400 hover:text-red-600 text-left">
              画像を削除
            </button>
          )}
        </div>

        {hasImage && (
          <>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 w-20 shrink-0">画像サイズ</label>
              <input type="range" min={0.3} max={2.0} step={0.05} value={v.imageScale}
                onChange={e => onChange({ ...v, imageScale: Number(e.target.value) })}
                className="flex-1" />
              <span className="text-xs text-gray-400 w-10 text-right">{v.imageScale.toFixed(2)}×</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 w-20 shrink-0">上下位置</label>
              <input type="range" min={-5} max={5} step={0.1} value={v.imageOffsetY}
                onChange={e => onChange({ ...v, imageOffsetY: Number(e.target.value) })}
                className="flex-1" />
              <span className="text-xs text-gray-400 w-10 text-right">
                {v.imageOffsetY > 0 ? `+${v.imageOffsetY.toFixed(1)}` : v.imageOffsetY.toFixed(1)}
              </span>
            </div>
          </>
        )}
      </div>
    )
  },

  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const maxHeight = typeof blockConfig.maxHeight === 'number' ? blockConfig.maxHeight : 200
    const lineColor = typeof blockConfig.lineColor === 'string' ? blockConfig.lineColor : ''

    return (
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-28 shrink-0">最大身長 (cm)</span>
          <input
            type="number" min={100} max={300} value={maxHeight}
            onChange={e => onChange({ ...blockConfig, maxHeight: Number(e.target.value) })}
            className="w-20 text-xs border border-gray-200 rounded px-2 py-1 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-28 shrink-0">線の色</span>
          <ColorPicker
            value={lineColor || '#9ca3af'}
            onChange={v => onChange({ ...blockConfig, lineColor: v })}
          />
          {lineColor && (
            <button type="button" onClick={() => onChange({ ...blockConfig, lineColor: undefined })}
              className="text-[10px] text-gray-400 hover:text-red-400">
              リセット
            </button>
          )}
        </div>
      </div>
    )
  },
}
