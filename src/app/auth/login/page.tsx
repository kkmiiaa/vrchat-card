'use client'

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { FaGoogle, FaDiscord } from 'react-icons/fa'

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/profile/edit'
  const [loading, setLoading] = useState<'google' | 'discord' | null>(null)
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full">
        <div className="mb-6">
          <span className="text-2xl font-black tracking-tight text-gray-900">Profy</span>
        </div>
        <h1 className="text-lg font-semibold text-gray-900 mb-1">ログイン / 新規登録</h1>
        <p className="text-gray-500 text-sm mb-8">
          アカウントでログインしてプロフィールページを作成しましょう。
        </p>

        <div className="space-y-3">
          <button
            onClick={() => signIn('google')}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FaGoogle className="text-red-500 text-lg" />
            {loading === 'google' ? '接続中...' : 'Googleでログイン'}
          </button>

          <button
            onClick={() => signIn('discord')}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <FaDiscord className="text-white text-lg" />
            {loading === 'discord' ? '接続中...' : 'Discordでログイン'}
          </button>
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
