'use client'
import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  TbBadgeVr, TbDeviceGamepad2, TbDeviceDesktop, TbDeviceMobile,
  TbStar, TbHeart, TbMusic, TbCamera, TbLink, TbWorld, TbPalette,
  TbBrandX, TbBrandDiscord, TbMicrophone, TbPhoto, TbBook,
  TbCrown, TbTrophy, TbMedal, TbShield, TbDiamond, TbFlame,
  TbRocket, TbSparkles, TbPaw, TbCat, TbFeather, TbBell, TbFlag,
  TbPin, TbDeviceGamepad,
} from 'react-icons/tb'
import { FiMic } from 'react-icons/fi'
import { PiGenderMaleBold, PiGenderFemaleBold, PiGenderIntersexBold } from 'react-icons/pi'

// ─────────────────────────────────────────
// アイコン定義
// ─────────────────────────────────────────
type IconDef = {
  key: string
  label: string
  node: React.ReactElement
  category: string
}

export const ICON_DEFS: IconDef[] = [
  // デバイス
  { key: 'TbBadgeVr',        label: 'VR',      node: <TbBadgeVr />,        category: 'Device' },
  { key: 'TbDeviceGamepad2', label: 'ゲーム機', node: <TbDeviceGamepad2 />, category: 'Device' },
  { key: 'TbDeviceDesktop',  label: 'PC',      node: <TbDeviceDesktop />,  category: 'Device' },
  { key: 'TbDeviceMobile',   label: 'モバイル', node: <TbDeviceMobile />,   category: 'Device' },
  { key: 'TbDeviceGamepad',  label: 'コントローラ', node: <TbDeviceGamepad />, category: 'Device' },
  { key: 'FiMic',            label: 'マイク',   node: <FiMic />,            category: 'Device' },
  // 人・属性
  { key: 'PiGenderMaleBold',     label: '男性',   node: <PiGenderMaleBold />,     category: 'Person' },
  { key: 'PiGenderFemaleBold',   label: '女性',   node: <PiGenderFemaleBold />,   category: 'Person' },
  { key: 'PiGenderIntersexBold', label: 'その他', node: <PiGenderIntersexBold />, category: 'Person' },
  // 実績・評価
  { key: 'TbCrown',   label: '王冠',    node: <TbCrown />,   category: 'Award' },
  { key: 'TbTrophy',  label: 'トロフィー', node: <TbTrophy />,  category: 'Award' },
  { key: 'TbMedal',   label: 'メダル',  node: <TbMedal />,   category: 'Award' },
  { key: 'TbShield',  label: 'シールド', node: <TbShield />,  category: 'Award' },
  { key: 'TbDiamond', label: 'ダイヤ',  node: <TbDiamond />, category: 'Award' },
  { key: 'TbStar',    label: 'スター',  node: <TbStar />,    category: 'Award' },
  // リンク・SNS
  { key: 'TbBrandX',       label: 'X',       node: <TbBrandX />,       category: 'Link' },
  { key: 'TbBrandDiscord', label: 'Discord', node: <TbBrandDiscord />, category: 'Link' },
  { key: 'TbWorld',        label: 'Web',     node: <TbWorld />,        category: 'Link' },
  { key: 'TbLink',         label: 'リンク',  node: <TbLink />,         category: 'Link' },
  // 創作・趣味
  { key: 'TbPalette',    label: 'アート',  node: <TbPalette />,    category: 'Hobby' },
  { key: 'TbMusic',      label: '音楽',    node: <TbMusic />,      category: 'Hobby' },
  { key: 'TbCamera',     label: 'カメラ',  node: <TbCamera />,     category: 'Hobby' },
  { key: 'TbPhoto',      label: '写真',    node: <TbPhoto />,      category: 'Hobby' },
  { key: 'TbMicrophone', label: '収録',    node: <TbMicrophone />, category: 'Hobby' },
  { key: 'TbBook',       label: '本',      node: <TbBook />,       category: 'Hobby' },
  // シンボル
  { key: 'TbHeart',    label: 'ハート',   node: <TbHeart />,    category: 'Symbol' },
  { key: 'TbFlame',    label: '炎',       node: <TbFlame />,    category: 'Symbol' },
  { key: 'TbRocket',   label: 'ロケット', node: <TbRocket />,   category: 'Symbol' },
  { key: 'TbSparkles', label: 'キラキラ', node: <TbSparkles />, category: 'Symbol' },
  { key: 'TbPaw',      label: '肉球',     node: <TbPaw />,      category: 'Symbol' },
  { key: 'TbCat',      label: 'ねこ',     node: <TbCat />,      category: 'Symbol' },
  { key: 'TbFeather',  label: '羽',       node: <TbFeather />,  category: 'Symbol' },
  { key: 'TbBell',     label: 'ベル',     node: <TbBell />,     category: 'Symbol' },
  { key: 'TbFlag',     label: 'フラグ',   node: <TbFlag />,     category: 'Symbol' },
  { key: 'TbPin',      label: 'ピン',     node: <TbPin />,      category: 'Symbol' },
]

const ICON_MAP = Object.fromEntries(ICON_DEFS.map(d => [d.key, d.node]))

const CATEGORY_LABELS: Record<string, string> = {
  Device: 'デバイス',
  Person: '人・属性',
  Award:  '実績',
  Link:   'リンク',
  Hobby:  '創作・趣味',
  Symbol: 'シンボル',
}

// ─────────────────────────────────────────
// アイコン解決
// ─────────────────────────────────────────
/** 文字列キーからアイコンを解決。登録済みキーなら React ノード、それ以外（絵文字等）はそのまま返す */
export function resolveIcon(key: string | null | undefined, size = 16): React.ReactNode {
  if (!key) return null
  const node = ICON_MAP[key]
  if (node) return React.cloneElement(node, { size })
  return key
}

/** resolveIcon をインライン style に対応した span でラップして返す */
export function renderIcon(key: string | null | undefined, size = 16): React.ReactNode {
  const resolved = resolveIcon(key, size)
  if (!resolved) return null
  if (typeof resolved === 'string') {
    return <span style={{ fontSize: size, lineHeight: 1 }}>{resolved}</span>
  }
  return <span style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>{resolved}</span>
}

// ─────────────────────────────────────────
// IconPicker コンポーネント
// ─────────────────────────────────────────
const CATEGORIES = ['Device', 'Person', 'Award', 'Link', 'Hobby', 'Symbol']

const POPUP_WIDTH = 280

export function IconPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0])
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({})
  const triggerRef = useRef<HTMLButtonElement>(null)

  // ポップアップ位置を fixed で計算（親の overflow に影響されない）
  const openPopup = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const left = Math.min(rect.left, window.innerWidth - POPUP_WIDTH - 8)
      setPopupStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: Math.max(8, left),
        width: POPUP_WIDTH,
        zIndex: 9999,
      })
    }
    setOpen(v => !v)
  }

  // 外側クリックで閉じる
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        const popup = document.getElementById('icon-picker-popup')
        if (popup && popup.contains(e.target as Node)) return
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const popup = open && (
    <div
      id="icon-picker-popup"
      style={popupStyle}
      className="rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden flex"
    >
      {/* 左側カテゴリタブ（縦） */}
      <div className="flex flex-col border-r border-gray-100 bg-gray-50 shrink-0">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-2 text-[10px] font-medium text-left whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'text-sky-600 bg-sky-50 border-r-2 border-sky-400'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* 右側アイコングリッド */}
      <div className="p-2 grid grid-cols-5 gap-1 content-start">
        {ICON_DEFS.filter(d => d.category === activeCategory).map(def => (
          <button
            key={def.key}
            type="button"
            title={def.label}
            onClick={() => { onChange(def.key); setOpen(false) }}
            className={`w-9 h-9 flex flex-col items-center justify-center rounded-lg border transition-colors gap-0.5 ${
              value === def.key
                ? 'border-sky-400 bg-sky-50 text-sky-700'
                : 'border-transparent text-gray-600 hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center">
              {React.cloneElement(def.node, { size: 18 })}
            </span>
            <span className="text-[8px] text-gray-400 leading-none truncate w-full text-center">
              {def.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <button
        ref={triggerRef}
        type="button"
        onClick={openPopup}
        title="アイコンを選択"
        className={`w-8 h-8 flex items-center justify-center rounded border transition-colors shrink-0 ${
          open
            ? 'border-sky-400 bg-sky-50 text-sky-700'
            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-white'
        }`}
      >
        {value ? renderIcon(value, 16) : <span className="text-gray-300 text-sm">＋</span>}
      </button>
      {value && (
        <button type="button" onClick={() => { onChange(''); setOpen(false) }}
          className="text-xs text-gray-300 hover:text-gray-500 shrink-0">✕</button>
      )}
      {typeof document !== 'undefined' && popup ? createPortal(popup, document.body) : null}
    </div>
  )
}
