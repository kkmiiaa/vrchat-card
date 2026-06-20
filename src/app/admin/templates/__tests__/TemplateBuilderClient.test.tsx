import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, act } from '@testing-library/react'
import type { TemplateLayoutRow } from '@/lib/templateLayout'

vi.mock('@/lib/fontMap', () => ({ fontMap: {} }))
vi.mock('next/font/google', () => new Proxy({}, { get: () => () => ({ style: { fontFamily: 'mock' } }) }))
vi.mock('next/font/local',  () => ({ default: () => ({ style: { fontFamily: 'mock' } }) }))

// TemplateBuilder は巨大なので丸ごとモックし、onLabelChange コールバックだけ取り出す
let capturedOnLabelChange: ((id: string, label: string) => void) | undefined
vi.mock('../../TemplateBuilder', () => ({
  default: ({ onLabelChange }: { onLabelChange?: (id: string, label: string) => void }) => {
    capturedOnLabelChange = onLabelChange
    return null
  },
}))

const mockSaveTemplateLayout = vi.fn().mockResolvedValue({ error: null })
vi.mock('@/lib/templateLayout', () => ({
  saveTemplateLayout:    (...args: unknown[]) => mockSaveTemplateLayout(...args),
  linkTemplateToCommunity: vi.fn().mockResolvedValue({ error: null }),
}))

const baseRow: TemplateLayoutRow = {
  id: 'v1',
  label: '旧ラベル',
  description: null,
  is_published: true,
  card_layout:        { type: 'row', children: [] },
  web_layout:         { type: 'row', children: [] },
  block_pool:         null,
  form_sections:      null,
  orientation_scales: { card: {}, web: {} },
  overlay_config:     null,
  card_width:         900,
  card_height:        506,
  web_width:          630,
  card_config:        null,
  community_slugs:    [],
  sample_card_data:   null,
  template_config:    null,
}

describe('TemplateBuilderClient', () => {
  beforeEach(() => {
    capturedOnLabelChange = undefined
    mockSaveTemplateLayout.mockClear()
  })

  it('handleLabelChange: saveTemplateLayout を setState updater の外で呼ぶ', async () => {
    const { default: TemplateBuilderClient } = await import('../TemplateBuilderClient')

    render(
      <TemplateBuilderClient
        savedLayouts={{ v1: baseRow }}
        communities={[]}
      />
    )

    expect(capturedOnLabelChange).toBeDefined()

    // React の「setState 中に別 setState」警告が出ないことを確認
    const consoleError = vi.spyOn(console, 'error')

    await act(async () => {
      capturedOnLabelChange!('v1', '新ラベル')
    })

    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining('Cannot update a component'),
      expect.anything(),
      expect.anything(),
    )

    // DB 保存が呼ばれること
    expect(mockSaveTemplateLayout).toHaveBeenCalledWith('v1', expect.objectContaining({ label: '新ラベル' }))

    consoleError.mockRestore()
  })

  it('handleLabelChange: card_layout / web_layout がない行は saveTemplateLayout を呼ばない', async () => {
    const { default: TemplateBuilderClient } = await import('../TemplateBuilderClient')
    const rowWithoutLayout: TemplateLayoutRow = { ...baseRow, card_layout: null, web_layout: null }

    render(
      <TemplateBuilderClient
        savedLayouts={{ v1: rowWithoutLayout }}
        communities={[]}
      />
    )

    await act(async () => {
      capturedOnLabelChange!('v1', '新ラベル')
    })

    expect(mockSaveTemplateLayout).not.toHaveBeenCalled()
  })
})
