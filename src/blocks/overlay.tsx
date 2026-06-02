'use client'
import type { ComponentDef, ComponentCardProps } from './types'
import { ColorPicker } from './colorPicker'

export type OverlayInset = {
  top: number
  right: number
  bottom: number
  left: number
}

export type OverlayValue = {
  variant: 'none' | 'glass' | 'solid' | 'flat' | 'border-only'
  color?: string      // solid 用
  opacity?: number    // 0-100
  inset?: OverlayInset
  borderRadius?: number
  /** パネル内側のセーフエリア（px）。グリッドはここから始まる */
  innerPadding?: number
  /** backdrop-filter blur（px）。glass バリアント用 */
  blur?: number
  /** ボーダー色。省略時はバリアントデフォルト */
  borderColor?: string
}

// デフォルト（top/bottom: 24px、left/right: 40px、borderRadius 16、innerPadding 20）
const DEFAULT: OverlayValue = {
  variant: 'glass',
  opacity: 82,
  inset: { top: 24, right: 40, bottom: 24, left: 40 },
  borderRadius: 16,
  innerPadding: 20,
}

export const OVERLAY_DEFAULT_V2: OverlayValue = DEFAULT

function OverlayCard({ value, ctx }: ComponentCardProps<OverlayValue>) {
  const { variant, color = '#ffffff', opacity = 82, inset, borderRadius = 20, blur, borderColor } = value

  if (variant === 'none') return null

  const alpha = (opacity / 100).toFixed(2)

  const style: React.CSSProperties = {
    position: 'absolute',
    top:    inset?.top    ?? 0,
    right:  inset?.right  ?? 0,
    bottom: inset?.bottom ?? 0,
    left:   inset?.left   ?? 0,
    borderRadius,
  }

  if (blur) {
    style.backdropFilter = `blur(${blur}px)`
    style.WebkitBackdropFilter = `blur(${blur}px)`
  }

  if (variant === 'glass') {
    style.background = `rgba(255,255,255,${alpha})`
    style.border = borderColor ? `1px solid ${borderColor}` : '2px solid rgba(200,220,240,0.7)'
    style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
  } else if (variant === 'flat') {
    style.background = `rgba(255,255,255,${alpha})`
    style.border = borderColor ? `1px solid ${borderColor}` : '1px solid rgba(0,0,0,0.28)'
  } else if (variant === 'solid') {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    style.background = `rgba(${r},${g},${b},${alpha})`
  }

  return <div style={style} />
}

const VARIANTS = ['glass', 'flat', 'solid'] as const
const VARIANT_LABELS: Record<string, string> = {
  glass: 'ガラス',
  flat:  'フラット',
  solid: '塗りつぶし',
}

export const overlayComponent: ComponentDef<OverlayValue> = {
  key: 'overlay',
  defaultValue: DEFAULT,
  variants: ['glass', 'flat', 'solid'],
  CardItem: OverlayCard,
  FormItem({ value, onChange, t }) {
    const set = (patch: Partial<OverlayValue>) => onChange({ ...value, ...patch })
    const inset = value.inset ?? DEFAULT.inset!
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-gray-500">{t.overlaySettings}</h2>

        {/* バリアント選択 */}
        <div className="grid grid-cols-3 gap-2">
          {VARIANTS.map(v => (
            <button
              key={v}
              type="button"
              onClick={() => set({ variant: v })}
              className={`px-3 py-2 rounded-lg text-sm border font-medium transition-all ${
                value.variant === v
                  ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {VARIANT_LABELS[v]}
            </button>
          ))}
        </div>

        {value.variant !== 'none' && (
          <>
            {/* solid: 色選択 */}
            {value.variant === 'solid' && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">色</span>
                <ColorPicker value={value.color ?? ''} onChange={v => set({ color: v || undefined })} defaultColor="#ffffff" />
              </div>
            )}

            {/* flat: ボーダー色 */}
            {value.variant === 'flat' && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">ボーダー色</span>
                <ColorPicker value={value.borderColor ?? ''} onChange={v => set({ borderColor: v || undefined })} defaultColor="#000000" />
              </div>
            )}

            {/* 不透明度 */}
            {value.variant !== 'border-only' && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">不透明度: {value.opacity ?? 82}%</span>
                <input
                  type="range" min={30} max={100}
                  value={Math.max(30, value.opacity ?? 82)}
                  onChange={e => set({ opacity: Number(e.target.value) })}
                  className="w-full accent-[#00AADB]"
                />
              </div>
            )}

          </>
        )}
      </div>
    )
  },
}
