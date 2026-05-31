'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { LayoutNode, FormSection } from '@/blocks/types'
import type { OverlayValue } from '@/blocks/overlay'

export type OrientationScales = {
  defaultLabelFontScale?: number
  defaultContentFontScale?: number
  defaultPaddingScale?: number
}

export type TemplateLayoutRow = {
  id: string
  label: string
  description: string | null
  is_published: boolean
  card_layout:        LayoutNode | null
  web_layout:         LayoutNode | null
  block_pool:         Record<string, unknown> | null | undefined
  form_sections:      FormSection[] | null
  orientation_scales: { card: OrientationScales; web: OrientationScales } | null
  overlay_config:     OverlayValue | null
  card_width:         number | null
  card_height:        number | null
  web_width:          number | null
  card_config:        {
    borderRadius?: number
    backgroundKey?: string
    overlayKey?: string
    card?: { grid?: { cellSize?: number; gap?: number } }
    web?:  { grid?: { cellSize?: number; gap?: number }; autoHeight?: boolean }
  } | null
  community_slugs: string[]
  sample_card_data: Record<string, unknown> | null
}

/** 単一テンプレート行を DB から取得 */
export async function fetchTemplateLayout(id: string): Promise<TemplateLayoutRow | null> {
  const supabase = await createClient()
  const SELECT = 'id, label, description, card_layout, web_layout, block_pool, form_sections, orientation_scales, overlay_config, card_width, card_height, web_width, card_config, sample_card_data, community_templates(community_slug)'

  const { data, error } = await supabase
    .from('templates')
    .select(SELECT)
    .eq('id', id)
    .single()

  if (error || !data) return null

  return {
    id:                 data.id,
    label:              data.label,
    description:        data.description,
    is_published:       false,
    card_layout:        data.card_layout        as LayoutNode | null,
    web_layout:         data.web_layout         as LayoutNode | null,
    block_pool:         data.block_pool         as Record<string, unknown> | null,
    form_sections:      data.form_sections      as FormSection[] | null,
    orientation_scales: data.orientation_scales as { card: OrientationScales; web: OrientationScales } | null,
    overlay_config:     data.overlay_config     as OverlayValue | null,
    card_width:         data.card_width         as number | null,
    card_height:        data.card_height        as number | null,
    web_width:          data.web_width          as number | null,
    card_config:        data.card_config        as TemplateLayoutRow['card_config'],
    community_slugs:    ((data.community_templates ?? []) as { community_slug: string }[]).map(r => r.community_slug),
    sample_card_data:   data.sample_card_data   as Record<string, unknown> | null,
  }
}

/** 全テンプレート行を DB から取得 */
export async function fetchTemplateLayouts(): Promise<Record<string, TemplateLayoutRow>> {
  const supabase = await createClient()
  const SELECT = 'id, label, description, card_layout, web_layout, block_pool, form_sections, orientation_scales, overlay_config, card_width, card_height, web_width, card_config, sample_card_data, community_templates(community_slug)'

  const { data, error } = await supabase
    .from('templates')
    .select(SELECT)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('fetchTemplateLayouts error:', error)
    return {}
  }

  return Object.fromEntries(
    (data ?? []).map(row => [
      row.id,
      {
        id:                 row.id,
        label:              row.label,
        description:        row.description,
        is_published:       false,
        card_layout:        row.card_layout        as LayoutNode | null,
        web_layout:         row.web_layout         as LayoutNode | null,
        block_pool:         row.block_pool         as Record<string, unknown> | null,
        form_sections:      row.form_sections      as FormSection[] | null,
        orientation_scales: row.orientation_scales as { card: OrientationScales; web: OrientationScales } | null,
        overlay_config:     row.overlay_config     as OverlayValue | null,
        card_width:         row.card_width         as number | null,
        card_height:        row.card_height        as number | null,
        web_width:          row.web_width          as number | null,
        card_config:        row.card_config        as TemplateLayoutRow['card_config'],
        community_slugs:    ((row.community_templates ?? []) as { community_slug: string }[]).map(r => r.community_slug),
        sample_card_data:   row.sample_card_data   as Record<string, unknown> | null,
      },
    ])
  )
}

export type CommunityRow = {
  slug: string
  label: string
  description: string | null
  sort_order: number
}

/** 全界隈を取得 */
export async function fetchCommunities(): Promise<CommunityRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('communities')
    .select('slug, label, description, sort_order')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('fetchCommunities error:', error)
    return []
  }
  return (data ?? []) as CommunityRow[]
}

/** 界隈を作成・更新（upsert） */
export async function saveCommunity(data: {
  slug: string
  label: string
  description?: string
  sort_order?: number
}): Promise<{ error: string | null }> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('communities')
    .upsert({
      slug:        data.slug,
      label:       data.label,
      description: data.description ?? null,
      sort_order:  data.sort_order ?? 0,
    }, { onConflict: 'slug' })
  return { error: error?.message ?? null }
}

/** 界隈の sort_order を一括更新 */
export async function updateCommunitySortOrders(
  items: { slug: string; sort_order: number }[]
): Promise<{ error: string | null }> {
  const supabase = createAdminClient()
  const results = await Promise.all(
    items.map(({ slug, sort_order }) =>
      supabase.from('communities').update({ sort_order }).eq('slug', slug)
    )
  )
  const err = results.find(r => r.error)?.error
  return { error: err?.message ?? null }
}

/** テンプレートを界隈に紐づける（insert or ignore） */
export async function linkTemplateToCommunity(
  templateId: string,
  communitySlug: string,
  sortOrder = 0,
): Promise<{ error: string | null }> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('community_templates')
    .upsert(
      { community_slug: communitySlug, template_id: templateId, sort_order: sortOrder },
      { onConflict: 'community_slug,template_id' },
    )
  return { error: error?.message ?? null }
}

/** テンプレートを新規作成（upsert）して動的部分も保存 */
export async function saveTemplateLayout(
  templateId: string,
  data: {
    label?:             string
    description?:       string
    card_layout:        LayoutNode
    web_layout:         LayoutNode
    form_sections:      FormSection[]
    orientation_scales: { card: OrientationScales; web: OrientationScales }
    overlay_config?:    OverlayValue | null
    block_pool?:        Record<string, unknown>
  }
): Promise<{ error: string | null }> {
  const supabase = createAdminClient()

  const payload: Record<string, unknown> = {
    id:                 templateId,
    card_layout:        data.card_layout,
    web_layout:         data.web_layout,
    form_sections:      data.form_sections,
    orientation_scales: data.orientation_scales,
    updated_at:         new Date().toISOString(),
  }
  if (data.label)       payload.label       = data.label
  if (data.description) payload.description = data.description
  if ('overlay_config' in data) payload.overlay_config = data.overlay_config ?? null
  if (data.block_pool !== undefined) payload.block_pool = data.block_pool

  const { error } = await supabase
    .from('templates')
    .upsert(payload, { onConflict: 'id' })

  return { error: error?.message ?? null }
}
