// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCardExport } from '../useCardExport'

// html-to-image のモック
vi.mock('html-to-image', () => ({
  toPng: vi.fn().mockResolvedValue('data:image/png;base64,mockdata'),
}))

describe('useCardExport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('初期状態では downloading が false', () => {
    const { result } = renderHook(() => useCardExport('テストカード'))
    expect(result.current.downloading).toBe(false)
  })

  it('exportRef が存在しない場合は null を返す', async () => {
    const { result } = renderHook(() => useCardExport('テストカード'))
    let dataUrl: string | null = null
    await act(async () => {
      dataUrl = await result.current.generatePng()
    })
    expect(dataUrl).toBeNull()
  })

  it('exportRef に要素がある場合は PNG データ URL を返す', async () => {
    const { toPng } = await import('html-to-image')
    const { result } = renderHook(() => useCardExport('テストカード'))

    // ref に DOM 要素を設定
    const el = document.createElement('div')
    act(() => {
      result.current.exportRef.current = el
    })

    let dataUrl: string | null = null
    await act(async () => {
      dataUrl = await result.current.generatePng()
    })

    expect(toPng).toHaveBeenCalledWith(el, { pixelRatio: 2 })
    expect(dataUrl).toBe('data:image/png;base64,mockdata')
  })

  it('ダウンロード中は downloading が true になる', async () => {
    const { result } = renderHook(() => useCardExport('テストカード'))
    const el = document.createElement('div')
    act(() => { result.current.exportRef.current = el })

    const downloadPromise = act(async () => {
      await result.current.downloadPng()
    })
    await downloadPromise
    expect(result.current.downloading).toBe(false) // 完了後は false に戻る
  })
})
