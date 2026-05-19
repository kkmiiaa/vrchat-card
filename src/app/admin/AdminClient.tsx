'use client'

import { useState } from 'react'
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
  sampleCards: Card[]
}

type Tab = 'components' | 'cards'

export default function AdminClient({ sampleCards }: Props) {
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
          {(['components', 'cards'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'components' ? 'コンポーネント' : 'カードデータ'}
            </button>
          ))}
        </div>

        {tab === 'components' && <ComponentPreview />}

        {tab === 'cards' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">最新カードデータ（10件）</h2>
            <div className="grid grid-cols-1 gap-3">
              {sampleCards.map(card => (
                <div
                  key={card.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-[#00AADB] transition-colors"
                  onClick={() => setSelectedCard(selectedCard?.id === card.id ? null : card)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-gray-400">{card.id}</span>
                      <span className="text-sm font-medium text-gray-700">{card.title ?? '(untitled)'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        card.visibility === 'public' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>{card.visibility}</span>
                      <span className="text-xs text-gray-400">{card.template_id}</span>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(card.created_at).toLocaleDateString('ja-JP')}</span>
                  </div>

                  {selectedCard?.id === card.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h3 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">card_data</h3>
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
