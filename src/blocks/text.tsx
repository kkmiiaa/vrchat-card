'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { BG_VARIANT_STYLE } from './types'

export const textComponent: ComponentDef<string> = {
  key: 'text',
  defaultValue: '',
  variants: ['default'],
  CardItem({ value, ctx, bgVariant }) {
    const fs = ctx.fontSize.lg
    const bgStyle = BG_VARIANT_STYLE[bgVariant ?? 'transparent']
    return (
      <div style={{
        width: '100%',
        flexGrow: 1,
        background: bgStyle.background,
        border: bgStyle.border,
        borderRadius: ctx.cardWidth * 0.006,
        padding: `${ctx.cardWidth * 0.007 * ctx.paddingScale}px ${ctx.cardWidth * 0.009 * ctx.paddingScale}px`,
        overflow: 'hidden',
      }}>
        <p style={{ fontSize: fs, color: ctx.theme.text, lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: ctx.fontFamily, margin: 0, height: '100%', overflow: 'hidden' }}>{value as string || ''}</p>
      </div>
    )
  },
  FormItem({ value, onChange, t, blockConfig }) {
    const rows = typeof blockConfig?.rows === 'number' ? blockConfig.rows : 5
    const placeholder = typeof blockConfig?.placeholder === 'string' ? blockConfig.placeholder : undefined
    const maxLength = typeof blockConfig?.maxLength === 'number' ? blockConfig.maxLength : undefined
    return (
      <div className="flex flex-col gap-2">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200 resize-none"
        />
      </div>
    )
  },
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const multiline = blockConfig.multiline !== false
    const maxLength = typeof blockConfig.maxLength === 'number' ? blockConfig.maxLength : ''
    const rows = typeof blockConfig.rows === 'number' ? blockConfig.rows : ''
    const placeholder = typeof blockConfig.placeholder === 'string' ? blockConfig.placeholder : ''
    return (
      <div className="flex flex-col gap-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={multiline} onChange={e => onChange({ ...blockConfig, multiline: e.target.checked })} className="accent-sky-500" />
          <span className="text-gray-700">複数行（multiline）</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 shrink-0">最大文字数</span>
          <input type="number" min={0} value={maxLength} placeholder="無制限"
            onChange={e => onChange({ ...blockConfig, maxLength: e.target.value ? Number(e.target.value) : undefined })}
            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-200" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 shrink-0">表示行数</span>
          <input type="number" min={1} value={rows} placeholder="デフォルト"
            onChange={e => onChange({ ...blockConfig, rows: e.target.value ? Number(e.target.value) : undefined })}
            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-200" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 shrink-0">placeholder</span>
          <input type="text" value={placeholder} placeholder="入力してください…"
            onChange={e => onChange({ ...blockConfig, placeholder: e.target.value || undefined })}
            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-200" />
        </div>
      </div>
    )
  },
}
