import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { profileImageComponent } from '../profileImage'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

describe('profileImage', () => {
  it('1. defaultValue は { base64: null, url: null }', () => {
    expect(profileImageComponent.defaultValue).toEqual({ base64: null, url: null })
  })

  it('2. variants に glass が含まれる', () => {
    expect(profileImageComponent.variants).toContain('glass')
  })

  it('3. default variant: 画像なしのとき "Photo" プレースホルダーが表示される', () => {
    render(
      profileImageComponent.CardItem!({
        value: { base64: null, url: null },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        variant: 'default',
      })
    )
    expect(screen.getByText('Photo')).toBeInTheDocument()
  })

  it('4. default variant: base64 画像が設定されているとき img タグが描画される', () => {
    const { container } = render(
      profileImageComponent.CardItem!({
        value: { base64: 'data:image/png;base64,abc', url: null },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        variant: 'default',
      })
    )
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img?.getAttribute('src')).toBe('data:image/png;base64,abc')
  })

  it('5. url が設定されているとき img src に url が使われる', () => {
    const { container } = render(
      profileImageComponent.CardItem!({
        value: { base64: null, url: 'https://example.com/photo.jpg' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        variant: 'default',
      })
    )
    const img = container.querySelector('img')
    expect(img?.getAttribute('src')).toBe('https://example.com/photo.jpg')
  })

  it('6. base64 と url が両方あるとき url が優先される', () => {
    const { container } = render(
      profileImageComponent.CardItem!({
        value: { base64: 'data:image/png;base64,abc', url: 'https://example.com/photo.jpg' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        variant: 'default',
      })
    )
    const img = container.querySelector('img')
    expect(img?.getAttribute('src')).toBe('https://example.com/photo.jpg')
  })

  it('7. circle variant: border-radius が 50% になる', () => {
    const { container } = render(
      profileImageComponent.CardItem!({
        value: { base64: null, url: null },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        variant: 'circle',
      })
    )
    const el = container.querySelector('div') as HTMLElement
    expect(el.style.borderRadius).toBe('50%')
  })

  it('8. glass variant: border が設定される', () => {
    const { container } = render(
      profileImageComponent.CardItem!({
        value: { base64: null, url: null },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        variant: 'glass',
      })
    )
    const el = container.querySelector('div') as HTMLElement
    expect(el.style.border).toContain('rgba(255, 255, 255, 0.75)')
  })

  it('9. glass variant: boxShadow が設定される', () => {
    const { container } = render(
      profileImageComponent.CardItem!({
        value: { base64: null, url: null },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        variant: 'glass',
      })
    )
    const el = container.querySelector('div') as HTMLElement
    expect(el.style.boxShadow).not.toBe('')
  })

  it('10. glass variant: border は 1px 固定', () => {
    const { container } = render(
      profileImageComponent.CardItem!({
        value: { base64: null, url: null },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        variant: 'glass',
      })
    )
    const el = container.querySelector('div') as HTMLElement
    expect(el.style.border).toMatch(/^1px/)
  })

  it('11. glass variant と default variant でボーダー有無が異なる', () => {
    const { container: glassContainer } = render(
      profileImageComponent.CardItem!({
        value: { base64: null, url: null },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        variant: 'glass',
      })
    )
    const { container: defaultContainer } = render(
      profileImageComponent.CardItem!({
        value: { base64: null, url: null },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        variant: 'default',
      })
    )
    const glassEl = glassContainer.querySelector('div') as HTMLElement
    const defaultEl = defaultContainer.querySelector('div') as HTMLElement
    expect(glassEl.style.border).not.toBe(defaultEl.style.border)
  })
})
