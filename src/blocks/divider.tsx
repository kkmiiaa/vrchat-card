'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { ColorPicker, LABEL_PRESET_COLORS } from './colorPicker'

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${opacity})`
}

export const dividerComponent: ComponentDef<null> = {
  key: 'divider',
  defaultValue: null,
  variants: ['horizontal', 'vertical'],
  CardItem({ blockConfig, variant }) {
    const color = hexToRgba(
      (blockConfig?.color as string | undefined) ?? '#000000',
      (blockConfig?.opacity as number | undefined) ?? 0.1,
    )
    const thickness = (blockConfig?.thickness as number | undefined) ?? 1
    const isVertical = variant === 'vertical'
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <div style={{
          width: isVertical ? thickness : '100%',
          height: isVertical ? '100%' : thickness,
          background: color,
          flexShrink: 0,
        }} />
      </div>
    )
  },
  FormItem() {
    return null
  },
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const color = typeof blockConfig.color === 'string' ? blockConfig.color : ''
    const opacity = typeof blockConfig.opacity === 'number' ? blockConfig.opacity : 0.1
    const thickness = typeof blockConfig.thickness === 'number' ? blockConfig.thickness : 1
    return (
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-16 shrink-0">色</span>
          <ColorPicker
            value={color}
            onChange={v => onChange({ ...blockConfig, color: v || undefined })}
            defaultColor="#000000"
            presetColors={LABEL_PRESET_COLORS}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-16 shrink-0">不透明度</span>
          <input
            type="range" min={0} max={1} step={0.05}
            value={opacity}
            onChange={e => onChange({ ...blockConfig, opacity: Number(e.target.value) })}
            className="flex-1"
          />
          <span className="text-[10px] text-gray-400 w-7 text-right">{Math.round(opacity * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-16 shrink-0">太さ</span>
          <input
            type="number" min={1} max={20}
            value={thickness}
            onChange={e => onChange({ ...blockConfig, thickness: Number(e.target.value) })}
            className="w-16 px-2 py-1 border rounded text-xs font-mono"
          />
        </div>
      </div>
    )
  },
}
