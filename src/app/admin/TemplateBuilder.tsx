'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { TemplateDefinition, BlockValues, LayoutNode, Block, LayoutNodeRow, LayoutNodeCol, TemplateGridDef } from '@/blocks/types'
import { cellsToPixels } from '@/blocks/types'
import { getAllComponents, getComponent } from '@/blocks/registry'
import { backgroundComponent } from '@/blocks/background'
import { fontMap } from '@/lib/fontMap'
import { translations } from '@/utils/translations'
import { getBackgroundStyle, CARD_BG_FALLBACK } from '@/utils/backgroundUtils'
import type { BackgroundValue } from '@/blocks/types'
import GenericCardRenderer from '@/components/GenericCardRenderer'
import { COMPONENT_SUPPORTS_BG_VARIANT } from './BlockPreviewList'

type Orientation = 'landscape' | 'portrait'
type NodePath = number[]

const BLOCK_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16']
function blockColor(key: string): string {
  let hash = 0
  for (const c of key) hash = (hash * 31 + c.charCodeAt(0)) % BLOCK_COLORS.length
  return BLOCK_COLORS[hash]
}

// パスでノードを取得
function getNode(root: LayoutNode, path: NodePath): LayoutNode | null {
  if (path.length === 0) return root
  const [idx, ...rest] = path
  if (root.type === 'block') return null
  const child = root.children[idx]
  if (!child) return null
  return getNode(child, rest)
}

// パスでノードを更新した新しいツリーを返す
function setNode(root: LayoutNode, path: NodePath, updater: (n: LayoutNode) => LayoutNode): LayoutNode {
  if (path.length === 0) return updater(root)
  if (root.type === 'block') return root
  const [idx, ...rest] = path
  const newChildren = root.children.map((child, i) =>
    i === idx ? setNode(child, rest, updater) : child
  )
  return { ...root, children: newChildren }
}

// パスのノードを削除した新しいツリーを返す
function deleteNode(root: LayoutNode, path: NodePath): LayoutNode {
  if (path.length === 0) return root
  if (root.type === 'block') return root
  const [idx, ...rest] = path
  if (rest.length === 0) {
    const newChildren = root.children.filter((_, i) => i !== idx)
    return { ...root, children: newChildren }
  }
  const newChildren = root.children.map((child, i) =>
    i === idx ? deleteNode(child, rest) : child
  )
  return { ...root, children: newChildren }
}

// パスの子に追加
function addChild(root: LayoutNode, path: NodePath, child: LayoutNode): LayoutNode {
  return setNode(root, path, (n) => {
    if (n.type === 'block') return n
    return { ...n, children: [...n.children, child] }
  })
}

// ノードを上下に移動
function moveNode(root: LayoutNode, path: NodePath, dir: -1 | 1): LayoutNode {
  if (path.length === 0) return root
  const parentPath = path.slice(0, -1)
  const idx = path[path.length - 1]
  return setNode(root, parentPath, (n) => {
    if (n.type === 'block') return n
    const newChildren = [...n.children]
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= newChildren.length) return n
    ;[newChildren[idx], newChildren[newIdx]] = [newChildren[newIdx], newChildren[idx]]
    return { ...n, children: newChildren }
  })
}

// レイアウトツリーから使用中のブロック情報を順序付きで収集
function collectBlockEntries(node: LayoutNode, seen = new Set<string>(), result: { componentKey: string; dataKey: string }[] = []): { componentKey: string; dataKey: string }[] {
  if (node.type === 'block') {
    if (!seen.has(node.dataKey)) { seen.add(node.dataKey); result.push({ componentKey: node.componentKey, dataKey: node.dataKey }) }
  } else {
    node.children.forEach(c => collectBlockEntries(c, seen, result))
  }
  return result
}

type Props = {
  definitions: TemplateDefinition[]
  values: BlockValues
}

export default function TemplateBuilder({ definitions, values }: Props) {
  const [selectedDefIdx, setSelectedDefIdx] = useState(0)
  const definition = definitions[selectedDefIdx]

  const [orientation, setOrientation] = useState<Orientation>('landscape')
  const [fitScale, setFitScale] = useState(0.5)
  const containerRef = useRef<HTMLDivElement>(null)

  const [layouts, setLayouts] = useState<Record<string, { landscape: LayoutNode; portrait: LayoutNode }>>(
    () => Object.fromEntries(definitions.map(d => [d.id, { landscape: d.landscape.layout, portrait: d.portrait.layout }]))
  )

  const currentLayouts = layouts[definition.id]
  const landscapeLayout = currentLayouts.landscape
  const portraitLayout  = currentLayouts.portrait

  const layout = orientation === 'landscape' ? landscapeLayout : portraitLayout
  const setLayout = useCallback((updater: LayoutNode | ((prev: LayoutNode) => LayoutNode)) => {
    setLayouts(prev => {
      const current = prev[definition.id]
      const next = typeof updater === 'function' ? updater(orientation === 'landscape' ? current.landscape : current.portrait) : updater
      return { ...prev, [definition.id]: { ...current, [orientation]: next } }
    })
  }, [definition.id, orientation])

  type OrientationScales = { defaultLabelFontScale?: number; defaultContentFontScale?: number; defaultPaddingScale?: number }
  const [orientationScales, setOrientationScales] = useState<Record<string, { landscape: OrientationScales; portrait: OrientationScales }>>(
    () => Object.fromEntries(definitions.map(d => [d.id, {
      landscape: { defaultLabelFontScale: d.landscape.defaultLabelFontScale, defaultContentFontScale: d.landscape.defaultContentFontScale, defaultPaddingScale: d.landscape.defaultPaddingScale },
      portrait:  { defaultLabelFontScale: d.portrait.defaultLabelFontScale,  defaultContentFontScale: d.portrait.defaultContentFontScale,  defaultPaddingScale: d.portrait.defaultPaddingScale  },
    }]))
  )
  const currentOrientationScales = orientationScales[definition.id]?.[orientation] ?? {}
  const setOrientationScale = useCallback((patch: OrientationScales) => {
    setOrientationScales(prev => ({
      ...prev,
      [definition.id]: { ...prev[definition.id], [orientation]: { ...prev[definition.id]?.[orientation], ...patch } },
    }))
  }, [definition.id, orientation])

  const [rightTab, setRightTab] = useState<'layout' | 'form'>('layout')
  const [localValues, setLocalValues] = useState<BlockValues>(() => ({ ...values }))
  const [localFontFamily, setLocalFontFamily] = useState<string>(definition.fontFamily)
  const updateLocalValue = useCallback((key: string, val: unknown) => {
    setLocalValues(prev => ({ ...prev, [key]: val }))
  }, [])

  const [selectedPath, setSelectedPath] = useState<NodePath | null>(null)
  const selectedNode = selectedPath ? getNode(layout, selectedPath) : null

  const o = definition[orientation]
  const scale = fitScale

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const sw = (rect.width  - 48) / o.cardWidth
      const sh = (rect.height - 48) / o.cardHeight
      setFitScale(Math.min(sw, sh))
    }
    update()
    const observer = new ResizeObserver(update)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [o.cardWidth, o.cardHeight, orientation])

  const allBlocks = getAllComponents().filter(b => b.key !== 'background' && b.key !== 'overlay')

  const handleUpdate = useCallback((path: NodePath, updater: (n: LayoutNode) => LayoutNode) => {
    setLayout((prev: LayoutNode) => setNode(prev, path, updater))
  }, [setLayout])

  const handleDelete = useCallback((path: NodePath) => {
    setSelectedPath(null)
    setLayout((prev: LayoutNode) => deleteNode(prev, path))
  }, [setLayout])

  const handleAdd = useCallback((path: NodePath, child: LayoutNode) => {
    setLayout((prev: LayoutNode) => addChild(prev, path, child))
  }, [setLayout])

  const handleMove = useCallback((path: NodePath, dir: -1 | 1) => {
    setLayout((prev: LayoutNode) => moveNode(prev, path, dir))
  }, [setLayout])

  const grid = o.grid

  // ページ背景（カードと同じ背景をコンテナ全体に適用）
  const bgValue = definition.backgroundKey
    ? (localValues[definition.backgroundKey] as BackgroundValue | undefined)
    : undefined
  const pageBg = bgValue
    ? (getBackgroundStyle(bgValue.type, bgValue.value, bgValue.base64 ?? null, CARD_BG_FALLBACK) ?? CARD_BG_FALLBACK)
    : CARD_BG_FALLBACK

  function fmtW(cells: number) {
    return `${cells}セル / ${cellsToPixels(cells, grid.cellSize, grid.gap)}px`
  }
  function fmtH(cells: number) {
    return `${cells}セル / ${cellsToPixels(cells, grid.cellSize, grid.gap)}px`
  }

  // ツリーノードを再帰描画
  function renderTree(node: LayoutNode, path: NodePath, depth: number): React.ReactNode {
    const isSelected = selectedPath && JSON.stringify(selectedPath) === JSON.stringify(path)
    const indent = depth * 12

    if (node.type === 'block') {
      const color = blockColor(node.componentKey)
      return (
        <div
          key={path.join('-')}
          onClick={() => setSelectedPath(path)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-xs transition-colors ${
            isSelected ? 'bg-sky-100 text-sky-800' : 'hover:bg-gray-100 text-gray-700'
          }`}
          style={{ paddingLeft: indent + 8 }}
        >
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
          <span className="font-mono font-medium">{node.componentKey}</span>
          <span className="text-gray-400 text-[10px]">:{node.variant}</span>
          <span className="ml-auto flex gap-1 text-[10px] text-gray-400">
            {node.flex !== undefined && <span>flex:{node.flex}</span>}
            {node.minW !== undefined && <span title={fmtW(node.minW)}>w:{node.minW}</span>}
            {node.minH !== undefined && <span title={fmtH(node.minH)}>h:{node.minH}</span>}
          </span>
        </div>
      )
    }

    const typeLabel = node.type === 'row' ? '→ row' : '↓ col'
    const typeColor = node.type === 'row' ? 'text-orange-600' : 'text-purple-600'
    return (
      <div key={path.join('-')}>
        <div
          onClick={() => setSelectedPath(path)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-xs transition-colors ${
            isSelected ? 'bg-sky-100 text-sky-800' : 'hover:bg-gray-100'
          }`}
          style={{ paddingLeft: indent + 8 }}
        >
          <span className={`font-bold font-mono ${typeColor}`}>{typeLabel}</span>
          <span className="ml-1 text-[10px] text-gray-400 flex gap-1">
            {node.flex !== undefined && <span>flex:{node.flex}</span>}
            {(node as LayoutNodeRow).minH !== undefined && (
              <span title={fmtH((node as LayoutNodeRow).minH!)}>h:{(node as LayoutNodeRow).minH}</span>
            )}
            {(node as LayoutNodeCol).minW !== undefined && (
              <span title={fmtW((node as LayoutNodeCol).minW!)}>w:{(node as LayoutNodeCol).minW}</span>
            )}
          </span>
          <span className="ml-auto text-gray-300 text-[10px]">{node.children.length}子</span>
        </div>
        <div>
          {node.children.map((child, i) => renderTree(child, [...path, i], depth + 1))}
        </div>
      </div>
    )
  }

  // 選択ノードのプロパティ編集パネル
  function renderProperties(): React.ReactNode {
    if (!selectedPath || !selectedNode) {
      return <p className="text-xs text-gray-400 px-3 py-4">ノードを選択してください</p>
    }
    const path = selectedPath
    const node = selectedNode

    const isRoot = path.length === 0
    const parentPath = path.slice(0, -1)
    const idx = path[path.length - 1] ?? 0
    const parentNode = parentPath.length > 0 ? getNode(layout, parentPath) : null
    const siblingCount = parentNode && parentNode.type !== 'block' ? parentNode.children.length : 0

    return (
      <div className="flex flex-col gap-3 px-3 py-3">
        {/* 移動・削除 */}
        {!isRoot && (
          <div className="flex items-center gap-2">
            <button onClick={() => handleMove(path, -1)} disabled={idx === 0}
              className="px-2 py-1 text-xs border rounded disabled:opacity-30 hover:bg-gray-50">↑</button>
            <button onClick={() => handleMove(path, 1)} disabled={idx >= siblingCount - 1}
              className="px-2 py-1 text-xs border rounded disabled:opacity-30 hover:bg-gray-50">↓</button>
            <button onClick={() => handleDelete(path)}
              className="ml-auto px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50">削除</button>
          </div>
        )}

        {/* flex / minW / minH */}
        <div className="flex flex-col gap-2">
          <SizeProp
            label="flex"
            value={node.flex}
            onChange={v => handleUpdate(path, n => ({ ...n, flex: v }))}
          />
          {node.type !== 'row' && (
            <SizeProp
              label="minW (セル)"
              value={(node as LayoutNodeCol | Block).minW}
              onChange={v => handleUpdate(path, n => ({ ...n, minW: v }))}
            />
          )}
          {node.type !== 'col' && (
            <SizeProp
              label="minH (セル)"
              value={(node as LayoutNodeRow | Block).minH}
              onChange={v => handleUpdate(path, n => ({ ...n, minH: v }))}
            />
          )}
        </div>

        {/* row / col: justify */}
        {(node.type === 'col' || node.type === 'row') && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-gray-500">justify-content</label>
            <select
              value={(node as LayoutNodeCol).justify ?? ''}
              onChange={e => handleUpdate(path, n => ({ ...n, justify: e.target.value || undefined }))}
              className="text-xs border rounded px-2 py-1"
            >
              <option value="">flex-start（デフォルト）</option>
              <option value="space-between">space-between</option>
              <option value="space-around">space-around</option>
              <option value="space-evenly">space-evenly</option>
              <option value="center">center</option>
              <option value="flex-end">flex-end</option>
            </select>
          </div>
        )}

        {/* row / col: label / subLabel / labelColor */}
        {(node.type === 'col' || node.type === 'row') && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-gray-500">ヘッダーラベル</label>
            <input
              type="text"
              value={(node as LayoutNodeCol).label ?? ''}
              onChange={e => handleUpdate(path, n => ({ ...n, label: e.target.value || undefined }))}
              placeholder="例: PROFILE"
              className="text-xs border rounded px-2 py-1"
            />
            <input
              type="text"
              value={(node as LayoutNodeCol).subLabel ?? ''}
              onChange={e => handleUpdate(path, n => ({ ...n, subLabel: e.target.value || undefined }))}
              placeholder="サブラベル（任意）"
              className="text-xs border rounded px-2 py-1"
            />
            <div className="flex items-center gap-2 mt-1">
              <label className="text-[10px] text-gray-500 flex-shrink-0">ラベル色</label>
              <input
                type="color"
                value={(node as LayoutNodeCol).labelColor ?? '#1f2937'}
                onChange={e => handleUpdate(path, n => ({ ...n, labelColor: e.target.value }))}
                className="w-7 h-6 rounded border cursor-pointer"
              />
              <button
                type="button"
                onClick={() => handleUpdate(path, n => { const { labelColor: _, ...rest } = n as LayoutNodeCol; return rest })}
                className="text-[10px] text-gray-400 hover:text-gray-600"
              >リセット</button>
            </div>
          </div>
        )}

        {/* block のみ: labelInset / labelInsetDir / labelColor */}
        {node.type === 'block' && (node as Block).label !== undefined && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-gray-500 w-28 flex-shrink-0">枠内ラベル</label>
              <input
                type="checkbox"
                checked={(node as Block).labelInset ?? false}
                onChange={e => handleUpdate(path, n => ({ ...n, labelInset: e.target.checked || undefined }))}
              />
            </div>
            {(node as Block).labelInset && (
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-gray-500 w-28 flex-shrink-0">並び方向</label>
                <select
                  value={(node as Block).labelInsetDir ?? 'col'}
                  onChange={e => handleUpdate(path, n => ({ ...n, labelInsetDir: e.target.value as 'col' | 'row' }))}
                  className="text-xs border rounded px-2 py-1 flex-1"
                >
                  <option value="col">縦（上下）</option>
                  <option value="row">横（左右）</option>
                </select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-gray-500 w-28 flex-shrink-0">ラベル色</label>
              <input
                type="color"
                value={(node as Block).labelColor ?? '#1f2937'}
                onChange={e => handleUpdate(path, n => ({ ...n, labelColor: e.target.value }))}
                className="w-7 h-6 rounded border cursor-pointer"
              />
              <button
                type="button"
                onClick={() => handleUpdate(path, n => { const { labelColor: _, ...rest } = n as Block; return rest })}
                className="text-[10px] text-gray-400 hover:text-gray-600"
              >リセット</button>
            </div>
          </div>
        )}

        {/* block のみ: labelFontScale / contentFontScale */}
        {node.type === 'block' && (node as Block).label !== undefined && (
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-gray-500 w-28 flex-shrink-0">ヘッダー文字倍率</label>
            <input
              type="number"
              step="0.05"
              min="0.3"
              max="3"
              placeholder="1.0"
              value={(node as Block).labelFontScale ?? ''}
              onChange={e => handleUpdate(path, n => ({
                ...n,
                labelFontScale: e.target.value === '' ? undefined : Number(e.target.value),
              }))}
              className="flex-1 px-2 py-1 border rounded text-xs font-mono"
            />
            {(node as Block).labelFontScale !== undefined && (
              <button
                onClick={() => handleUpdate(path, n => ({ ...n, labelFontScale: undefined }))}
                className="text-gray-300 hover:text-gray-500 text-xs"
              >↺</button>
            )}
          </div>
        )}
        {node.type === 'block' && (
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-gray-500 w-28 flex-shrink-0">コンテンツ文字倍率</label>
            <input
              type="number"
              step="0.05"
              min="0.3"
              max="3"
              placeholder="1.0"
              value={(node as Block).contentFontScale ?? ''}
              onChange={e => handleUpdate(path, n => ({
                ...n,
                contentFontScale: e.target.value === '' ? undefined : Number(e.target.value),
              }))}
              className="flex-1 px-2 py-1 border rounded text-xs font-mono"
            />
            {(node as Block).contentFontScale !== undefined && (
              <button
                onClick={() => handleUpdate(path, n => ({ ...n, contentFontScale: undefined }))}
                className="text-gray-300 hover:text-gray-500 text-xs"
              >↺</button>
            )}
          </div>
        )}

        {/* block のみ: componentKey / dataKey / variant */}
        {node.type === 'block' && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">コンポーネント</label>
              <select
                value={node.componentKey}
                onChange={e => handleUpdate(path, n => ({ ...n, componentKey: e.target.value, variant: 'default' }))}
                className="text-xs border rounded px-2 py-1"
              >
                {allBlocks.map(b => (
                  <option key={b.key} value={b.key}>{b.key}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">データキー</label>
              <input
                type="text"
                value={node.dataKey}
                onChange={e => handleUpdate(path, n => ({ ...n, dataKey: e.target.value }))}
                className="text-xs border rounded px-2 py-1 font-mono"
              />
            </div>
            {COMPONENT_SUPPORTS_BG_VARIANT[node.componentKey] !== false && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">bgVariant（背景）</label>
              <select
                value={(node as Block).bgVariant ?? 'transparent'}
                onChange={e => handleUpdate(path, n => ({ ...n, bgVariant: e.target.value as import('@/blocks/types').BgVariant || undefined }))}
                className="text-xs border rounded px-2 py-1"
              >
                <option value="default">default（白ボックス）</option>
                <option value="glass">glass（すりガラス）</option>
                <option value="transparent">transparent（背景なし）</option>
                <option value="outline">outline（枠線のみ）</option>
              </select>
            </div>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">variant（コンテンツ）</label>
              <select
                value={node.variant}
                onChange={e => handleUpdate(path, n => ({ ...n, variant: e.target.value }))}
                className="text-xs border rounded px-2 py-1"
              >
                {(allBlocks.find(b => b.key === node.componentKey)?.variants ?? ['default']).map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">alignSelf</label>
              <select
                value={(node as Block).alignSelf ?? ''}
                onChange={e => handleUpdate(path, n => ({ ...n, alignSelf: e.target.value || undefined }))}
                className="text-xs border rounded px-2 py-1"
              >
                <option value="">stretch（デフォルト）</option>
                <option value="flex-start">flex-start（コンテンツ高さ）</option>
                <option value="flex-end">flex-end</option>
                <option value="center">center</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">ラベル</label>
              <input
                type="text"
                value={node.label ?? ''}
                onChange={e => handleUpdate(path, n => ({ ...n, label: e.target.value || undefined }))}
                placeholder="—"
                className="text-xs border rounded px-2 py-1"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">サブラベル</label>
              <input
                type="text"
                value={node.subLabel ?? ''}
                onChange={e => handleUpdate(path, n => ({ ...n, subLabel: e.target.value || undefined }))}
                placeholder="—"
                className="text-xs border rounded px-2 py-1"
              />
            </div>
          </div>
        )}

        {/* divider のみ: blockConfig 編集 */}
        {node.type === 'block' && (node as Block).componentKey === 'divider' && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Divider 設定</p>
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-gray-500 w-16 flex-shrink-0">色</label>
              <input
                type="color"
                value={((node as Block).blockConfig?.color as string | undefined) ?? '#000000'}
                onChange={e => handleUpdate(path, n => ({ ...n, blockConfig: { ...(n as Block).blockConfig, color: e.target.value } }))}
                className="w-7 h-7 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-gray-500 w-16 flex-shrink-0">不透明度</label>
              <input
                type="range"
                min={0} max={1} step={0.05}
                value={((node as Block).blockConfig?.opacity as number | undefined) ?? 0.1}
                onChange={e => handleUpdate(path, n => ({ ...n, blockConfig: { ...(n as Block).blockConfig, opacity: Number(e.target.value) } }))}
                className="flex-1"
              />
              <span className="text-[10px] text-gray-400 w-7 text-right">
                {Math.round((((node as Block).blockConfig?.opacity as number | undefined) ?? 0.1) * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-gray-500 w-16 flex-shrink-0">太さ</label>
              <input
                type="number"
                min={1} max={20}
                value={((node as Block).blockConfig?.thickness as number | undefined) ?? 1}
                onChange={e => handleUpdate(path, n => ({ ...n, blockConfig: { ...(n as Block).blockConfig, thickness: Number(e.target.value) } }))}
                className="w-16 px-2 py-1 border rounded text-xs font-mono"
              />
            </div>
          </div>
        )}

        {/* row/col のみ: 子追加 */}
        {node.type !== 'block' && (
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-gray-500">子ノードを追加</p>
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => handleAdd(path, { type: 'row', flex: 1, children: [] })}
                className="px-2 py-1 text-xs border rounded hover:bg-orange-50 text-orange-700 border-orange-200"
              >+ row</button>
              <button
                onClick={() => handleAdd(path, { type: 'col', flex: 1, children: [] })}
                className="px-2 py-1 text-xs border rounded hover:bg-purple-50 text-purple-700 border-purple-200"
              >+ col</button>
              <button
                onClick={() => handleAdd(path, { type: 'block', componentKey: allBlocks[0]?.key ?? 'name', dataKey: allBlocks[0]?.key ?? 'name', variant: 'default', flex: 1 })}
                className="px-2 py-1 text-xs border rounded hover:bg-blue-50 text-blue-700 border-blue-200"
              >+ block</button>
            </div>
          </div>
        )}

        {/* JSON 出力（デバッグ用） */}
        <details className="text-[10px]">
          <summary className="text-gray-400 cursor-pointer">JSON</summary>
          <pre className="mt-1 p-2 bg-gray-50 rounded overflow-auto text-[10px] max-h-40">
            {JSON.stringify(node, null, 2)}
          </pre>
        </details>
      </div>
    )
  }

  const resolvedDefinition = {
    ...definition,
    landscape: { ...definition.landscape, layout: landscapeLayout, ...orientationScales[definition.id]?.landscape },
    portrait:  { ...definition.portrait,  layout: portraitLayout,  ...orientationScales[definition.id]?.portrait  },
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* 左 aside: テンプレート一覧 */}
      <div className="w-52 border-r bg-white flex flex-col overflow-hidden flex-shrink-0">
        <div className="px-3 py-2 border-b">
          <p className="text-xs font-medium text-gray-700">テンプレート</p>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {definitions.map((def, idx) => (
            <button
              key={def.id}
              onClick={() => { setSelectedDefIdx(idx); setSelectedPath(null) }}
              className={`w-full text-left px-3 py-2.5 transition-colors ${
                selectedDefIdx === idx ? 'bg-sky-50 border-r-2 border-sky-400' : 'hover:bg-gray-50'
              }`}
            >
              <p className={`text-xs font-medium ${selectedDefIdx === idx ? 'text-sky-700' : 'text-gray-700'}`}>
                {def.label}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{def.id}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 中央: カードプレビュー */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* ツールバー */}
        <div className="flex items-center gap-3 flex-wrap px-4 py-2.5 border-b bg-white flex-shrink-0 text-xs">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['landscape', 'portrait'] as const).map(ori => (
              <button
                key={ori}
                onClick={() => { setOrientation(ori); setSelectedPath(null) }}
                className={`px-3 py-1.5 font-medium rounded-md transition-all ${
                  orientation === ori ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {ori === 'landscape' ? '横' : '縦'}
              </button>
            ))}
          </div>
          <span className="ml-auto text-gray-400 font-mono text-xs">{Math.round(scale * 100)}%</span>
        </div>

        {/* プレビュー（ページ全体に背景を適用） */}
        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-center overflow-auto p-6"
          style={{ background: pageBg }}
        >
          <div style={{
            width:  o.cardWidth  * scale,
            height: o.cardHeight * scale,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: (definition.borderRadius ?? 20) * scale,
            flexShrink: 0,
          }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: o.cardWidth, height: o.cardHeight }}>
              <GenericCardRenderer
                definition={resolvedDefinition}
                orientation={orientation}
                values={localValues}
                fontFamily={localFontFamily}
                noBackground
                highlightPath={selectedPath ?? undefined}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 右: ツリーエディタ */}
      <div className="w-72 border-l bg-white flex flex-col overflow-hidden flex-shrink-0">
        {/* タブ */}
        <div className="flex border-b flex-shrink-0">
          {(['layout', 'form'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setRightTab(tab)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                rightTab === tab
                  ? 'text-sky-600 border-b-2 border-sky-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'layout' ? 'レイアウト' : 'フォーム'}
            </button>
          ))}
        </div>

        {rightTab === 'layout' && <>
        <div className="flex-1 overflow-y-auto py-1 text-xs">
          {renderTree(layout, [], 0)}
        </div>
        {/* フォントスケール編集 */}
        <div className="border-t flex flex-col">
        </div>

        <div className="border-t flex flex-col overflow-y-auto max-h-72">
          <div className="px-3 py-2 border-b">
            <p className="text-xs font-medium text-gray-700">プロパティ</p>
          </div>
          {renderProperties()}
        </div>
        </>}

        {rightTab === 'form' && (
          <div className="flex-1 overflow-y-auto">
            {/* フォント */}
            <div className="border-b px-3 py-3 flex flex-col gap-2">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Font</p>
              <div className="flex flex-col gap-1.5">
                {(Object.entries(fontMap) as [string, { style: { fontFamily: string } }][]).map(([key, font]) => {
                  const ff = font.style.fontFamily
                  const isSelected = localFontFamily === ff
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setLocalFontFamily(ff)}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                        isSelected
                          ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                      style={{ fontFamily: ff }}
                    >
                      {key}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 背景 */}
            {definition.backgroundKey && (
              <div className="border-b px-3 py-3">
                <backgroundComponent.FormItem
                  value={(localValues[definition.backgroundKey] as BackgroundValue | undefined) ?? backgroundComponent.defaultValue}
                  onChange={v => updateLocalValue(definition.backgroundKey!, v)}
                  t={translations.ja}
                />
              </div>
            )}

            {collectBlockEntries(layout).map(({ componentKey, dataKey }) => {
              const block = getComponent(componentKey)
              if (!block?.FormItem) return null
              const val = localValues[dataKey] ?? block.defaultValue
              const t = translations.ja
              return (
                <div key={dataKey} className="border-b px-3 py-3">
                  <block.FormItem
                    value={val}
                    onChange={v => updateLocalValue(dataKey, v)}
                    t={t}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function SizeProp({ label, value, onChange }: {
  label: string
  value: number | undefined
  onChange: (v: number | undefined) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[10px] text-gray-500 w-20 flex-shrink-0">{label}</label>
      <input
        type="number"
        min={0}
        max={200}
        value={value ?? ''}
        placeholder="—"
        onChange={e => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        className="flex-1 px-2 py-1 border rounded text-xs"
      />
      {value !== undefined && (
        <button onClick={() => onChange(undefined)} className="text-gray-300 hover:text-gray-500 text-xs">✕</button>
      )}
    </div>
  )
}
