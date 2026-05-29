'use client'

import { usePathname } from 'next/navigation'

const PAGES = [
  { href: '/admin/components',  label: 'コンポーネント' },
  { href: '/admin/templates',   label: 'テンプレート' },
  { href: '/admin/communities', label: '界隈' },
  { href: '/admin/cards',       label: 'カード' },
]

export default function AdminNav() {
  const pathname = usePathname()
  return (
    <nav className="flex items-center gap-1 ml-2">
      {PAGES.map(p => (
        <a
          key={p.href}
          href={p.href}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
            pathname.startsWith(p.href)
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          {p.label}
        </a>
      ))}
    </nav>
  )
}
