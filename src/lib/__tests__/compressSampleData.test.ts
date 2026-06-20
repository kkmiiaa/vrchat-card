import { describe, it, expect, vi, beforeAll } from 'vitest'

// uploadAdminBase64Image をモック（Storage へのアップロードを回避）
vi.mock('@/lib/adminImageUpload', () => ({
  uploadAdminBase64Image: vi.fn().mockResolvedValue(null),
}))

import { compressSampleData } from '../compressSampleData'

beforeAll(() => {
  // jsdom では Image の onload/onerror が発火しないため onerror を即座に呼ぶスタブを使う
  vi.stubGlobal('Image', class {
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    set src(_: string) { setTimeout(() => this.onerror?.(), 0) }
  })
})

describe('compressSampleData', () => {
  it('base64 を持たないフィールドはそのまま返す', async () => {
    const input = { name: 'test', age: { searchTag: '20s' }, friendPolicy: 'frPolicyAnyone' }
    expect(await compressSampleData(input)).toEqual(input)
  })

  it('null / undefined フィールドはそのまま返す', async () => {
    const input = { a: null, b: undefined }
    expect(await compressSampleData(input)).toEqual(input)
  })

  describe('profileImage: { base64, url }', () => {
    it('base64 を null に除去し url は保持する', async () => {
      const input = { profileImage: { base64: 'data:image/png;base64,abc', url: 'https://example.com/img.png' } }
      const result = await compressSampleData(input)
      expect((result.profileImage as Record<string, unknown>).base64).toBeNull()
      expect((result.profileImage as Record<string, unknown>).url).toBe('https://example.com/img.png')
    })

    it('base64 がすでに null でも問題なく処理される', async () => {
      const input = { profileImage: { base64: null, url: 'https://example.com/img.png' } }
      expect(await compressSampleData(input)).toEqual(input)
    })
  })

  describe('gallery: { base64: (string | null)[] }', () => {
    it('base64 配列をすべて null に除去する', async () => {
      const input = {
        gallery: {
          enabled: true,
          images: ['https://example.com/1.png'],
          base64: ['data:image/jpeg;base64,xyz', null],
        },
      }
      const result = await compressSampleData(input)
      const gallery = result.gallery as Record<string, unknown>
      expect(gallery.base64).toEqual([null, null])
      expect(gallery.images).toEqual(['https://example.com/1.png'])
      expect(gallery.enabled).toBe(true)
    })

    it('base64 が空配列でも問題なく処理される', async () => {
      const input = { gallery: { enabled: false, images: [], base64: [] } }
      const result = await compressSampleData(input)
      const gallery = result.gallery as Record<string, unknown>
      expect(gallery.base64).toEqual([])
    })
  })

  it('ネストされたオブジェクト内の base64 も除去される', async () => {
    const input = {
      section: {
        nested: { base64: 'data:image/png;base64,deep', url: 'https://example.com/x.png' },
      },
    }
    const result = await compressSampleData(input)
    const nested = (result.section as Record<string, unknown>).nested as Record<string, unknown>
    expect(nested.base64).toBeNull()
    expect(nested.url).toBe('https://example.com/x.png')
  })

  it('複数フィールドが混在しても正しく処理される', async () => {
    const input = {
      name: 'Alice',
      profileImage: { base64: 'data:image/png;base64,aaa', url: 'https://example.com/a.png' },
      gallery: { enabled: true, images: [], base64: ['data:image/jpeg;base64,bbb'] },
      vrchat: 'alice_vrc',
    }
    const result = await compressSampleData(input)
    expect((result.profileImage as { base64: unknown }).base64).toBeNull()
    expect((result.gallery as { base64: unknown[] }).base64).toEqual([null])
    expect(result.name).toBe('Alice')
    expect(result.vrchat).toBe('alice_vrc')
  })
})
