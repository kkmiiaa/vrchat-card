'use client'

import { useState } from 'react'
import type { ResolvedComponent } from '@/lib/components'
import TemplateComponentList from './BlockPreviewList'
import AbstractComponentPreview from './AbstractComponentPreview'

type Card = {
  id: string
  title: string | null
  card_data: Record<string, unknown>
  template_id: string
  created_at: string
  visibility: string
}

type Props = {
  templateComponents: ResolvedComponent[]
  componentKeyMap: Record<string, string>
  sampleCards: Card[]
}

type Tab = 'components' | 'template-components' | 'cards'

const TABS: { key: Tab; label: string; sub: string }[] = [
  { key: 'components',          label: 'コンポーネント',         sub: 'パーツのクラス（input_type）' },
  { key: 'template-components', label: 'テンプレートコンポーネント', sub: 'パーツのインスタンス（フィールド定義）' },
  { key: 'cards',               label: 'カード',                sub: '完成品のインスタンス' },
]

const COMPONENT_TYPES = [
  { inputType: 'expressive-select', search: '◎ tag で完全一致', format: '{ tag: string, display?: string }', example: '性別' },
  { inputType: 'select',            search: '◎ 完全一致',       format: 'string',                            example: 'フレンドポリシー' },
  { inputType: 'multi-select',      search: '◎ 配列内包含',     format: 'string[]',                          example: 'プレイ環境、言語' },
  { inputType: 'text',              search: '△ 全文検索のみ',   format: 'string',                            example: '自己紹介' },
  { inputType: 'number',            search: '○ 範囲検索',       format: 'number',                            example: 'マイクON率' },
  { inputType: 'boolean',           search: '◎',               format: 'boolean',                           example: 'フラグ系' },
  { inputType: 'sns',               search: '✕',               format: '{ vrchatId?, twitterId?, ... }',    example: 'SNSリンク' },
  { inputType: 'weekly-activity',   search: '✕',               format: '{ days, weekdayStart, ... }',       example: '活動時間' },
  { inputType: 'mark-list',        search: '✕',               format: '{ label, mark }[]',                 example: 'OK/NG' },
  { inputType: 'gallery',           search: '✕',               format: '{ images: string[] }',              example: '画像ギャラリー' },
]

const INPUT_TYPE_COLORS: Record<string, string> = {
  'expressive-select': 'bg-purple-100 text-purple-700',
  'multi-select':      'bg-blue-100 text-blue-700',
  'select':            'bg-sky-100 text-sky-700',
  'text':              'bg-gray-100 text-gray-600',
  'number':            'bg-orange-100 text-orange-700',
  'boolean':           'bg-green-100 text-green-700',
  'sns':               'bg-pink-100 text-pink-700',
  'weekly-activity':   'bg-teal-100 text-teal-700',
  'mark-list':         'bg-rose-100 text-rose-700',
  'gallery':           'bg-yellow-100 text-yellow-700',
}

export default function AdminClient({ templateComponents, componentKeyMap, sampleCards }: Props) {
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
        <div className="flex gap-1 mb-8 bg-gray-100 rounded-xl p-1 w-fit">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* 現在のタブの説明 */}
        <p className="text-xs text-gray-400 mb-6 -mt-4">
          {TABS.find(t => t.key === tab)?.sub}
        </p>

        {/* コンポーネント：input_type定義テーブル ＋ 抽象プレビュー */}
        {tab === 'components' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">input_type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">検索</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">card_data 値形式</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">用途例</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {COMPONENT_TYPES.map(c => (
                    <tr key={c.inputType} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${INPUT_TYPE_COLORS[c.inputType] ?? 'bg-gray-100 text-gray-600'}`}>
                          {c.inputType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{c.search}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.format}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{c.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AbstractComponentPreview />
          </div>
        )}

        {/* テンプレートコンポーネント：variantが固定されたフィールドインスタンス */}
        {tab === 'template-components' && <TemplateComponentList />}

        {/* カード：完成品のインスタンス */}
        {tab === 'cards' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900">最新カード（10件）</h2>
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
