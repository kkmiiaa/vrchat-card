'use client'

import { useState } from 'react'
import type { CommunityRow } from '@/lib/templateLayout'
import { saveCommunity, updateCommunitySortOrders } from '@/lib/templateLayout'

type Props = {
  initialCommunities: CommunityRow[]
}

const EMPTY_FORM = { slug: '', label: '', description: '' }

export default function CommunitiesClient({ initialCommunities }: Props) {
  const [communities, setCommunities] = useState(initialCommunities)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState<string | null>(null)

  // ─── 新規 / 編集フォーム ────────────────────────────────────────────────

  const openNew = () => {
    setEditingSlug('__new__')
    setForm(EMPTY_FORM)
    setError('')
  }

  const openEdit = (c: CommunityRow) => {
    setEditingSlug(c.slug)
    setForm({ slug: c.slug, label: c.label, description: c.description ?? '' })
    setError('')
  }

  const closeForm = () => { setEditingSlug(null); setForm(EMPTY_FORM); setError('') }

  const handleSave = async () => {
    const slug  = form.slug.trim()
    const label = form.label.trim()
    if (!slug || !label) { setError('スラッグとラベルは必須です'); return }
    if (!/^[a-z0-9-]+$/.test(slug)) { setError('スラッグは英小文字・数字・ハイフンのみ'); return }
    if (editingSlug === '__new__' && communities.find(c => c.slug === slug)) {
      setError('そのスラッグはすでに存在します'); return
    }

    setSaving(true); setError('')
    const maxOrder = Math.max(0, ...communities.map(c => c.sort_order ?? 0))
    const { error: err } = await saveCommunity({
      slug,
      label,
      description: form.description.trim() || undefined,
      sort_order:  editingSlug === '__new__' ? maxOrder + 10 : undefined,
    })
    setSaving(false)

    if (err) { setError(err); return }

    if (editingSlug === '__new__') {
      setCommunities(prev => [...prev, { slug, label, description: form.description.trim() || null, sort_order: maxOrder + 10 }])
    } else {
      setCommunities(prev => prev.map(c => c.slug === slug
        ? { ...c, label, description: form.description.trim() || null }
        : c
      ))
    }
    closeForm()
  }

  // ─── ドラッグ＆ドロップで並べ替え ──────────────────────────────────────

  const handleDragStart = (slug: string) => setDragging(slug)
  const handleDragOver  = (e: React.DragEvent, targetSlug: string) => {
    e.preventDefault()
    if (!dragging || dragging === targetSlug) return
    setCommunities(prev => {
      const from = prev.findIndex(c => c.slug === dragging)
      const to   = prev.findIndex(c => c.slug === targetSlug)
      if (from < 0 || to < 0) return prev
      const next = [...prev]
      next.splice(to, 0, next.splice(from, 1)[0])
      return next
    })
  }
  const handleDragEnd = async () => {
    setDragging(null)
    const items = communities.map((c, i) => ({ slug: c.slug, sort_order: (i + 1) * 10 }))
    await updateCommunitySortOrders(items)
  }

  const isNew = editingSlug === '__new__'
  const isEditing = editingSlug !== null

  return (
    <div className="flex h-full overflow-hidden">
      {/* 左: リスト */}
      <div className="w-72 shrink-0 border-r bg-white flex flex-col">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-800">界隈一覧</span>
          <button
            onClick={openNew}
            className="text-xs text-sky-500 hover:text-sky-700 font-medium"
          >
            ＋ 追加
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {communities.length === 0 && (
            <p className="text-xs text-gray-400 px-4 py-3">界隈がありません</p>
          )}
          {communities.map(c => (
            <div
              key={c.slug}
              draggable
              onDragStart={() => handleDragStart(c.slug)}
              onDragOver={e => handleDragOver(e, c.slug)}
              onDragEnd={handleDragEnd}
              onClick={() => openEdit(c)}
              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer select-none transition-colors ${
                editingSlug === c.slug
                  ? 'bg-sky-50 border-r-2 border-sky-400'
                  : 'hover:bg-gray-50'
              } ${dragging === c.slug ? 'opacity-40' : ''}`}
            >
              <span className="text-gray-300 text-xs cursor-grab">⠿</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{c.label}</p>
                <p className="text-[10px] text-gray-400 truncate">{c.slug}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="px-4 py-2 text-[10px] text-gray-300 border-t">
          ドラッグで並べ替え（自動保存）
        </p>
      </div>

      {/* 右: フォーム */}
      <div className="flex-1 overflow-y-auto flex items-start justify-center pt-12 px-6">
        {!isEditing ? (
          <div className="text-center text-gray-400 text-sm mt-12">
            <p>界隈を選択するか、「＋ 追加」で新規作成</p>
          </div>
        ) : (
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 flex flex-col gap-5">
            <h2 className="text-base font-semibold text-gray-800">
              {isNew ? '新規界隈を追加' : '界隈を編集'}
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                スラッグ <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={e => { setForm(f => ({ ...f, slug: e.target.value })); setError('') }}
                disabled={!isNew}
                placeholder="例: vrchat, trpg"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:bg-gray-50 disabled:text-gray-400"
              />
              <p className="text-[10px] text-gray-400">英小文字・数字・ハイフンのみ。作成後は変更不可</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                ラベル <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.label}
                onChange={e => { setForm(f => ({ ...f, label: e.target.value })); setError('') }}
                placeholder="例: VRChat"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">説明</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="省略可"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={closeForm}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.slug.trim() || !form.label.trim()}
                className="flex-1 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 disabled:opacity-40 transition-colors"
              >
                {saving ? '保存中…' : '保存'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
