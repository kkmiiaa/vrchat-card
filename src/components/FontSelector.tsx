'use client'

import {
  RoundedMplus,
  Kosugi,
  ZenMaru,
  Uzura,
  Kawaii,
  MaruMinya,
} from '@/app/fonts'

export type FontKey =
  | 'rounded'
  | 'kosugi'
  | 'zenmaru'
  | 'uzura'
  | 'kawaii'
  | 'maruminya'

export default function FontSelector({
  fontKey,
  setFontKey,
  t,
}: {
  fontKey: FontKey
  setFontKey: (val: FontKey) => void
  t: any
}) {
  const fontOptions: { key: FontKey; label: string; fontFamily: string }[] = [
    { key: 'rounded',   label: 'Rounded M+',      fontFamily: RoundedMplus.style.fontFamily },
    { key: 'kosugi',    label: 'Kosugi Maru',      fontFamily: Kosugi.style.fontFamily },
    { key: 'zenmaru',   label: 'Zen Maru Gothic',  fontFamily: ZenMaru.style.fontFamily },
    { key: 'uzura',     label: t.uzuraFont,         fontFamily: Uzura.style.fontFamily },
    { key: 'kawaii',    label: t.kawaiiFont,        fontFamily: Kawaii.style.fontFamily },
    { key: 'maruminya', label: t.maruminyaFont,     fontFamily: MaruMinya.style.fontFamily },
  ]

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.fontSettings}</p>
      <div className="grid grid-cols-2 gap-1.5">
        {fontOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setFontKey(opt.key)}
            className={`px-3 py-2 rounded-lg border text-sm transition-colors text-left truncate
              ${fontKey === opt.key
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'}
            `}
            style={{ fontFamily: opt.fontFamily }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
