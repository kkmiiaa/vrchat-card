'use client'

import { useRef, useState } from 'react'

export default function HeroCard() {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 22
    const y = -((e.clientY - rect.top) / rect.height - 0.5) * 22
    setTilt({ x, y })
  }

  const style: React.CSSProperties = {
    transform: hovered
      ? `perspective(700px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) scale3d(1.05,1.05,1.05)`
      : 'perspective(700px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)',
    transition: hovered ? 'transform 0.08s ease-out' : 'transform 0.6s cubic-bezier(0.34,1.3,0.64,1)',
    willChange: 'transform',
  }

  return (
    <div
      ref={ref}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }) }}
      className="relative mt-16 w-full max-w-sm mx-auto cursor-pointer"
    >
      {/* 底面グロー */}
      <div
        className="absolute inset-0 rounded-3xl blur-2xl opacity-0 transition-opacity duration-300 bg-gradient-to-br from-sky-300/40 to-cyan-300/30"
        style={{ opacity: hovered ? 1 : 0 }}
      />

      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none rounded-b-3xl" />

      <div className="bg-white border-2 border-sky-100 rounded-3xl p-6 shadow-2xl shadow-sky-100/60 relative">
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#00AADB] to-[#00C9B8]" />

        {/* ホバー時の内部グロー */}
        <div
          className="absolute inset-0 rounded-3xl transition-opacity duration-300 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 60% 30%, rgba(0,170,219,0.07) 0%, transparent 70%)',
            opacity: hovered ? 1 : 0,
          }}
        />

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
  )
}
