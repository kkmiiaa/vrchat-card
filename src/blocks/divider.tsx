'use client'
import type { ComponentDef } from './types'

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
}
