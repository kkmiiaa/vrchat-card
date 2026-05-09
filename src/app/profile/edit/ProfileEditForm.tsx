'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { UserRow, ProfileRow } from '@/lib/types'

type Props = {
  userRow: UserRow | null
  profile: ProfileRow | null
}

const SNS_FIELDS = [
  { key: 'x', label: 'X (Twitter)', placeholder: '@username' },
  { key: 'discord', label: 'Discord', placeholder: 'username' },
  { key: 'vrchat', label: 'VRChat ID', placeholder: 'VRChat ID' },
  { key: 'instagram', label: 'Instagram', placeholder: '@username' },
  { key: 'github', label: 'GitHub', placeholder: 'username' },
]

export default function ProfileEditForm({ userRow, profile }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [snsLinks, setSnsLinks] = useState<Record<string, string>>(profile?.sns_links ?? {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const slug = userRow?.username_slug ?? ''

  function setSns(key: string, value: string) {
    setSnsLinks(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)

    await supabase.from('profiles').upsert({
      user_id: userRow!.id,
      display_name: displayName,
      bio,
      sns_links: snsLinks,
    })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto py-10 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">プロフィール編集</h1>
          <button
            onClick={() => router.push(`/u/${slug}`)}
            className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            公開ページを見る →
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <p className="text-xs text-gray-400 mb-1">あなたのURL</p>
          <p className="font-mono text-indigo-600 text-sm">
            vaa3d.studio/u/{slug}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">表示名</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="あなたの名前"
              maxLength={30}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">自己紹介</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="自己紹介を書いてください"
              maxLength={200}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{bio.length}/200</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">SNS・ID</label>
            <div className="space-y-3">
              {SNS_FIELDS.map(({ key, label, placeholder }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-24 shrink-0">{label}</span>
                  <input
                    type="text"
                    value={snsLinks[key] ?? ''}
                    onChange={e => setSns(key, e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full py-3 rounded-xl bg-indigo-500 text-white font-medium text-sm hover:bg-indigo-600 transition-colors disabled:opacity-50"
        >
          {saved ? '✓ 保存しました' : saving ? '保存中...' : '保存する'}
        </button>
      </div>
    </div>
  )
}
