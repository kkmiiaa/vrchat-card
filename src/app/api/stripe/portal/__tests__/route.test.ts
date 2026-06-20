import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPortalCreate = vi.fn()
vi.mock('@/lib/stripe', () => ({
  stripe: { billingPortal: { sessions: { create: mockPortalCreate } } },
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

describe('POST /api/stripe/portal', () => {
  it('未認証のとき 401 を返す', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await POST()
    expect(res.status).toBe(401)
  })

  it('stripe_customer_id がない場合は 400 を返す', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockSupabaseChain.single.mockResolvedValue({ data: { stripe_customer_id: null, username_slug: 'slug' }, error: null })

    const res = await POST()
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('no_stripe_customer')
  })

  it('認証済み・顧客 ID あり のとき URL を返す', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockSupabaseChain.single.mockResolvedValue({ data: { stripe_customer_id: 'cus_123', username_slug: 'myslug' }, error: null })
    mockPortalCreate.mockResolvedValue({ url: 'https://billing.stripe.com/portal' })

    const res = await POST()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toBe('https://billing.stripe.com/portal')
  })

  it('return_url に username_slug が含まれる', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockSupabaseChain.single.mockResolvedValue({ data: { stripe_customer_id: 'cus_123', username_slug: 'myslug' }, error: null })
    mockPortalCreate.mockResolvedValue({ url: 'https://billing.stripe.com/portal' })

    await POST()
    const call = mockPortalCreate.mock.calls[0][0]
    expect(call.return_url).toContain('myslug')
  })
})
