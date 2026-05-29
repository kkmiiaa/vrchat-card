import { COMPONENT_CATEGORIES, COMPONENT_NAMES } from '../componentCatalog'
import ComponentBlockList from '../BlockPreviewList'

export default function AdminComponentsPage() {
  return (
    <div className="flex h-full">
      <nav className="w-48 shrink-0 border-r border-gray-100 bg-white overflow-y-auto py-4">
        {COMPONENT_CATEGORIES.map((cat, i) => {
          const items = COMPONENT_NAMES.filter(c => c.category === cat.key)
          if (items.length === 0) return null
          const isPromoted = cat.key === 'global'
          return (
            <div key={cat.key} className={i > 0 ? 'mt-4' : ''}>
              <p className="px-4 mb-1 text-[10px] font-semibold text-gray-300 uppercase tracking-wider">{cat.label}</p>
              {items.map(c => (
                <a
                  key={c.name}
                  href={`#component-${c.name}`}
                  className={`block px-4 py-1.5 text-xs rounded-lg mx-2 transition-colors ${
                    isPromoted
                      ? 'text-violet-500 hover:text-violet-700 hover:bg-violet-50'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {c.name}
                </a>
              ))}
            </div>
          )
        })}
      </nav>
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <ComponentBlockList />
        </div>
      </main>
    </div>
  )
}
