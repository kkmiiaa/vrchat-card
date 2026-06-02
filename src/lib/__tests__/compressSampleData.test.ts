import { describe, it, expect } from 'vitest'
import { compressSampleData } from '../compressSampleData'

describe('compressSampleData', () => {
  it('base64 を持たないフィールドはそのまま返す', () => {
    const input = { name: 'test', age: { searchTag: '20s' }, friendPolicy: 'frPolicyAnyone' }
    expect(compressSampleData(input)).toEqual(input)
  })

  it('null / undefined フィールドはそのまま返す', () => {
    const input = { a: null, b: undefined }
    expect(compressSampleData(input)).toEqual(input)
  })

  describe('profileImage: { base64, url }', () => {
    it('base64 を null に除去し url は保持する', () => {
      const input = { profileImage: { base64: 'data:image/png;base64,abc', url: 'https://example.com/img.png' } }
      expect(compressSampleData(input)).toEqual({
        profileImage: { base64: null, url: 'https://example.com/img.png' },
      })
    })

    it('base64 がすでに null でも問題なく処理される', () => {
      const input = { profileImage: { base64: null, url: 'https://example.com/img.png' } }
      expect(compressSampleData(input)).toEqual(input)
    })
  })

  describe('gallery: { base64: (string | null)[] }', () => {
    it('base64 配列をすべて null に除去する', () => {
      const input = {
        gallery: {
          enabled: true,
          images: ['https://example.com/1.png'],
          base64: ['data:image/jpeg;base64,xyz', null],
        },
      }
      expect(compressSampleData(input)).toEqual({
        gallery: {
          enabled: true,
          images: ['https://example.com/1.png'],
          base64: [null, null],
        },
      })
    })

    it('base64 が空配列でも問題なく処理される', () => {
      const input = { gallery: { enabled: false, images: [], base64: [] } }
      expect(compressSampleData(input)).toEqual(input)
    })
  })

  it('ネストされたオブジェクト内の base64 も除去される', () => {
    const input = {
      section: {
        nested: { base64: 'data:image/png;base64,deep', url: 'https://example.com/x.png' },
      },
    }
    expect(compressSampleData(input)).toEqual({
      section: {
        nested: { base64: null, url: 'https://example.com/x.png' },
      },
    })
  })

  it('複数フィールドが混在しても正しく処理される', () => {
    const input = {
      name: 'Alice',
      profileImage: { base64: 'data:image/png;base64,aaa', url: 'https://example.com/a.png' },
      gallery: { enabled: true, images: [], base64: ['data:image/jpeg;base64,bbb'] },
      vrchat: 'alice_vrc',
    }
    const result = compressSampleData(input)
    expect((result.profileImage as { base64: unknown }).base64).toBeNull()
    expect((result.gallery as { base64: unknown[] }).base64).toEqual([null])
    expect(result.name).toBe('Alice')
    expect(result.vrchat).toBe('alice_vrc')
  })
})
