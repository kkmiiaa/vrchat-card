'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { TemplateDefinition, BlockValues, LayoutNode, Block, LayoutNodeRow, LayoutNodeCol, TemplateGridDef } from '@/blocks/types'
import { cellsToPixels } from '@/blocks/types'
import { getAllComponents, getComponent } from '@/blocks/registry'
import { backgroundComponent } from '@/blocks/background'
import { fontMap } from '@/lib/fontMap'
import { translations } from '@/utils/translations'
import { getBackgroundStyle, CARD_BG_FALLBACK } from '@/utils/backgroundUtils'
import type { BackgroundValue } from '@/blocks/types'
import GenericCardRenderer from '@/components/GenericCardRenderer'
import { BlockPropertyEditor, isBgVariantApplicable, type BlockDisplaySettings } from './BlockPropertyEditor'
import { ColorPicker, LABEL_PRESET_COLORS } from '@/blocks/colorPicker'

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

// ノードを別の親に移動（DnD 用）
function reparentNode(root: LayoutNode, fromPath: NodePath, toParentPath: NodePath, toIdx: number): LayoutNode {
  if (fromPath.length === 0) return root
  const node = getNode(root, fromPath)
  if (!node) return root
  // 自分自身の子孫への移動を禁止
  if (
    toParentPath.length >= fromPath.length &&
    JSON.stringify(toParentPath.slice(0, fromPath.length)) === JSON.stringify(fromPath)
  ) return root

  const newRoot = deleteNode(root, fromPath)
  const fromParentPath = fromPath.slice(0, -1)
  const fromIdx = fromPath[fromPath.length - 1]

  // 削除後のパス補正
  let adjParent = toParentPath
  let adjIdx = toIdx
  outer: for (let i = 0; i <= fromParentPath.length; i++) {
    if (i === fromParentPath.length && i === toParentPath.length) {
      // 同一親
      if (toIdx > fromIdx) adjIdx = toIdx - 1
      break
    }
    if (i === fromParentPath.length) {
      // fromParentPath が toParentPath の prefix
      const next = toParentPath[i]
      if (next > fromIdx) adjParent = [...toParentPath.slice(0, i), next - 1, ...toParentPath.slice(i + 1)]
      break
    }
    if (i === toParentPath.length) break outer
    if (fromParentPath[i] !== toParentPath[i]) break outer
  }

  return setNode(newRoot, adjParent, n => {
    if (n.type === 'block') return n
    const children = [...n.children]
    children.splice(adjIdx, 0, node)
    return { ...n, children }
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

// レイアウトツリーから全 dataKey を収集
function collectAllDataKeys(node: LayoutNode, result = new Set<string>()): Set<string> {
  if (node.type === 'block') { result.add(node.dataKey) }
  else { node.children.forEach(c => collectAllDataKeys(c, result)) }
  return result
}

// componentKey に対してユニークな dataKey を生成（例: text1, text2, ...）
function generateDataKey(componentKey: string, usedKeys: Set<string>): string {
  let i = 1
  while (usedKeys.has(`${componentKey}${i}`)) i++
  return `${componentKey}${i}`
}

// レイアウトツリーから使用中のブロック情報を順序付きで収集
function collectBlockEntries(node: LayoutNode, seen = new Set<string>(), result: { componentKey: string; dataKey: string; blockConfig?: Record<string, unknown> }[] = []): { componentKey: string; dataKey: string; blockConfig?: Record<string, unknown> }[] {
  if (node.type === 'block') {
    if (!seen.has(node.dataKey)) { seen.add(node.dataKey); result.push({ componentKey: node.componentKey, dataKey: node.dataKey, blockConfig: node.blockConfig }) }
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

  const [leftWidth, setLeftWidth] = useState(208)
  const [rightWidth, setRightWidth] = useState(288)
  const [propHeight, setPropHeight] = useState(288)

  const startDragLeft = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = leftWidth
    const onMove = (ev: MouseEvent) => setLeftWidth(Math.max(120, Math.min(400, startW + ev.clientX - startX)))
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [leftWidth])

  const startDragRight = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = rightWidth
    const onMove = (ev: MouseEvent) => setRightWidth(Math.max(180, Math.min(500, startW - ev.clientX + startX)))
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [rightWidth])

  const startDragProp = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startY = e.clientY
    const startH = propHeight
    const onMove = (ev: MouseEvent) => setPropHeight(Math.max(100, Math.min(600, startH - ev.clientY + startY)))
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [propHeight])

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

  const dragPathRef = useRef<NodePath | null>(null)
  const [isDraggingActive, setIsDraggingActive] = useState(false)
  const [dropTarget, setDropTarget] = useState<{ parentPath: NodePath; insertIdx: number } | null>(null)

  const handleReparent = useCallback((fromPath: NodePath, toParentPath: NodePath, toIdx: number) => {
    setSelectedPath(null)
    setLayout((prev: LayoutNode) => reparentNode(prev, fromPath, toParentPath, toIdx))
    dragPathRef.current = null
    setIsDraggingActive(false)
    setDropTarget(null)
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
    return `${cells}セル / ${cellsToPixels(cells, grid.cellSize)}px`
  }
  function fmtH(cells: number) {
    return `${cells}セル / ${cellsToPixels(cells, grid.cellSize)}px`
  }

  // ドロップゾーン（常時レンダリング・ドラッグ中のみ可視・インタラクティブ）
  function renderDropZone(parentPath: NodePath, insertIdx: number): React.ReactNode {
    const dp = dragPathRef.current
    // 自分自身の子孫へのドロップ位置はスペーサーのみ
    const isDescendant = dp !== null &&
      parentPath.length >= dp.length &&
      JSON.stringify(parentPath.slice(0, dp.length)) === JSON.stringify(dp)
    // 元の位置と同じ（ノーオペレーション）
    const isNoop = dp !== null && (() => {
      const fromParent = dp.slice(0, -1)
      const fromIdx = dp[dp.length - 1]
      return JSON.stringify(fromParent) === JSON.stringify(parentPath) &&
        (insertIdx === fromIdx || insertIdx === fromIdx + 1)
    })()

    const isActive = !!dropTarget &&
      JSON.stringify(dropTarget.parentPath) === JSON.stringify(parentPath) &&
      dropTarget.insertIdx === insertIdx

    const canDrop = isDraggingActive && !isDescendant && !isNoop

    return (
      <div
        style={{ height: isDraggingActive && canDrop ? 10 : 2, transition: 'height 0.1s', display: 'flex', alignItems: 'center', padding: '0 8px' }}
        onDragOver={e => {
          if (!canDrop) return
          e.preventDefault()
          e.stopPropagation()
          setDropTarget({ parentPath, insertIdx })
        }}
        onDragLeave={() => {
          if (isActive) setDropTarget(null)
        }}
        onDrop={e => {
          e.preventDefault(); e.stopPropagation()
          if (dragPathRef.current && canDrop) handleReparent(dragPathRef.current, parentPath, insertIdx)
        }}
      >
        <div
          className={`w-full rounded transition-colors ${
            isActive ? 'bg-sky-400' : isDraggingActive && canDrop ? 'bg-gray-200' : 'bg-transparent'
          }`}
          style={{ height: 2 }}
        />
      </div>
    )
  }

  // ツリーノードを再帰描画
  function renderTree(node: LayoutNode, path: NodePath, depth: number): React.ReactNode {
    const isSelected = selectedPath && JSON.stringify(selectedPath) === JSON.stringify(path)
    const isDraggingThis = isDraggingActive && dragPathRef.current &&
      JSON.stringify(dragPathRef.current) === JSON.stringify(path)
    const indent = depth * 12
    const isMovable = path.length > 0

    const startDrag = (e: React.DragEvent) => {
      if (!isMovable) { e.preventDefault(); return }
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', path.join(','))
      dragPathRef.current = path
      setIsDraggingActive(true)
      setDropTarget(null)
    }
    const endDrag = () => {
      dragPathRef.current = null
      setIsDraggingActive(false)
      setDropTarget(null)
    }

    if (node.type === 'block') {
      const color = blockColor(node.componentKey)
      return (
        <div
          key={path.join('-')}
          draggable={isMovable}
          onDragStart={startDrag}
          onDragEnd={endDrag}
          onClick={() => setSelectedPath(path)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-xs transition-colors ${
            isSelected ? 'bg-sky-100 text-sky-800' : 'hover:bg-gray-100 text-gray-700'
          } ${isDraggingThis ? 'opacity-30' : ''}`}
          style={{ paddingLeft: indent + 8 }}
        >
          {isMovable && <span className="text-gray-300 hover:text-gray-500 cursor-grab mr-0.5 flex-shrink-0 select-none">⠿</span>}
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
          draggable={isMovable}
          onDragStart={startDrag}
          onDragEnd={endDrag}
          onClick={() => setSelectedPath(path)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-xs transition-colors ${
            isSelected ? 'bg-sky-100 text-sky-800' : 'hover:bg-gray-100'
          } ${isDraggingThis ? 'opacity-30' : ''}`}
          style={{ paddingLeft: indent + 8 }}
        >
          {isMovable && <span className="text-gray-300 hover:text-gray-500 cursor-grab mr-0.5 flex-shrink-0 select-none">⠿</span>}
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
          {renderDropZone(path, 0)}
          {node.children.map((child, i) => (
            <React.Fragment key={i}>
              {renderTree(child, [...path, i], depth + 1)}
              {renderDropZone(path, i + 1)}
            </React.Fragment>
          ))}
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
        {/* 移動・削除・コピー・貼り付け */}
        <div className="flex items-center gap-1 flex-wrap">
          {!isRoot && <>
            <button onClick={() => handleMove(path, -1)} disabled={idx === 0}
              className="px-2 py-1 text-xs border rounded disabled:opacity-30 hover:bg-gray-50">↑</button>
            <button onClick={() => handleMove(path, 1)} disabled={idx >= siblingCount - 1}
              className="px-2 py-1 text-xs border rounded disabled:opacity-30 hover:bg-gray-50">↓</button>
          </>}
          <NodeCopyButton node={node} />
          <NodePasteButton onApply={n => handleUpdate(path, () => n)} />
          {!isRoot && (
            <button onClick={() => handleDelete(path)}
              className="ml-auto px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50">削除</button>
          )}
        </div>

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

        {/* row / col: gap */}
        {(node.type === 'col' || node.type === 'row') && (
          <SizeProp
            label="gap (単位)"
            value={(node as LayoutNodeCol | LayoutNodeRow).gap}
            onChange={v => handleUpdate(path, n => ({ ...n, gap: v }))}
          />
        )}

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
              <ColorPicker
                value={(node as LayoutNodeCol).labelColor ?? ''}
                onChange={v => handleUpdate(path, n => v ? { ...n, labelColor: v } : (() => { const { labelColor: _, ...rest } = n as LayoutNodeCol; return rest })())}
                defaultColor="#1f2937"
                presetColors={LABEL_PRESET_COLORS}
              />
            </div>
          </div>
        )}

        {/* block のみ: componentKey / dataKey */}
        {node.type === 'block' && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">コンポーネント</label>
              <select
                value={node.componentKey}
                onChange={e => {
                  const newComponentKey = e.target.value
                  handleUpdate(path, n => {
                    const usedKeys = collectAllDataKeys(layout)
                    usedKeys.delete((n as Block).dataKey)
                    const newDataKey = generateDataKey(newComponentKey, usedKeys)
                    return { ...n, componentKey: newComponentKey, dataKey: newDataKey, variant: 'default' }
                  })
                }}
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
          </div>
        )}

        {/* block のみ: 表示設定（BlockPropertyEditor） */}
        {node.type === 'block' && (() => {
          const comp = getComponent((node as Block).componentKey)
          if (!comp) return null
          const displaySettings: BlockDisplaySettings = {
            variant:        node.variant ?? 'default',
            bgVariant:      (node as Block).bgVariant ?? 'transparent',
            label:          node.label ?? '',
            subLabel:       node.subLabel ?? '',
            labelColor:     (node as Block).labelColor ?? '',
            labelInset:     (node as Block).labelInset ?? false,
            labelInsetDir:  (node as Block).labelInsetDir ?? 'col',
          }
          const handleDisplayChange = (patch: Partial<BlockDisplaySettings>) => {
            handleUpdate(path, n => {
              const next = { ...n, ...patch }
              // 空文字は undefined に正規化
              if (patch.label !== undefined)    next.label    = patch.label    || undefined
              if (patch.subLabel !== undefined) next.subLabel = patch.subLabel || undefined
              if (patch.bgVariant !== undefined && !isBgVariantApplicable(comp, next.variant ?? 'default')) {
                delete (next as Block).bgVariant
              }
              return next
            })
          }
          return (
            <BlockPropertyEditor
              component={comp}
              settings={displaySettings}
              onChange={handleDisplayChange}
              extras={
                <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
                  {/* alignSelf */}
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
                  {/* labelFontScale */}
                  {(node as Block).label !== undefined && (
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] text-gray-500 w-28 flex-shrink-0">ヘッダー文字倍率</label>
                      <input type="number" step="0.05" min="0.3" max="3" placeholder="1.0"
                        value={(node as Block).labelFontScale ?? ''}
                        onChange={e => handleUpdate(path, n => ({ ...n, labelFontScale: e.target.value === '' ? undefined : Number(e.target.value) }))}
                        className="flex-1 px-2 py-1 border rounded text-xs font-mono"
                      />
                      {(node as Block).labelFontScale !== undefined && (
                        <button onClick={() => handleUpdate(path, n => ({ ...n, labelFontScale: undefined }))} className="text-gray-300 hover:text-gray-500 text-xs">↺</button>
                      )}
                    </div>
                  )}
                  {/* contentFontScale */}
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-gray-500 w-28 flex-shrink-0">コンテンツ文字倍率</label>
                    <input type="number" step="0.05" min="0.3" max="3" placeholder="1.0"
                      value={(node as Block).contentFontScale ?? ''}
                      onChange={e => handleUpdate(path, n => ({ ...n, contentFontScale: e.target.value === '' ? undefined : Number(e.target.value) }))}
                      className="flex-1 px-2 py-1 border rounded text-xs font-mono"
                    />
                    {(node as Block).contentFontScale !== undefined && (
                      <button onClick={() => handleUpdate(path, n => ({ ...n, contentFontScale: undefined }))} className="text-gray-300 hover:text-gray-500 text-xs">↺</button>
                    )}
                  </div>
                  {/* blockConfigForm */}
                  {comp.blockConfigForm && (
                    <div className="flex flex-col gap-2 border-t border-gray-100 pt-2">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">ブロック設定</p>
                      <comp.blockConfigForm
                        blockConfig={(node as Block).blockConfig ?? {}}
                        onChange={cfg => handleUpdate(path, n => ({ ...n, blockConfig: cfg }))}
                      />
                    </div>
                  )}
                </div>
              }
            />
          )
        })()}

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
                onClick={() => {
                  const componentKey = allBlocks[0]?.key ?? 'name'
                  const dataKey = generateDataKey(componentKey, collectAllDataKeys(layout))
                  handleAdd(path, { type: 'block', componentKey, dataKey, variant: 'default', flex: 1 })
                }}
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
      <div className="bg-white flex flex-col overflow-hidden flex-shrink-0" style={{ width: leftWidth }}>
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

      {/* 左リサイズハンドル */}
      <div onMouseDown={startDragLeft} className="w-1 flex-shrink-0 cursor-col-resize hover:bg-sky-300 active:bg-sky-400 transition-colors border-r border-gray-200" />

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
          <CopyLayoutButton layout={layout} />
          <PasteLayoutButton onApply={setLayout} orientation={orientation} />
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

      {/* 右リサイズハンドル */}
      <div onMouseDown={startDragRight} className="w-1 flex-shrink-0 cursor-col-resize hover:bg-sky-300 active:bg-sky-400 transition-colors border-l border-gray-200" />

      {/* 右: ツリーエディタ */}
      <div className="bg-white flex flex-col overflow-hidden flex-shrink-0" style={{ width: rightWidth }}>
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
        <div
          className="flex-1 overflow-y-auto py-1 text-xs"
          onDragOver={e => isDraggingActive && e.preventDefault()}
          onDragEnd={() => { dragPathRef.current = null; setIsDraggingActive(false); setDropTarget(null) }}
        >
          {renderTree(layout, [], 0)}
        </div>
        {/* フォントスケール編集 */}
        <div className="border-t flex flex-col">
        </div>

        {/* プロパティリサイズハンドル */}
        <div
          onMouseDown={startDragProp}
          className="h-1 flex-shrink-0 cursor-row-resize hover:bg-sky-300 active:bg-sky-400 transition-colors border-t border-gray-200"
        />
        <div className="flex flex-col overflow-y-auto flex-shrink-0" style={{ height: propHeight }}>
          <div className="px-3 py-2 border-b flex-shrink-0">
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

            {collectBlockEntries(layout).map(({ componentKey, dataKey, blockConfig }) => {
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
                    blockConfig={blockConfig}
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

function NodeCopyButton({ node }: { node: LayoutNode }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(JSON.stringify(node, null, 2))
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className={`px-2 py-1 text-xs rounded border transition-colors ${copied ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}
    >
      {copied ? '✓ コピー済み' : 'ノードコピー'}
    </button>
  )
}

function NodePasteButton({ onApply }: { onApply: (node: LayoutNode) => void }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  const handleApply = () => {
    try {
      const node = JSON.parse(text) as LayoutNode
      onApply(node)
      setOpen(false)
      setText('')
      setError('')
    } catch {
      setError('JSON のパースに失敗しました')
    }
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setError('') }}
        className="px-2 py-1 text-xs rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors"
      >
        ノード貼り付け
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl p-4 w-[480px] flex flex-col gap-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">ノード貼り付け</span>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>
            <p className="text-[11px] text-gray-400">選択中のノードを JSON で置き換えます。</p>
            <textarea
              className="w-full h-48 text-xs font-mono border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder='{ "type": "col", ... }'
              value={text}
              onChange={e => { setText(e.target.value); setError('') }}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-xs rounded border border-gray-200 text-gray-500 hover:bg-gray-50">キャンセル</button>
              <button onClick={handleApply} disabled={!text.trim()} className="px-3 py-1.5 text-xs rounded bg-sky-500 text-white font-semibold hover:bg-sky-600 disabled:opacity-40">適用</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function PasteLayoutButton({ onApply, orientation }: { onApply: (node: LayoutNode) => void; orientation: string }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  const handleApply = () => {
    try {
      const parsed = JSON.parse(text)
      // landscape / portrait キーを持つオブジェクトなら該当 orientation を取り出す
      const node: LayoutNode = (parsed.landscape || parsed.portrait)
        ? (parsed[orientation] ?? parsed)
        : parsed
      onApply(node)
      setOpen(false)
      setText('')
      setError('')
    } catch {
      setError('JSON のパースに失敗しました')
    }
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setError('') }}
        className="px-2 py-1 text-xs rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors"
      >
        JSON 貼り付け
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl p-4 w-[480px] flex flex-col gap-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                JSON 貼り付け <span className="text-gray-400 font-normal">（{orientation}）</span>
              </span>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>
            <p className="text-[11px] text-gray-400">
              現在の <strong>{orientation}</strong> レイアウトを上書きします。<br />
              <code className="bg-gray-100 px-1 rounded">{'{landscape: {...}}'}</code> 形式でも、ノード直書きでも対応します。
            </p>
            <textarea
              className="w-full h-56 text-xs font-mono border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder='{ "type": "row", ... }'
              value={text}
              onChange={e => { setText(e.target.value); setError('') }}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-xs rounded border border-gray-200 text-gray-500 hover:bg-gray-50">キャンセル</button>
              <button onClick={handleApply} disabled={!text.trim()} className="px-3 py-1.5 text-xs rounded bg-sky-500 text-white font-semibold hover:bg-sky-600 disabled:opacity-40">適用</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function CopyLayoutButton({ layout }: { layout: LayoutNode }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(layout, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handleCopy}
      className={`px-2 py-1 text-xs rounded border transition-colors ${
        copied
          ? 'border-green-300 bg-green-50 text-green-700'
          : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
      }`}
    >
      {copied ? '✓ コピー済み' : 'JSON コピー'}
    </button>
  )
}
