'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { NotificationsResponse } from '@/app/api/notifications/route'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'system' | 'activity'>('system')
  const [data, setData] = useState<NotificationsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // パネル外クリックで閉じる
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // パネルを開いたとき既読にする
  const handleOpen = async () => {
    setOpen(prev => !prev)
    if (!open && data) {
      const systemIds = data.system.filter(n => !n.read).map(n => n.id)
      const activityIds = data.activity.filter(n => !n.read_at).map(n => n.id)
      if (systemIds.length || activityIds.length) {
        await fetch('/api/notifications/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ systemIds, activityIds }),
        })
        // ローカルで既読状態を更新
        setData(prev => prev ? {
          ...prev,
          unread_count: 0,
          system: prev.system.map(n => ({ ...n, read: true })),
          activity: prev.activity.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })),
        } : null)
      }
    }
  }

  const unread = data?.unread_count ?? 0

  return (
    <div className="relative" ref={panelRef}>
      {/* ベルボタン */}
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        aria-label="通知"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* 通知パネル */}
      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* タブ */}
          <div className="flex border-b border-gray-100">
            {(['system', 'activity'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                  tab === t
                    ? 'text-[#00AADB] border-b-2 border-[#00AADB]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t === 'system' ? 'お知らせ' : 'アクティビティ'}
              </button>
            ))}
          </div>

          {/* コンテンツ */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-sky-200 border-t-[#00AADB] rounded-full animate-spin" />
              </div>
            ) : tab === 'system' ? (
              <SystemNotifications items={data?.system ?? []} />
            ) : (
              <ActivityNotifications items={data?.activity ?? []} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SystemNotifications({ items }: { items: NotificationsResponse['system'] }) {
  if (items.length === 0) {
    return <EmptyState text="お知らせはありません" />
  }
  return (
    <ul>
      {items.map(n => (
        <li key={n.id} className={`px-4 py-3 border-b border-gray-50 last:border-0 ${!n.read ? 'bg-sky-50/50' : ''}`}>
          <p className="text-xs font-semibold text-gray-800 mb-0.5">{n.title}</p>
          <p className="text-xs text-gray-500 leading-relaxed">{n.body}</p>
          <p className="text-[10px] text-gray-300 mt-1">{formatDate(n.created_at)}</p>
        </li>
      ))}
    </ul>
  )
}

function ActivityNotifications({ items }: { items: NotificationsResponse['activity'] }) {
  if (items.length === 0) {
    return <EmptyState text="アクティビティはありません" />
  }
  return (
    <ul>
      {items.map(n => (
        <li key={n.id} className={`px-4 py-3 border-b border-gray-50 last:border-0 flex items-start gap-3 ${!n.read_at ? 'bg-sky-50/50' : ''}`}>
          {/* アバター */}
          <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden">
            {n.from_profile?.avatar_url
              ? <img src={n.from_profile.avatar_url} alt="" className="w-full h-full object-cover" />
              : (n.from_profile?.display_name?.[0] ?? '?')
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-700">
              <span className="font-semibold">{n.from_profile?.display_name ?? 'ユーザー'}</span>
              {n.type === 'like' && ' があなたのカードにいいねしました'}
            </p>
            <p className="text-[10px] text-gray-300 mt-0.5">{formatDate(n.created_at)}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-300">
      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <p className="text-xs">{text}</p>
    </div>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = (now.getTime() - d.getTime()) / 1000
  if (diff < 60) return 'たった今'
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`
  return `${Math.floor(diff / 86400)}日前`
}
