'use client'

import { useState } from 'react'

type Card = {
  id: string
  title: string | null
  card_data: Record<string, unknown>
  template_id: string
  created_at: string
  visibility: string
}

export default function CardsClient({ cards }: { cards: Card[] }) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 w-full space-y-4 overflow-y-auto h-full">
      <h2 className="text-base font-bold text-gray-900">最新カード（{cards.length}件）</h2>
      <div className="grid grid-cols-1 gap-3">
        {cards.map(card => (
          <div
            key={card.id}
            className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-[#00AADB] transition-colors"
            onClick={() => setSelected(selected === card.id ? null : card.id)}
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
              <span className="text-xs text-gray-400 shrink-0">
                {new Date(card.created_at).toLocaleDateString('ja-JP')}
              </span>
            </div>
            {selected === card.id && (
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
    </main>
  )
}
