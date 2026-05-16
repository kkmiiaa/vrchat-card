'use client'
import type { Block } from './types'

const RANKS = [
  { rank: 'Visitor',      color: '#9ca3af' },
  { rank: 'New User',     color: '#3b82f6' },
  { rank: 'User',         color: '#22c55e' },
  { rank: 'Known User',   color: '#f97316' },
  { rank: 'Trusted User', color: '#a855f7' },
] as const

export const trustRankBlock: Block<string> = {
  key: 'trustRank',
  defaultValue: '',
  FormItem({ value, onChange }) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Trust Rank</h2>
        <div className="flex flex-wrap gap-1.5">
          {RANKS.map(({ rank, color }) => (
            <button
              key={rank}
              type="button"
              onClick={() => onChange(value === rank ? '' : rank)}
              style={value === rank
                ? { borderColor: color, backgroundColor: color, color: '#fff' }
                : { borderColor: color + '60', color }
              }
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors border font-semibold ${
                value === rank ? '' : 'bg-white hover:opacity-80'
              }`}
            >
              {rank}
            </button>
          ))}
        </div>
      </div>
    )
  },
}
