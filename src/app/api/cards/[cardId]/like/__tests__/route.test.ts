import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockRpc = vi.fn()
const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    rpc: mockRpc,
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

const { POST } = await import('../route')

type Params = { params: Promise<{ cardId: string }> }
function makeParams(cardId: string): Params {
  return { params: Promise.resolve({ cardId }) }
}
function makeRequest(delta: 1 | -1): NextRequest {
  return new NextRequest('http://localhost/api/cards/card1/like', {
    method: 'POST',
    body: JSON.stringify({ delta }),
  })
}

function makeChain(terminalValue: unknown) {
  const chain = { select: vi.fn(), eq: vi.fn(), single: vi.fn(), insert: vi.fn() }
  chain.select.mockReturnValue(chain)
  chain.eq.mockReturnValue(chain)
  chain.single.mockResolvedValue(terminalValue)
  chain.insert.mockResolvedValue({ error: null })
  return chain
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
  mockFrom.mockReturnValue(makeChain({ data: { user_id: 'owner1' }, error: null }))
})

describe('POST /api/cards/[cardId]/like', () => {
  it('delta=+1 で increment_like_count RPC を呼ぶ', async () => {
    mockRpc.mockResolvedValue({ data: 5, error: null })
    const res = await POST(makeRequest(1), makeParams('card1'))
    expect(res.status).toBe(200)
    expect(mockRpc).toHaveBeenCalledWith('increment_like_count', { card_id: 'card1', delta: 1 })
    const json = await res.json()
    expect(json.like_count).toBe(5)
  })

  it('delta=-1 で increment_like_count RPC を呼ぶ', async () => {
    mockRpc.mockResolvedValue({ data: 3, error: null })
    const res = await POST(makeRequest(-1), makeParams('card1'))
    expect(res.status).toBe(200)
    expect(mockRpc).toHaveBeenCalledWith('increment_like_count', { card_id: 'card1', delta: -1 })
  })

  it('delta=+1 のとき user_notifications を作成する（他者のカード）', async () => {
    mockRpc.mockResolvedValue({ data: 5, error: null })
    const chain = makeChain({ data: { user_id: 'owner1' }, error: null })
    mockFrom.mockReturnValue(chain)

    await POST(makeRequest(1), makeParams('card1'))
    // insert が呼ばれていること
    expect(chain.insert).toHaveBeenCalled()
  })

  it('自分のカードへのいいねでは通知を作成しない', async () => {
    mockRpc.mockResolvedValue({ data: 5, error: null })
    // カードオーナーが自分自身
    const chain = makeChain({ data: { user_id: 'u1' }, error: null })
    mockFrom.mockReturnValue(chain)

    await POST(makeRequest(1), makeParams('card1'))
    expect(chain.insert).not.toHaveBeenCalled()
  })

  it('RPC エラー時は 500 を返す', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'rpc failed' } })
    const res = await POST(makeRequest(1), makeParams('card1'))
    expect(res.status).toBe(500)
  })
})
