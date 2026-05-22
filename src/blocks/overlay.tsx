'use client'
import type { ComponentDef, ComponentCardProps } from './types'

export type OverlayInset = {
  top: number
  right: number
  bottom: number
  left: number
}

export type OverlayValue = {
  variant: 'none' | 'glass' | 'solid' | 'border-only'
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

// デフォルト（top/bottom: 24px、left/right: 40px、borderRadius 20、innerPadding 8）
const DEFAULT: OverlayValue = {
  variant: 'glass',
  opacity: 82,
  inset: { top: 24, right: 40, bottom: 24, left: 40 },
  borderRadius: 20,
  innerPadding: 8,
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
  } else if (variant === 'solid') {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    style.background = `rgba(${r},${g},${b},${alpha})`
  } else if (variant === 'border-only') {
    style.background = 'transparent'
    style.border = `2px solid ${ctx.theme.accent}`
  }

  return <div style={style} />
}

const VARIANTS = ['none', 'glass', 'solid', 'border-only'] as const
const VARIANT_LABELS: Record<string, string> = {
  none: 'なし',
  glass: 'ガラス',
  solid: '塗りつぶし',
  'border-only': 'ボーダーのみ',
}

export const overlayComponent: ComponentDef<OverlayValue> = {
  key: 'overlay',
  defaultValue: DEFAULT,
  variants: ['none', 'glass', 'solid', 'border-only'],
  CardItem: OverlayCard,
  FormItem({ value, onChange, t }) {
    const set = (patch: Partial<OverlayValue>) => onChange({ ...value, ...patch })
    const inset = value.inset ?? DEFAULT.inset!
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.overlaySettings}</h2>

        {/* バリアント選択 */}
        <div className="grid grid-cols-2 gap-2">
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
                <input
                  type="color"
                  value={value.color ?? '#ffffff'}
                  onChange={e => set({ color: e.target.value })}
                  className="w-10 h-8 rounded cursor-pointer border border-gray-200"
                />
              </div>
            )}

            {/* 不透明度 */}
            {value.variant !== 'border-only' && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">不透明度: {value.opacity ?? 82}%</span>
                <input
                  type="range" min={0} max={100}
                  value={value.opacity ?? 82}
                  onChange={e => set({ opacity: Number(e.target.value) })}
                  className="w-full accent-[#00AADB]"
                />
              </div>
            )}

            {/* 余白 */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-gray-500">余白（px）</span>
              <div className="grid grid-cols-2 gap-2">
                {(['top', 'right', 'bottom', 'left'] as const).map(side => (
                  <label key={side} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-8">{side === 'top' ? '上' : side === 'right' ? '右' : side === 'bottom' ? '下' : '左'}</span>
                    <input
                      type="number" min={0} max={200}
                      value={inset[side]}
                      onChange={e => set({ inset: { ...inset, [side]: Number(e.target.value) } })}
                      className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* 角丸 */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">角丸: {value.borderRadius ?? 20}px</span>
              <input
                type="range" min={0} max={60}
                value={value.borderRadius ?? 20}
                onChange={e => set({ borderRadius: Number(e.target.value) })}
                className="w-full accent-[#00AADB]"
              />
            </div>

            {/* 内側セーフエリア */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">内側セーフエリア: {value.innerPadding ?? 12}px</span>
              <input
                type="range" min={0} max={40}
                value={value.innerPadding ?? 12}
                onChange={e => set({ innerPadding: Number(e.target.value) })}
                className="w-full accent-[#00AADB]"
              />
            </div>
          </>
        )}
      </div>
    )
  },
}
