'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import HeaderAuth from '@/components/HeaderAuth'
import { createCard } from '@/lib/saveCard'
import { v1Template } from '@/templates/v1'
import { v2Template } from '@/templates/v2'
import type { CardTemplate } from '@/blocks/types'

const TEMPLATES = [v2Template, v1Template]

function CardPreview({ tpl }: { tpl: CardTemplate }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const W = tpl.cardWidth
  const H = tpl.cardHeight

  useEffect(() => {
    if (!containerRef.current) return
    let lastWidth = -1
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      if (w === lastWidth) return
      lastWidth = w
      setScale(w / W)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [W])

  return (
    <div ref={containerRef} style={{ width: '100%', height: H * scale, overflow: 'hidden' }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: W, height: H, pointerEvents: 'none' }}>
        <tpl.PreviewCard />
      </div>
    </div>
  )
}

export default function TemplateSelector() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = Array.from(new Set(TEMPLATES.flatMap(t => t.communities)))

  const filtered = activeTag
    ? TEMPLATES.filter(t => t.communities.includes(activeTag))
    : TEMPLATES

  async function handleSelect(templateId: string) {
    setLoading(templateId)
    const result = await createCard({ templateId })
    if ('error' in result) {
      alert('カードの作成に失敗しました: ' + result.error)
      setLoading(null)
      return
    }
    router.push(`/card/${result.cardId}`)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full border-2 border-sky-100 opacity-50" />
        <div className="absolute bottom-20 -left-10 w-48 h-48 rounded-full border border-cyan-100 opacity-40" />
        <div className="absolute top-0 right-0 w-80 h-60 bg-sky-50 rounded-full blur-[70px] opacity-60" />
      </div>

      <header className="relative z-10 border-b border-sky-100 h-14 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md">
        <Link href="/" className="text-xl font-black tracking-tight text-[#00AADB]">vaacard</Link>
        <HeaderAuth />
      </header>

      <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 mb-4">
            <span className="text-sky-400 font-black text-sm">#</span>
            <span className="text-xs text-sky-500 font-semibold">テンプレート選択</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">テンプレートを選ぶ</h1>
          <p className="text-sm text-gray-400">気に入ったデザインを選んでカードを作りましょう。</p>
        </div>

        {/* 界隈タグフィルター */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-8">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeTag === null
                  ? 'bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white border-transparent shadow-sm shadow-sky-200'
                  : 'border-sky-200 text-sky-400 hover:border-[#00AADB] hover:text-[#00AADB] bg-white'
              }`}
            >
              すべて
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  activeTag === tag
                    ? 'bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white border-transparent shadow-sm shadow-sky-200'
                    : 'border-sky-200 text-sky-400 hover:border-[#00AADB] hover:text-[#00AADB] bg-white'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* テンプレートグリッド */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-300 text-sm">
            該当するテンプレートがありません
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {filtered.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => handleSelect(tpl.id)}
                disabled={loading !== null}
                className="group text-left disabled:opacity-50"
              >
                {/* カードプレビュー */}
                <div className="rounded-2xl overflow-hidden shadow-md shadow-sky-100 ring-1 ring-sky-100 transition-all group-hover:shadow-lg group-hover:shadow-sky-200 group-hover:ring-[#00AADB]/30 mb-3 aspect-video relative">
                  {loading === tpl.id ? (
                    <div className="absolute inset-0 bg-sky-50 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-sky-200 border-t-[#00AADB] rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="absolute inset-0">
                      <CardPreview tpl={tpl} />
                    </div>
                  )}
                </div>

                {/* メタ情報 */}
                <div className="px-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-800">{tpl.title}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${tpl.badgeColor}`}>
                      {tpl.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{tpl.desc}</p>
                  {tpl.communities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tpl.communities.map(c => (
                        <span key={c} className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-sky-200 text-sky-400 bg-white">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
