'use client'
import { useEffect, useState } from 'react'
import type { ComponentDef, BlockConfigFormProps } from './types'

export type QrCodeValue = {
  customUrl?: string
}

type UrlType = 'card' | 'user' | 'custom'

const URL_TYPE_LABELS: { value: UrlType; label: string; desc: string }[] = [
  { value: 'card',   label: 'カードページ', desc: 'このカードの個別ページ' },
  { value: 'user',   label: 'ユーザーページ', desc: 'プロフィールページ' },
  { value: 'custom', label: 'カスタム URL',   desc: '任意の URL' },
]

const DEMO_URL = 'https://vaacard.com'

// ─── 丸ドット QR SVG ────────────────────────────────────────────────────────

type QrMatrix = boolean[][]

async function buildMatrix(url: string): Promise<QrMatrix> {
  const QRCode = (await import('qrcode')).default
  const data = await QRCode.create(url, { errorCorrectionLevel: 'M' })
  const n = data.modules.size
  const mat: QrMatrix = Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (__, c) => !!data.modules.get(r, c))
  )
  return mat
}

/** QR を描画する SVG コンポーネント */
function RoundedQR({ url, size, color }: { url: string; size: number; color: string }) {
  const [matrix, setMatrix] = useState<QrMatrix | null>(null)

  useEffect(() => {
    let cancelled = false
    buildMatrix(url).then(m => { if (!cancelled) setMatrix(m) })
    return () => { cancelled = true }
  }, [url])

  if (!matrix) return <div style={{ width: size, height: size }} />

  const n = matrix.length
  const cell = size / n

  const rects = matrix.flatMap((row, r) =>
    row.map((on, c) => on
      ? `M${c * cell},${r * cell} h${cell} v${cell} h-${cell} z`
      : ''
    ).filter(Boolean)
  )

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <path d={rects.join(' ')} fill={color} />
    </svg>
  )
}

// ─── コンポーネント ──────────────────────────────────────────────────────────

export const qrCodeComponent: ComponentDef<QrCodeValue> = {
  key: 'qr-code',
  defaultValue: {},
  variants: ['default', 'glass'],
  supportsBgVariant: false,
  isEmpty: () => true,
  CardItem({ value, ctx, variant = 'default', blockConfig, label }) {
    const urlType: UrlType = (blockConfig?.urlType as UrlType | undefined) ?? 'card'
    const resolvedUrl =
      urlType === 'card'   ? (ctx.cardUrl ?? DEMO_URL) :
      urlType === 'user'   ? (ctx.userUrl ?? DEMO_URL) :
      (value?.customUrl ?? DEMO_URL)

    const sizeScale = typeof blockConfig?.size === 'number' ? blockConfig.size : 0.055
    const size = ctx.cardWidth * sizeScale
    const pad = ctx.cardWidth * 0.01
    const radius = ctx.cardWidth * 0.018
    const isGlass = variant === 'glass'

    const dotColor = isGlass ? 'rgba(30,30,50,0.75)' : '#1e1e32'

    const containerStyle: React.CSSProperties = isGlass ? {
      background: 'rgba(255,255,255,0.45)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.75)',
      borderRadius: radius,
      boxShadow: '0 0 12px rgba(0,0,0,0.08)',
      padding: pad,
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: ctx.cardWidth * 0.004,
    } : {
      background: '#ffffff',
      border: `${ctx.cardWidth * 0.004}px solid #1e1e32`,
      borderRadius: radius,
      boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
      padding: pad,
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: ctx.cardWidth * 0.004,
    }

    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: ctx.cardWidth * 0.003,
      }}>
        {label && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: ctx.cardWidth * 0.003, flexShrink: 0 }}>
            <span style={{ fontSize: ctx.fontSize.sm * (label.fontScale ?? 1), fontWeight: 700, color: label.color ?? ctx.theme.text, fontFamily: ctx.fontFamily }}>{label.text}</span>
            {label.subText && <span style={{ fontSize: ctx.fontSize.xs * (label.fontScale ?? 1), color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>{label.subText}</span>}
          </div>
        )}
        <div style={containerStyle}>
          <RoundedQR url={resolvedUrl} size={size} color={dotColor} />
        </div>
      </div>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    const urlType: UrlType = (blockConfig?.urlType as UrlType | undefined) ?? 'card'
    const customUrl = value?.customUrl ?? ''

    return (
      <div className="flex flex-col gap-3">
        {urlType === 'custom' ? (
          <input
            type="url"
            value={customUrl}
            onChange={e => onChange({ ...value, customUrl: e.target.value })}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        ) : (
          <p className="text-xs text-gray-400">
            {urlType === 'card' ? 'カードの個別ページへのQRコードが表示されます' : 'ユーザーページへのQRコードが表示されます'}
          </p>
        )}
        <div className="flex justify-center">
          <RoundedQR
            url={urlType === 'custom' ? (customUrl || 'https://example.com') : DEMO_URL}
            size={96}
            color="#6366f1"
          />
        </div>
      </div>
    )
  },
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const urlType: UrlType = (blockConfig.urlType as UrlType | undefined) ?? 'card'
    const size = typeof blockConfig.size === 'number' ? blockConfig.size : 0.055

    return (
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-12 shrink-0">サイズ</span>
          <input
            type="range" min={0.05} max={0.15} step={0.005}
            value={size}
            onChange={e => onChange({ ...blockConfig, size: Number(e.target.value) })}
            className="flex-1"
          />
          <span className="text-[10px] text-gray-400 w-8 text-right">{Math.round(size * 1000) / 10}%</span>
        </div>
        <p className="text-[10px] text-gray-400">QR コードのリンク先</p>
        <div className="flex flex-col gap-1">
          {URL_TYPE_LABELS.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ ...blockConfig, urlType: value })}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-colors ${
                urlType === value
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <span className="text-xs font-medium w-28 shrink-0">{label}</span>
              <span className="text-[10px] text-gray-400">{desc}</span>
            </button>
          ))}
        </div>
      </div>
    )
  },
}
