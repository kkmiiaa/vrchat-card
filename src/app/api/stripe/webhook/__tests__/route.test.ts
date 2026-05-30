import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// stripe モック
const mockConstructEvent = vi.fn()
const mockSubscriptionsRetrieve = vi.fn()
vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: { constructEvent: mockConstructEvent },
    subscriptions: { retrieve: mockSubscriptionsRetrieve },
  },
}))

// Supabase service client モック
const mockUpdate = vi.fn()
const mockEq = vi.fn()
const mockFrom = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

const { POST } = await import('../route')

function makeRequest(body: string, sig = 'valid-sig'): NextRequest {
  return new NextRequest('http://localhost/api/stripe/webhook', {
    method: 'POST',
    body,
    headers: { 'stripe-signature': sig },
  })
}

function makeSupabaseChain() {
  const chain = { update: vi.fn(), eq: vi.fn() }
  chain.update.mockReturnValue(chain)
  chain.eq.mockResolvedValue({ error: null })
  mockFrom.mockReturnValue(chain)
  return chain
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://supabase.test'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key'
})

describe('POST /api/stripe/webhook', () => {
  describe('署名検証', () => {
    it('無効な署名のとき 400 を返す', async () => {
      mockConstructEvent.mockImplementation(() => { throw new Error('invalid') })
      const res = await POST(makeRequest('{}'))
      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.error).toBe('invalid signature')
    })
  })

  describe('checkout.session.completed', () => {
    it('user_id と subscription があれば plan を pro に更新する', async () => {
      const chain = makeSupabaseChain()
      const sub = { items: { data: [{ current_period_end: 9999999999 }] }, metadata: { user_id: 'u1' } }
      mockSubscriptionsRetrieve.mockResolvedValue(sub)
      mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: { object: { metadata: { user_id: 'u1' }, subscription: 'sub_123', customer: 'cus_123' } },
      })

      const res = await POST(makeRequest('{}'))
      expect(res.status).toBe(200)
      expect(chain.update).toHaveBeenCalledWith(expect.objectContaining({ plan: 'pro' }))
    })

    it('user_id がなければ何もしない', async () => {
      makeSupabaseChain()
      mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: { object: { metadata: {}, subscription: 'sub_123', customer: null } },
      })

      const res = await POST(makeRequest('{}'))
      expect(res.status).toBe(200)
      expect(mockFrom).not.toHaveBeenCalled()
    })
  })

  describe('invoice.paid', () => {
    it('subscription の user_id で plan を pro に更新する', async () => {
      const chain = makeSupabaseChain()
      const sub = { items: { data: [{ current_period_end: 9999999999 }] }, metadata: { user_id: 'u2' } }
      mockSubscriptionsRetrieve.mockResolvedValue(sub)
      mockConstructEvent.mockReturnValue({
        type: 'invoice.paid',
        data: { object: { subscription: 'sub_456' } },
      })

      const res = await POST(makeRequest('{}'))
      expect(res.status).toBe(200)
      expect(chain.update).toHaveBeenCalledWith(expect.objectContaining({ plan: 'pro' }))
    })

    it('subscription がなければ何もしない', async () => {
      makeSupabaseChain()
      mockConstructEvent.mockReturnValue({
        type: 'invoice.paid',
        data: { object: { subscription: null } },
      })

      const res = await POST(makeRequest('{}'))
      expect(res.status).toBe(200)
      expect(mockSubscriptionsRetrieve).not.toHaveBeenCalled()
    })
  })

  describe('customer.subscription.deleted', () => {
    it('user_id の plan を free に戻す', async () => {
      const chain = makeSupabaseChain()
      mockConstructEvent.mockReturnValue({
        type: 'customer.subscription.deleted',
        data: { object: { metadata: { user_id: 'u3' } } },
      })

      const res = await POST(makeRequest('{}'))
      expect(res.status).toBe(200)
      expect(chain.update).toHaveBeenCalledWith({ plan: 'free', plan_expires_at: null })
    })

    it('user_id がなければ何もしない', async () => {
      makeSupabaseChain()
      mockConstructEvent.mockReturnValue({
        type: 'customer.subscription.deleted',
        data: { object: { metadata: {} } },
      })

      const res = await POST(makeRequest('{}'))
      expect(res.status).toBe(200)
      expect(mockFrom).not.toHaveBeenCalled()
    })
  })

  describe('未知のイベント', () => {
    it('200 を返して何もしない', async () => {
      makeSupabaseChain()
      mockConstructEvent.mockReturnValue({ type: 'unknown.event', data: { object: {} } })
      const res = await POST(makeRequest('{}'))
      expect(res.status).toBe(200)
      expect(mockFrom).not.toHaveBeenCalled()
    })
  })
})
