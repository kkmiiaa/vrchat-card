import { describe, it, expect } from 'vitest'
import { getBackgroundStyle } from '../backgroundUtils'

describe('getBackgroundStyle', () => {
  describe('color type', () => {
    it('単色カラーコードをそのまま返す', () => {
      expect(getBackgroundStyle('color', '#ff0000')).toBe('#ff0000')
    })

    it('white を返す', () => {
      expect(getBackgroundStyle('color', '#ffffff')).toBe('#ffffff')
    })
  })

  describe('gradient type', () => {
    it('グラデーションの CSS を返す', () => {
      const result = getBackgroundStyle('gradient', ['#60a5fa', '#a78bfa'])
      expect(result).toBe('linear-gradient(135deg, #60a5fa, #a78bfa)')
    })

    it('value が string の場合はフォールバックを返す', () => {
      const fallback = 'linear-gradient(135deg, #c7d2fe, #fbcfe8, #fde68a)'
      expect(getBackgroundStyle('gradient', '#60a5fa', null, fallback)).toBe(fallback)
    })

    it('value が undefined の場合はフォールバックを返す', () => {
      const fallback = 'linear-gradient(135deg, #c7d2fe, #fbcfe8, #fde68a)'
      expect(getBackgroundStyle('gradient', undefined, null, fallback)).toBe(fallback)
    })
  })

  describe('image type', () => {
    it('base64 があれば base64 URL を返す', () => {
      const b64 = 'data:image/png;base64,abc123'
      const result = getBackgroundStyle('image', '/bg.webp', b64)
      expect(result).toBe(`url(${b64}) center/cover no-repeat`)
    })

    it('base64 がなければ value の URL を返す', () => {
      const result = getBackgroundStyle('image', '/backgrounds/bg_1.webp', null)
      expect(result).toBe('url(/backgrounds/bg_1.webp) center/cover no-repeat')
    })

    it('base64 も value もない場合はフォールバックを返す', () => {
      const fallback = 'linear-gradient(135deg, #c7d2fe, #fbcfe8, #fde68a)'
      expect(getBackgroundStyle('image', undefined, null, fallback)).toBe(fallback)
    })

    it('base64 と url が両方ある場合は base64 を優先する（html-to-image のクロスオリジン回避）', () => {
      const b64 = 'data:image/png;base64,abc123'
      const url = 'https://example.supabase.co/storage/v1/object/public/card-images/bg.png'
      const result = getBackgroundStyle('image', '/bg.webp', b64, undefined, url)
      expect(result).toBe(`url(${b64}) center/cover no-repeat`)
    })

    it('base64 がなく url がある場合は url を使う', () => {
      const url = 'https://example.supabase.co/storage/v1/object/public/card-images/bg.png'
      const result = getBackgroundStyle('image', '/bg.webp', null, undefined, url)
      expect(result).toBe(`url(${url}) center/cover no-repeat`)
    })
  })

  describe('type が未定義の場合', () => {
    it('フォールバックを返す', () => {
      const fallback = 'linear-gradient(135deg, #c7d2fe, #fbcfe8, #fde68a)'
      expect(getBackgroundStyle(undefined, undefined, null, fallback)).toBe(fallback)
    })

    it('フォールバックなしなら null を返す', () => {
      expect(getBackgroundStyle(undefined)).toBeNull()
    })
  })

  describe('ProfilePage での cardBg 相当の挙動', () => {
    it('background が未設定の場合は null を返す', () => {
      expect(getBackgroundStyle(undefined)).toBeNull()
    })

    it('グラデーションは 135deg で返す', () => {
      expect(getBackgroundStyle('gradient', ['#fcd5ce', '#e0f7fa'])).toBe(
        'linear-gradient(135deg, #fcd5ce, #e0f7fa)'
      )
    })
  })
})
