'use client'
import { useEffect, useState } from 'react'
import type { ComponentDef, BackgroundValue } from './types'

// 上段: 薄色、下段: 同色相の濃色 (10列ペア)
const PALETTE = [
  '#ffffff', '#f3f4f6', '#dbeafe', '#fcd5ce', '#fce7f3',
  '#ede9fe', '#e0f7fa', '#d1fae5', '#fef9c3', '#ffedd5',
  '#333333', '#6b7280', '#60a5fa', '#f87171', '#f472b6',
  '#a78bfa', '#38bdf8', '#34d399', '#facc15', '#fb923c',
]

const PRESET_GRADIENTS = [
  { id: 'blue-purple',   from: '#60a5fa', to: '#a78bfa' },
  { id: 'pink-red',      from: '#f472b6', to: '#ef4444' },
  { id: 'pastel-sky',    from: '#fcd5ce', to: '#e0f7fa' },
  { id: 'mint-lavender', from: '#34d399', to: '#e6e6fa' },
  { id: 'sunset',        from: '#fb923c', to: '#f472b6' },
  { id: 'ocean',         from: '#38bdf8', to: '#34d399' },
  { id: 'yellow-green',  from: '#facc15', to: '#4ade80' },
  { id: 'purple-pink',   from: '#a78bfa', to: '#f472b6' },
  { id: 'red-orange',    from: '#f87171', to: '#fb923c' },
  { id: 'sky-white',     from: '#38bdf8', to: '#ffffff' },
]

const PRESET_IMAGES = [
  '/backgrounds/bg_1.webp',
  '/backgrounds/bg_2.webp',
  '/backgrounds/bg_3.webp',
  '/backgrounds/bg_4.webp',
  '/backgrounds/bg_5.webp',
]

function ColorSwatch({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-7 h-7 rounded-lg border-2 hover:scale-110 transition-transform ${selected ? 'border-[#00AADB] scale-110' : 'border-black/10'}`}
      style={{ backgroundColor: color }}
    />
  )
}

export const backgroundComponent: ComponentDef<BackgroundValue> = {
  key: 'background',
  defaultValue: { type: 'gradient', value: ['#fcd5ce', '#e0f7fa'], base64: null },
  FormItem({ value, onChange, t }) {
    const [gradFrom, setGradFrom] = useState<string>('#60a5fa')
    const [gradTo, setGradTo] = useState<string>('#a78bfa')
    const [gradPicking, setGradPicking] = useState<'from' | 'to'>('from')

    // カスタム画像のbase64変換
    useEffect(() => {
      if (!(value.imageFile instanceof File)) return
      const reader = new FileReader()
      reader.onload = e => onChange({ ...value, base64: e.target?.result as string })
      reader.readAsDataURL(value.imageFile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value.imageFile])

    // グラデーション値を復元
    useEffect(() => {
      if (value.type === 'gradient' && Array.isArray(value.value)) {
        setGradFrom(value.value[0])
        setGradTo(value.value[1])
      }
    }, [])

    const set = (patch: Partial<BackgroundValue>) => onChange({ ...value, ...patch })

    function applyGradient(from: string, to: string) {
      set({ type: 'gradient', value: [from, to], imageFile: null, base64: null })
    }

    const currentFrom = Array.isArray(value.value) ? value.value[0] : gradFrom
    const currentTo   = Array.isArray(value.value) ? value.value[1] : gradTo

    return (
      <div className="flex flex-col gap-5">
        <h2 className="text-sm font-medium text-gray-500">{t.backgroundSettings}</h2>

        {/* 単色 */}
        <div>
          <span className="text-sm font-semibold">{t.solidColorBg}</span>
          <div className="grid grid-cols-10 gap-1.5 mt-2">
            {PALETTE.map(color => (
              <ColorSwatch
                key={color}
                color={color}
                selected={value.type === 'color' && value.value === color}
                onClick={() => set({ type: 'color', value: color, imageFile: null, base64: null })}
              />
            ))}
          </div>
        </div>

        {/* グラデーション */}
        <div>
          <span className="text-sm font-semibold">{t.gradientBg}</span>

          {/* プリセット */}
          <div className="grid grid-cols-5 gap-2 mt-2">
            {PRESET_GRADIENTS.map(({ id, from, to }) => (
              <button
                key={id}
                onClick={() => {
                  setGradFrom(from); setGradTo(to)
                  applyGradient(from, to)
                }}
                className={`h-7 rounded-lg border-2 hover:scale-105 transition-transform ${value.type === 'gradient' && currentFrom === from && currentTo === to ? 'border-[#00AADB] scale-105' : 'border-black/10'}`}
                style={{ backgroundImage: `linear-gradient(to right, ${from}, ${to})` }}
              />
            ))}
          </div>

          {/* カスタム: グラデーションバーのハンドルをクリック */}
          <div className="mt-3">
            <p className="text-[10px] text-gray-400 mb-1.5">カスタムカラー：左右の丸をクリックして色を変更</p>
            {/* グラデーションバー + ハンドル */}
            <div className="relative flex items-center h-9">
              {/* バー本体 */}
              <div
                className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-5 rounded-full border border-black/10"
                style={{ backgroundImage: `linear-gradient(to right, ${currentFrom}, ${currentTo})` }}
              />
              {/* 左ハンドル */}
              <button
                onClick={() => setGradPicking('from')}
                className={`relative z-10 w-9 h-9 rounded-full border-[3px] shadow-md transition-all flex-shrink-0 ${gradPicking === 'from' ? 'border-[#00AADB] scale-110' : 'border-white'}`}
                style={{ backgroundColor: currentFrom }}
              />
              <div className="flex-1" />
              {/* 右ハンドル */}
              <button
                onClick={() => setGradPicking('to')}
                className={`relative z-10 w-9 h-9 rounded-full border-[3px] shadow-md transition-all flex-shrink-0 ${gradPicking === 'to' ? 'border-[#00AADB] scale-110' : 'border-white'}`}
                style={{ backgroundColor: currentTo }}
              />
            </div>
            {/* 選択中の側のパレット */}
            <div className="mt-2 grid grid-cols-10 gap-1.5">
              {PALETTE.map(color => (
                <ColorSwatch
                  key={color}
                  color={color}
                  selected={gradPicking === 'from' ? currentFrom === color : currentTo === color}
                  onClick={() => {
                    const from = gradPicking === 'from' ? color : currentFrom
                    const to   = gradPicking === 'to'   ? color : currentTo
                    setGradFrom(from); setGradTo(to)
                    applyGradient(from, to)
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* プリセット画像 */}
        <div>
          <span className="text-sm font-semibold">{t.handwrittenBg}</span>
          <div className="flex gap-2 mt-2">
            {PRESET_IMAGES.map(src => (
              <button
                key={src}
                onClick={() => set({ type: 'image', value: src, imageFile: null, base64: null })}
                className={`w-14 h-9 rounded-lg bg-cover bg-center border-2 hover:scale-105 transition-transform ${value.type === 'image' && value.value === src ? 'border-[#00AADB] scale-105' : 'border-black/10'}`}
                style={{ backgroundImage: `url(${src})` }}
              />
            ))}
          </div>
        </div>

        {/* カスタム画像 */}
        <div>
          <span className="text-sm font-semibold">{t.imageBg}</span>
          <label className="flex items-center mt-1">
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) set({ type: 'image', value: '', imageFile: file, base64: null })
              }}
              className="hidden"
              id="bg-image-upload"
            />
            <label htmlFor="bg-image-upload" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-1.5 px-3 rounded-lg cursor-pointer transition-colors">
              {t.chooseFile}
            </label>
            <span className="ml-2 text-gray-600 text-sm">
              {value.imageFile instanceof File ? value.imageFile.name : t.noFileChosen}
            </span>
          </label>
        </div>
      </div>
    )
  },
}
