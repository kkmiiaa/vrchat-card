import React from 'react'
import type { CardTemplate, TemplateDefinition, FormSection, BackgroundValue } from '@/blocks/types'
import type { TemplateLayoutRow } from '@/lib/templateLayout'
import { getComponent } from '@/blocks/registry'
import GenericCardRenderer from '@/components/GenericCardRenderer'
import { CARD_LANDSCAPE_WIDTH, CARD_LANDSCAPE_HEIGHT, CARD_PORTRAIT_WIDTH } from '@/lib/cardDimensions'

/**
 * TemplateLayoutRow（DB 定義）から CardTemplate を生成する。
 * TS 静的定義（TemplateDefinition）への依存をなくし、DB 単体で動作する。
 *
 * definition を渡した場合は DB が優先で、なければ TS 定義をフォールバックとして使う。
 * フェーズ3ステップ5完了後は definition 引数は不要になる。
 */
export function buildCardTemplateFromDefinition(
  definition: TemplateDefinition | null,
  dbRow: TemplateLayoutRow | null,
): { template: CardTemplate; formSections: FormSection[] } {
  // ── block_pool ──────────────────────────────────────────────────────────
  const blockPool = {
    ...(definition?.blockPool ?? {}),
    ...(dbRow?.block_pool as TemplateDefinition['blockPool'] ?? {}),
  }

  // ── レイアウト ───────────────────────────────────────────────────────────
  const cardLayout   = dbRow?.card_layout   ?? definition?.card.layout   ?? { type: 'col' as const, children: [] }
  const webLayout    = dbRow?.web_layout    ?? definition?.web.layout    ?? { type: 'col' as const, children: [] }
  const overlayFixed = dbRow?.overlay_config ?? definition?.overlayFixed

  // ── サイズ ──────────────────────────────────────────────────────────────
  const cardWidth  = dbRow?.card_width  ?? definition?.card.cardWidth  ?? CARD_LANDSCAPE_WIDTH
  const cardHeight = dbRow?.card_height ?? definition?.card.cardHeight ?? CARD_LANDSCAPE_HEIGHT
  const webWidth   = dbRow?.web_width   ?? definition?.web.cardWidth   ?? CARD_PORTRAIT_WIDTH

  // ── card_config（grid・borderRadius 等） ─────────────────────────────────
  const cfg = dbRow?.card_config
  const borderRadius   = cfg?.borderRadius   ?? definition?.borderRadius  ?? 20
  const backgroundKey  = cfg?.backgroundKey  ?? definition?.backgroundKey ?? 'background'
  const overlayKey     = cfg?.overlayKey     ?? definition?.overlayKey    ?? 'overlay'
  const fixedBackground   = cfg?.fixedBackground   ?? undefined
  const defaultSurface  = (cfg?.defaultSurface as import('@/blocks/types').SurfaceVariant | undefined) ?? undefined
  const cardGrid      = cfg?.card?.grid    ?? definition?.card.grid     ?? { cellSize: 8, gap: 4 }
  const webGrid       = cfg?.web?.grid     ?? definition?.web.grid      ?? { cellSize: 8, gap: 4 }
  const webAutoHeight = cfg?.web?.autoHeight ?? definition?.web.autoHeight ?? true

  // ── orientation_scales ──────────────────────────────────────────────────
  const cardScales = dbRow?.orientation_scales?.card ?? {}
  const webScales  = dbRow?.orientation_scales?.web  ?? {}

  // ── resolvedDefinition（GenericCardRenderer に渡す）──────────────────────
  const resolvedDefinition: TemplateDefinition = {
    id:           (definition?.id ?? dbRow?.id ?? 'unknown') as TemplateDefinition['id'],
    label:        dbRow?.label ?? definition?.label ?? '',
    theme:        (cfg?.theme as TemplateDefinition['theme'] | undefined) ?? definition?.theme ?? { accent: '#00AADB', text: '#1f2937', subText: '#9ca3af', bg: 'rgba(255,255,255,0.85)' },
    fontFamily:   cfg?.fontFamily ?? definition?.fontFamily ?? 'sans-serif',
    borderRadius,
    backgroundKey,
    overlayKey,
    blockPool,
    overlayFixed,
    card: {
      ...(definition?.card ?? {}),
      cardWidth,
      cardHeight,
      grid: { cellSize: cardGrid.cellSize ?? 8, gap: cardGrid.gap ?? 4 },
      layout: cardLayout,
      ...cardScales,
    },
    web: {
      ...(definition?.web ?? {}),
      cardWidth: webWidth,
      autoHeight: webAutoHeight,
      grid: { cellSize: webGrid.cellSize ?? 8, gap: webGrid.gap ?? 4 },
      layout: webLayout,
      ...webScales,
    },
  }

  const formSections: FormSection[] = dbRow?.form_sections ?? definition?.formSections ?? []

  // ── blocks 配列（useCardValues・FormItem 解決に使用）─────────────────────
  const seenDataKeys = new Set<string>()
  const poolBlocks = Object.values(blockPool ?? {})
    .map(entry => {
      const component = getComponent(entry.componentKey)
      return {
        key:          entry.dataKey,
        formLabel:    typeof entry.label === 'string' ? entry.label : undefined,
        defaultValue: component?.defaultValue ?? null,
        blockConfig:  entry.blockConfig,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        FormItem:     component?.FormItem ?? ((() => null) as any),
        isEmpty:      component?.isEmpty,
      }
    })
    .filter(b => {
      if (!b.key || seenDataKeys.has(b.key)) return false
      seenDataKeys.add(b.key)
      return true
    })

  // backgroundKey が blockPool になければ background コンポーネントを追加
  const bgComponent = !seenDataKeys.has(backgroundKey) ? getComponent('background') : null
  const bgBlock = bgComponent ? [{
    key:          backgroundKey,
    formLabel:    undefined,
    defaultValue: bgComponent.defaultValue ?? null,
    blockConfig:  undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FormItem:     bgComponent.FormItem as any,
    isEmpty:      bgComponent.isEmpty,
  }] : []

  const blocks = [...poolBlocks, ...bgBlock]

  const template: CardTemplate = {
    id:           resolvedDefinition.id as string,
    title:        dbRow?.label ?? definition?.label ?? '',
    desc:         dbRow?.description ?? '',
    badge:        '',
    badgeColor:   '',
    communities:  dbRow?.community_slugs ?? [],
    communitySlug: dbRow?.community_slugs?.[0] ?? undefined,
    cardWidth,
    cardHeight:   cardHeight ?? cardWidth,
    webWidth,
    webHeight:    definition?.web.cardHeight ?? webWidth,
    sections:     [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    blocks: blocks as any,

    CardRenderer({ values, fontFamily, background, noBackground, isInteractive, orientation, cardUrl, userUrl }) {
      return React.createElement(GenericCardRenderer, {
        definition: resolvedDefinition,
        orientation: orientation === 'web' ? 'web' : 'card',
        values,
        fontFamily,
        noBackground: true,
        background: fixedBackground ?? background,
        isInteractive,
        defaultSurface,
        cardUrl,
        userUrl,
      })
    },

    PreviewCard() {
      const sampleData = dbRow?.sample_card_data ?? {}
      const sampleBg = backgroundKey
        ? (sampleData[backgroundKey] as BackgroundValue | undefined)
        : undefined
      return React.createElement(GenericCardRenderer, {
        definition: resolvedDefinition,
        orientation: 'card',
        values:      sampleData,
        fontFamily:  resolvedDefinition.fontFamily,
        background:  fixedBackground ?? sampleBg,
        defaultSurface,
      })
    },
  }

  return { template, formSections }
}
