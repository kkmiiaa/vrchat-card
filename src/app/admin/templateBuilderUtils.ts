import type { LayoutNode, BlockValues, FormSection, FormNode, TemplateDefinition } from '@/blocks/types'
import { getComponent } from '@/blocks/registry'
import type { TemplateLayoutRow } from '@/lib/templateLayout'

// ─── ブロックエントリ収集 ────────────────────────────────────────────────────

export type BlockEntry = {
  componentKey: string
  dataKey: string
  blockConfig?: Record<string, unknown>
  formLabel?: string
  hideWhenEmpty?: boolean
}

export function collectBlockEntries(
  node: LayoutNode,
  seen = new Set<string>(),
  result: BlockEntry[] = [],
  blockPool?: TemplateDefinition['blockPool'],
): BlockEntry[] {
  if (node.type === 'ref') {
    const poolEntry = blockPool?.[node.blockId]
    if (poolEntry && !seen.has(poolEntry.dataKey)) {
      seen.add(poolEntry.dataKey)
      result.push({
        componentKey: poolEntry.componentKey,
        dataKey:      poolEntry.dataKey,
        blockConfig:  poolEntry.blockConfig,
        formLabel:    poolEntry.formLabel,
        hideWhenEmpty: poolEntry.hideWhenEmpty,
      })
    }
  } else if (node.type === 'block') {
    if (!seen.has(node.dataKey)) {
      seen.add(node.dataKey)
      result.push({
        componentKey: node.componentKey,
        dataKey:      node.dataKey,
        blockConfig:  node.blockConfig,
        formLabel:    node.formLabel,
        hideWhenEmpty: node.hideWhenEmpty,
      })
    }
  } else {
    node.children.forEach(c => collectBlockEntries(c, seen, result, blockPool))
  }
  return result
}

export function collectAllDataKeys(node: LayoutNode, result = new Set<string>(), blockPool?: TemplateDefinition['blockPool']): Set<string> {
  if (node.type === 'ref') {
    const poolEntry = blockPool?.[node.blockId]
    if (poolEntry) result.add(poolEntry.dataKey)
  } else if (node.type === 'block') {
    result.add(node.dataKey)
  } else {
    node.children.forEach(c => collectAllDataKeys(c, result, blockPool))
  }
  return result
}

export function generateDataKey(componentKey: string, usedKeys: Set<string>): string {
  let i = 1
  while (usedKeys.has(`${componentKey}${i}`)) i++
  return `${componentKey}${i}`
}

// ─── デフォルト値収集 ────────────────────────────────────────────────────────

export function collectDefaultValues(node: LayoutNode, blockPool?: TemplateDefinition['blockPool']): BlockValues {
  const entries = collectBlockEntries(node, undefined, undefined, blockPool)
  const result: BlockValues = {}
  entries.forEach(({ componentKey, dataKey }) => {
    const block = getComponent(componentKey)
    if (block) result[dataKey] = block.defaultValue
  })
  return result
}

// ─── フォームセクション解決 ──────────────────────────────────────────────────

export function makeDefaultFormSections(d: TemplateDefinition): FormSection[] {
  const designItems: FormNode[] = [{ type: 'font' }]
  if (d.backgroundKey) designItems.push({ type: 'block', dataKey: d.backgroundKey })
  return [{ title: 'カードデザイン', items: designItems, defaultOpen: true }]
}

export function resolveFormSections(
  d: TemplateDefinition,
  savedLayouts: Record<string, TemplateLayoutRow> = {},
): FormSection[] {
  const fromDb = savedLayouts[d.id]?.form_sections
  if (fromDb?.length) return fromDb
  if (d.formSections?.length) return d.formSections
  return makeDefaultFormSections(d)
}

// ─── saveTemplateLayout payload 構築 ─────────────────────────────────────────

export type SavePayload = {
  id: string
  card_layout: LayoutNode
  web_layout: LayoutNode
  block_pool?: Record<string, unknown>
  form_sections: FormSection[]
  orientation_scales: {
    card: Record<string, unknown>
    web: Record<string, unknown>
  }
  updated_at: string
  label?: string
  description?: string
}

export function buildSavePayload(
  templateId: string,
  data: {
    label?: string
    description?: string
    card_layout: LayoutNode
    web_layout: LayoutNode
    block_pool?: Record<string, unknown>
    form_sections: FormSection[]
    orientation_scales: { card: Record<string, unknown>; web: Record<string, unknown> }
  },
): SavePayload {
  const payload: SavePayload = {
    id:                 templateId,
    card_layout:        data.card_layout,
    web_layout:         data.web_layout,
    form_sections:      data.form_sections,
    orientation_scales: data.orientation_scales,
    updated_at:         new Date().toISOString(),
  }
  if (data.block_pool)  payload.block_pool  = data.block_pool
  if (data.label)       payload.label       = data.label
  if (data.description) payload.description = data.description
  return payload
}
