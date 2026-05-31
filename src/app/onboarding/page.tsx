'use client'

import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,29}$/

type SlugStatus = 'idle' | 'checking' | 'ok' | 'taken' | 'invalid'

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingForm />
    </Suspense>
  )
}

function OnboardingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next')
  const supabase = createClient()

  const [displayName, setDisplayName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 現在の自動生成スラグを取得して初期表示
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('users').select('username_slug').eq('id', user.id).single()
        .then(({ data }) => { if (data?.username_slug) setSlug(data.username_slug) })
    })
  }, [])

  const checkSlug = useCallback((value: string) => {
    if (checkTimer.current) clearTimeout(checkTimer.current)
    if (!value) { setSlugStatus('idle'); return }
    if (!SLUG_RE.test(value)) { setSlugStatus('invalid'); return }
    setSlugStatus('checking')
    checkTimer.current = setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('users').select('id').eq('username_slug', value).single()
      // 自分自身のスラグは OK
      if (data && data.id !== user?.id) {
        setSlugStatus('taken')
      } else {
        setSlugStatus('ok')
      }
    }, 400)
  }, [supabase])

  function handleSlugChange(value: string) {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSlug(cleaned)
    checkSlug(cleaned)
  }

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
      setAvatarUrl(`${publicUrl}?t=${Date.now()}`)
    } catch {
      // アバター失敗は続行可
    } finally {
      setAvatarUploading(false)
    }
  }

  async function handleSubmit() {
    setError(null)
    if (!displayName.trim()) { setError('表示名を入力してください'); return }
    if (slug && slugStatus === 'invalid') { setError('IDは半角英数字・ハイフンのみ、3文字以上で入力してください'); return }
    if (slug && slugStatus === 'taken') { setError('このIDはすでに使われています'); return }
    if (slug && slugStatus === 'checking') { setError('ID確認中です。少し待ってから再試行してください'); return }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    // プロフィール更新
    const profileUpdates: Record<string, string> = { display_name: displayName.trim() }
    if (avatarUrl) profileUpdates.avatar_url = avatarUrl
    await supabase.from('profiles').update(profileUpdates).eq('user_id', user.id)

    // スラグ更新（変更がある場合のみ）
    let finalSlug: string | null = null
    if (slug && (slugStatus === 'ok' || slugStatus === 'idle')) {
      const { error: slugErr } = await supabase.from('users').update({ username_slug: slug }).eq('id', user.id)
      if (slugErr) { setError('IDの保存に失敗しました'); setSaving(false); return }
      finalSlug = slug
    } else {
      const { data: userRow } = await supabase.from('users').select('username_slug').eq('id', user.id).single()
      finalSlug = userRow?.username_slug ?? null
    }

    // next があればそちら優先（/card/vrchat からの保存フロー等）
    router.push(nextUrl ?? (finalSlug ? `/u/${finalSlug}` : '/'))
  }

  async function handleSkip() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    if (nextUrl) { router.push(nextUrl); return }
    const { data: userRow } = await supabase.from('users').select('username_slug').eq('id', user.id).single()
    router.push(userRow ? `/u/${userRow.username_slug}` : '/')
  }

  const slugHint = (() => {
    if (!slug) return null
    if (slugStatus === 'invalid') return { ok: false, msg: '半角英数字・ハイフンのみ、3文字以上' }
    if (slugStatus === 'checking') return { ok: null, msg: '確認中...' }
    if (slugStatus === 'taken') return { ok: false, msg: 'このIDはすでに使われています' }
    if (slugStatus === 'ok') return { ok: true, msg: '使用できます' }
    return null
  })()

  const canSubmit = !saving && !avatarUploading && slugStatus !== 'taken' && slugStatus !== 'invalid' && slugStatus !== 'checking'

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex items-center justify-center px-4 py-8">
      {/* 背景装飾 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full border-2 border-sky-100 opacity-50" />
        <div className="absolute bottom-10 -left-16 w-56 h-56 rounded-full border border-cyan-100 opacity-40" />
        <div className="absolute top-1/3 right-[10%] w-3 h-3 rounded-full bg-sky-200/60" />
        <div className="absolute bottom-1/3 left-[15%] w-4 h-4 rounded-full bg-cyan-200/50" />
      </div>

      <div className="relative w-full max-w-sm">
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
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* 表示名 */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              表示名 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="あなたの名前やニックネーム"
              maxLength={30}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 transition-all"
              autoFocus
            />
          </div>

          {/* ID（スラグ） */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              ID <span className="text-gray-400 font-normal">（マイページの URL に使います）</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none select-none">
                vaacard.com/u/
              </span>
              <input
                type="text"
                value={slug}
                onChange={e => handleSlugChange(e.target.value)}
                placeholder="your-id"
                maxLength={30}
                className={`w-full pl-[7.5rem] pr-8 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                  slugStatus === 'ok'    ? 'border-green-300 focus:ring-green-100' :
                  slugStatus === 'taken' || slugStatus === 'invalid' ? 'border-red-300 focus:ring-red-100' :
                  'border-gray-200 focus:ring-sky-200 focus:border-sky-300'
                }`}
              />
              {slugStatus === 'ok' && (
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {(slugStatus === 'taken' || slugStatus === 'invalid') && (
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            {slugHint && (
              <p className={`text-[11px] mt-1.5 ${slugHint.ok === true ? 'text-green-500' : slugHint.ok === false ? 'text-red-500' : 'text-gray-400'}`}>
                {slugHint.msg}
              </p>
            )}
          </div>

          {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="tap-spring w-full py-3 bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white text-sm font-bold rounded-xl shadow-md shadow-sky-200 hover:opacity-90 disabled:opacity-50 transition-opacity mb-3"
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
