import React from 'react'
import type { CardTemplate, TemplateDefinition, FormSection } from '@/blocks/types'
import type { TemplateLayoutRow } from '@/lib/templateLayout'
import { getComponent } from '@/blocks/registry'
import GenericCardRenderer from '@/components/GenericCardRenderer'

/**
 * TemplateDefinition（TS 静的定義）と TemplateLayoutRow（DB 動的定義）を合成して
 * GenericCardRenderer を使う CardTemplate を生成する。
 *
 * CardEditor / CardScaledView はそのまま再利用できる。
 */
export function buildCardTemplateFromDefinition(
  definition: TemplateDefinition,
  dbRow: TemplateLayoutRow | null,
): { template: CardTemplate; formSections: FormSection[] } {
  // DB と TS 定義をマージ（DB が優先）
  const blockPool = {
    ...(definition.blockPool ?? {}),
    ...(dbRow?.block_pool as TemplateDefinition['blockPool'] ?? {}),
  }

  const cardLayout    = dbRow?.card_layout    ?? definition.card.layout
  const webLayout     = dbRow?.web_layout     ?? definition.web.layout
  const overlayFixed  = dbRow?.overlay_config ?? definition.overlayFixed
  const cardScales    = dbRow?.orientation_scales?.card ?? {}
  const webScales     = dbRow?.orientation_scales?.web  ?? {}

  // カードサイズは DB 優先、なければ TS 定義のフォールバック
  const resolvedCardWidth  = dbRow?.card_width  ?? definition.card.cardWidth
  const resolvedCardHeight = dbRow?.card_height ?? definition.card.cardHeight
  const resolvedWebWidth   = dbRow?.web_width   ?? definition.web.cardWidth

  const resolvedDefinition: TemplateDefinition = {
    ...definition,
    blockPool,
    overlayFixed,
    card: { ...definition.card, layout: cardLayout, cardWidth: resolvedCardWidth, cardHeight: resolvedCardHeight, ...cardScales },
    web:  { ...definition.web,  layout: webLayout,  cardWidth: resolvedWebWidth,  ...webScales  },
  }

  const formSections: FormSection[] = dbRow?.form_sections ?? definition.formSections ?? []

  // blockPool → CardEditor が必要とする blocks 配列に変換
  // (useCardValues の初期値 + FormItem の解決に使用)
  const seenDataKeys = new Set<string>()
  const blocks = Object.values(blockPool ?? {})
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
      if (seenDataKeys.has(b.key)) return false
      seenDataKeys.add(b.key)
      return true
    })


  const template: CardTemplate = {
    id:           definition.id as 'v1' | 'v2',
    title:        dbRow?.label ?? definition.label,
    desc:         dbRow?.description ?? '',
    badge:        '',
    badgeColor:   '',
    communities:  ['VRChat'],
    communitySlug:'vrchat',
    cardWidth:    resolvedCardWidth,
    cardHeight:   resolvedCardHeight ?? resolvedCardWidth,
    webWidth:     resolvedWebWidth,
    webHeight:    resolvedDefinition.web.cardHeight ?? resolvedWebWidth,
    sections:     [],  // propFormSections を使うため不要
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    blocks:       blocks as any,

    CardRenderer({ values, fontFamily, noBackground, orientation, cardUrl, userUrl }) {
      return React.createElement(GenericCardRenderer, {
        definition: resolvedDefinition,
        orientation: orientation === 'web' ? 'web' : 'card',
        values,
        fontFamily,
        noBackground,
        cardUrl,
        userUrl,
      })
    },

    PreviewCard() {
      return React.createElement(GenericCardRenderer, {
        definition: resolvedDefinition,
        orientation: 'card',
        values:      {},
        fontFamily:  definition.fontFamily,
      })
    },
  }

  return { template, formSections }
}
