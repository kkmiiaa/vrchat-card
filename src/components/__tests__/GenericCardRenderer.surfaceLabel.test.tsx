/**
 * GenericCardRenderer – surface コンテナ / labelInset 仕様テスト
 *
 * surface コンテナとラベルは GenericCardRenderer が一元管理する。
 * コンポーネントには surface/label を渡さず、renderer がラップする。
 *
 * テスト観点:
 *   1. surface コンテナスタイルが各 surface 値で正しく適用される
 *   2. labelInset: false → ラベルがコンテナの外側（上）に描画される
 *   3. labelInset: true, dir=col → ラベルとコンテンツが縦並び（flex-direction: column）
 *   4. labelInset: true, dir=row → ラベルとコンテンツが横並び（flex-direction: row）
 *   5. ラベルなし → ラベル行が描画されない
 *   6. surface と labelInset の組み合わせが正しく動作する
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import GenericCardRenderer from '../GenericCardRenderer'
import type { TemplateDefinition, SurfaceVariant } from '@/blocks/types'

// ─── ヘルパー ────────────────────────────────────────────────────────────────

const DEFAULT_WEB: TemplateDefinition['web'] = {
  cardWidth: 630,
  autoHeight: true,
  grid: { cellSize: 10, gap: 4 },
  layout: { type: 'col', children: [] },
}

function makeBlock(props: {
  surface?: SurfaceVariant
  label?: string
  labelInset?: boolean
  labelInsetDir?: 'col' | 'row'
  labelColor?: string
}): TemplateDefinition {
  return {
    id: 'test',
    label: 'test',
    theme: { accent: '#00AADB', text: '#1f2937', subText: '#9ca3af', bg: '#fff' },
    fontFamily: 'sans-serif',
    borderRadius: 0,
    card: {
      cardWidth: 900,
      cardHeight: 500,
      grid: { cellSize: 10, gap: 4 },
      layout: {
        type: 'block',
        componentKey: 'text',
        dataKey: 'name',
        ...props,
      },
    },
    web: DEFAULT_WEB,
  }
}

/** jsdom は background shorthand を backgroundColor に展開し、rgba にスペースを挿入する */
function normColor(c: string): string {
  return c.replace(/rgba\((\d+),(\d+),(\d+),([\d.]+)\)/g, 'rgba($1, $2, $3, $4)')
}

function findElemWithBg(container: HTMLElement, bg: string): HTMLElement | null {
  const norm = normColor(bg)
  return Array.from(container.querySelectorAll<HTMLElement>('[style]'))
    .find(el => el.style.backgroundColor === norm || el.style.backgroundColor === bg) ?? null
}

function findElemWithBorder(container: HTMLElement, border: string): HTMLElement | null {
  const match = border.match(/^([\d.]+px)\s+(solid)\s+(.+)$/)
  if (!match) return null
  const [, width, style, color] = match
  const normC = normColor(color)
  return Array.from(container.querySelectorAll<HTMLElement>('[style]'))
    .find(el =>
      el.style.borderTopWidth === width &&
      el.style.borderTopStyle === style &&
      (el.style.borderTopColor === normC || el.style.borderTopColor === color)
    ) ?? null
}

/**
 * surface コンテナ（background を持つ div）を返す。
 * labelInset: true の場合、surface コンテナがラベルとコンテンツを両方含む。
 * labelInset: false の場合、surface コンテナはコンテンツのみを含む（ラベルは外側）。
 */
function findSurfaceContainer(container: HTMLElement, bg: string): HTMLElement | null {
  return findElemWithBg(container, bg)
}

/**
 * labelInset: false の外側ラッパー（label + surface container の縦並び親）を返す。
 * flex-direction: column を持ち、ラベルテキストを含む div を探す。
 */
function findOuterWrapper(container: HTMLElement, labelText: string): HTMLElement | null {
  return Array.from(container.querySelectorAll<HTMLElement>('div[style]'))
    .find(el =>
      el.style.getPropertyValue('flex-direction') === 'column' &&
      el.textContent?.includes(labelText)
    ) ?? null
}

const VALUES = { name: 'テスト' }

// ═══════════════════════════════════════════════════════════════════════════════
// 1. surface コンテナスタイル
// ═══════════════════════════════════════════════════════════════════════════════

describe('GenericCardRenderer – surface コンテナスタイル', () => {
  it("surface='contained' → background rgba(255,255,255,0.85)", () => {
    const { container } = render(
      <GenericCardRenderer definition={makeBlock({ surface: 'contained' })} values={VALUES} transparentBackground />
    )
    expect(findElemWithBg(container, 'rgba(255,255,255,0.85)')).not.toBeNull()
  })

  it("surface='glass' → background rgba(255,255,255,0.55)", () => {
    const { container } = render(
      <GenericCardRenderer definition={makeBlock({ surface: 'glass' })} values={VALUES} transparentBackground />
    )
    expect(findElemWithBg(container, 'rgba(255,255,255,0.55)')).not.toBeNull()
  })

  it("surface='glass' → border 1px solid rgba(255,255,255,0.75)", () => {
    const { container } = render(
      <GenericCardRenderer definition={makeBlock({ surface: 'glass' })} values={VALUES} transparentBackground />
    )
    expect(findElemWithBorder(container, '1px solid rgba(255,255,255,0.75)')).not.toBeNull()
  })

  it("surface='flat' → background rgba(255,255,255,0.95)", () => {
    const { container } = render(
      <GenericCardRenderer definition={makeBlock({ surface: 'flat' })} values={VALUES} transparentBackground />
    )
    expect(findElemWithBg(container, 'rgba(255,255,255,0.95)')).not.toBeNull()
  })

  it("surface='flat' → border 0.75px solid rgba(0,0,0,0.30)", () => {
    const { container } = render(
      <GenericCardRenderer definition={makeBlock({ surface: 'flat' })} values={VALUES} transparentBackground />
    )
    expect(findElemWithBorder(container, '0.75px solid rgba(0,0,0,0.30)')).not.toBeNull()
  })

  it("surface='transparent' → 白背景のコンテナが描画されない", () => {
    const { container } = render(
      <GenericCardRenderer definition={makeBlock({ surface: 'transparent' })} values={VALUES} transparentBackground />
    )
    expect(findElemWithBg(container, 'rgba(255,255,255,0.85)')).toBeNull()
    expect(findElemWithBg(container, 'rgba(255,255,255,0.55)')).toBeNull()
    expect(findElemWithBg(container, 'rgba(255,255,255,0.95)')).toBeNull()
  })

  it("surface='outline' → background transparent", () => {
    const { container } = render(
      <GenericCardRenderer definition={makeBlock({ surface: 'outline' })} values={VALUES} transparentBackground />
    )
    expect(findElemWithBg(container, 'transparent')).not.toBeNull()
  })

  it("surface='outline' → border 1px solid rgba(255,255,255,0.6)", () => {
    const { container } = render(
      <GenericCardRenderer definition={makeBlock({ surface: 'outline' })} values={VALUES} transparentBackground />
    )
    expect(findElemWithBorder(container, '1px solid rgba(255,255,255,0.6)')).not.toBeNull()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ラベルなし
// ═══════════════════════════════════════════════════════════════════════════════

describe('GenericCardRenderer – ラベルなし', () => {
  it('label 未指定のときラベルテキストが描画されない', () => {
    const { container } = render(
      <GenericCardRenderer definition={makeBlock({ surface: 'contained' })} values={VALUES} transparentBackground />
    )
    // span は text コンポーネントの "-" (空値) のみのはず。ラベルspan はない
    const spans = container.querySelectorAll('span')
    // ラベルテキストを持つ太字 span がないことを確認
    const boldSpan = Array.from(spans).find(s => s.style.fontWeight === '700')
    expect(boldSpan).toBeUndefined()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 3. labelInset: false（外ラベル）
// ═══════════════════════════════════════════════════════════════════════════════

describe('GenericCardRenderer – labelInset: false（外ラベル）', () => {
  it('ラベルテキストが描画される', () => {
    const { container } = render(
      <GenericCardRenderer
        definition={makeBlock({ label: 'マイクON率', labelInset: false, surface: 'contained' })}
        values={VALUES}
        transparentBackground
      />
    )
    expect(container.textContent).toContain('マイクON率')
  })

  it('外ラベルは flex-direction: column のコンテナを形成する（ラベル上・コンテンツ下）', () => {
    const { container } = render(
      <GenericCardRenderer
        definition={makeBlock({ label: 'LABEL', labelInset: false, surface: 'contained' })}
        values={VALUES}
        transparentBackground
      />
    )
    // 外ラベルの場合、renderer が label → surface container の縦並びコンテナを作る
    const outerWrapper = findOuterWrapper(container, 'LABEL')
    expect(outerWrapper).not.toBeNull()
    expect(outerWrapper?.style.getPropertyValue('flex-direction')).toBe('column')
  })

  it('surface コンテナはラベルの下（コンテンツ部分）に適用される', () => {
    const { container } = render(
      <GenericCardRenderer
        definition={makeBlock({ label: 'LABEL', labelInset: false, surface: 'glass' })}
        values={VALUES}
        transparentBackground
      />
    )
    // glass background がどこかに存在する
    expect(findElemWithBg(container, 'rgba(255,255,255,0.55)')).not.toBeNull()
    // ラベルテキストも存在する
    expect(container.textContent).toContain('LABEL')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 4. labelInset: true, dir=col（縦並び）
// ═══════════════════════════════════════════════════════════════════════════════

describe('GenericCardRenderer – labelInset: true, dir=col', () => {
  it('ラベルテキストが描画される', () => {
    const { container } = render(
      <GenericCardRenderer
        definition={makeBlock({ label: 'マイクON率', labelInset: true, labelInsetDir: 'col', surface: 'contained' })}
        values={VALUES}
        transparentBackground
      />
    )
    expect(container.textContent).toContain('マイクON率')
  })

  it('surface コンテナが flex-direction: column（縦並び）', () => {
    const { container } = render(
      <GenericCardRenderer
        definition={makeBlock({ label: 'LABEL', labelInset: true, labelInsetDir: 'col', surface: 'contained' })}
        values={VALUES}
        transparentBackground
      />
    )
    // labelInset=true の場合、surface コンテナ自体が flex-direction: column でラベルとコンテンツを縦並びにする
    const surfaceEl = findSurfaceContainer(container, 'rgba(255,255,255,0.85)')
    expect(surfaceEl).not.toBeNull()
    expect(surfaceEl?.style.getPropertyValue('flex-direction')).toBe('column')
  })

  it('surface スタイルがラベルを含むコンテナに適用される', () => {
    const { container } = render(
      <GenericCardRenderer
        definition={makeBlock({ label: 'LABEL', labelInset: true, labelInsetDir: 'col', surface: 'glass' })}
        values={VALUES}
        transparentBackground
      />
    )
    // glass background がラベルを含むコンテナに存在する
    const glassEl = findElemWithBg(container, 'rgba(255,255,255,0.55)')
    expect(glassEl).not.toBeNull()
    // そのコンテナがラベルテキストを子孫として持つ
    expect(glassEl?.textContent).toContain('LABEL')
  })

  it('dir=col 未指定時も surface コンテナが column（デフォルト）', () => {
    const { container } = render(
      <GenericCardRenderer
        definition={makeBlock({ label: 'LABEL', labelInset: true, surface: 'contained' })}
        values={VALUES}
        transparentBackground
      />
    )
    const surfaceEl = findSurfaceContainer(container, 'rgba(255,255,255,0.85)')
    expect(surfaceEl).not.toBeNull()
    expect(surfaceEl?.style.getPropertyValue('flex-direction')).toBe('column')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 5. labelInset: true, dir=row（横並び）
// ═══════════════════════════════════════════════════════════════════════════════

describe('GenericCardRenderer – labelInset: true, dir=row', () => {
  it('ラベルテキストが描画される', () => {
    const { container } = render(
      <GenericCardRenderer
        definition={makeBlock({ label: 'マイクON率', labelInset: true, labelInsetDir: 'row', surface: 'contained' })}
        values={VALUES}
        transparentBackground
      />
    )
    expect(container.textContent).toContain('マイクON率')
  })

  it('surface コンテナが flex-direction: row（横並び）', () => {
    const { container } = render(
      <GenericCardRenderer
        definition={makeBlock({ label: 'LABEL', labelInset: true, labelInsetDir: 'row', surface: 'contained' })}
        values={VALUES}
        transparentBackground
      />
    )
    // labelInset=true, row の場合、surface コンテナが flex-direction: row でラベルとコンテンツを横並びにする
    const surfaceEl = findSurfaceContainer(container, 'rgba(255,255,255,0.85)')
    expect(surfaceEl).not.toBeNull()
    expect(surfaceEl?.style.getPropertyValue('flex-direction')).toBe('row')
  })

  it('surface スタイルがラベルを含むコンテナに適用される', () => {
    const { container } = render(
      <GenericCardRenderer
        definition={makeBlock({ label: 'LABEL', labelInset: true, labelInsetDir: 'row', surface: 'flat' })}
        values={VALUES}
        transparentBackground
      />
    )
    const flatEl = findElemWithBg(container, 'rgba(255,255,255,0.95)')
    expect(flatEl).not.toBeNull()
    expect(flatEl?.textContent).toContain('LABEL')
  })

  it('row の場合 surface コンテナに align-items: center が設定される', () => {
    const { container } = render(
      <GenericCardRenderer
        definition={makeBlock({ label: 'LABEL', labelInset: true, labelInsetDir: 'row', surface: 'contained' })}
        values={VALUES}
        transparentBackground
      />
    )
    const surfaceEl = findSurfaceContainer(container, 'rgba(255,255,255,0.85)')
    expect(surfaceEl).not.toBeNull()
    expect(surfaceEl?.style.getPropertyValue('align-items')).toBe('center')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 6. labelInset: false + surface の組み合わせ（col/row の差異）
// ═══════════════════════════════════════════════════════════════════════════════

describe('GenericCardRenderer – labelInset: false vs true の描画位置の差異', () => {
  it('labelInset: false → surface コンテナの外にラベルが描画される（ラベルは surface bg の外）', () => {
    const { container } = render(
      <GenericCardRenderer
        definition={makeBlock({ label: 'OUTSIDE', labelInset: false, surface: 'glass' })}
        values={VALUES}
        transparentBackground
      />
    )
    const glassEl = findElemWithBg(container, 'rgba(255,255,255,0.55)')
    // glass コンテナの中にラベルテキストが含まれていない
    expect(glassEl?.textContent).not.toContain('OUTSIDE')
    // ただしラベルは全体には存在する
    expect(container.textContent).toContain('OUTSIDE')
  })

  it('labelInset: true → surface コンテナの内側にラベルが描画される', () => {
    const { container } = render(
      <GenericCardRenderer
        definition={makeBlock({ label: 'INSIDE', labelInset: true, labelInsetDir: 'col', surface: 'glass' })}
        values={VALUES}
        transparentBackground
      />
    )
    const glassEl = findElemWithBg(container, 'rgba(255,255,255,0.55)')
    // glass コンテナの中にラベルテキストが含まれる
    expect(glassEl?.textContent).toContain('INSIDE')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 7. 後方互換エイリアス
// ═══════════════════════════════════════════════════════════════════════════════

describe('GenericCardRenderer – surface 後方互換エイリアス', () => {
  it("surface='simple'（旧値）は 'contained' と同じ background を描画する", () => {
    const { container } = render(
      // @ts-expect-error 'simple' は後方互換エイリアス
      <GenericCardRenderer definition={makeBlock({ surface: 'simple' })} values={VALUES} transparentBackground />
    )
    expect(findElemWithBg(container, 'rgba(255,255,255,0.85)')).not.toBeNull()
  })

  it("surface='default'（旧値）は 'contained' と同じ background を描画する", () => {
    const { container } = render(
      // @ts-expect-error 'default' は後方互換エイリアス
      <GenericCardRenderer definition={makeBlock({ surface: 'default' })} values={VALUES} transparentBackground />
    )
    expect(findElemWithBg(container, 'rgba(255,255,255,0.85)')).not.toBeNull()
  })
})
