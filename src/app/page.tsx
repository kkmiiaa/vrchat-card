import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import HeroCard from './_lp/HeroCard'
import FeaturesSection from './_lp/FeaturesSection'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let mySlug: string | null = null
  if (user) {
    const { data } = await supabase.from('users').select('username_slug').eq('id', user.id).single()
    mySlug = data?.username_slug ?? null
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col overflow-x-hidden">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-sm h-14 px-6 flex items-center justify-between">
        <span className="text-xl font-black tracking-tight text-[#00AADB]">vaacard</span>
        <div className="flex items-center gap-3">
          <Link href="/c/vrchat" className="text-xs font-semibold text-gray-500 hover:text-[#00AADB] transition-colors hidden sm:inline">
            ユーザーを探す
          </Link>
          {user ? (
            <>
              {mySlug && (
                <Link href={`/u/${mySlug}`} className="text-xs font-semibold text-[#00AADB] border border-sky-200 px-3 py-1.5 rounded-full hover:bg-sky-50 transition-colors">
                  マイページ
                </Link>
              )}
              <Link
                href="/card/new"
                className="lp-btn-shine text-xs font-bold bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white px-4 py-1.5 rounded-full hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-sm shadow-sky-200"
              >
                カードを作る
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-xs font-semibold text-gray-400 hover:text-[#00AADB] transition-colors">
                ログイン
              </Link>
              <Link
                href="/card/new"
                className="lp-btn-shine text-xs font-bold bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white px-4 py-1.5 rounded-full hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-sm shadow-sky-200"
              >
                はじめる
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 pt-14">

        {/* Hero */}
        <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
          {/* Floating bubbles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Large floating rings */}
            <div className="lp-float-e absolute -top-10 -right-10 w-64 h-64 rounded-full border-2 border-sky-100 opacity-60" />
            <div className="lp-float-b absolute top-16 -left-20 w-80 h-80 rounded-full border border-cyan-100 opacity-50" />
            <div className="lp-float-c absolute bottom-10 right-10 w-40 h-40 rounded-full border-2 border-sky-100 opacity-40" />
            {/* Filled floating bubbles */}
            <div className="lp-float-a absolute top-8 right-[18%] w-5 h-5 rounded-full bg-sky-200/60" />
            <div className="lp-float-d absolute top-32 left-[10%] w-3 h-3 rounded-full bg-cyan-200/70" />
            <div className="lp-float-c absolute top-20 right-[35%] w-2 h-2 rounded-full bg-sky-300/50" />
            <div className="lp-float-b absolute bottom-20 left-[25%] w-4 h-4 rounded-full bg-sky-200/50" />
            <div className="lp-float-f absolute bottom-32 right-[12%] w-6 h-6 rounded-full bg-cyan-100/80" />
            {/* Drifting hashtags */}
            <div className="lp-drift  absolute top-24 right-[12%] text-sky-200 text-3xl font-black select-none">#</div>
            <div className="lp-float-e absolute top-40 left-[8%]  text-cyan-100 text-5xl font-black select-none">#</div>
            <div className="lp-float-c absolute bottom-16 right-[22%] text-sky-100 text-4xl font-black select-none">#</div>
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-96 h-64 bg-sky-50 rounded-full blur-[80px] opacity-80" />
            <div className="absolute bottom-0 left-0 w-80 h-56 bg-cyan-50 rounded-full blur-[70px] opacity-70" />
          </div>

          <div className="relative max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 mb-8 hover:border-sky-400 transition-colors">
              <span className="text-sky-400 font-black text-sm">#</span>
              <span className="text-xs text-sky-500 font-semibold tracking-wide">プロフィールカード</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-tight mb-6">
              あなたを、<br />
              <span className="lp-gradient-flow">
                一枚で伝える。
              </span>
            </h1>

            <p className="text-gray-400 text-base leading-relaxed mb-10 max-w-sm mx-auto">
              VRChat やオンラインゲームで使える自己紹介カードを、数分で作成・共有できます。
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/card/new"
                className="lp-btn-shine px-7 py-3.5 bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white text-sm font-bold rounded-full hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-sky-200"
              >
                カードを作る
              </Link>
              <Link
                href="/c/vrchat"
                className="px-7 py-3.5 border border-sky-200 text-[#00AADB] text-sm font-bold rounded-full hover:bg-sky-50 hover:border-sky-400 hover:scale-105 active:scale-95 transition-all"
              >
                カードを探す
              </Link>
            </div>
          </div>

          {/* 3D tilt card mockup */}
          <HeroCard />
        </section>

        {/* Features — scroll-in */}
        <FeaturesSection />

        {/* CTA */}
        <section className="relative py-28 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-sky-50 rounded-full blur-[60px]" />
            <div className="lp-float-a absolute top-10 left-[8%]  w-12 h-12 rounded-full border-2 border-sky-100" />
            <div className="lp-float-c absolute top-20 right-[10%] w-8 h-8 rounded-full bg-cyan-50 border border-cyan-100" />
            <div className="lp-float-d absolute bottom-10 left-[20%] w-5 h-5 rounded-full bg-sky-100/60" />
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 mb-6">
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-xs text-sky-500 font-semibold">#無料ではじめる</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              さっそく作ってみよう
            </h2>
            <p className="text-sm text-gray-400 mb-10">アカウント登録は無料です。</p>
            <Link
              href="/card/new"
              className="lp-btn-shine inline-flex items-center gap-2 px-9 py-4 bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white text-sm font-bold rounded-full hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-sky-200"
            >
              カードを作る
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-sky-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-black tracking-tight text-[#00AADB]">vaacard</span>
        <div className="flex items-center gap-4">
          <a
            href="https://x.com/yota3d"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            お問い合わせ・テンプレート依頼
          </a>
          <a href="/privacy" className="text-xs text-gray-300 hover:text-gray-500 transition-colors">プライバシーポリシー</a>
          <a href="/terms" className="text-xs text-gray-300 hover:text-gray-500 transition-colors">利用規約</a>
        </div>
        <p className="text-xs text-gray-300">© 2025 vaacard</p>
      </footer>

    </div>
  )
}
