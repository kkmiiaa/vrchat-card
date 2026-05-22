'use client'

import { useState } from 'react'
import type { ResolvedComponent } from '@/lib/components'
import { cardV1Definition } from '@/templates/v1Definition'
import { cardV2Definition } from '@/templates/v2Definition'
import TemplateBuilder from './TemplateBuilder'
import type { TemplateDefinition } from '@/blocks/types'
import ComponentBlockList, { COMPONENTS, COMPONENT_CATEGORIES, COMPONENT_SUPPORTS_BG_VARIANT } from './BlockPreviewList'

const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  cardV1Definition,
  cardV2Definition,
]


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

type Tab = 'components' | 'templates' | 'cards'

const TABS: { key: Tab; label: string; sub: string }[] = [
  { key: 'components',          label: 'コンポーネント',            sub: 'パーツのクラス（input_type）' },
  { key: 'templates',           label: 'テンプレート',              sub: '完成品のクラス（汎用レンダラープレビュー）' },
  { key: 'cards',               label: 'カード',                   sub: '完成品のインスタンス' },
]

const SAMPLE_VALUES = {
  name: 'サンプル ユーザー',
  gender: { tag: 'female', display: '女性' },
  age: { searchTag: '18+', display: '20代' },
  playEnv: ['PCVR', 'Quest'],
  language: ['日本語', 'English'],
  micOnRate: 60,
  selfIntro: 'はじめまして！\nVRChatでよく遊んでいます。\nお気軽に話しかけてください。',
  friendPolicy: ['frPolicyAfterGettingToKnow'],
  sns: { vrchatId: 'sample_user', twitterId: '@sample', discordId: 'sample#0000', friendPolicy: 'frPolicyAfterGettingToKnow' },
  trustRank: 'Known User',
  activity: { days: [true, true, true, true, true, false, true], weekdayStart: '20:00', weekdayEnd: '00:00', holidayStart: '14:00', holidayEnd: '02:00' },
  status: { blue: 'フレンド歓迎', green: '通話OK', yellow: 'AFK', red: 'DND' },
  profileImage: { base64: null, url: 'https://placehold.co/200x200/e5e7eb/9ca3af?text=Photo' },
  background: { type: 'gradient', value: ['#fcd5ce', '#e0f7fa'], base64: null },
  // CardV1 実寸: overlay inset 20px + PAD_X 27px = 47px → inset:20, innerPadding:27
  overlay: { variant: 'glass', opacity: 82, inset: { top: 20, right: 20, bottom: 20, left: 20 }, borderRadius: 20, innerPadding: 27 },
  interactions: [
    { label: 'VC', mark: '◎' },
    { label: 'テキスト', mark: '◯' },
    { label: 'ギミック', mark: '◎' },
    { label: 'ダンス', mark: '◯' },
    { label: 'ハグ', mark: '△' },
    { label: '写真撮影', mark: '◎' },
  ],
}

export default function AdminClient({ templateComponents: _, componentKeyMap: __, sampleCards }: Props) {
  const [tab, setTab] = useState<Tab>('components')
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  const isFullHeight = tab === 'templates'

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 h-12 flex items-center gap-6 flex-shrink-0">
        <a href="/" className="text-[#00AADB] font-black text-lg">vaacard</a>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-semibold text-gray-600 mr-2">Admin</span>

        {/* タブ（ヘッダー内） */}
        <nav className="flex items-center gap-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                tab === t.key
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* サブタイトル */}
        <span className="text-xs text-gray-400 ml-auto">
          {TABS.find(t => t.key === tab)?.sub}
        </span>
      </header>

      {/* コンテンツ（ヘッダー高さ分オフセット） */}
      {tab === 'components' && (
        <div className="flex mt-12" style={{ height: 'calc(100vh - 3rem)' }}>
          {/* サイドバー */}
          <nav className="w-48 shrink-0 border-r border-gray-100 bg-white overflow-y-auto py-4">
            {COMPONENT_CATEGORIES.map((cat, i) => {
              const items = COMPONENTS.filter(c => c.category === cat.key)
              if (items.length === 0) return null
              const isPromoted = cat.key === 'global'
              return (
                <div key={cat.key} className={i > 0 ? 'mt-4' : ''}>
                  <p className="px-4 mb-1 text-[10px] font-semibold text-gray-300 uppercase tracking-wider">{cat.label}</p>
                  {items.map(c => (
                    <a
                      key={c.name}
                      href={`#component-${c.name}`}
                      onClick={e => { e.preventDefault(); document.getElementById(`component-${c.name}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                      className={`block px-4 py-1.5 text-xs rounded-lg mx-2 transition-colors ${
                        isPromoted
                          ? 'text-violet-500 hover:text-violet-700 hover:bg-violet-50'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {c.name}
                    </a>
                  ))}
                </div>
              )
            })}
          </nav>
          {/* メインコンテンツ */}
          <main className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-4xl mx-auto">
              <ComponentBlockList />
            </div>
          </main>
        </div>
      )}

      {/* テンプレートビルダー */}
      {tab === 'templates' && (
        <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 3rem)', marginTop: '3rem' }}>
          <TemplateBuilder definitions={TEMPLATE_DEFINITIONS} values={SAMPLE_VALUES} />
        </div>
      )}

      {tab === 'cards' && (
        <main className="max-w-5xl mx-auto px-6 py-8 w-full space-y-4 mt-12">
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
        </main>
      )}
    </div>
  )
}
