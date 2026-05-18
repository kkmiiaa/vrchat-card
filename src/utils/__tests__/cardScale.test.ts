import { describe, it, expect } from 'vitest'
import { calcCardScale } from '../cardScale'

describe('calcCardScale', () => {
  it('コンテナ幅がカード幅より小さい場合、縮小スケールを返す', () => {
    expect(calcCardScale(450, 900)).toBeCloseTo(0.5)
  })

  it('コンテナ幅がカード幅と同じ場合、1 を返す', () => {
    expect(calcCardScale(900, 900)).toBe(1)
  })

  it('コンテナ幅がカード幅より大きい場合、1 を上限として返す', () => {
    expect(calcCardScale(1800, 900)).toBe(1)
  })

  it('コンテナ幅が 0 の場合、最小スケール 0.1 を返す', () => {
    expect(calcCardScale(0, 900)).toBe(0.1)
  })

  it('小数点スケールが正しく計算される', () => {
    expect(calcCardScale(675, 900)).toBeCloseTo(0.75)
  })
})
