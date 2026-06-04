import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Supabase server client モック（チェーンの末尾 eq は Promise を返す）
function makeChain() {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  const terminalEq = vi.fn().mockResolvedValue({ error: null })
  chain.select = vi.fn().mockReturnValue(chain)
  chain.update = vi.fn().mockReturnValue(chain)
  chain.delete = vi.fn().mockReturnValue(chain)
  chain.single  = vi.fn().mockResolvedValue({ data: null, error: null })
  // eq を呼ぶたびに chain を返し、最後の eq は Promise を返せるよう terminalEq に差し替え可能にする
  chain.eq = vi.fn().mockImplementation(() => {
    // 次の eq 呼び出しが terminal になるよう chain を返す
    chain.eq = terminalEq
    return chain
  })
  chain._terminalEq = terminalEq
  return chain
}

let mockServerChain = makeChain()

const mockGetUser = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: vi.fn(() => mockServerChain),
  })),
}))



// Supabase admin client モック（Storage 用）
const mockStorageRemove = vi.fn().mockResolvedValue({ error: null })
const mockStorageUpload = vi.fn()
const mockStorageGetPublicUrl = vi.fn()
const mockAdminFrom = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockAdminFrom,
    storage: {
      from: vi.fn(() => ({
        upload: mockStorageUpload,
        remove: mockStorageRemove,
        getPublicUrl: mockStorageGetPublicUrl,
      })),
    },
  })),
}))

const { GET, PATCH, DELETE } = await import('../route')

type Params = { params: Promise<{ cardId: string }> }

function makeParams(cardId: string): Params {
  return { params: Promise.resolve({ cardId }) }
}

function makeRequest(method: string, body?: unknown): NextRequest {
  return new NextRequest('http://localhost/api/cards/card1', {
    method,
    body: body ? JSON.stringify(body) : undefined,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockServerChain = makeChain()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://supabase.test'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key'
})

// ─── GET ─────────────────────────────────────────────────────────────────────

describe('GET /api/cards/[cardId]', () => {
  it('カードが見つかれば 200 とデータを返す', async () => {
    mockServerChain.single.mockResolvedValue({ data: { id: 'card1', title: 'test' }, error: null })
    const res = await GET(makeRequest('GET'), makeParams('card1'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.id).toBe('card1')
  })

  it('カードが見つからなければ 404 を返す', async () => {
    mockServerChain.single.mockResolvedValue({ data: null, error: { message: 'not found' } })
    const res = await GET(makeRequest('GET'), makeParams('missing'))
    expect(res.status).toBe(404)
  })
})

// ─── PATCH ───────────────────────────────────────────────────────────────────

describe('PATCH /api/cards/[cardId]', () => {
  it('未認証のとき 401 を返す', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await PATCH(makeRequest('PATCH', { cardData: {} }), makeParams('card1'))
    expect(res.status).toBe(401)
  })

  it('card_data を更新できる', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockServerChain._terminalEq.mockResolvedValue({ error: null })
    const res = await PATCH(makeRequest('PATCH', { cardData: { name: 'test' } }), makeParams('card1'))
    expect(res.status).toBe(200)
  })

  it('imageBase64 がなければ Storage アップロードしない', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockServerChain._terminalEq.mockResolvedValue({ error: null })
    await PATCH(makeRequest('PATCH', { cardData: {} }), makeParams('card1'))
    expect(mockStorageUpload).not.toHaveBeenCalled()
  })

  it('imageBase64 があれば Storage にアップロードして image_url を更新する', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockStorageUpload.mockResolvedValue({ error: null })
    mockStorageGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/img.png' } })
    mockAdminFrom.mockReturnValue(mockServerChain)
    mockServerChain._terminalEq.mockResolvedValue({ error: null })

    const res = await PATCH(
      makeRequest('PATCH', { imageBase64: 'data:image/png;base64,abc=' }),
      makeParams('card1'),
    )
    expect(res.status).toBe(200)
    expect(mockStorageUpload).toHaveBeenCalled()
  })

  it('imageBase64 と ogp_version が同時に送られた場合、ファイル名に _v{N} が含まれる', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockStorageUpload.mockResolvedValue({ error: null })
    mockStorageGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/u1/card1_v3.png' } })
    mockAdminFrom.mockReturnValue(mockServerChain)
    mockServerChain._terminalEq.mockResolvedValue({ error: null })

    let capturedUpdate: Record<string, unknown> = {}
    mockServerChain.update = vi.fn((data: Record<string, unknown>) => {
      capturedUpdate = data
      return mockServerChain
    })

    await PATCH(
      makeRequest('PATCH', { imageBase64: 'data:image/png;base64,abc=', ogp_version: 3 }),
      makeParams('card1'),
    )

    // ファイル名に _v3 が含まれること
    expect(mockStorageUpload).toHaveBeenCalledWith(
      expect.stringContaining('_v3.png'),
      expect.any(Buffer),
      expect.any(Object),
    )
    // image_url がバージョン付きファイル名の URL になること
    expect(capturedUpdate.image_url).toBe('https://example.com/u1/card1_v3.png')
  })

  it('ogp_version=1 のとき旧フォーマット（バージョンなし）ファイルを削除する', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockStorageUpload.mockResolvedValue({ error: null })
    mockStorageGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/u1/card1_v1.png' } })
    mockAdminFrom.mockReturnValue(mockServerChain)
    mockServerChain._terminalEq.mockResolvedValue({ error: null })
    mockServerChain.update = vi.fn(() => mockServerChain)

    await PATCH(
      makeRequest('PATCH', { imageBase64: 'data:image/png;base64,abc=', ogp_version: 1 }),
      makeParams('card1'),
    )

    // 旧ファイル（バージョンなし）の削除が呼ばれること
    expect(mockStorageRemove).toHaveBeenCalledWith(
      expect.arrayContaining([expect.stringContaining('card1.png')])
    )
  })
})

// ─── DELETE ──────────────────────────────────────────────────────────────────

describe('DELETE /api/cards/[cardId]', () => {
  it('未認証のとき 401 を返す', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await DELETE(makeRequest('DELETE'), makeParams('card1'))
    expect(res.status).toBe(401)
  })

  it('認証済みのとき DB からカードを削除する', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockServerChain._terminalEq.mockResolvedValue({ error: null })
    mockStorageRemove.mockResolvedValue({ error: null })

    const res = await DELETE(makeRequest('DELETE'), makeParams('card1'))
    expect(res.status).toBe(200)
  })

  it('gallery 画像（4スロット）を Storage から削除する', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockServerChain._terminalEq.mockResolvedValue({ error: null })
    mockStorageRemove.mockResolvedValue({ error: null })

    await DELETE(makeRequest('DELETE'), makeParams('card1'))

    const [paths] = mockStorageRemove.mock.calls[0]
    expect(paths).toHaveLength(4)
    expect(paths).toContain('u1/card1/profile.jpg')
    expect(paths).toContain('u1/card1/gallery-0.jpg')
  })
})
