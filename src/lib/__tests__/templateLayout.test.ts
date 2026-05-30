import { describe, it, expect, vi, beforeEach } from 'vitest'

// 'use server' ディレクティブを持つモジュールのため、依存をモックしてから import
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockOrder = vi.fn()
const mockUpsert = vi.fn()
const mockUpdate = vi.fn()

function makeChain(terminal: () => unknown) {
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn(() => chain)
  chain.eq     = vi.fn(() => chain)
  chain.order  = vi.fn(() => chain)
  chain.single = terminal
  chain.upsert = terminal
  chain.update = vi.fn(() => chain)
  return chain
}

const mockSupabase = {
  from: vi.fn(),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient:      vi.fn(async () => mockSupabase),
  createAdminClient: vi.fn(() => mockSupabase),
}))

const { fetchTemplateLayout, fetchTemplateLayouts, fetchCommunities, saveCommunity, updateCommunitySortOrders, linkTemplateToCommunity, saveTemplateLayout } = await import('../templateLayout')

// ─── fetchTemplateLayout ──────────────────────────────────────────────────────

describe('fetchTemplateLayout', () => {
  beforeEach(() => vi.clearAllMocks())

  it('DB 行を TemplateLayoutRow に整形して返す', async () => {
    const row = {
      id: 'v1',
      label: 'V1',
      description: null,
      card_layout: { type: 'col' },
      web_layout: { type: 'row' },
      block_pool: { name: {} },
      form_sections: [{ title: 'section1' }],
      orientation_scales: { card: { defaultLabelFontScale: 1 }, web: {} },
      overlay_config: null,
    }
    const chain = makeChain(vi.fn(async () => ({ data: row, error: null })))
    mockSupabase.from.mockReturnValue(chain)

    const result = await fetchTemplateLayout('v1')

    expect(result).toMatchObject({
      id: 'v1',
      label: 'V1',
      description: null,
      card_layout: { type: 'col' },
      web_layout: { type: 'row' },
      block_pool: { name: {} },
      form_sections: [{ title: 'section1' }],
      orientation_scales: { card: { defaultLabelFontScale: 1 }, web: {} },
      overlay_config: null,
    })
  })

  it('該当 ID が無いとき null を返す', async () => {
    const chain = makeChain(vi.fn(async () => ({ data: null, error: { message: 'not found' } })))
    mockSupabase.from.mockReturnValue(chain)

    const result = await fetchTemplateLayout('nonexistent')
    expect(result).toBeNull()
  })
})

// ─── fetchTemplateLayouts ────────────────────────────────────────────────────

describe('fetchTemplateLayouts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('Record<id, row> を正しく構築する', async () => {
    const rows = [
      { id: 'v1', label: 'V1', description: null, card_layout: null, web_layout: null, block_pool: null, form_sections: null, orientation_scales: null, overlay_config: null },
      { id: 'v2', label: 'V2', description: 'desc', card_layout: null, web_layout: null, block_pool: null, form_sections: null, orientation_scales: null, overlay_config: null },
    ]
    const chain = { ...makeChain(vi.fn()), order: vi.fn(async () => ({ data: rows, error: null })) }
    chain.select = vi.fn(() => chain)
    mockSupabase.from.mockReturnValue(chain)

    const result = await fetchTemplateLayouts()

    expect(Object.keys(result)).toEqual(['v1', 'v2'])
    expect(result['v1'].label).toBe('V1')
    expect(result['v2'].description).toBe('desc')
  })

  it('エラー時は空オブジェクトを返す', async () => {
    const chain = { ...makeChain(vi.fn()), order: vi.fn(async () => ({ data: null, error: { message: 'db error' } })) }
    chain.select = vi.fn(() => chain)
    mockSupabase.from.mockReturnValue(chain)

    const result = await fetchTemplateLayouts()
    expect(result).toEqual({})
  })

  it('form_sections が null のとき null のまま返す', async () => {
    const rows = [
      { id: 'v1', label: 'V1', description: null, card_layout: null, web_layout: null, block_pool: null, form_sections: null, orientation_scales: null, overlay_config: null },
    ]
    const chain = { ...makeChain(vi.fn()), order: vi.fn(async () => ({ data: rows, error: null })) }
    chain.select = vi.fn(() => chain)
    mockSupabase.from.mockReturnValue(chain)

    const result = await fetchTemplateLayouts()
    expect(result['v1'].form_sections).toBeNull()
  })
})

// ─── fetchCommunities ────────────────────────────────────────────────────────

describe('fetchCommunities', () => {
  beforeEach(() => vi.clearAllMocks())

  it('コミュニティ行の配列を返す', async () => {
    const rows = [{ slug: 'vrchat', label: 'VRChat', description: null, sort_order: 0 }]
    const chain = { ...makeChain(vi.fn()), order: vi.fn(async () => ({ data: rows, error: null })) }
    chain.select = vi.fn(() => chain)
    mockSupabase.from.mockReturnValue(chain)

    const result = await fetchCommunities()
    expect(result).toEqual(rows)
  })

  it('エラー時は空配列を返す', async () => {
    const chain = { ...makeChain(vi.fn()), order: vi.fn(async () => ({ data: null, error: { message: 'err' } })) }
    chain.select = vi.fn(() => chain)
    mockSupabase.from.mockReturnValue(chain)

    const result = await fetchCommunities()
    expect(result).toEqual([])
  })
})

// ─── saveCommunity ───────────────────────────────────────────────────────────

describe('saveCommunity', () => {
  beforeEach(() => vi.clearAllMocks())

  it('成功時は error: null を返す', async () => {
    const chain = makeChain(vi.fn(async () => ({ error: null })))
    mockSupabase.from.mockReturnValue(chain)

    const result = await saveCommunity({ slug: 'vrchat', label: 'VRChat' })
    expect(result).toEqual({ error: null })
  })

  it('DB エラー時はメッセージを返す', async () => {
    const chain = makeChain(vi.fn(async () => ({ error: { message: 'upsert failed' } })))
    mockSupabase.from.mockReturnValue(chain)

    const result = await saveCommunity({ slug: 'vrchat', label: 'VRChat' })
    expect(result).toEqual({ error: 'upsert failed' })
  })
})

// ─── saveTemplateLayout ──────────────────────────────────────────────────────

describe('saveTemplateLayout', () => {
  beforeEach(() => vi.clearAllMocks())

  it('成功時は error: null を返す', async () => {
    const chain = makeChain(vi.fn(async () => ({ error: null })))
    mockSupabase.from.mockReturnValue(chain)

    const result = await saveTemplateLayout('v1', {
      card_layout: { type: 'col', children: [] },
      web_layout:  { type: 'row', children: [] },
      form_sections: [],
      orientation_scales: { card: {}, web: {} },
    })
    expect(result).toEqual({ error: null })
  })

  it('label / description が指定された場合 payload に含まれる', async () => {
    let capturedPayload: unknown = null
    const chain = {
      upsert: vi.fn(async (payload: unknown) => {
        capturedPayload = payload
        return { error: null }
      }),
    }
    mockSupabase.from.mockReturnValue(chain)

    await saveTemplateLayout('v1', {
      label: 'My Label',
      description: 'My Desc',
      card_layout: { type: 'col', children: [] },
      web_layout:  { type: 'row', children: [] },
      form_sections: [],
      orientation_scales: { card: {}, web: {} },
    })

    expect(capturedPayload).toMatchObject({ label: 'My Label', description: 'My Desc', id: 'v1' })
  })
})
