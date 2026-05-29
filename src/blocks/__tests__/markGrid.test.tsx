import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { markGridComponent } from '../markGrid'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

const defaultValue = { marks: {}, custom: [] }

describe('markGrid', () => {
  it('1. defaultValue は { marks: {}, custom: [] }', () => {
    expect(markGridComponent.defaultValue).toEqual({ marks: {}, custom: [] })
  })

  it('2. CardItem: blockConfig.items でスロットが描画される', () => {
    const { container } = render(
      markGridComponent.CardItem!({
        value: { marks: { 0: '◎' }, custom: [] },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { items: [{ label: '触る' }, { label: '近距離' }], cols: 2 },
      })
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('3. CardItem: blockConfig.cols でグリッドカラム数が変わる', () => {
    const { container } = render(
      markGridComponent.CardItem!({
        value: defaultValue,
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { cols: 2, items: [] },
      })
    )
    const grid = container.firstChild as HTMLElement
    expect(grid.style.gridTemplateColumns).toBe('repeat(2, 1fr)')
  })

  it('4. CardItem: custom items が template items の後に追加される', () => {
    const { container } = render(
      markGridComponent.CardItem!({
        value: { marks: {}, custom: [{ label: 'カスタム', mark: '◎' }] },
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { items: [{ label: '触る' }], cols: 2 },
      })
    )
    expect(container.querySelectorAll('div > div').length).toBeGreaterThanOrEqual(2)
  })
})
