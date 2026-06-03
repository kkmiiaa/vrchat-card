'use client'
import { useState, useRef, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'

export const SERVICE_COLORS = ['#00AADB']

export const PRESET_COLORS = [
  // vaacard サービスカラー
  ...SERVICE_COLORS,
  // ビビッド
  '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6',
  // グレイッシュ（くすみ）
  '#c0636b', '#c07a4a', '#a89442', '#5d9e6e', '#4a7fc1', '#6b6bb5',
  // パステル
  '#f9a8a8', '#fbc89a', '#fde68a', '#a7f3c0', '#bfdbfe', '#ddd6fe',
  // パステル（ピンク・ラベンダー）
  '#f9c5d1', '#e8b4e8', '#c4b5fd', '#93c5fd', '#99f6e4', '#d9f99d',
  // グレイッシュ（ニュートラル寄り）
  '#b5a9a9', '#b0a899', '#a8b0a0', '#9aaab8', '#a8a0b5', '#b8a0b0',
  // ニュートラル
  '#f5f5f5', '#d1d5db', '#9ca3af', '#6b7280', '#374151', '#1f2937',
]

export const LABEL_PRESET_COLORS = [
  // vaacard サービスカラー
  ...SERVICE_COLORS,
  // 黒・ダークグレー
  '#000000', '#111827', '#1f2937', '#374151', '#4b5563', '#6b7280',
  // ミディアムグレー
  '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6', '#f9fafb', '#ffffff',
  // グレイッシュカラー（テキスト向き）
  '#7f6b6b', '#7a6b55', '#6b7055', '#4f6b6b', '#4b5d7a', '#5b547a',
  // くすみアクセント
  '#8b5a5a', '#8b6f4e', '#7a7040', '#3d7a5e', '#3b5fa8', '#5a4f9e',
  // ホワイト系（背景が暗い時用）
  '#ffffffcc', '#ffffffaa', '#ffffff88', '#00000088', '#000000aa', '#000000cc',
]

const POPUP_WIDTH = 220
const POPUP_HEIGHT = 220

export function ColorPicker({
  value,
  onChange,
  defaultColor,
  presetColors,
}: {
  value: string
  onChange: (v: string) => void
  defaultColor?: string
  presetColors?: string[]
}) {
  const [open, setOpen] = useState(false)
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({})
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popupId = useId()

  const colors = presetColors ?? PRESET_COLORS

  const openPopup = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - POPUP_WIDTH - 8))
      const spaceBelow = window.innerHeight - rect.bottom
      const top = spaceBelow >= POPUP_HEIGHT + 8
        ? rect.bottom + 4
        : rect.top - POPUP_HEIGHT - 4
      setPopupStyle({
        position: 'fixed',
        top: Math.max(8, top),
        left,
        width: POPUP_WIDTH,
        zIndex: 9999,
      })
    }
    setOpen(v => !v)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return
      const popup = document.getElementById(popupId)
      if (popup?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, popupId])

  const display = value || defaultColor || '#9ca3af'

  const popup = open && (
    <div
      id={popupId}
      style={popupStyle}
      className="rounded-xl border border-gray-200 bg-white shadow-xl p-3 flex flex-col gap-3"
    >
      {/* プリセットグリッド */}
      <div className="grid grid-cols-6 gap-1.5">
        {colors.map(c => (
          <button
            key={c}
            type="button"
            title={c}
            onClick={() => { onChange(c); setOpen(false) }}
            className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110"
            style={{
              background: c,
              borderColor: value === c ? '#0ea5e9' : 'transparent',
              boxShadow: value === c ? `0 0 0 1px #0ea5e9` : 'inset 0 0 0 1px rgba(0,0,0,0.1)',
            }}
          />
        ))}
      </div>

      {/* カスタム入力（hex） */}
      <div className="flex items-center gap-2 border-t border-gray-100 pt-2">
        <span className="text-[10px] text-gray-400 shrink-0 font-mono">#</span>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={(defaultColor ?? '#9ca3af').replace(/^#/, '')}
          className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 font-mono focus:outline-none focus:ring-1 focus:ring-sky-200"
        />
        {value && (
          <button type="button" onClick={() => { onChange(''); setOpen(false) }}
            className="text-xs text-gray-300 hover:text-gray-500 shrink-0">✕</button>
        )}
      </div>
    </div>
  )

  return (
    <span className="inline-flex items-center gap-1">
      <button
        ref={triggerRef}
        type="button"
        onClick={openPopup}
        title={display}
        data-testid="color-picker-trigger"
        className="w-7 h-7 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors shrink-0 p-0.5"
        style={{ background: display }}
      />
      {typeof document !== 'undefined' && popup ? createPortal(popup, document.body) : null}
    </span>
  )
}
