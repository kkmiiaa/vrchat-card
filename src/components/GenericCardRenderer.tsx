'use client'

import React, { forwardRef } from 'react'
import type {
  TemplateDefinition,
  BlockValues,
  CardRenderContext,
  LayoutNode,
  Block,
  TemplateGridDef,
} from '@/blocks/types'
import { cellsToPixels, makeFontSizeTokens, SURFACE_STYLE } from '@/blocks/types'
import { getComponent } from '@/blocks/registry'
import { getBackgroundStyle, CARD_BG_FALLBACK } from '@/utils/backgroundUtils'
import type { BackgroundValue } from '@/blocks/types'
import { renderIcon } from '@/blocks/iconRegistry'

type Props = {
  definition: TemplateDefinition
  values: BlockValues
  fontFamily?: string
  background?: BackgroundValue
  isInteractive?: boolean
  noBackground?: boolean
  orientation?: 'card' | 'web'
  /** 選択中のノードパス（admin ビルダー用ハイライト） */
  highlightPath?: number[]
  /** カード個別ページ URL（QR コード用） */
  cardUrl?: string
  /** ユーザーページ URL（QR コード用） */
  userUrl?: string
  /** ブロックの surface 未指定時のフォールバック（デザインプリセット） */
  defaultSurface?: import('@/blocks/types').SurfaceVariant
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

function resolveRef(
  node: LayoutNode,
  blockPool: TemplateDefinition['blockPool'],
): LayoutNode {
  if (node.type !== 'ref') return node
  const poolEntry = blockPool?.[node.blockId]
  if (!poolEntry) return { type: 'block', componentKey: '', dataKey: node.blockId, variant: 'simple' }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { type: _type, blockId: _blockId, ...refOverrides } = node
  const merged = { type: 'block' as const, ...poolEntry, ...Object.fromEntries(Object.entries(refOverrides).filter(([, v]) => v !== undefined)) }
  return merged as Block
}

function renderNode(
  node: LayoutNode,
  grid: TemplateGridDef,
  values: BlockValues,
  ctx: CardRenderContext,
  currentPath: number[],
  highlightPath: number[] | undefined,
  blockPool?: TemplateDefinition['blockPool'],
): React.ReactNode {
  node = resolveRef(node, blockPool)
  const { cellSize, gap: gapUnit } = grid
  const isHighlighted = highlightPath !== undefined &&
    JSON.stringify(currentPath) === JSON.stringify(highlightPath)

  const highlight: React.CSSProperties = isHighlighted
    ? { outline: '2px solid #00AADB', outlineOffset: '-2px' }
    : {}

  if (node.type === 'block') {
    const block = getComponent(node.componentKey)
    if (!block?.CardItem) return null
    const value = values[node.dataKey] ?? block.defaultValue

    const hasFlex = node.flex !== undefined
    const contentScale = (node.contentFontScale ?? 1) * (ctx.defaultContentFontScale ?? 1)
    const resolvedSurface = node.surface ?? ctx.defaultSurface
    const isInternalSurface = block.surfaceMode === 'internal'

    const blockCtx = {
      ...(contentScale !== 1 ? { ...ctx, fontSize: {
        xs: ctx.fontSize.xs * contentScale,
        sm: ctx.fontSize.sm * contentScale,
        md: ctx.fontSize.md * contentScale,
        lg: ctx.fontSize.lg * contentScale,
        xl: ctx.fontSize.xl * contentScale,
      }} : ctx),
      ...(isInternalSurface ? { surface: resolvedSurface } : {}),
    }

    const cardContent = block.CardItem({ value, ctx: blockCtx, variant: node.variant, blockConfig: node.blockConfig, isInteractive: ctx.isInteractive })
    if (cardContent === null || cardContent === undefined) return null

    // surface コンテナスタイル（surfaceMode:'internal' のブロックは外側コンテナを適用しない）
    const hasSurface = !isInternalSurface && !!resolvedSurface && resolvedSurface !== 'transparent'
    const ss = hasSurface ? SURFACE_STYLE[resolvedSurface!] : null
    const surfaceProps: React.CSSProperties = ss ? {
      background: ss.background,
      border: ss.border,
      boxShadow: ss.boxShadow,
      borderRadius: ctx.cardWidth * 0.006,
      padding: `${ctx.cardWidth * 0.006 * ctx.paddingScale}px ${ctx.cardWidth * 0.008 * ctx.paddingScale}px`,
    } : {}

    // ラベル要素（GenericCardRenderer が一元管理）
    const labelScale = (node.labelFontScale ?? 1) * (ctx.defaultLabelFontScale ?? 1)
    const titleFs = blockCtx.fontSize.sm * labelScale
    const subFs   = blockCtx.fontSize.xs * labelScale
    const labelColor = node.labelColor ?? ctx.theme.text
    const labelEl = node.label ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: ctx.cardWidth * 0.004, flexShrink: 0 }}>
        {node.labelIcon && <span style={{ display: 'inline-flex', alignItems: 'center', color: labelColor, fontSize: titleFs, lineHeight: 1 }}>{renderIcon(node.labelIcon, titleFs)}</span>}
        <span style={{ fontSize: titleFs, fontWeight: 700, color: labelColor, fontFamily: ctx.fontFamily }}>{node.label}</span>
        {node.subLabel && <span style={{ fontSize: subFs, color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>{node.subLabel}</span>}
      </div>
    ) : null

    const baseStyle: React.CSSProperties = {
      minWidth: 0, minHeight: 0,
      flexGrow: hasFlex ? node.flex : 0,
      flexShrink: hasFlex ? 1 : 0,
      flexBasis: hasFlex ? 0 : 'auto',
      ...(node.minW !== undefined && !hasFlex ? { width: cellsToPixels(node.minW, cellSize) } : {}),
      ...(node.alignSelf ? { alignSelf: node.alignSelf } : {}),
      ...highlight,
    }

    // labelInset: ラベルを surface コンテナ内に配置
    if (node.labelInset && node.label) {
      const isRow = node.labelInsetDir === 'row'
      return (
        <div style={{
          ...baseStyle,
          display: 'flex',
          flexDirection: isRow ? 'row' : 'column',
          gap: isRow ? ctx.cardWidth * 0.005 : ctx.cardWidth * 0.003,
          alignItems: isRow ? 'center' : 'stretch',
          overflow: 'hidden',
          ...(node.minH !== undefined && !hasFlex ? { height: cellsToPixels(node.minH, cellSize) } : {}),
          ...surfaceProps,
        }}>
          {labelEl}
          <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0, display: 'flex', alignItems: 'stretch' }}>
            {cardContent}
          </div>
        </div>
      )
    }

    // ラベル外置き: label → surface コンテナ → content の縦並び
    if (node.label) {
      return (
        <div style={{ ...baseStyle, display: 'flex', flexDirection: 'column', gap: ctx.cardWidth * 0.004, minWidth: 0 }}>
          {labelEl}
          <div style={{
            flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0,
            display: 'flex', alignItems: 'stretch', overflow: 'hidden',
            ...(node.minH !== undefined ? { minHeight: cellsToPixels(node.minH, cellSize) } : {}),
            ...surfaceProps,
          }}>
            {cardContent}
          </div>
        </div>
      )
    }

    // ラベルなし: surface コンテナのみ
    return (
      <div style={{
        ...baseStyle,
        display: 'flex',
        alignItems: hasFlex || node.minH !== undefined ? 'stretch' : 'flex-start',
        overflow: 'hidden',
        ...(node.minH !== undefined && !hasFlex ? { height: cellsToPixels(node.minH, cellSize) } : {}),
        ...surfaceProps,
      }}>
        {cardContent}
      </div>
    )
  }

  if (node.type === 'row') {
    const nodeGap = (node.gap ?? 2) * gapUnit
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
      ...(node.minH !== undefined && !hasFlex ? { minHeight: cellsToPixels(node.minH, cellSize) } : {}),
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
      flexBasis: 'auto',
      ...(node.justify ? { justifyContent: node.justify } : {}),
      ...(node.alignItems ? { alignItems: node.alignItems } : {}),
    }
    return (
      <div style={outerStyle}>
        {node.label && (
          <div style={{ display: 'flex', alignItems: 'center', gap: ctx.cardWidth * 0.004, flexShrink: 0 }}>
            {node.labelIcon && <span style={{ display: 'inline-flex', alignItems: 'center', color: labelColor, fontSize: titleFs, lineHeight: 1 }}>{renderIcon(node.labelIcon, titleFs)}</span>}
            <span style={{ fontSize: titleFs, fontWeight: 700, color: labelColor, fontFamily: ctx.fontFamily }}>{node.label}</span>
            {node.subLabel && <span style={{ fontSize: subFs, color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>{node.subLabel}</span>}
          </div>
        )}
        <div style={innerStyle}>
          {node.children.map((child, i) => (
            <React.Fragment key={i}>
              {renderNode(child, grid, values, ctx, [...currentPath, i], highlightPath, blockPool)}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  if (node.type === 'col') {
    const spacingJustify = node.justify === 'space-between' || node.justify === 'space-around' || node.justify === 'space-evenly'
    const nodeGap = node.justify && spacingJustify ? 0 : (node.gap ?? 2) * gapUnit
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
      flexGrow: hasFlex ? node.flex : 0,
      flexShrink: hasFlex ? 1 : 0,
      flexBasis: hasFlex ? 0 : 'auto',
      ...(node.justify ? { justifyContent: node.justify } : {}),
      ...(node.alignItems ? { alignItems: node.alignItems } : {}),
      ...(node.minW !== undefined && !hasFlex ? { width: cellsToPixels(node.minW, cellSize) } : {}),
      ...((node as { minH?: number }).minH !== undefined && !hasFlex ? { minHeight: cellsToPixels((node as { minH?: number }).minH!, cellSize) } : {}),
      ...highlight,
    }
    return (
      <div style={style}>
        {node.label && (
          <div style={{ display: 'flex', alignItems: 'center', gap: ctx.cardWidth * 0.004, flexShrink: 0 }}>
            {node.labelIcon && <span style={{ display: 'inline-flex', alignItems: 'center', color: labelColor, fontSize: titleFs, lineHeight: 1 }}>{renderIcon(node.labelIcon, titleFs)}</span>}
            <span style={{ fontSize: titleFs, fontWeight: 700, color: labelColor, fontFamily: ctx.fontFamily }}>{node.label}</span>
            {node.subLabel && <span style={{ fontSize: subFs, color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>{node.subLabel}</span>}
          </div>
        )}
        {node.children.map((child, i) => (
          <React.Fragment key={i}>
            {renderNode(child, grid, values, ctx, [...currentPath, i], highlightPath, blockPool)}
          </React.Fragment>
        ))}
      </div>
    )
  }

  return null
}

const GenericCardRenderer = forwardRef<HTMLDivElement, Props>(function GenericCardRenderer(
  { definition, values, fontFamily, background, isInteractive, noBackground, orientation = 'card', highlightPath, cardUrl, userUrl, defaultSurface },
  ref
) {
  const { cardWidth, cardHeight, autoHeight, grid, layout, defaultLabelFontScale, defaultContentFontScale, defaultPaddingScale } = definition[orientation]
  const { cellSize, gap: gapUnit } = grid
  const { theme } = definition
  const resolvedFont = fontFamily ?? definition.fontFamily
  const isAutoHeight = autoHeight === true

  const ctx: CardRenderContext = {
    fontFamily: resolvedFont,
    cardWidth,
    theme,
    fontSize: makeFontSizeTokens(cardWidth, definition.fontScale),
    defaultLabelFontScale,
    defaultContentFontScale,
    paddingScale: defaultPaddingScale ?? 1,
    cardUrl,
    userUrl,
    isInteractive,
    defaultSurface,
  }

  const bgValue: BackgroundValue | undefined = background ?? undefined

  const bg = noBackground
    ? 'transparent'
    : bgValue
      ? getBackgroundStyle(bgValue.type, bgValue.value, bgValue.base64 ?? null, CARD_BG_FALLBACK) as string
      : CARD_BG_FALLBACK

  const overlayValuesForInset = definition.overlayFixed
    ? { [definition.overlayKey!]: definition.overlayFixed }
    : values
  const pad = resolveInset(definition, overlayValuesForInset, cardWidth * 0.025)
  const innerWidth = cardWidth - pad.left - pad.right
  const innerHeight = cardHeight !== undefined ? cardHeight - pad.top - pad.bottom : undefined

  if (isAutoHeight) {
    return (
      <div
        ref={ref}
        style={{
          width: cardWidth,
          position: 'relative',
          fontFamily: resolvedFont,
          background: bg,
          borderRadius: definition.borderRadius ?? 20,
          overflow: 'hidden',
        }}
      >
        {/* コンテンツ（通常フロー）が親の高さを決定する */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            paddingTop: pad.top,
            paddingBottom: pad.bottom,
            paddingLeft: pad.left,
            paddingRight: pad.right,
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}
        >
          {renderNode(layout, grid, values, ctx, [], highlightPath, definition.blockPool)}
        </div>
        {/* オーバーレイ：コンテンツが確定した高さに追従する */}
        {definition.overlayKey && (() => {
          const overlayBlock = getComponent(definition.overlayKey!)
          if (!overlayBlock?.CardItem) return null
          const overlayValue = definition.overlayFixed ?? values[definition.overlayKey!] ?? overlayBlock.defaultValue
          return (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: definition.borderRadius ?? 20 }}>
              <overlayBlock.CardItem value={overlayValue} ctx={ctx} variant="default" />
            </div>
          )
        })()}
      </div>
    )
  }

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
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: definition.borderRadius ?? 20 }}>
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
          display: 'flex',
        }}
      >
{renderNode(layout, grid, values, ctx, [], highlightPath, definition.blockPool)}
      </div>
    </div>
  )
})

export default GenericCardRenderer
