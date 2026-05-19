'use client'

import { useState } from 'react'
import type { ResolvedComponent } from '@/lib/components'
import ComponentPreview from './ComponentPreview'

type Card = {
  id: string
  title: string | null
  card_data: Record<string, unknown>
  template_id: string
  created_at: string
  visibility: string
}

type Props = {
  baseComponents: ResolvedComponent[]
  communityComponents: ResolvedComponent[]
  componentKeyMap: Record<string, string>
  sampleCards: Card[]
}

type Tab = 'components' | 'community' | 'template' | 'cards'

const TABS: { key: Tab; label: string }[] = [
  { key: 'components', label: 'コンポーネント' },
  { key: 'community',  label: '界隈コンポーネント' },
  { key: 'template',   label: 'テンプレート' },
  { key: 'cards',      label: 'カードデータ' },
]

const INPUT_TYPE_COLORS: Record<string, string> = {
  'expressive-select': 'bg-purple-100 text-purple-700',
  'multi-select':      'bg-blue-100 text-blue-700',
  'select':            'bg-sky-100 text-sky-700',
  'text':              'bg-gray-100 text-gray-600',
  'number':            'bg-orange-100 text-orange-700',
  'boolean':           'bg-green-100 text-green-700',
  'sns':               'bg-pink-100 text-pink-700',
  'gallery':           'bg-yellow-100 text-yellow-700',
}

export default function AdminClient({ baseComponents, communityComponents, componentKeyMap, sampleCards }: Props) {
  const [tab, setTab] = useState<Tab>('components')
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <a href="/" className="text-[#00AADB] font-black text-lg">vaacard</a>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-semibold text-gray-600">Admin</span>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* タブ */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* コンポーネント：抽象的なフィールド定義 */}
        {tab === 'components' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">コンポーネント</h2>
              <p className="text-sm text-gray-400 mt-0.5">界隈・テンプレートに依存しない汎用フィールド定義</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 w-32">key</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 w-28">input_type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 w-20">検索</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">base_options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {baseComponents.map(c => (
                    <tr key={c.key} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{c.key}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${INPUT_TYPE_COLORS[c.input_type] ?? 'bg-gray-100 text-gray-600'}`}>
                          {c.input_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-400">{c.is_searchable ? '✓' : '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{c.options?.join(', ') ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 界隈コンポーネント：VRChat界隈による上書き */}
        {tab === 'community' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">界隈コンポーネント</h2>
              <p className="text-sm text-gray-400 mt-0.5">VRChat界隈がコンポーネントをどう上書きするか（ラベル・card_dataキー・選択肢）</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 w-32">component_key</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 w-32">card_data key</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 w-24">label</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 w-28">input_type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">options（上書き後）</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {communityComponents.map(c => (
                    <tr key={c.key} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{c.key}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[#00AADB]">{componentKeyMap[c.key] ?? c.key}</td>
                      <td className="px-4 py-3 text-gray-900 text-xs">{c.label}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${INPUT_TYPE_COLORS[c.input_type] ?? 'bg-gray-100 text-gray-600'}`}>
                          {c.input_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{c.options?.join(', ') ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* テンプレート：FormItemのデザインプレビュー */}
        {tab === 'template' && <ComponentPreview />}

        {/* カードデータ */}
        {tab === 'cards' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">カードデータ</h2>
              <p className="text-sm text-gray-400 mt-0.5">最新10件のcard_dataを確認</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {sampleCards.map(card => (
                <div
                  key={card.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-[#00AADB] transition-colors"
                  onClick={() => setSelectedCard(selectedCard?.id === card.id ? null : card)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs text-gray-400">{card.id}</span>
                      <span className="text-sm font-medium text-gray-700">{card.title ?? '(untitled)'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        card.visibility === 'public' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>{card.visibility}</span>
                      <span className="text-xs text-gray-400">{card.template_id}</span>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{new Date(card.created_at).toLocaleDateString('ja-JP')}</span>
                  </div>
                  {selectedCard?.id === card.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">card_data</p>
                      <pre className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 overflow-auto max-h-96 whitespace-pre-wrap">
                        {JSON.stringify(card.card_data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
