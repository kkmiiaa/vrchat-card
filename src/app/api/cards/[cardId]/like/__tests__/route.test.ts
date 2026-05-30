import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockRpc = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    rpc: mockRpc,
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

beforeEach(() => vi.clearAllMocks())

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

  it('RPC エラー時は 500 を返す', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'rpc failed' } })
    const res = await POST(makeRequest(1), makeParams('card1'))
    expect(res.status).toBe(500)
  })
})
