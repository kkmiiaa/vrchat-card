/**
 * background を card_data と分離して保存する API 挙動のテスト
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockSelect = vi.fn()
const mockEq    = vi.fn()
const mockSingle = vi.fn()
const mockCount  = vi.fn()

function makeChain() {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  chain.select   = vi.fn().mockReturnValue(chain)
  chain.insert   = mockInsert
  chain.update   = mockUpdate
  chain.eq       = vi.fn().mockReturnValue(chain)
  chain.single   = vi.fn().mockResolvedValue({ data: { id: 'card-1' }, error: null })
  return chain
}

const mockGetUser = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: vi.fn(() => makeChain()),
  })),
}))

beforeEach(() => {
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  mockInsert.mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: { id: 'card-1' }, error: null }),
    }),
  })
  mockUpdate.mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
  })
})

// プラン制限 mock（Pro ユーザー扱いにして制限をスキップ）
vi.mock('@/lib/plans', () => ({ FREE_CARD_LIMIT: 999 }))

describe('POST /api/cards — background を card_data から分離', () => {
  it('background フィールドを card_data と別に insert する', async () => {
    const { POST } = await import('../route')
    const bg = { type: 'color', value: '#ff0000' }

    const req = new NextRequest('http://localhost/api/cards', {
      method: 'POST',
      body: JSON.stringify({
        templateId: 'v1',
        cardData: { name: 'テスト', gender: { tag: 'male' } },
        background: bg,
      }),
    })

    await POST(req)

    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      background: bg,
    }))
    // card_data に background が混入していない
    const insertArg = mockInsert.mock.calls[0][0]
    expect(insertArg.card_data).not.toHaveProperty('background')
  })

  it('background なしで作成した場合、card_data に background が入らない', async () => {
    const { POST } = await import('../route')

    const req = new NextRequest('http://localhost/api/cards', {
      method: 'POST',
      body: JSON.stringify({
        templateId: 'v1',
        cardData: { name: 'テスト' },
      }),
    })

    await POST(req)

    const insertArg = mockInsert.mock.calls[0][0]
    expect(insertArg.card_data).not.toHaveProperty('background')
  })
})

describe('POST /api/cards — visibility デフォルト値', () => {
  it('visibility を指定しない場合、デフォルトは private（下書き）', async () => {
    const { POST } = await import('../route')

    const req = new NextRequest('http://localhost/api/cards', {
      method: 'POST',
      body: JSON.stringify({ templateId: 'v1' }),
    })

    await POST(req)

    const insertArg = mockInsert.mock.lastCall![0]
    expect(insertArg.visibility).toBe('private')
  })

  it('visibility を明示指定した場合はその値が使われる', async () => {
    const { POST } = await import('../route')

    const req = new NextRequest('http://localhost/api/cards', {
      method: 'POST',
      body: JSON.stringify({ templateId: 'v1', visibility: 'public' }),
    })

    await POST(req)

    const insertArg = mockInsert.mock.lastCall![0]
    expect(insertArg.visibility).toBe('public')
  })
})

describe('PATCH /api/cards/[cardId] — background を card_data から分離', () => {
  it('background フィールドを card_data と別に update する', async () => {
    const { PATCH } = await import('@/app/api/cards/[cardId]/route')
    const bg = { type: 'gradient', value: ['#aaa', '#bbb'] }

    const req = new NextRequest('http://localhost/api/cards/card-1', {
      method: 'PATCH',
      body: JSON.stringify({
        cardData: { name: '更新' },
        background: bg,
      }),
    })

    await PATCH(req, { params: Promise.resolve({ cardId: 'card-1' }) })

    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      background: bg,
    }))
    const updateArg = mockUpdate.mock.calls[0][0]
    expect(updateArg.card_data).not.toHaveProperty('background')
  })
})
