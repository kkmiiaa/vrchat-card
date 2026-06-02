import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { profileImageComponent } from '../profileImage'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

describe('profileImage', () => {
  it('1. defaultValue は { base64: null, url: null }', () => {
    expect(profileImageComponent.defaultValue).toEqual({ base64: null, url: null })
  })

  it('2. variants に glass が含まれない（glass は廃止、surfaceMode:internal で代替）', () => {
    expect(profileImageComponent.variants).not.toContain('glass')
  })

  it('3. surfaceMode が internal である', () => {
    expect(profileImageComponent.surfaceMode).toBe('internal')
  })

  it('4. 画像なしのとき "Photo" プレースホルダーが表示される', () => {
    render(
      profileImageComponent.CardItem!({
        value: { base64: null, url: null },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        variant: 'simple',
      })
    )
    expect(screen.getByText('Photo')).toBeInTheDocument()
  })

  it('5. base64 画像が設定されているとき img タグが描画される', () => {
    const { container } = render(
      profileImageComponent.CardItem!({
        value: { base64: 'data:image/png;base64,abc', url: null },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        variant: 'simple',
      })
    )
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img?.getAttribute('src')).toBe('data:image/png;base64,abc')
  })

  it('6. url が設定されているとき img src に url が使われる', () => {
    const { container } = render(
      profileImageComponent.CardItem!({
        value: { base64: null, url: 'https://example.com/photo.jpg' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        variant: 'simple',
      })
    )
    const img = container.querySelector('img')
    expect(img?.getAttribute('src')).toBe('https://example.com/photo.jpg')
  })

  it('7. base64 と url が両方あるとき url が優先される', () => {
    const { container } = render(
      profileImageComponent.CardItem!({
        value: { base64: 'data:image/png;base64,abc', url: 'https://example.com/photo.jpg' },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        variant: 'simple',
      })
    )
    const img = container.querySelector('img')
    expect(img?.getAttribute('src')).toBe('https://example.com/photo.jpg')
  })

  it('8. circle variant: border-radius が 50% になる', () => {
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

  it('9. ctx.surface="glass" のとき border が設定される', () => {
    const { container } = render(
      profileImageComponent.CardItem!({
        value: { base64: null, url: null },
        ctx: { ...DEFAULT_CARD_RENDER_CONTEXT, surface: 'glass' },
        variant: 'simple',
      })
    )
    const el = container.querySelector('div') as HTMLElement
    expect(el.style.border).toContain('rgba(255, 255, 255, 0.75)')
  })

  it('10. ctx.surface="glass" のとき boxShadow が設定される', () => {
    const { container } = render(
      profileImageComponent.CardItem!({
        value: { base64: null, url: null },
        ctx: { ...DEFAULT_CARD_RENDER_CONTEXT, surface: 'glass' },
        variant: 'simple',
      })
    )
    const el = container.querySelector('div') as HTMLElement
    expect(el.style.boxShadow).not.toBe('')
  })

  it('11. ctx.surface="transparent" のとき border が設定されない', () => {
    const { container } = render(
      profileImageComponent.CardItem!({
        value: { base64: null, url: null },
        ctx: { ...DEFAULT_CARD_RENDER_CONTEXT, surface: 'transparent' },
        variant: 'simple',
      })
    )
    const el = container.querySelector('div') as HTMLElement
    expect(el.style.border || '').toBe('')
  })

  it('12. glass と transparent で border の有無が異なる', () => {
    const { container: gc } = render(
      profileImageComponent.CardItem!({
        value: { base64: null, url: null },
        ctx: { ...DEFAULT_CARD_RENDER_CONTEXT, surface: 'glass' },
        variant: 'simple',
      })
    )
    const { container: tc } = render(
      profileImageComponent.CardItem!({
        value: { base64: null, url: null },
        ctx: { ...DEFAULT_CARD_RENDER_CONTEXT, surface: 'transparent' },
        variant: 'simple',
      })
    )
    const glassBorder = (gc.querySelector('div') as HTMLElement).style.border
    const transBorder = (tc.querySelector('div') as HTMLElement).style.border
    expect(glassBorder).not.toBe(transBorder)
  })
})
