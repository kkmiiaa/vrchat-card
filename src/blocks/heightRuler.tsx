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
    const accentColor = ctx.theme.accent

    // ── viewBox 座標系（高さに依存しない固定単位） ──
    const VB_PAD  = 6    // 上下パディング
    const VB_RULER = 200 // ルーラー本体（cm と同じスケール）
    const VB_H    = VB_RULER + VB_PAD * 2  // 212
    const VB_W    = 70   // SVG 幅（VB 単位）

    const LINE_X  = 16   // 縦線の X
    const TICK_MAJ = 7   // 主目盛り右長さ
    const TICK_MIN = 3.5 // 補助目盛り右長さ
    const LABEL_X = LINE_X + TICK_MAJ + 2
    const FS      = 6.5  // フォントサイズ（VB 単位）

    // h → VB y 座標（上端=rulerMax, 下端=0）
    const toY = (h: number) => VB_PAD + (rulerMax - h) / rulerMax * VB_RULER
    const markerY = toY(Math.min(Math.max(v.height, 0), rulerMax))

    const ticks: { h: number; y: number; isMajor: boolean }[] = []
    for (let h = 0; h <= rulerMax; h += RULER_STEP) {
      ticks.push({ h, y: toY(h), isMajor: h % 50 === 0 })
    }

    // アバター画像（<image>要素でSVG内に配置）
    const imgSrc = v.avatarImageUrl ?? v.avatarImage ?? null
    const imgScale = v.imageScale ?? 1
    const imgH_vb = VB_RULER * imgScale
    const imgW_vb = (VB_W - LINE_X - 2) * imgScale
    const imgOffsetY_vb = -(v.imageOffsetY ?? 0) * 8  // VB 単位での上下オフセット
    const imgY_vb = toY(0) - imgH_vb + imgOffsetY_vb  // 下端を 0cm に揃える

    return (
      <div style={{
        width: '100%',
        height: '100%',
        minHeight: ctx.cardWidth * 0.3,
        flexShrink: 0,
      }}>
        {/* viewBox ベース SVG: height:100% で親コンテナを満たす */}
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMinYMin meet"
          width="100%"
          height="100%"
          style={{ display: 'block', overflow: 'visible' }}
        >
          {/* 縦線 */}
          <line x1={LINE_X} y1={VB_PAD} x2={LINE_X} y2={VB_PAD + VB_RULER} stroke={lineColor} strokeWidth={0.6} />

          {/* 目盛り */}
          {ticks.map(({ h, y, isMajor }) => (
            <g key={h}>
              <line
                x1={LINE_X} y1={y}
                x2={LINE_X + (isMajor ? TICK_MAJ : TICK_MIN)} y2={y}
                stroke={lineColor} strokeWidth={isMajor ? 0.6 : 0.4}
              />
              {isMajor && (
                <text
                  x={LABEL_X}
                  y={y + FS * 0.35}
                  textAnchor="start"
                  fontSize={FS}
                  fill={lineColor}
                  fontFamily={ctx.fontFamily}
                >
                  {h}
                </text>
              )}
            </g>
          ))}

          {/* アバター透過画像（目盛りの手前・マーカーの奥） */}
          {imgSrc && (
            <image
              href={imgSrc}
              x={LINE_X + 2}
              y={imgY_vb}
              width={imgW_vb}
              height={imgH_vb}
              preserveAspectRatio="xMidYMax meet"
            />
          )}

          {/* 身長マーカー（最前面） */}
          <g>
            <line
              x1={LINE_X} y1={markerY}
              x2={VB_W - 2} y2={markerY}
              stroke={accentColor} strokeWidth={1} strokeDasharray="2 1.5"
            />
            <rect
              x={LABEL_X}
              y={markerY - FS * 1.1}
              width={FS * 4.0}
              height={FS * 1.5}
              rx={FS * 0.35}
              fill={accentColor}
            />
            <text
              x={LABEL_X + FS * 2.0}
              y={markerY - FS * 0.15}
              textAnchor="middle"
              fontSize={FS * 0.9}
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
