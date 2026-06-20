import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { gaugeComponent } from '../gauge'
import { DEFAULT_CARD_RENDER_CONTEXT } from '../types'

describe('gauge', () => {
  it('defaultValue は 0', () => {
    expect(gaugeComponent.defaultValue).toBe(0)
  })

  it('blockConfig.step を設定すると FormItem の range input に step 属性が反映される', () => {
    const { container } = render(
      gaugeComponent.FormItem!({
        value: 50,
        onChange: () => {},
        t: {} as never,
        blockConfig: { step: 10 },
      })
    )
    const range = container.querySelector('input[type="range"]')
    expect(range).toHaveAttribute('step', '10')
  })

  it('blockConfig.step が未設定のとき step は 1（デフォルト）', () => {
    const { container } = render(
      gaugeComponent.FormItem!({
        value: 50,
        onChange: () => {},
        t: {} as never,
        blockConfig: {},
      })
    )
    const range = container.querySelector('input[type="range"]')
    expect(range).toHaveAttribute('step', '1')
  })

  it('blockConfig.maxValue を設定すると range の max 属性に反映される', () => {
    const { container } = render(
      gaugeComponent.FormItem!({
        value: 50,
        onChange: () => {},
        t: {} as never,
        blockConfig: { maxValue: 200 },
      })
    )
    const range = container.querySelector('input[type="range"]')
    expect(range).toHaveAttribute('max', '200')
  })

  it('blockConfig.unit を設定すると CardItem に単位ラベルが表示される', () => {
    render(
      gaugeComponent.CardItem!({
        value: 75,
        ctx: DEFAULT_CARD_RENDER_CONTEXT,
        blockConfig: { unit: '%', showLabel: true },
      })
    )
    expect(screen.getByText(/75/)).toBeInTheDocument()
  })
})
