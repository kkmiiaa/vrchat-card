'use client'

import { useState } from 'react'
import TemplateBuilder from '../TemplateBuilder'
import type { TemplateDefinition } from '@/blocks/types'
import type { TemplateLayoutRow, CommunityRow } from '@/lib/templateLayout'
import { saveTemplateLayout, linkTemplateToCommunity } from '@/lib/templateLayout'

type Props = {
  definitions: TemplateDefinition[]
  savedLayouts: Record<string, TemplateLayoutRow>
  communities: CommunityRow[]
}

type Tab = 'edit' | 'new'

const BASE_OPTIONS = [
  { value: 'v2', label: 'v2（Glass Card）' },
  { value: 'v1', label: 'v1（Standard）' },
]

export default function TemplateBuilderClient({ definitions: initialDefinitions, savedLayouts: initialLayouts, communities }: Props) {
  const [tab, setTab] = useState<Tab>('edit')
  const [definitions, setDefinitions] = useState(initialDefinitions)
  const [savedLayouts, setSavedLayouts] = useState(initialLayouts)

  // 新規作成フォーム
  const [newId, setNewId] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [baseId, setBaseId] = useState('v2')
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>(
    communities.length === 1 ? [communities[0].slug] : []
  )
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const toggleCommunity = (slug: string) => {
    setSelectedCommunities(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  const handleCreate = async () => {
    const id = newId.trim()
    const label = newLabel.trim()
    if (!id || !label) { setCreateError('ID とラベルは必須です'); return }
    if (!/^[a-z0-9-]+$/.test(id)) { setCreateError('ID は英小文字・数字・ハイフンのみ使用できます'); return }
    if (definitions.find(d => d.id === id)) { setCreateError('そのIDはすでに存在します'); return }
    if (selectedCommunities.length === 0) { setCreateError('界隈を1つ以上選択してください'); return }

    const baseDef = definitions.find(d => d.id === baseId) ?? definitions[0]
    const baseLayout = savedLayouts[baseId]

    setCreating(true)
    setCreateError('')

    const cardLayout = baseLayout?.card_layout ?? baseDef.card.layout
    const webLayout  = baseLayout?.web_layout  ?? baseDef.web.layout
    const formSections    = baseLayout?.form_sections    ?? []
    const orientationScales = baseLayout?.orientation_scales ?? { card: {}, web: {} }

    // 1. テンプレート保存
    const { error: saveError } = await saveTemplateLayout(id, {
      label,
      description: newDescription.trim() || undefined,
      card_layout:        cardLayout,
      web_layout:         webLayout,
      form_sections:      formSections,
      orientation_scales: orientationScales,
    })

    if (saveError) {
      setCreateError(saveError)
      setCreating(false)
      return
    }

    // 2. 界隈と紐づけ
    const linkResults = await Promise.all(
      selectedCommunities.map((slug, i) => linkTemplateToCommunity(id, slug, (i + 1) * 10))
    )
    const linkError = linkResults.find(r => r.error)?.error
    if (linkError) {
      setCreateError(`テンプレートは作成されましたが、界隈との紐づけに失敗しました: ${linkError}`)
      setCreating(false)
      return
    }

    // ローカルに定義を追加
    const newDef: TemplateDefinition = { ...baseDef, id, label }
    setDefinitions(prev => [...prev, newDef])
    setSavedLayouts(prev => ({
      ...prev,
      [id]: {
        id, label,
        description: newDescription.trim() || null,
        is_published: false,
        card_layout:        cardLayout,
        web_layout:         webLayout,
        block_pool:         baseLayout?.block_pool ?? null,
        form_sections:      formSections,
        orientation_scales: orientationScales,
        overlay_config:     null,
        card_width:         baseLayout?.card_width  ?? null,
        card_height:        baseLayout?.card_height ?? null,
        web_width:          baseLayout?.web_width   ?? null,
        card_config:        baseLayout?.card_config ?? null,
        community_slugs:    baseLayout?.community_slugs ?? [],
        sample_card_data:   baseLayout?.sample_card_data ?? null,
      },
    }))

    // フォームリセット → 編集タブに切り替え
    setNewId(''); setNewLabel(''); setNewDescription(''); setBaseId('v2')
    setSelectedCommunities(communities.length === 1 ? [communities[0].slug] : [])
    setCreating(false)
    setTab('edit')
  }

  const handleLabelChange = async (id: string, label: string) => {
    // ローカルに即時反映
    setDefinitions(prev => prev.map(d => d.id === id ? { ...d, label } : d))
    setSavedLayouts(prev => {
      const saved = prev[id]
      if (!saved) return prev
      // DB 保存は最新の state を参照するためここで行う
      if (saved.card_layout && saved.web_layout) {
        saveTemplateLayout(id, {
          label,
          card_layout:        saved.card_layout,
          web_layout:         saved.web_layout,
          form_sections:      saved.form_sections ?? [],
          orientation_scales: saved.orientation_scales ?? { card: {}, web: {} },
        })
      }
      return { ...prev, [id]: { ...saved, label } }
    })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* サブタブ */}
      <div className="flex border-b bg-white flex-shrink-0 px-4 gap-1 pt-1">
        {([['edit', 'テンプレート編集'], ['new', '＋ 新規作成']] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors ${
              tab === key
                ? 'bg-gray-100 text-gray-900 border border-b-0 border-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'edit' && (
        <div className="flex flex-1 overflow-hidden">
          <TemplateBuilder definitions={definitions} savedLayouts={savedLayouts} onLabelChange={handleLabelChange} />
        </div>
      )}

      {tab === 'new' && (
        <div className="flex-1 overflow-y-auto flex items-start justify-center pt-12 px-6">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 flex flex-col gap-5">
            <h2 className="text-base font-semibold text-gray-800">新規テンプレート作成</h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">テンプレート ID <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={newId}
                onChange={e => { setNewId(e.target.value); setCreateError('') }}
                placeholder="例: v3, my-template"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
              <p className="text-[10px] text-gray-400">英小文字・数字・ハイフンのみ</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">ラベル <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={newLabel}
                onChange={e => { setNewLabel(e.target.value); setCreateError('') }}
                placeholder="例: VRChat カード v3"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">説明</label>
              <input
                type="text"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                placeholder="省略可"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                紐づける界隈 <span className="text-red-400">*</span>
              </label>
              {communities.length === 0 ? (
                <p className="text-xs text-gray-400">界隈が登録されていません</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {communities.map(c => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => { toggleCommunity(c.slug); setCreateError('') }}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        selectedCommunities.includes(c.slug)
                          ? 'border-sky-400 bg-sky-50 text-sky-700 font-medium'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">コピー元テンプレート</label>
              <div className="flex gap-2">
                {BASE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setBaseId(opt.value)}
                    className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${
                      baseId === opt.value
                        ? 'border-sky-400 bg-sky-50 text-sky-700 font-medium'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {createError && <p className="text-xs text-red-500">{createError}</p>}

            <button
              onClick={handleCreate}
              disabled={creating || !newId.trim() || !newLabel.trim() || selectedCommunities.length === 0}
              className="w-full py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 disabled:opacity-40 transition-colors"
            >
              {creating ? '作成中…' : '作成してビルダーで編集'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
