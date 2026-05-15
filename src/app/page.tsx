import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

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
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-b border-sky-100 h-14 px-6 flex items-center justify-between">
        <span className="text-xl font-black tracking-tight text-[#00AADB]">vaacard</span>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {mySlug && (
                <Link href={`/u/${mySlug}`} className="text-xs font-semibold text-[#00AADB] border border-sky-200 px-3 py-1.5 rounded-full hover:bg-sky-50 transition-colors">
                  マイページ
                </Link>
              )}
              <Link
                href="/card/new"
                className="text-xs font-bold bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity shadow-sm shadow-sky-200"
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
                className="text-xs font-bold bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity shadow-sm shadow-sky-200"
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
            {/* Large bubbles */}
            <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full border-2 border-sky-100 opacity-60" />
            <div className="absolute top-16 -left-20 w-80 h-80 rounded-full border border-cyan-100 opacity-50" />
            <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full border-2 border-sky-100 opacity-40" />
            {/* Filled bubbles */}
            <div className="absolute top-8 right-[18%] w-5 h-5 rounded-full bg-sky-200/60" />
            <div className="absolute top-32 left-[10%] w-3 h-3 rounded-full bg-cyan-200/70" />
            <div className="absolute top-20 right-[35%] w-2 h-2 rounded-full bg-sky-300/50" />
            <div className="absolute bottom-20 left-[25%] w-4 h-4 rounded-full bg-sky-200/50" />
            <div className="absolute bottom-32 right-[12%] w-6 h-6 rounded-full bg-cyan-100/80" />
            {/* Hashtags */}
            <div className="absolute top-24 right-[12%] text-sky-200 text-3xl font-black select-none">#</div>
            <div className="absolute top-40 left-[8%] text-cyan-100 text-5xl font-black select-none">#</div>
            <div className="absolute bottom-16 right-[22%] text-sky-100 text-4xl font-black select-none">#</div>
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-96 h-64 bg-sky-50 rounded-full blur-[80px] opacity-80" />
            <div className="absolute bottom-0 left-0 w-80 h-56 bg-cyan-50 rounded-full blur-[70px] opacity-70" />
          </div>

          <div className="relative max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 mb-8">
              <span className="text-sky-400 font-black text-sm">#</span>
              <span className="text-xs text-sky-500 font-semibold tracking-wide">プロフィールカード</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-tight mb-6">
              あなたを、<br />
              <span className="bg-gradient-to-r from-[#00AADB] to-[#00C9B8] bg-clip-text text-transparent">
                一枚で伝える。
              </span>
            </h1>

            <p className="text-gray-400 text-base leading-relaxed mb-10 max-w-sm mx-auto">
              VRChat やオンラインゲームで使える自己紹介カードを、数分で作成・共有できます。
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/card/new"
                className="px-7 py-3.5 bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white text-sm font-bold rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-sky-200"
              >
                カードを作る
              </Link>
            </div>
          </div>

          {/* Card mockup */}
          <div className="relative mt-16 w-full max-w-sm mx-auto">
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
            <div className="bg-white border-2 border-sky-100 rounded-3xl p-6 shadow-2xl shadow-sky-100/60 relative">
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#00AADB] to-[#00C9B8]" />
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00AADB] to-[#00C9B8] shadow-md shadow-sky-100 flex-shrink-0" />
                <div>
                  <div className="h-3 w-24 bg-sky-50 rounded-full mb-2 border border-sky-100" />
                  <div className="h-2 w-16 bg-cyan-50 rounded-full border border-cyan-100" />
                </div>
              </div>
              <div className="flex gap-2 mb-4 flex-wrap">
                {['#VRChat', '#JP', '#20代'].map(tag => (
                  <span key={tag} className="px-2.5 py-1 text-xs rounded-full bg-sky-50 text-sky-400 border border-sky-200 font-semibold">{tag}</span>
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-gray-50 rounded-full w-full border border-gray-100" />
                <div className="h-2 bg-gray-50 rounded-full w-4/5 border border-gray-100" />
                <div className="h-2 bg-gray-50 rounded-full w-3/5 border border-gray-100" />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-3xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-sky-200" />
              <div className="w-3 h-3 rounded-full bg-sky-300" />
              <div className="w-2 h-2 rounded-full bg-sky-200" />
            </div>
            <p className="text-xs font-bold text-gray-300 tracking-widest uppercase">Features</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                tag: '#すぐ作れる',
                bubble: 'bg-sky-400',
                bg: 'bg-sky-50',
                border: 'border-sky-200',
                accent: 'text-sky-500',
                desc: 'テンプレートを選んで入力するだけ。アカウント不要で今すぐ試せます。',
              },
              {
                tag: '#URLで共有',
                bubble: 'bg-cyan-400',
                bg: 'bg-cyan-50',
                border: 'border-cyan-200',
                accent: 'text-cyan-500',
                desc: 'ログインするとカードにURLが発行され、どこからでも共有・編集できます。',
              },
              {
                tag: '#テンプレ豊富',
                bubble: 'bg-teal-400',
                bg: 'bg-teal-50',
                border: 'border-teal-200',
                accent: 'text-teal-500',
                desc: '用途やスタイルに合わせて選べるテンプレートを順次追加予定。',
              },
            ].map(f => (
              <div key={f.tag} className={`${f.bg} border-2 ${f.border} rounded-2xl p-6 hover:shadow-md transition-shadow relative overflow-hidden`}>
                {/* Bubble decoration */}
                <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${f.bubble} opacity-10`} />
                <div className={`absolute -bottom-6 -left-6 w-20 h-20 rounded-full ${f.bubble} opacity-10`} />
                <p className={`text-sm font-black mb-3 ${f.accent}`}>{f.tag}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-28 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-sky-50 rounded-full blur-[60px]" />
            {/* Bubbles */}
            <div className="absolute top-10 left-[8%] w-12 h-12 rounded-full border-2 border-sky-100" />
            <div className="absolute top-20 right-[10%] w-8 h-8 rounded-full bg-cyan-50 border border-cyan-100" />
            <div className="absolute bottom-10 left-[20%] w-5 h-5 rounded-full bg-sky-100/60" />
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
              className="inline-flex items-center gap-2 px-9 py-4 bg-gradient-to-r from-[#00AADB] to-[#00C9B8] text-white text-sm font-bold rounded-full hover:opacity-90 transition-opacity shadow-xl shadow-sky-200"
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
      <footer className="border-t border-sky-100 h-14 px-6 flex items-center justify-between">
        <span className="text-xs font-black tracking-tight text-[#00AADB]">vaacard</span>
        <p className="text-xs text-gray-300">© 2025 vaacard</p>
      </footer>

    </div>
  )
}
