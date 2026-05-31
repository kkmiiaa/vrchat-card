'use client'

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { FaGoogle, FaDiscord } from 'react-icons/fa'
import Link from 'next/link'

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'
  const router = useRouter()
  const [loading, setLoading] = useState<'google' | 'discord' | 'email' | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function signIn(provider: 'google' | 'discord') {
    setLoading(provider)
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading('email')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      })
      if (error) { setError(error.message); setLoading(null); return }
      setError('確認メールを送信しました。メールをご確認ください。')
      setLoading(null)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError('メールアドレスまたはパスワードが正しくありません。'); setLoading(null); return }
      router.push(next)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* Background bubbles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full border-2 border-sky-100 opacity-60" />
        <div className="absolute bottom-10 -left-16 w-80 h-80 rounded-full border border-cyan-100 opacity-40" />
        <div className="absolute top-1/2 right-[5%] w-5 h-5 rounded-full bg-sky-200/50" />
        <div className="absolute top-1/3 left-[8%] w-3 h-3 rounded-full bg-cyan-200/60" />
        <div className="absolute bottom-1/4 right-[15%] w-8 h-8 rounded-full border border-sky-100" />
        <div className="absolute top-0 right-0 w-96 h-64 bg-sky-50 rounded-full blur-[80px] opacity-60" />
        <div className="absolute bottom-0 left-0 w-80 h-56 bg-cyan-50 rounded-full blur-[70px] opacity-50" />
      </div>

      <header className="relative z-10 h-14 px-6 flex items-center border-b border-sky-100 shadow-sm bg-white/80 backdrop-blur-md">
        <Link href="/" className="text-xl font-black tracking-tight text-[#00AADB]">vaacard</Link>
      </header>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl border-2 border-sky-100 shadow-xl shadow-sky-100/50 p-10 max-w-md w-full">
          <div className="h-1 -mx-10 -mt-10 mb-8 rounded-t-3xl bg-gradient-to-r from-[#00AADB] to-[#00C9B8]" />

          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 mb-4">
              <span className="text-sky-400 font-black text-sm">#</span>
              <span className="text-xs text-sky-500 font-semibold">vaacard</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {isSignUp ? '新規登録' : 'ログイン'}
            </h1>
            <p className="text-gray-400 text-sm">
              アカウントでログインしてプロフィールページを作成しましょう。
            </p>
          </div>

          {/* OAuth */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => signIn('google')}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-full border-2 border-sky-100 text-gray-700 font-semibold text-sm hover:border-sky-300 hover:bg-sky-50 transition-colors disabled:opacity-50"
            >
              <FaGoogle className="text-red-500 text-base" />
              {loading === 'google' ? '接続中...' : 'Googleでログイン'}
            </button>
            <button
              onClick={() => signIn('discord')}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-full bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md shadow-sky-200"
            >
              <FaDiscord className="text-white text-base" />
              {loading === 'discord' ? '接続中...' : 'Discordでログイン'}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-sky-100" />
            <span className="text-xs text-gray-300 font-medium">またはメールで</span>
            <div className="flex-1 h-px bg-sky-100" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="メールアドレス"
              required
              autoComplete="email"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-sky-100 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#00AADB] transition-colors"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="パスワード"
              required
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-sky-100 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#00AADB] transition-colors"
            />

            {error && (
              <p className={`text-xs px-3 py-2 rounded-xl ${error.includes('確認メール') ? 'bg-sky-50 text-sky-500 border border-sky-200' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading !== null}
              className="w-full py-3 rounded-full border-2 border-sky-200 text-[#00AADB] font-semibold text-sm hover:bg-sky-50 transition-colors disabled:opacity-50"
            >
              {loading === 'email' ? '処理中...' : isSignUp ? '登録する' : 'ログイン'}
            </button>
          </form>

          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
            className="w-full mt-3 text-xs text-gray-400 hover:text-[#00AADB] transition-colors"
          >
            {isSignUp ? 'すでにアカウントをお持ちの方はこちら' : 'アカウントをお持ちでない方はこちら'}
          </button>

          <p className="text-xs text-gray-300 text-center mt-6">
            ログインすることで
            <Link href="/terms" className="underline hover:text-gray-400 transition-colors">利用規約</Link>
            ・
            <Link href="/privacy" className="underline hover:text-gray-400 transition-colors">プライバシーポリシー</Link>
            に同意したものとみなします。
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
