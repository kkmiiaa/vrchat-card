'use client'

import { useState } from 'react'
import { genderTagBlock } from '@/blocks/gender'
import { playEnvBlock } from '@/blocks/playEnv'
import { languageBlock } from '@/blocks/language'
import { friendPolicyMultiBlock } from '@/blocks/friendPolicyMulti'
import { selfIntroBlock } from '@/blocks/selfIntro'
import { micOnRateBlock } from '@/blocks/micOnRate'
import { ageBlock } from '@/blocks/age'
import { trustRankBlock } from '@/blocks/trustRank'
import { statusBlock } from '@/blocks/status'
import { snsBlock } from '@/blocks/sns'
import { activityBlock } from '@/blocks/activity'
import { interactionsBlock } from '@/blocks/interactions'
import { translations } from '@/utils/translations'
import type { Block } from '@/blocks/types'
import { DEFAULT_CARD_RENDER_CONTEXT } from '@/blocks/types'

const t = translations.ja

const PREVIEW_BLOCKS: { block: Block<unknown>; inputType: string; description: string }[] = [
  { block: genderTagBlock as Block<unknown>,        inputType: 'expressive-select', description: 'タグ（検索用）＋自由テキスト（表示用）の二層構造' },
  { block: playEnvBlock as Block<unknown>,          inputType: 'multi-select',      description: '複数選択。PCVR/Quest/Desktop' },
  { block: languageBlock as Block<unknown>,         inputType: 'multi-select',      description: '複数選択。プリセット＋自由入力' },
  { block: friendPolicyMultiBlock as Block<unknown>,inputType: 'multi-select',      description: 'フレンドポリシー。複数選択可' },
  { block: selfIntroBlock as Block<unknown>,        inputType: 'text',              description: '自由テキスト。pre-wrap で改行反映' },
  { block: micOnRateBlock as Block<unknown>,        inputType: 'number',            description: '0〜100のスライダー。プログレスバー表示' },
  { block: ageBlock as Block<unknown>,              inputType: 'expressive-select', description: 'モード選択＋自由入力。非公開はCardItemで非表示' },
  { block: trustRankBlock as Block<unknown>,        inputType: 'select',            description: 'Trust Rank。ランク色でバッジ表示' },
  { block: statusBlock as Block<unknown>,           inputType: 'text',              description: '青緑黄赤4色のステータス説明文' },
  { block: snsBlock as Block<unknown>,              inputType: 'sns',               description: 'VRChat/X/Discord IDをまとめて管理' },
  { block: activityBlock as Block<unknown>,         inputType: 'activity',          description: '曜日＋時間帯。平日/休日を別設定' },
  { block: interactionsBlock as Block<unknown>,     inputType: 'interactions',      description: 'OK/NG項目。◎◯△✗でマーク' },
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
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
        <span className="font-mono text-sm font-semibold text-gray-800">{block.key}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${INPUT_TYPE_COLORS[inputType] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
          {inputType}
        </span>
        <span className="text-xs text-gray-400">{description}</span>
      </div>

      {/* FormItem / CardItem を横並び */}
      <div className="grid grid-cols-2 divide-x divide-gray-100">
        {/* FormItem */}
        <div className="px-5 py-5">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">FormItem</p>
          <block.FormItem value={value} onChange={setValue} t={t} />
        </div>

        {/* CardItem */}
        <div className="px-5 py-5">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">CardItem</p>
          <div className="min-h-[40px] flex items-start">
            {block.CardItem
              ? <block.CardItem value={value} ctx={DEFAULT_CARD_RENDER_CONTEXT} />
              : <span className="text-xs text-gray-300 italic">未実装</span>
            }
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50">
            <p className="text-[10px] text-gray-300 uppercase tracking-wider mb-1">保存値</p>
            <pre className="text-[10px] text-gray-400 bg-gray-50 rounded px-2 py-1 overflow-auto whitespace-pre-wrap">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ComponentPreview() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">FormItemで入力した値がCardItemにリアルタイム反映されます。</p>
      {PREVIEW_BLOCKS.map(item => (
        <BlockPreview key={item.block.key} {...item} />
      ))}
    </div>
  )
}
