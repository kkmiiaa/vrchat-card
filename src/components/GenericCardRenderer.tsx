'use client'

import React, { forwardRef } from 'react'
import type {
  TemplateDefinition,
  BlockValues,
  CardRenderContext,
  LayoutNode,
  TemplateGridDef,
} from '@/blocks/types'
import { cellsToPixels, makeFontSizeTokens } from '@/blocks/types'
import { getComponent } from '@/blocks/registry'
import { getBackgroundStyle, CARD_BG_FALLBACK } from '@/utils/backgroundUtils'
import type { BackgroundValue } from '@/blocks/types'

type Props = {
  definition: TemplateDefinition
  values: BlockValues
  fontFamily?: string
  background?: BackgroundValue
  isInteractive?: boolean
  noBackground?: boolean
  orientation?: 'landscape' | 'portrait'
  /** 選択中のノードパス（admin ビルダー用ハイライト） */
  highlightPath?: number[]
}

type Inset = { top: number; right: number; bottom: number; left: number }

function resolveInset(definition: TemplateDefinition, values: BlockValues, fallback: number): Inset {
  if (!definition.overlayKey) return { top: fallback, right: fallback, bottom: fallback, left: fallback }
  const v = values[definition.overlayKey] as { inset?: Inset; innerPadding?: number } | undefined
  const inset = v?.inset
  const inner = v?.innerPadding ?? 12
  if (!inset) return { top: fallback + inner, right: fallback + inner, bottom: fallback + inner, left: fallback + inner }
  return {
    top:    inset.top    + inner,
    right:  inset.right  + inner,
    bottom: inset.bottom + inner,
    left:   inset.left   + inner,
  }
}

function renderNode(
  node: LayoutNode,
  grid: TemplateGridDef,
  values: BlockValues,
  ctx: CardRenderContext,
  currentPath: number[],
  highlightPath: number[] | undefined,
): React.ReactNode {
  const { cellSize, gap } = grid
  const isHighlighted = highlightPath !== undefined &&
    JSON.stringify(currentPath) === JSON.stringify(highlightPath)

  const highlight: React.CSSProperties = isHighlighted
    ? { outline: '2px solid #00AADB', outlineOffset: '-2px', position: 'relative', zIndex: 10 }
    : {}

  if (node.type === 'block') {
    const block = getComponent(node.componentKey)
    if (!block?.CardItem) return null
    const value = values[node.dataKey] ?? block.defaultValue

    const hasFlex = node.flex !== undefined
    const style: React.CSSProperties = {
      display: 'flex', alignItems: 'stretch', overflow: 'hidden', minWidth: 0, minHeight: 0,
      flexGrow: hasFlex ? node.flex : 0,
      flexShrink: hasFlex ? 1 : 0,
      flexBasis: hasFlex ? 0 : 'auto',
      ...(node.minW !== undefined && !hasFlex ? { width: cellsToPixels(node.minW, cellSize, gap) } : {}),
      ...(node.minH !== undefined && !hasFlex ? { height: cellsToPixels(node.minH, cellSize, gap) } : {}),
      ...(node.alignSelf ? { alignSelf: node.alignSelf } : {}),
      ...highlight,
    }

    const contentScale = (node.contentFontScale ?? 1) * (ctx.defaultContentFontScale ?? 1)
    const blockCtx = contentScale !== 1
      ? { ...ctx, fontSize: {
          xs: ctx.fontSize.xs * contentScale,
          sm: ctx.fontSize.sm * contentScale,
          md: ctx.fontSize.md * contentScale,
          lg: ctx.fontSize.lg * contentScale,
          xl: ctx.fontSize.xl * contentScale,
        }}
      : ctx

    const cardContent = block.CardItem({ value, ctx: blockCtx, variant: node.variant, bgVariant: node.bgVariant, blockConfig: node.blockConfig })
    if (cardContent === null || cardContent === undefined) return null

    const glassRadius = node.glassRadius ?? ctx.cardWidth * 0.008
    const glassStyle: React.CSSProperties = node.glass
      ? { background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: glassRadius, overflow: 'hidden' }
      : {}

    const innerStyle = (flexOverride?: React.CSSProperties): React.CSSProperties => ({ ...style, ...flexOverride })

    if (!node.label) return (
      <div style={innerStyle(node.glass ? glassStyle : {})}>
        <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, minHeight: 0, overflow: 'hidden', display: 'flex', alignItems: 'stretch', ...(node.glass ? { borderRadius: glassRadius } : {}) }}>
          {cardContent}
        </div>
      </div>
    )

    const labelScale = (node.labelFontScale ?? 1) * (ctx.defaultLabelFontScale ?? 1)
    const titleFs = ctx.fontSize.sm * labelScale
    const subFs   = ctx.fontSize.xs * labelScale
    const labelColor = node.labelColor ?? ctx.theme.text
    const contentMinH = node.minH !== undefined ? cellsToPixels(node.minH, cellSize, gap) : undefined
    const innerFlex: React.CSSProperties = {
      flexGrow: 1, flexShrink: 1, flexBasis: 0, height: undefined,
      ...(contentMinH !== undefined ? { minHeight: contentMinH } : {}),
    }

    const labelEl = (
      <div style={{ display: 'flex', alignItems: 'baseline', gap: ctx.cardWidth * 0.004, flexShrink: 0 }}>
        <span style={{ fontSize: titleFs, fontWeight: 700, color: labelColor, fontFamily: ctx.fontFamily }}>{node.label}</span>
        {node.subLabel && <span style={{ fontSize: subFs, color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>{node.subLabel}</span>}
      </div>
    )

    // labelInset: ラベルをコンテンツ枠（白枠）の内側に描画
    if (node.labelInset) {
      const dir = node.labelInsetDir ?? 'col'
      const insetPad = `${ctx.cardWidth * 0.007 * ctx.paddingScale}px ${ctx.cardWidth * 0.009 * ctx.paddingScale}px`
      const flexDir: React.CSSProperties['flexDirection'] = dir === 'row' ? 'row' : 'column'
      const insetBoxStyle: React.CSSProperties = node.glass
        ? glassStyle
        : { background: 'rgba(255,255,255,0.85)', borderRadius: glassRadius, overflow: 'hidden' }
      const boxStyle: React.CSSProperties = {
        ...insetBoxStyle,
        display: 'flex',
        flexDirection: flexDir,
        gap: dir === 'col' ? ctx.cardWidth * 0.004 : ctx.cardWidth * 0.008,
        alignItems: dir === 'row' ? 'center' : 'stretch',
        padding: insetPad,
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
      }
      return (
        <div style={innerStyle()}>
          <div style={boxStyle}>
            {labelEl}
            <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, minHeight: 0, overflow: 'hidden', display: 'flex', alignItems: 'stretch' }}>
              {cardContent}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: ctx.cardWidth * 0.004, flexGrow: hasFlex ? node.flex : 0, flexShrink: hasFlex ? 1 : 0, flexBasis: hasFlex ? 0 : 'auto', overflow: 'hidden', minWidth: 0, minHeight: 0, ...(node.alignSelf ? { alignSelf: node.alignSelf } : {}), ...highlight }}>
        {labelEl}
        <div style={innerStyle({ ...innerFlex, ...glassStyle })}>
          <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, minHeight: 0, overflow: 'hidden', display: 'flex', alignItems: 'stretch' }}>
            {cardContent}
          </div>
        </div>
      </div>
    )
  }

  if (node.type === 'row') {
    const nodeGap = node.gap ?? 8
    const hasFlex = node.flex !== undefined
    const labelScale = ctx.defaultLabelFontScale ?? 1
    const titleFs = ctx.fontSize.sm * labelScale
    const subFs   = ctx.fontSize.xs * labelScale
    const labelColor = node.labelColor ?? ctx.theme.text
    const outerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: node.label ? ctx.cardWidth * 0.004 : 0,
      minWidth: 0,
      minHeight: 0,
      flexGrow: hasFlex ? node.flex : 0,
      flexShrink: hasFlex ? 1 : 0,
      flexBasis: hasFlex ? 0 : 'auto',
      ...highlight,
    }
    const innerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      gap: nodeGap,
      minWidth: 0,
      minHeight: 0,
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      ...(node.minH !== undefined && !hasFlex ? { minHeight: cellsToPixels(node.minH, cellSize, gap) } : {}),
      ...(node.justify ? { justifyContent: node.justify } : {}),
    }
    return (
      <div style={outerStyle}>
        {node.label && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: ctx.cardWidth * 0.004, flexShrink: 0 }}>
            <span style={{ fontSize: titleFs, fontWeight: 700, color: labelColor, fontFamily: ctx.fontFamily }}>{node.label}</span>
            {node.subLabel && <span style={{ fontSize: subFs, color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>{node.subLabel}</span>}
          </div>
        )}
        <div style={innerStyle}>
          {node.children.map((child, i) => (
            <React.Fragment key={i}>
              {renderNode(child, grid, values, ctx, [...currentPath, i], highlightPath)}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  if (node.type === 'col') {
    const spacingJustify = node.justify === 'space-between' || node.justify === 'space-around' || node.justify === 'space-evenly'
    const nodeGap = node.justify && spacingJustify ? 0 : (node.gap ?? 8)
    const hasFlex = node.flex !== undefined
    const labelScale = ctx.defaultLabelFontScale ?? 1
    const titleFs = ctx.fontSize.sm * labelScale
    const subFs   = ctx.fontSize.xs * labelScale
    const labelColor = node.labelColor ?? ctx.theme.text
    const style: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: nodeGap,
      minWidth: 0,
      minHeight: 0,
      overflow: 'hidden',
      flexGrow: hasFlex ? node.flex : 0,
      flexShrink: hasFlex ? 1 : 0,
      flexBasis: hasFlex ? 0 : 'auto',
      ...(node.justify ? { justifyContent: node.justify } : {}),
      ...(node.minW !== undefined && !hasFlex ? { width: cellsToPixels(node.minW, cellSize, gap) } : {}),
      ...highlight,
    }
    return (
      <div style={style}>
        {node.label && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: ctx.cardWidth * 0.004, flexShrink: 0 }}>
            <span style={{ fontSize: titleFs, fontWeight: 700, color: labelColor, fontFamily: ctx.fontFamily }}>{node.label}</span>
            {node.subLabel && <span style={{ fontSize: subFs, color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>{node.subLabel}</span>}
          </div>
        )}
        {node.children.map((child, i) => (
          <React.Fragment key={i}>
            {renderNode(child, grid, values, ctx, [...currentPath, i], highlightPath)}
          </React.Fragment>
        ))}
      </div>
    )
  }

  return null
}

const GenericCardRenderer = forwardRef<HTMLDivElement, Props>(function GenericCardRenderer(
  { definition, values, fontFamily, background, isInteractive: _, noBackground, orientation = 'landscape', highlightPath },
  ref
) {
  const { cardWidth, cardHeight, grid, layout, defaultLabelFontScale, defaultContentFontScale, defaultPaddingScale } = definition[orientation]
  const { cellSize, gap } = grid
  const { theme } = definition
  const resolvedFont = fontFamily ?? definition.fontFamily

  const ctx: CardRenderContext = {
    fontFamily: resolvedFont,
    cardWidth,
    theme,
    fontSize: makeFontSizeTokens(cardWidth, definition.fontScale),
    defaultLabelFontScale,
    defaultContentFontScale,
    paddingScale: defaultPaddingScale ?? 1,
  }

  const bgValue: BackgroundValue | undefined =
    background ?? (definition.backgroundKey ? (values[definition.backgroundKey] as BackgroundValue | undefined) : undefined)

  const bg = noBackground
    ? 'transparent'
    : bgValue
      ? getBackgroundStyle(bgValue.type, bgValue.value, bgValue.base64 ?? null, CARD_BG_FALLBACK) as string
      : CARD_BG_FALLBACK

  const overlayValuesForInset = definition.overlayFixed
    ? { [definition.overlayKey!]: definition.overlayFixed }
    : values
  const pad = resolveInset(definition, overlayValuesForInset, cardWidth * 0.025)
  const innerWidth  = cardWidth  - pad.left - pad.right
  const innerHeight = cardHeight - pad.top  - pad.bottom

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
        borderRadius: definition.borderRadius ?? 20,
      }}
    >
      {/* オーバーレイ（背景の上・コンテンツの下） */}
      {definition.overlayKey && (() => {
        const overlayBlock = getComponent(definition.overlayKey!)
        if (!overlayBlock?.CardItem) return null
        const overlayValue = definition.overlayFixed ?? values[definition.overlayKey!] ?? overlayBlock.defaultValue
        return (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', borderRadius: definition.borderRadius ?? 20 }}>
            <overlayBlock.CardItem value={overlayValue} ctx={ctx} variant="default" />
          </div>
        )
      })()}

      {/* コンテンツエリア（overlay inset + innerPadding 分オフセット） */}
      <div
        style={{
          position: 'absolute',
          left: pad.left,
          top: pad.top,
          width: innerWidth,
          height: innerHeight,
          overflow: 'hidden',
          display: 'flex',
        }}
      >
{renderNode(layout, grid, values, ctx, [], highlightPath)}
      </div>
    </div>
  )
})

export default GenericCardRenderer
