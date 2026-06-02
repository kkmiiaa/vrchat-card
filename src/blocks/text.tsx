'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { SURFACE_STYLE } from './types'

export const textComponent: ComponentDef<string> = {
  key: 'text',
  defaultValue: '',
  variants: ['simple'],
  supportsSurface: true,
  surfaceFor: ['simple'],
  CardItem({ value, ctx, surface, label, blockConfig }) {
    const fs = ctx.fontSize.lg
    // label（insetLabel）があるときはコンテナが見える必要があるため、transparent は default にフォールバック
    const effectiveSurface = (label && (surface === 'transparent' || surface === undefined))
       ? 'simple'
      : (surface ?? 'transparent')
    const surfaceStyle = SURFACE_STYLE[effectiveSurface]
    const multiline = blockConfig?.multiline !== false
    const noPadding = blockConfig?.noPadding === true
    const maxRows = typeof blockConfig?.rows === 'number' ? blockConfig.rows : undefined
    return (
      <div style={{
        width: '100%',
        flexGrow: 1,
        background: surfaceStyle.background,
        border: surfaceStyle.border,
        boxShadow: surfaceStyle.boxShadow,
        borderRadius: ctx.cardWidth * 0.006,
        padding: noPadding ? 0 : `${ctx.cardWidth * 0.007 * ctx.paddingScale}px ${ctx.cardWidth * 0.009 * ctx.paddingScale}px`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: (label?.dir === 'row') ? 'row' : 'column',
        gap: label ? (label.dir === 'row' ? ctx.cardWidth * 0.005 : ctx.cardWidth * 0.003) : 0,
        alignItems: (label?.dir === 'row') ? 'center' : (label ? 'stretch' : (multiline ? 'flex-start' : 'center')),
        justifyContent: (label?.dir === 'row') ? undefined : (multiline ? 'flex-start' : 'center'),
      }}>
        {label && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: ctx.cardWidth * 0.003, flexShrink: 0 }}>
            <span style={{ fontSize: ctx.fontSize.sm * (label.fontScale ?? 1), fontWeight: 700, color: label.color ?? ctx.theme.text, fontFamily: ctx.fontFamily }}>{label.text}</span>
            {label.subText && <span style={{ fontSize: ctx.fontSize.xs * (label.fontScale ?? 1), color: ctx.theme.subText, fontFamily: ctx.fontFamily }}>{label.subText}</span>}
          </div>
        )}
        <p style={{
          fontSize: fs,
          color: (value as string) ? ctx.theme.text : ctx.theme.subText,
          lineHeight: 1.75,
          whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
          wordBreak: multiline ? 'break-all' : 'normal',
          overflow: 'hidden',
          textOverflow: multiline ? 'clip' : 'ellipsis',
          fontFamily: ctx.fontFamily,
          margin: 0,
          width: '100%',
          ...(multiline && maxRows !== undefined ? {
            display: '-webkit-box',
            WebkitLineClamp: maxRows,
            WebkitBoxOrient: 'vertical' as const,
          } : {}),
        }}>{(value as string) || '-'}</p>
      </div>
    )
  },
  FormItem({ value, onChange, t, blockConfig }) {
    const multiline = blockConfig?.multiline !== false
    const rows = typeof blockConfig?.rows === 'number' ? blockConfig.rows : 5
    const placeholder = typeof blockConfig?.placeholder === 'string' ? blockConfig.placeholder : undefined
    const maxLength = typeof blockConfig?.maxLength === 'number' ? blockConfig.maxLength : undefined
    return (
      <div className="flex flex-col gap-2">
        {multiline ? (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            maxLength={maxLength}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200 resize-none"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        )}
      </div>
    )
  },
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const multiline = blockConfig.multiline !== false
    const noPadding = blockConfig.noPadding === true
    const maxLength = typeof blockConfig.maxLength === 'number' ? blockConfig.maxLength : ''
    const rows = typeof blockConfig.rows === 'number' ? blockConfig.rows : ''
    const placeholder = typeof blockConfig.placeholder === 'string' ? blockConfig.placeholder : ''
    return (
      <div className="flex flex-col gap-2 text-sm">
        {/* フラグ系 */}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={multiline}
            onChange={e => onChange({ ...blockConfig, multiline: e.target.checked })}
            className="accent-sky-500" />
          <span className="text-gray-700">複数行（multiline）</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={noPadding}
            onChange={e => onChange({ ...blockConfig, noPadding: e.target.checked || undefined })}
            className="accent-sky-500" />
          <span className="text-gray-700">余白なし（noPadding）</span>
        </label>
        {/* 数値・テキスト系 */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 shrink-0">最大文字数</span>
          <input type="number" min={0} value={maxLength} placeholder="無制限"
            onChange={e => onChange({ ...blockConfig, maxLength: e.target.value ? Number(e.target.value) : undefined })}
            className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-200" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 shrink-0">表示行数</span>
          <input type="number" min={1} value={rows} placeholder="デフォルト"
            onChange={e => onChange({ ...blockConfig, rows: e.target.value ? Number(e.target.value) : undefined })}
            className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-200" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-24 shrink-0">placeholder</span>
          <input type="text" value={placeholder} placeholder="入力してください…"
            onChange={e => onChange({ ...blockConfig, placeholder: e.target.value || undefined })}
            className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-200" />
        </div>
      </div>
    )
  },
}
