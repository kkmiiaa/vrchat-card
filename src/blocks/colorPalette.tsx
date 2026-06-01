'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { ColorPicker } from './colorPicker'

export const colorPaletteComponent: ComponentDef<string[]> = {
  key: 'colorPalette',
  defaultValue: ['#60a5fa', '#4ade80', '#fbbf24', '#f87171'],
  variants: ['simple', 'compact'],
  CardItem({ value, ctx, variant, _surface, blockConfig }) {
    const maxCount = typeof blockConfig?.maxCount === 'number' ? blockConfig.maxCount : undefined
    const allColors = Array.isArray(value) ? value : []
    const colors = maxCount !== undefined ? allColors.slice(0, maxCount) : allColors
    const isCompact = variant === 'compact'
    const swatchSize = isCompact ? ctx.cardWidth * 0.018 : ctx.cardWidth * 0.028

    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: isCompact ? 3 : 5,
        padding: `${ctx.cardWidth * 0.004 * ctx.paddingScale}px`,
      }}>
        {colors.map((color, i) => (
          <div
            key={i}
            style={{
              width: swatchSize,
              height: swatchSize,
              borderRadius: '50%',
              background: color,
              border: '2px solid rgba(255,255,255,0.8)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    const colors = Array.isArray(value) ? value : []
    const freeInput = blockConfig?.freeInput !== false
    const maxCount = typeof blockConfig?.maxCount === 'number' ? blockConfig.maxCount : 8
    const presetColors: string[] = Array.isArray(blockConfig?.colors) ? blockConfig!.colors as string[] : []
    const hasPresets = presetColors.length > 0

    const updateColor = (index: number, color: string) => {
      onChange(colors.map((c, i) => i === index ? color : c))
    }

    const togglePreset = (preset: string) => {
      if (colors.includes(preset)) {
        onChange(colors.filter(c => c !== preset))
      } else if (colors.length < maxCount) {
        onChange([...colors, preset])
      }
    }

    const addColor = () => {
      if (colors.length < maxCount) onChange([...colors, '#a78bfa'])
    }

    const removeColor = (index: number) => {
      onChange(colors.filter((_, i) => i !== index))
    }

    return (
      <div className="flex flex-col gap-2">
        {hasPresets ? (
          // プリセットモード: blockConfig.colors から選択
          <div className="flex flex-wrap gap-2">
            {presetColors.map((preset, i) => {
              const selected = colors.includes(preset)
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => togglePreset(preset)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${selected ? 'border-gray-700 scale-110' : 'border-white/80'}`}
                  style={{ background: preset, boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
                  title={preset}
                />
              )
            })}
          </div>
        ) : (
          // 自由入力モード
          <>
            <div className="flex flex-wrap gap-3">
              {colors.map((color, i) => (
                <div key={i} className="flex items-center gap-1">
                  {freeInput ? (
                    <ColorPicker value={color} onChange={v => updateColor(i, v)} />
                  ) : (
                    <span className="w-8 h-8 rounded-full border border-gray-200" style={{ background: color }} />
                  )}
                  <button
                    type="button"
                    onClick={() => removeColor(i)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-sm leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {colors.length < maxCount && (
              <button
                type="button"
                onClick={addColor}
                className="text-sm text-sky-500 hover:text-sky-700 font-medium text-left transition-colors"
              >
                + 色を追加
              </button>
            )}
          </>
        )}
      </div>
    )
  },
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const colors: string[] = Array.isArray(blockConfig.colors) ? blockConfig.colors as string[] : []
    const maxCount = typeof blockConfig.maxCount === 'number' ? blockConfig.maxCount : ''

    const updateColor = (i: number, c: string) => {
      const next = colors.map((v, idx) => idx === i ? c : v)
      onChange({ ...blockConfig, colors: next })
    }
    const addColor = () => onChange({ ...blockConfig, colors: [...colors, '#a78bfa'] })
    const removeColor = (i: number) => onChange({ ...blockConfig, colors: colors.filter((_, idx) => idx !== i) })

    return (
      <div className="flex flex-col gap-2 text-sm">
        <p className="text-[10px] text-gray-400">カラー（colors）</p>
        <div className="flex flex-wrap gap-2">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-1">
              <ColorPicker value={c} onChange={v => updateColor(i, v)} />
              <button type="button" onClick={() => removeColor(i)} className="text-xs text-red-400 hover:text-red-600">×</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addColor} className="text-xs text-sky-500 hover:text-sky-700 mt-1">+ 追加</button>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-20 shrink-0">最大件数</span>
          <input type="number" min={1} value={maxCount} placeholder="無制限"
            onChange={e => onChange({ ...blockConfig, maxCount: e.target.value ? Number(e.target.value) : undefined })}
            className="w-20 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={blockConfig.freeInput !== false} id="colorpalette-freeInput" className="rounded"
            onChange={e => onChange({ ...blockConfig, freeInput: e.target.checked ? undefined : false })} />
          <label htmlFor="colorpalette-freeInput" className="text-[10px] text-gray-500">カラーピッカーで自由入力（freeInput）</label>
        </div>
      </div>
    )
  },
}
