'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/avatar.${ext}`
      await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      const cacheBusted = `${publicUrl}?t=${Date.now()}`
      setAvatarUrl(cacheBusted)
    } catch {
      // アバター失敗は続行可
    } finally {
      setAvatarUploading(false)
    }
  }

  async function handleSubmit() {
    if (!displayName.trim()) { setError('表示名を入力してください'); return }
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const updates: Record<string, string> = { display_name: displayName.trim() }
    if (avatarUrl) updates.avatar_url = avatarUrl

    const { error: err } = await supabase.from('profiles').update(updates).eq('user_id', user.id)
    if (err) { setError('保存に失敗しました。もう一度お試しください。'); setSaving(false); return }

    // username_slug を取得してマイページへ
    const { data: userRow } = await supabase.from('users').select('username_slug').eq('id', user.id).single()
    router.push(userRow ? `/u/${userRow.username_slug}` : '/')
  }

  async function handleSkip() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: userRow } = await supabase.from('users').select('username_slug').eq('id', user.id).single()
    router.push(userRow ? `/u/${userRow.username_slug}` : '/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex items-center justify-center px-4">
      {/* 背景装飾 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full border-2 border-sky-100 opacity-50" />
        <div className="absolute bottom-10 -left-16 w-56 h-56 rounded-full border border-cyan-100 opacity-40" />
        <div className="absolute top-1/3 right-[10%] w-3 h-3 rounded-full bg-sky-200/60" />
        <div className="absolute bottom-1/3 left-[15%] w-4 h-4 rounded-full bg-cyan-200/50" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* ロゴ */}
        <p className="text-center text-xl font-black text-[#00AADB] mb-8 tracking-tight">vaacard</p>

        <div className="bg-white rounded-3xl shadow-xl shadow-sky-100/50 border border-sky-100 p-8">
          <h1 className="text-xl font-black text-gray-900 mb-1">ようこそ！</h1>
          <p className="text-sm text-gray-400 mb-7">マイページの情報を設定しましょう</p>

          {/* アバター */}
          <div className="flex flex-col items-center mb-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="tap-spring relative w-20 h-20 rounded-full overflow-hidden border-2 border-sky-200 hover:border-sky-400 transition-all group"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center">
                  {avatarUploading ? (
                    <div className="w-5 h-5 border-2 border-sky-300 border-t-[#00AADB] rounded-full animate-spin" />
                  ) : (
                    <svg className="w-7 h-7 text-sky-300 group-hover:text-sky-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </div>
              )}
            </button>
            <p className="text-[11px] text-gray-400 mt-2">
              {avatarUrl ? 'タップして変更' : 'プロフィール画像（任意）'}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* 表示名 */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              表示名 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="あなたの名前やニックネーム"
              maxLength={30}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 transition-all"
              autoFocus
            />
            {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
          </div>

          {/* ボタン */}
          <button
            onClick={handleSubmit}
            disabled={saving || avatarUploading}
            className="tap-spring w-full py-3 bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white text-sm font-bold rounded-xl shadow-md shadow-sky-200 hover:opacity-90 disabled:opacity-60 transition-opacity mb-3"
          >
            {saving ? '保存中...' : 'マイページを作成 →'}
          </button>

          <button
            onClick={handleSkip}
            className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            あとで設定する
          </button>
        </div>
      </div>
    </div>
  )
}
