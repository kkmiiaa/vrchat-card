'use client'
import type { ComponentDef } from './types'

export type HeightRulerValue = {
  height: number
  avatarImage: string | null
  imageScale: number
  imageOffsetY: number
}

const DEFAULT_VALUE: HeightRulerValue = {
  height: 160,
  avatarImage: null,
  imageScale: 1,
  imageOffsetY: 0,
}

// 目盛りの最大値・ステップ
const RULER_MAX = 200
const RULER_STEP = 10

export const heightRulerComponent: ComponentDef<HeightRulerValue> = {
  key: 'height-ruler',
  defaultValue: DEFAULT_VALUE,
  variants: ['simple'],

  CardItem({ value, ctx }) {
    const v: HeightRulerValue = value && typeof value === 'object'
      ? { ...DEFAULT_VALUE, ...value }
      : DEFAULT_VALUE

    const rulerH = ctx.cardWidth * 0.55
    const lineX = ctx.cardWidth * 0.025   // 縦線のX位置
    const tickRight = ctx.cardWidth * 0.015  // 目盛りの右方向長さ
    const labelOffsetX = tickRight + ctx.cardWidth * 0.004  // ラベル開始X（線より右）
    const svgW = lineX + tickRight + ctx.cardWidth * 0.05   // SVG幅（ラベル含む）
    const rulerW = lineX  // 後方互換（アバター画像位置用）
    const totalW = ctx.cardWidth * 0.22
    const fs = ctx.fontSize.xs
    const accentColor = ctx.theme.accent

    // 身長の割合位置（0 = 下端, 1 = 上端）
    const heightRatio = Math.min(Math.max(v.height / RULER_MAX, 0), 1)
    const markerY = rulerH * (1 - heightRatio)

    const ticks = []
    for (let h = 0; h <= RULER_MAX; h += RULER_STEP) {
      const y = rulerH * (1 - h / RULER_MAX)
      const isMajor = h % 50 === 0
      ticks.push({ h, y, isMajor })
    }

    // アバター画像の実表示サイズ（imageScale は 0.5〜2.0）
    const imgH = rulerH * (v.imageScale ?? 1)
    const imgW = imgH * 0.55  // 縦長比率
    const imgOffsetY = (v.imageOffsetY ?? 0) * rulerH * 0.1

    return (
      <div style={{
        position: 'relative',
        width: totalW,
        height: rulerH,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'flex-start',
      }}>
        {/* アバター透過画像 */}
        {v.avatarImage && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: svgW + ctx.cardWidth * 0.01,
            width: imgW,
            height: imgH,
            transform: `translateY(${imgOffsetY}px)`,
          }}>
            <img
              src={v.avatarImage}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom center', display: 'block' }}
            />
          </div>
        )}

        {/* 目盛りSVG */}
        <svg
          width={svgW}
          height={rulerH}
          style={{ flexShrink: 0, overflow: 'hidden' }}
        >
          {/* メインライン */}
          <line x1={lineX} y1={0} x2={lineX} y2={rulerH} stroke={ctx.theme.subText} strokeWidth={1} />

          {/* 目盛り */}
          {ticks.map(({ h, y, isMajor }) => {
            const tickLen = isMajor ? tickRight : tickRight * 0.5
            return (
              <g key={h}>
                <line
                  x1={lineX} y1={y}
                  x2={lineX + tickLen} y2={y}
                  stroke={ctx.theme.subText} strokeWidth={isMajor ? 1 : 0.5}
                />
                {isMajor && (
                  <text
                    x={lineX + labelOffsetX}
                    y={y + fs * 0.35}
                    textAnchor="start"
                    fontSize={fs * 0.85}
                    fill={ctx.theme.subText}
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

    const handleFile = (file: File | null) => {
      if (!file) { onChange({ ...v, avatarImage: null }); return }
      const reader = new FileReader()
      reader.onload = e => onChange({ ...v, avatarImage: e.target?.result as string })
      reader.readAsDataURL(file)
    }

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 w-20 shrink-0">身長</label>
          <input
            type="number"
            min={50} max={250}
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
          <label
            htmlFor="height-ruler-image-upload"
            className="flex items-center gap-2 cursor-pointer"
          >
            {v.avatarImage
              ? <img src={v.avatarImage} alt="" className="h-20 w-auto object-contain rounded border border-gray-200 bg-gray-50" />
              : <div className="h-20 w-20 flex items-center justify-center rounded border-2 border-dashed border-gray-200 text-gray-400 text-xs bg-gray-50">画像を選択</div>
            }
          </label>
          {v.avatarImage && (
            <button
              type="button"
              onClick={() => onChange({ ...v, avatarImage: null })}
              className="text-xs text-red-400 hover:text-red-600 text-left"
            >
              画像を削除
            </button>
          )}
        </div>

        {v.avatarImage && (
          <>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 w-20 shrink-0">画像サイズ</label>
              <input
                type="range"
                min={0.3} max={2.0} step={0.05}
                value={v.imageScale}
                onChange={e => onChange({ ...v, imageScale: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="text-xs text-gray-400 w-10 text-right">{v.imageScale.toFixed(2)}×</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 w-20 shrink-0">上下位置</label>
              <input
                type="range"
                min={-5} max={5} step={0.1}
                value={v.imageOffsetY}
                onChange={e => onChange({ ...v, imageOffsetY: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="text-xs text-gray-400 w-10 text-right">{v.imageOffsetY > 0 ? `+${v.imageOffsetY.toFixed(1)}` : v.imageOffsetY.toFixed(1)}</span>
            </div>
          </>
        )}
      </div>
    )
  },
}
