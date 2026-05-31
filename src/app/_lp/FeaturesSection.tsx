'use client'

import { useEffect, useRef } from 'react'

const features = [
  {
    tag: '#すぐ作れる',
    bubbleClass: 'bg-sky-400',
    bg: 'bg-sky-50',
    border: 'border-sky-200 hover:border-sky-400',
    accent: 'text-sky-500',
    shadow: 'hover:shadow-sky-100',
    glowColor: 'rgba(14,165,233,0.08)',
    desc: 'テンプレートを選んで入力するだけ。アカウント不要で今すぐ試せます。',
    delay: 0,
  },
  {
    tag: '#URLで共有',
    bubbleClass: 'bg-cyan-400',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200 hover:border-cyan-400',
    accent: 'text-cyan-500',
    shadow: 'hover:shadow-cyan-100',
    glowColor: 'rgba(6,182,212,0.08)',
    desc: 'ログインするとカードにURLが発行され、どこからでも共有・編集できます。',
    delay: 100,
  },
  {
    tag: '#テンプレ豊富',
    bubbleClass: 'bg-teal-400',
    bg: 'bg-teal-50',
    border: 'border-teal-200 hover:border-teal-400',
    accent: 'text-teal-500',
    shadow: 'hover:shadow-teal-100',
    glowColor: 'rgba(20,184,166,0.08)',
    desc: '用途やスタイルに合わせて選べるテンプレートを順次追加予定。',
    delay: 200,
  },
]

export default function FeaturesSection() {
  const refs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('lp-revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    refs.current.forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
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
        {features.map((f, i) => (
          <div
            key={f.tag}
            ref={el => { refs.current[i] = el }}
            className={`lp-reveal group ${f.bg} border-2 ${f.border} rounded-2xl p-6 relative overflow-hidden
              hover:-translate-y-2 hover:shadow-xl ${f.shadow} transition-all duration-300 cursor-default`}
            style={{ transitionDelay: `${f.delay}ms` }}
          >
            {/* バブル装飾（ホバーで拡大） */}
            <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${f.bubbleClass} opacity-10 group-hover:opacity-20 group-hover:scale-125 transition-all duration-500`} />
            <div className={`absolute -bottom-6 -left-6 w-20 h-20 rounded-full ${f.bubbleClass} opacity-10 group-hover:opacity-20 group-hover:scale-125 transition-all duration-500`} />
            {/* 内部グロー */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at 70% 20%, ${f.glowColor} 0%, transparent 70%)` }}
            />

            <p className={`relative text-sm font-black mb-3 ${f.accent} group-hover:scale-105 transition-transform duration-200 origin-left`}>{f.tag}</p>
            <p className="relative text-xs text-gray-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
