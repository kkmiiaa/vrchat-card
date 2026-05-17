'use client'

import { useEffect, useState } from 'react'

type Announcement = {
  id: string
  title: string
  body: string
  published_at: string
}

type Props = {
  announcements: Announcement[]
}

const STORAGE_KEY = 'dismissed-announcements'

function getDismissed(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function dismiss(id: string) {
  const current = getDismissed()
  if (!current.includes(id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, id]))
  }
}

export default function AnnouncementBanner({ announcements }: Props) {
  const [visible, setVisible] = useState<Announcement[]>([])

  useEffect(() => {
    const dismissed = getDismissed()
    setVisible(announcements.filter(a => !dismissed.includes(a.id)))
  }, [announcements])

  if (visible.length === 0) return null

  const handleDismiss = (id: string) => {
    dismiss(id)
    setVisible(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="flex flex-col gap-2 mb-4">
      {visible.map(a => (
        <div
          key={a.id}
          className="flex items-start gap-3 px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-200"
        >
          <span className="text-indigo-500 text-base mt-0.5 shrink-0">📢</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-indigo-800 leading-snug">{a.title}</p>
            {a.body && (
              <p className="text-xs text-indigo-700 leading-snug mt-0.5 whitespace-pre-wrap">{a.body}</p>
            )}
          </div>
          <button
            onClick={() => handleDismiss(a.id)}
            className="shrink-0 text-indigo-400 hover:text-indigo-600 transition-colors text-lg leading-none mt-0.5"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
