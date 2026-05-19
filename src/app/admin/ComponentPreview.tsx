'use client'

import { useState } from 'react'
import { genderTagBlock } from '@/blocks/gender'
import { playEnvBlock } from '@/blocks/playEnv'
import { languageBlock } from '@/blocks/language'
import { friendPolicyMultiBlock } from '@/blocks/friendPolicyMulti'
import { selfIntroBlock } from '@/blocks/selfIntro'
import { translations } from '@/utils/translations'
import type { Block } from '@/blocks/types'

const t = translations.ja

// 管理者ページで表示するコンポーネント定義
const PREVIEW_BLOCKS: { block: Block<unknown>; inputType: string; description: string }[] = [
  {
    block: genderTagBlock as Block<unknown>,
    inputType: 'expressive-select',
    description: 'タグ（検索用）＋自由テキスト（表示用）の二層構造',
  },
  {
    block: playEnvBlock as Block<unknown>,
    inputType: 'multi-select',
    description: '複数選択。配列で保存。',
  },
  {
    block: languageBlock as Block<unknown>,
    inputType: 'multi-select',
    description: '複数選択。配列で保存。',
  },
  {
    block: friendPolicyMultiBlock as Block<unknown>,
    inputType: 'select',
    description: '単一選択。文字列で保存。',
  },
  {
    block: selfIntroBlock as Block<unknown>,
    inputType: 'text',
    description: '自由テキスト。全文検索のみ対応。',
  },
]

const INPUT_TYPE_COLORS: Record<string, string> = {
  'expressive-select': 'bg-purple-100 text-purple-700 border-purple-200',
  'multi-select':      'bg-blue-100 text-blue-700 border-blue-200',
  'select':            'bg-sky-100 text-sky-700 border-sky-200',
  'text':              'bg-gray-100 text-gray-600 border-gray-200',
}

function BlockPreview({ block, inputType, description }: typeof PREVIEW_BLOCKS[number]) {
  const [value, setValue] = useState(block.defaultValue)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* ヘッダー */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-semibold text-gray-800">{block.key}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${INPUT_TYPE_COLORS[inputType] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {inputType}
            </span>
          </div>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] text-gray-300 uppercase tracking-wider mb-1">保存値</p>
          <pre className="text-[10px] text-gray-500 bg-gray-50 rounded px-2 py-1 max-w-[180px] overflow-auto whitespace-pre-wrap text-right">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      </div>

      {/* フォームプレビュー */}
      <div className="px-5 py-5">
        <block.FormItem
          value={value}
          onChange={setValue}
          t={t}
        />
      </div>
    </div>
  )
}

export default function ComponentPreview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-lg font-bold text-gray-900">コンポーネント定義</h2>
        <p className="text-sm text-gray-400">実際のFormItemをプレビュー。右上に保存される値をリアルタイム表示。</p>
      </div>
      {PREVIEW_BLOCKS.map(item => (
        <BlockPreview key={item.block.key} {...item} />
      ))}
    </div>
  )
}
