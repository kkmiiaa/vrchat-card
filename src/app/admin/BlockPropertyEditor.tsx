'use client'

import { ColorPicker, LABEL_PRESET_COLORS } from '@/blocks/colorPicker'
import { IconPicker } from '@/blocks/iconRegistry'
import type { ComponentDef, SurfaceVariant } from '@/blocks/types'

// ─── 型定義 ─────────────────────────────────────────────────────────

export type BlockDisplaySettings = {
  variant: string
  surface: SurfaceVariant
  label: string
  subLabel: string
  labelColor: string
  labelIcon: string
  labelInset: boolean
  labelInsetDir: 'col' | 'row'
}

export function defaultBlockDisplaySettings(component: ComponentDef<unknown>): BlockDisplaySettings {
  return {
    variant: component.variants?.[0] ?? 'simple',
    surface: 'transparent',
    label: '',
    subLabel: '',
    labelColor: '',
    labelIcon: '',
    labelInset: false,
    labelInsetDir: 'col',
  }
}

const SURFACE_OPTIONS: { value: SurfaceVariant; label: string }[] = [
  { value: 'simple',      label: 'simple' },
  { value: 'glass',       label: 'glass' },
  { value: 'flat',        label: 'flat' },
  { value: 'transparent', label: 'transparent' },
  { value: 'outline',     label: 'outline' },
]

/** コンポーネントと現在の variant から surface 選択肢を表示するか判定 */
export function isSurfaceApplicable(
  component: Pick<ComponentDef<unknown>, 'supportsSurface' | 'surfaceFor'>,
  variant: string,
): boolean {
  if (!component.supportsSurface) return false
  return (component.surfaceFor ?? []).includes(variant)
}

// ─── 共通ラベル ─────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] text-gray-400 w-16 shrink-0">{children}</span>
}

// ─── BlockPropertyEditor ────────────────────────────────────────────

/**
 * variant / surface / label / labelInset / blockConfigForm を一括編集する共通 UI。
 * TemplateBuilder と ComponentPreview の両方から使い、どちらかに新しい設定を追加したら
 * ここだけ直せば両画面に反映される。
 *
 * 画面固有の追加 UI は `extras` スロットに渡す。
 */
export function BlockPropertyEditor({
  component,
  settings,
  onChange,
  extras,
}: {
  component: ComponentDef<unknown>
  settings: BlockDisplaySettings
  onChange: (patch: Partial<BlockDisplaySettings>) => void
  extras?: React.ReactNode
}) {
  const variants = component.variants ?? ['simple']
  const showSurface = isSurfaceApplicable(component, settings.variant)

  return (
    <div className="flex flex-col gap-3">
      {/* variant */}
      {variants.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <FieldLabel>variant</FieldLabel>
          <div className="flex flex-wrap gap-1">
            {variants.map(v => (
              <button
                key={v}
                type="button"
                onClick={() => onChange({ variant: v })}
                className={`text-xs px-2 py-0.5 rounded border font-mono transition-colors ${
                  settings.variant === v
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* surface */}
      {showSurface && (
        <div className="flex items-center gap-2 flex-wrap">
          <FieldLabel>surface</FieldLabel>
          <div className="flex flex-wrap gap-1">
            {SURFACE_OPTIONS.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => onChange({ surface: o.value })}
                className={`text-xs px-2 py-0.5 rounded border font-mono transition-colors ${
                  settings.surface === o.value
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                }`}
              >
                {o.value}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* label */}
      <div className="flex items-center gap-2">
        <FieldLabel>label</FieldLabel>
        <input
          type="text"
          value={settings.label}
          onChange={e => onChange({ label: e.target.value })}
          placeholder="例: 言語"
          className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-200"
        />
      </div>

      {/* subLabel */}
      <div className="flex items-center gap-2">
        <FieldLabel>subLabel</FieldLabel>
        <input
          type="text"
          value={settings.subLabel}
          onChange={e => onChange({ subLabel: e.target.value })}
          placeholder="例: language"
          className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-200"
        />
      </div>

      {/* labelColor */}
      <div className="flex items-center gap-2">
        <FieldLabel>labelColor</FieldLabel>
        <ColorPicker
          value={settings.labelColor}
          onChange={v => onChange({ labelColor: v })}
          defaultColor="#1f2937"
          presetColors={LABEL_PRESET_COLORS}
        />
      </div>

      {/* labelIcon */}
      <div className="flex items-center gap-2">
        <FieldLabel>labelIcon</FieldLabel>
        <IconPicker value={settings.labelIcon} onChange={v => onChange({ labelIcon: v })} />
      </div>

      {/* labelInset（label が設定されている場合のみ） */}
      {settings.label && (
        <div className="flex items-center gap-2">
          <FieldLabel>labelInset</FieldLabel>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.labelInset}
              onChange={e => onChange({ labelInset: e.target.checked })}
              className="w-3 h-3 accent-sky-500"
            />
            <span className="text-xs text-gray-500">枠内に配置</span>
          </label>
          {settings.labelInset && (
            <select
              value={settings.labelInsetDir}
              onChange={e => onChange({ labelInsetDir: e.target.value as 'col' | 'row' })}
              className="ml-2 text-xs border border-gray-200 rounded px-1 py-0.5 text-gray-600 focus:outline-none"
            >
              <option value="col">col（上下）</option>
              <option value="row">row（左右）</option>
            </select>
          )}
        </div>
      )}

      {/* 画面固有の追加 UI */}
      {extras}
    </div>
  )
}
