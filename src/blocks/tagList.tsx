'use client'
import { useState } from 'react'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { ColorPicker } from './colorPicker'

export const tagListComponent: ComponentDef<string[]> = {
  key: 'tagList',
  defaultValue: [],
  variants: ['simple', 'compact'],
  CardItem({ value, ctx, variant, surface: _bgVariant, blockConfig }) {
    const tags = Array.isArray(value) ? value : []
    const isCompact = variant === 'compact'
    const fs = isCompact ? ctx.fontSize.xs : ctx.fontSize.sm
    const prefix = typeof blockConfig?.prefix === 'string' ? blockConfig.prefix : ''
    const tagColor = typeof blockConfig?.color === 'string' ? blockConfig.color : ctx.theme.accent

    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        gap: isCompact ? 3 : 4,
        fontFamily: ctx.fontFamily,
      }}>
        {tags.map((tag, i) => (
          <span
            key={i}
            style={{
              fontSize: fs,
              padding: `${isCompact ? 1 : 2}px ${isCompact ? 6 : 8}px`,
              borderRadius: 9999,
              background: `${tagColor}22`,
              color: tagColor,
              border: `1px solid ${tagColor}55`,
              whiteSpace: 'nowrap',
            }}
          >
            {prefix}{tag}
          </span>
        ))}
      </div>
    )
  },
  FormItem({ value, onChange, blockConfig }) {
    const tags = Array.isArray(value) ? value : []
    const [input, setInput] = useState('')
    const maxTags = typeof blockConfig?.maxTags === 'number' ? blockConfig.maxTags : undefined

    const addTag = () => {
      const trimmed = input.trim()
      if (trimmed && !tags.includes(trimmed) && (maxTags === undefined || tags.length < maxTags)) {
        onChange([...tags, trimmed])
      }
      setInput('')
    }

    const removeTag = (index: number) => {
      onChange(tags.filter((_, i) => i !== index))
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
            placeholder="タグを入力してEnter"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors"
          >
            追加
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-full text-xs">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(i)}
                  className="text-sky-400 hover:text-red-500 transition-colors leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    )
  },
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const color = typeof blockConfig.color === 'string' ? blockConfig.color : ''
    const maxTags = typeof blockConfig.maxTags === 'number' ? blockConfig.maxTags : ''
    const prefix = typeof blockConfig.prefix === 'string' ? blockConfig.prefix : ''
    return (
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-20 shrink-0">プレフィックス</span>
          <input type="text" value={prefix} placeholder="例: #"
            onChange={e => onChange({ ...blockConfig, prefix: e.target.value || undefined })}
            className="w-16 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-20 shrink-0">色</span>
          <ColorPicker value={color ?? ''} onChange={v => onChange({ ...blockConfig, color: v || undefined })} defaultColor="#00AADB" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-20 shrink-0">最大件数</span>
          <input type="number" min={1} value={maxTags} placeholder="無制限"
            onChange={e => onChange({ ...blockConfig, maxTags: e.target.value ? Number(e.target.value) : undefined })}
            className="w-20 text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
        </div>
      </div>
    )
  },
}
