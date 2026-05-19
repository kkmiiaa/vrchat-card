'use client'

import React, { forwardRef } from 'react'
import type { TemplateDefinition, BlockValues, CardRenderContext } from '@/blocks/types'
import { getBlock } from '@/blocks/registry'
import { getBackgroundStyle, CARD_BG_FALLBACK } from '@/utils/backgroundUtils'
import type { BackgroundValue } from '@/blocks/types'

type Props = {
  definition: TemplateDefinition
  values: BlockValues
  /** フォント上書き（省略時はdefinition.fontFamilyを使用） */
  fontFamily?: string
  /** 背景設定（省略時は透明） */
  background?: BackgroundValue
  isInteractive?: boolean
  noBackground?: boolean
}

const GenericCardRenderer = forwardRef<HTMLDivElement, Props>(function GenericCardRenderer(
  { definition, values, fontFamily, background, isInteractive: _, noBackground },
  ref
) {
  const { cardWidth, cardHeight, grid, components, theme } = definition
  const resolvedFont = fontFamily ?? definition.fontFamily

  const ctx: CardRenderContext = {
    fontFamily: resolvedFont,
    cardWidth,
    theme,
  }

  const bg = noBackground
    ? 'transparent'
    : background
      ? getBackgroundStyle(background.type, background.value, background.base64 ?? null, CARD_BG_FALLBACK) as string
      : CARD_BG_FALLBACK

  // グリッドの各セルの幅・高さを計算
  const PAD = cardWidth * 0.025
  const innerWidth  = cardWidth  - PAD * 2
  const innerHeight = cardHeight - PAD * 2
  const cellW = (innerWidth  - grid.gap * (grid.cols - 1)) / grid.cols
  const cellH = (innerHeight - grid.gap * (grid.rows - 1)) / grid.rows

  return (
    <div
      ref={ref}
      style={{
        width: cardWidth,
        height: cardHeight,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: resolvedFont,
        background: bg,
      }}
    >
      {/* コンポーネント配置エリア */}
      <div
        style={{
          position: 'absolute',
          left: PAD,
          top: PAD,
          width: innerWidth,
          height: innerHeight,
        }}
      >
        {components.map((comp, i) => {
          const block = getBlock(comp.blockKey)
          if (!block?.CardItem) return null

          const value = values[comp.blockKey] ?? block.defaultValue

          // グリッド座標 → px 位置
          const left   = comp.x * (cellW + grid.gap)
          const top    = comp.y * (cellH + grid.gap)
          const width  = comp.w * cellW + (comp.w - 1) * grid.gap
          const height = comp.h * cellH + (comp.h - 1) * grid.gap

          return (
            <div
              key={`${comp.blockKey}-${i}`}
              style={{
                position: 'absolute',
                left,
                top,
                width,
                height,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'flex-start',
              }}
            >
              <block.CardItem value={value} ctx={ctx} variant={comp.variant} />
            </div>
          )
        })}
      </div>
    </div>
  )
})

export default GenericCardRenderer
