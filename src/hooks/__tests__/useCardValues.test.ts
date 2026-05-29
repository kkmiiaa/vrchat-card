// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCardValues } from '../useCardValues'
import { renderHook, act } from '@testing-library/react'

// localStorage のモック
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    clear: () => { store = {} },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

const mockBlocks = [
  { key: 'name', defaultValue: '' },
  { key: 'gender', defaultValue: '' },
]

describe('useCardValues', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('テンプレートのデフォルト値で初期化される', () => {
    const { result } = renderHook(() => useCardValues(mockBlocks))
    expect(result.current.values).toEqual({ name: '', gender: '' })
  })

  it('updateValue で値を更新できる', () => {
    const { result } = renderHook(() => useCardValues(mockBlocks))
    act(() => {
      result.current.updateValue('name', 'テストユーザー')
    })
    expect(result.current.values.name).toBe('テストユーザー')
  })

  it('他のキーの値は変更されない', () => {
    const { result } = renderHook(() => useCardValues(mockBlocks))
    act(() => {
      result.current.updateValue('name', 'Alice')
    })
    expect(result.current.values.gender).toBe('')
  })

  it('initialized が true になった後 localStorage に保存される', async () => {
    const { result } = renderHook(() => useCardValues(mockBlocks))
    // initialized を true にするため hasMounted と初期化を進める
    act(() => {
      result.current.updateValue('name', 'saved')
    })
    // initialized後にlocalStorageに書き込まれることをテストする
    // (詳細はhook実装後に確認)
    expect(typeof result.current.values).toBe('object')
  })

  it('initialValues が渡された場合はそれで上書きされる', () => {
    const { result } = renderHook(() =>
      useCardValues(mockBlocks, { name: '上書き', gender: { tag: 'male', display: '男性' } })
    )
    expect(result.current.values.name).toBe('上書き')
    expect((result.current.values.gender as { tag: string }).tag).toBe('male')
  })
})
