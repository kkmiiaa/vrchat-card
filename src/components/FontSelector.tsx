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

const fontOptions: {
  key: FontKey
  label: string
  fontFamily: string
}[] = [
  { key: 'rounded', label: 'Rounded M+', fontFamily: RoundedMplus.style.fontFamily },
  { key: 'kosugi', label: 'Kosugi Maru', fontFamily: Kosugi.style.fontFamily },
  { key: 'zenmaru', label: 'Zen Maru Gothic', fontFamily: ZenMaru.style.fontFamily },
  { key: 'uzura', label: 'うずらフォント', fontFamily: Uzura.style.fontFamily },
  { key: 'kawaii', label: 'kawaii手書き文字', fontFamily: Kawaii.style.fontFamily },
  { key: 'maruminya', label: 'マルミーニャM', fontFamily: MaruMinya.style.fontFamily },
]

export default function FontSelector({
  fontKey,
  setFontKey,
  t,
}: {
  fontKey: FontKey
  setFontKey: (val: FontKey) => void
  t: any
}) {
  const fontOptions: {
    key: FontKey
    label: string
    fontFamily: string
  }[] = [
    { key: 'rounded', label: 'Rounded M+', fontFamily: RoundedMplus.style.fontFamily },
    { key: 'kosugi', label: 'Kosugi Maru', fontFamily: Kosugi.style.fontFamily },
    { key: 'zenmaru', label: 'Zen Maru Gothic', fontFamily: ZenMaru.style.fontFamily },
    { key: 'uzura', label: t.uzuraFont, fontFamily: Uzura.style.fontFamily },
    { key: 'kawaii', label: t.kawaiiFont, fontFamily: Kawaii.style.fontFamily },
    { key: 'maruminya', label: t.maruminyaFont, fontFamily: MaruMinya.style.fontFamily },
  ]

  return (
    <div className="flex flex-col gap-4 pt-2 pb-2">
      <h2 className="text-lg font-bold">{t.fontSettings}</h2>
      <div className="flex flex-wrap gap-2">
        {fontOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setFontKey(opt.key)}
            className={`px-4 py-2 rounded border text-sm transition
              ${fontKey === opt.key
                ? 'border-blue-600 bg-blue-100 text-blue-800'
                : 'border-gray-300 bg-white hover:bg-gray-50'}
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
