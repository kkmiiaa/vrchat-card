import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockSessionCreate = vi.fn()
vi.mock('@/lib/stripe', () => ({
  stripe: { checkout: { sessions: { create: mockSessionCreate } } },
  STRIPE_PRO_PRICE_ID: 'price_test',
}))

const mockGetUser = vi.fn()
const mockSupabaseChain = { select: vi.fn(), eq: vi.fn(), single: vi.fn() }
mockSupabaseChain.select.mockReturnValue(mockSupabaseChain)
mockSupabaseChain.eq.mockReturnValue(mockSupabaseChain)

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: vi.fn(() => mockSupabaseChain),
  })),
}))

const { POST } = await import('../route')

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
})

describe('POST /api/stripe/checkout', () => {
  it('未認証のとき 401 を返す', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await POST()
    expect(res.status).toBe(401)
  })

  it('認証済みのとき Stripe セッションを作成して URL を返す', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockSupabaseChain.single.mockResolvedValue({ data: { username_slug: 'myslug' }, error: null })
    mockSessionCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session' })

    const res = await POST()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toBe('https://checkout.stripe.com/session')
  })

  it('success_url に username_slug が含まれる', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockSupabaseChain.single.mockResolvedValue({ data: { username_slug: 'myslug' }, error: null })
    mockSessionCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session' })

    await POST()
    const call = mockSessionCreate.mock.calls[0][0]
    expect(call.success_url).toContain('myslug')
    expect(call.success_url).toContain('upgraded=1')
  })

  it('metadata に user_id が含まれる', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockSupabaseChain.single.mockResolvedValue({ data: { username_slug: 'myslug' }, error: null })
    mockSessionCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session' })

    await POST()
    const call = mockSessionCreate.mock.calls[0][0]
    expect(call.metadata?.user_id).toBe('u1')
  })
})
