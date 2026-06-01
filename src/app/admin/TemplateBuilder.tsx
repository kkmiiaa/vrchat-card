'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { TemplateDefinition, BlockValues, LayoutNode, Block, LayoutNodeRow, LayoutNodeCol, LayoutNodeRef, TemplateGridDef, FormSection, FormNode, FormNodeBlock, FormNodeFont, SurfaceVariant } from '@/blocks/types'
import { DEFAULT_CARD_RENDER_CONTEXT } from '@/blocks/types'
import { saveTemplateLayout, saveSampleCardData } from '@/lib/templateLayout'
import { compressSampleData } from '@/lib/compressSampleData'
import type { TemplateLayoutRow, OrientationScales } from '@/lib/templateLayout'
import { cellsToPixels } from '@/blocks/types'
import { getAllComponents, getComponent } from '@/blocks/registry'
import { collectBlockEntries, collectAllDataKeys, generateDataKey, collectDefaultValues, resolveFormSectionsFromRow } from './templateBuilderUtils'
import { backgroundComponent } from '@/blocks/background'
import { overlayComponent } from '@/blocks/overlay'
import type { OverlayValue } from '@/blocks/overlay'
import { fontMap } from '@/lib/fontMap'
import { translations } from '@/utils/translations'
import { getBackgroundStyle, CARD_BG_FALLBACK } from '@/utils/backgroundUtils'
import type { BackgroundValue } from '@/blocks/types'
import GenericCardRenderer from '@/components/GenericCardRenderer'
import { BlockPropertyEditor, isBgVariantApplicable, type BlockDisplaySettings } from './BlockPropertyEditor'
import { ColorPicker, LABEL_PRESET_COLORS } from '@/blocks/colorPicker'
import { IconPicker } from '@/blocks/iconRegistry'

type Orientation = 'card' | 'web'
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
  if (root.type === 'block' || root.type === 'ref') return null
  const child = root.children[idx]
  if (!child) return null
  return getNode(child, rest)
}

// パスでノードを更新した新しいツリーを返す
function setNode(root: LayoutNode, path: NodePath, updater: (n: LayoutNode) => LayoutNode): LayoutNode {
  if (path.length === 0) return updater(root)
  if (root.type === 'block' || root.type === 'ref') return root
  const [idx, ...rest] = path
  const newChildren = root.children.map((child, i) =>
    i === idx ? setNode(child, rest, updater) : child
  )
  return { ...root, children: newChildren }
}

// パスのノードを削除した新しいツリーを返す
function deleteNode(root: LayoutNode, path: NodePath): LayoutNode {
  if (path.length === 0) return root
  if (root.type === 'block' || root.type === 'ref') return root
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

// 選択パスからコンテナ（row/col）を解決する。ref/block なら親まで遡る
function resolveContainerPath(path: NodePath | null, root: LayoutNode): NodePath {
  if (!path) return []
  for (let len = path.length; len >= 0; len--) {
    const p = path.slice(0, len)
    const node = len === 0 ? root : getNode(root, p)
    if (node && node.type !== 'block' && node.type !== 'ref') return p
  }
  return []
}

// パスの子に追加
function addChild(root: LayoutNode, path: NodePath, child: LayoutNode): LayoutNode {
  return setNode(root, path, (n) => {
    if (n.type === 'block' || n.type === 'ref') return n
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
    if (n.type === 'block' || n.type === 'ref') return n
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
    if (n.type === 'block' || n.type === 'ref') return n
    const newChildren = [...n.children]
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= newChildren.length) return n
    ;[newChildren[idx], newChildren[newIdx]] = [newChildren[newIdx], newChildren[idx]]
    return { ...n, children: newChildren }
  })
}

// 指定 blockId の ref ノード・および同 dataKey の block ノードをツリーから除去
function removeRefsById(node: LayoutNode, blockId: string): LayoutNode {
  if (node.type === 'ref' || node.type === 'block') return node
  const filtered = node.children
    .filter(c => !(c.type === 'ref' && c.blockId === blockId) && !(c.type === 'block' && c.dataKey === blockId))
    .map(c => removeRefsById(c, blockId))
  return { ...node, children: filtered }
}

// レイアウトツリーから全 dataKey を収集

type PoolEntry = {
  componentKey: string
  dataKey: string
  variant?: string
  surface?: string
  blockConfig?: Record<string, unknown>
  label?: string
  subLabel?: string
  labelColor?: string
  labelIcon?: string
  labelInset?: boolean
  labelInsetDir?: 'col' | 'row'
  labelFontScale?: number
  contentFontScale?: number
  formLabel?: string
  hideWhenEmpty?: boolean
}

function collectUsedKeys(node: LayoutNode): Set<string> {
  const result = new Set<string>()
  function scan(n: LayoutNode) {
    if (n.type === 'ref') result.add(n.blockId)
    else if (n.type === 'block') result.add(n.dataKey)
    else n.children.forEach(scan)
  }
  scan(node)
  return result
}

type Props = {
  savedLayouts: Record<string, TemplateLayoutRow>
  onLabelChange?: (id: string, label: string) => void
}

function rowToDefinition(
  row: TemplateLayoutRow,
  cardLayout: LayoutNode,
  webLayout: LayoutNode,
  cardScales: OrientationScales,
  webScales: OrientationScales & { cardWidth?: number; cardHeight?: number },
  blockPool: Record<string, unknown>,
  overlayConfig: import('@/blocks/overlay').OverlayValue | null,
): TemplateDefinition {
  const cfg = row.card_config ?? {}
  return {
    id: row.id,
    label: row.label,
    fontFamily: cfg.fontFamily ?? 'sans-serif',
    borderRadius: cfg.borderRadius,
    backgroundKey: cfg.backgroundKey,
    overlayKey: cfg.overlayKey,
    theme: DEFAULT_CARD_RENDER_CONTEXT.theme,
    blockPool: blockPool as TemplateDefinition['blockPool'],
    overlayFixed: overlayConfig ?? undefined,
    card: {
      layout: cardLayout,
      cardWidth:  row.card_width  ?? 900,
      cardHeight: row.card_height ?? 506,
      ...cardScales,
      grid: cfg.card?.grid ?? { cellSize: 8, gap: 4 },
    },
    web: {
      layout: webLayout,
      cardWidth: row.web_width ?? 630,
      autoHeight: true,
      ...webScales,
      grid: cfg.web?.grid ?? { cellSize: 8, gap: 4 },
    },
  } as unknown as TemplateDefinition
}

export default function TemplateBuilder({ savedLayouts, onLabelChange }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const rowList = Object.values(savedLayouts)

  const [selectedId, setSelectedId] = useState(() => {
    const defId = searchParams.get('def')
    if (defId && savedLayouts[defId]) return defId
    return rowList[0]?.id ?? ''
  })
  const currentRow = savedLayouts[selectedId] ?? rowList[0]

  const [poolBlocks, setPoolBlocks] = useState<Record<string, Record<string, PoolEntry>>>(
    () => Object.fromEntries(rowList.map(row => {
      const dbPool = (row.block_pool ?? {}) as Record<string, PoolEntry>
      const initPool: Record<string, PoolEntry> = { ...dbPool }
      function scanIntoPool(node: LayoutNode) {
        if (node.type === 'block') {
          if (!initPool[node.dataKey]) {
            initPool[node.dataKey] = {
              componentKey: node.componentKey,
              dataKey: node.dataKey,
              blockConfig: node.blockConfig,
              label: node.label,
              variant: node.variant,
            }
          }
        } else if (node.type !== 'ref') {
          node.children.forEach(scanIntoPool)
        }
      }
      if (row.card_layout) scanIntoPool(row.card_layout)
      if (row.web_layout)  scanIntoPool(row.web_layout)
      return [row.id, initPool]
    }))
  )

  const [orientation, setOrientation] = useState<Orientation>('card')
  const [fitScale, setFitScale] = useState(0.5)
  const [scaleMultiplier, setScaleMultiplier] = useState(1.0)
  const containerRef = useRef<HTMLDivElement>(null)

  const [layouts, setLayouts] = useState<Record<string, { card: LayoutNode; web: LayoutNode }>>(
    () => Object.fromEntries(rowList.map(row => ([row.id, {
      card: row.card_layout ?? { type: 'row', children: [] } as LayoutNode,
      web:  row.web_layout  ?? { type: 'row', children: [] } as LayoutNode,
    }])))
  )

  const currentPool = poolBlocks[currentRow.id] ?? {}
  const setCurrentPool = useCallback((updater: Record<string, PoolEntry> | ((prev: Record<string, PoolEntry>) => Record<string, PoolEntry>)) => {
    setPoolBlocks(prev => ({
      ...prev,
      [currentRow.id]: typeof updater === 'function' ? updater(prev[currentRow.id] ?? {}) : updater,
    }))
  }, [currentRow.id])

  const currentLayouts = layouts[currentRow.id]
  const cardLayout = currentLayouts?.card ?? ({ type: 'row', children: [] } as LayoutNode)
  const webLayout  = currentLayouts?.web  ?? ({ type: 'row', children: [] } as LayoutNode)

  const layout = orientation === 'card' ? cardLayout : webLayout
  const setLayout = useCallback((updater: LayoutNode | ((prev: LayoutNode) => LayoutNode)) => {
    setLayouts(prev => {
      const current = prev[currentRow.id]
      const next = typeof updater === 'function' ? updater(orientation === 'card' ? current.card : current.web) : updater
      return { ...prev, [currentRow.id]: { ...current, [orientation]: next } }
    })
  }, [currentRow.id, orientation])

  type LocalOrientationScales = { defaultLabelFontScale?: number; defaultContentFontScale?: number; defaultPaddingScale?: number }
  const [orientationScales, setOrientationScales] = useState<Record<string, { card: LocalOrientationScales; web: LocalOrientationScales }>>(
    () => Object.fromEntries(rowList.map(row => ([row.id, {
      card: row.orientation_scales?.card ?? {},
      web:  row.orientation_scales?.web  ?? {},
    }])))
  )
  const currentOrientationScales = orientationScales[currentRow.id]?.[orientation] ?? {}
  const setOrientationScale = useCallback((patch: LocalOrientationScales) => {
    setOrientationScales(prev => ({
      ...prev,
      [currentRow.id]: { ...prev[currentRow.id], [orientation]: { ...prev[currentRow.id]?.[orientation], ...patch } },
    }))
  }, [currentRow.id, orientation])

  const [leftWidth, setLeftWidth] = useState(208)
  const [rightWidth, setRightWidth] = useState(288)
  const [propHeight, setPropHeight] = useState(288)
  const [poolHeight, setPoolHeight] = useState(240)

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

  const startDragPool = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startY = e.clientY
    const startH = poolHeight
    const onMove = (ev: MouseEvent) => setPoolHeight(Math.max(80, Math.min(600, startH - ev.clientY + startY)))
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [poolHeight])

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
  const [propTab, setPropTab] = useState<'placement' | 'blockConfig'>('placement')
  const [formSectionsByDef, setFormSectionsByDef] = useState<Record<string, FormSection[]>>(
    () => Object.fromEntries(rowList.map(row => [row.id, resolveFormSectionsFromRow(row)]))
  )
  const currentFormSections = formSectionsByDef[currentRow.id] ?? []
  const setCurrentFormSections = useCallback((updater: FormSection[] | ((prev: FormSection[]) => FormSection[])) => {
    setFormSectionsByDef(prev => ({
      ...prev,
      [currentRow.id]: typeof updater === 'function' ? updater(prev[currentRow.id] ?? []) : updater,
    }))
  }, [currentRow.id])

  const [localValues, setLocalValues] = useState<BlockValues>(() => {
    const pool = (currentRow.block_pool ?? {}) as TemplateDefinition['blockPool']
    return {
      ...collectDefaultValues(currentRow.card_layout ?? { type: 'row', children: [] } as LayoutNode, pool),
      ...collectDefaultValues(currentRow.web_layout  ?? { type: 'row', children: [] } as LayoutNode, pool),
    }
  })
  const [localFontFamily, setLocalFontFamily] = useState<string>(currentRow.card_config?.fontFamily ?? 'sans-serif')
  const updateLocalValue = useCallback((key: string, val: unknown) => {
    setLocalValues(prev => ({ ...prev, [key]: val }))
  }, [])
  const resetLocalValues = useCallback(() => {
    const pool = currentPool as TemplateDefinition['blockPool']
    setLocalValues({
      ...collectDefaultValues(cardLayout, pool),
      ...collectDefaultValues(webLayout,  pool),
    })
    setLocalFontFamily(currentRow.card_config?.fontFamily ?? 'sans-serif')
  }, [cardLayout, currentRow.card_config?.fontFamily])

  const [overlayConfigs, setOverlayConfigs] = useState<Record<string, OverlayValue | null>>(
    () => Object.fromEntries(rowList.map(row => [row.id, row.overlay_config ?? null]))
  )
  const currentOverlayConfig = overlayConfigs[currentRow.id] ?? null
  const setCurrentOverlayConfig = useCallback((v: OverlayValue | null) => {
    setOverlayConfigs(prev => ({ ...prev, [currentRow.id]: v }))
  }, [currentRow.id])
  const [selectedOverlay, setSelectedOverlay] = useState(false)

  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [editingLabel, setEditingLabel] = useState(false)
  const [labelDraft, setLabelDraft] = useState('')

  type DesignPreset = 'simple' | 'glass' | 'flat'
  const [designPresets, setDesignPresets] = useState<Record<string, DesignPreset>>(
    () => Object.fromEntries(rowList.map(row => [
      row.id,
      (row.card_config?.defaultSurface as DesignPreset | undefined) ?? 'simple',
    ]))
  )
  const currentDesignPreset = designPresets[currentRow.id] ?? 'simple'
  const setCurrentDesignPreset = useCallback((p: DesignPreset) => {
    setDesignPresets(prev => ({ ...prev, [currentRow.id]: p }))
  }, [currentRow.id])

  type BackgroundMode = 'custom' | 'fixed'
  const [backgroundModes, setBackgroundModes] = useState<Record<string, BackgroundMode>>(
    () => Object.fromEntries(rowList.map(row => [
      row.id,
      row.card_config?.fixedBackground ? 'fixed' : 'custom',
    ]))
  )
  const currentBgMode = backgroundModes[currentRow.id] ?? 'custom'
  const setCurrentBgMode = useCallback((mode: BackgroundMode) => {
    setBackgroundModes(prev => ({ ...prev, [currentRow.id]: mode }))
  }, [currentRow.id])

  const [fixedBackgrounds, setFixedBackgrounds] = useState<Record<string, BackgroundValue | null>>(
    () => Object.fromEntries(rowList.map(row => [
      row.id,
      (row.card_config?.fixedBackground as BackgroundValue | undefined) ?? null,
    ]))
  )
  const currentFixedBg = fixedBackgrounds[currentRow.id] ?? backgroundComponent.defaultValue
  const setCurrentFixedBg = useCallback((v: BackgroundValue) => {
    setFixedBackgrounds(prev => ({ ...prev, [currentRow.id]: v }))
  }, [currentRow.id])

  const handleSave = useCallback(async () => {
    setSaveState('saving')
    const cfg = currentRow.card_config ?? {}
    const { error } = await saveTemplateLayout(currentRow.id, {
      label:              currentRow.label,
      card_layout:        cardLayout,
      web_layout:         webLayout,
      block_pool:         currentPool as Record<string, unknown>,
      form_sections:      currentFormSections,
      orientation_scales: {
        card: orientationScales[currentRow.id]?.card ?? {},
        web:  orientationScales[currentRow.id]?.web  ?? {},
      },
      overlay_config: overlayConfigs[currentRow.id] ?? null,
      card_config: {
        ...cfg,
        fontFamily: localFontFamily,
        defaultSurface: currentDesignPreset,
        ...(currentBgMode === 'fixed'
          ? { fixedBackground: currentFixedBg }
          : { fixedBackground: undefined }),
      },
    })
    setSaveState(error ? 'error' : 'saved')
    setTimeout(() => setSaveState('idle'), 2000)
  }, [currentRow, cardLayout, webLayout, currentFormSections, orientationScales, overlayConfigs, currentPool, localFontFamily, currentDesignPreset, currentBgMode, currentFixedBg])

  const [sampleState, setSampleState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const handleSaveSample = useCallback(async () => {
    setSampleState('saving')
    const compressed = await compressSampleData(localValues as Record<string, unknown>)
    const { error } = await saveSampleCardData(currentRow.id, compressed)
    setSampleState(error ? 'error' : 'saved')
    setTimeout(() => setSampleState('idle'), 2000)
  }, [currentRow.id, localValues])

  const [selectedPath, setSelectedPath] = useState<NodePath | null>(null)
  const selectedNode = selectedPath ? getNode(layout, selectedPath) : null
  const [selectedPoolBlockId, setSelectedPoolBlockId] = useState<string | null>(null)

  const o = orientation === 'card'
    ? { cardWidth: currentRow.card_width ?? 900, cardHeight: currentRow.card_height ?? 506, autoHeight: false as const }
    : { cardWidth: currentRow.web_width ?? 630, autoHeight: true as const, cardHeight: undefined as number | undefined }
  const scale = fitScale * scaleMultiplier

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const sw = (rect.width  - 48) / o.cardWidth
      const sh = o.autoHeight ? sw : (rect.height - 48) / (o.cardHeight ?? o.cardWidth)
      setFitScale(o.autoHeight ? sw : Math.min(sw, sh))
    }
    update()
    const observer = new ResizeObserver(update)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [o.cardWidth, o.cardHeight, o.autoHeight, orientation])

  // レイアウト内の block ノードをプールに自動同期
  useEffect(() => {
    function scanBlocks(node: LayoutNode, acc: Record<string, PoolEntry>) {
      if (node.type === 'block') {
        if (!acc[node.dataKey]) {
          acc[node.dataKey] = {
            componentKey: node.componentKey,
            dataKey:      node.dataKey,
            variant:      node.variant,
            blockConfig:  node.blockConfig,
            label:        node.label,
          }
        }
      } else if (node.type !== 'ref') {
        node.children.forEach(c => scanBlocks(c, acc))
      }
    }
    const found: Record<string, PoolEntry> = {}
    scanBlocks(cardLayout, found)
    scanBlocks(webLayout,  found)
    if (Object.keys(found).length === 0) return
    setCurrentPool(prev => {
      const next = { ...prev }
      let changed = false
      for (const [key, entry] of Object.entries(found)) {
        if (!next[key]) { next[key] = entry; changed = true }
      }
      return changed ? next : prev
    })
  }, [cardLayout, webLayout, setCurrentPool])

  const allBlocks = getAllComponents().filter(b => b.key !== 'background' && b.key !== 'overlay')

  const handleUpdate = useCallback((path: NodePath, updater: (n: LayoutNode) => LayoutNode) => {
    setLayout((prev: LayoutNode) => setNode(prev, path, updater))
  }, [setLayout])

  const handleDelete = useCallback((path: NodePath) => {
    setSelectedPath(null)
    setLayout((prev: LayoutNode) => deleteNode(prev, path))
  }, [setLayout])

  const handleAdd = useCallback((path: NodePath, child: LayoutNode) => {
    const parentNode = getNode(layout, path)
    const childCount = (parentNode && parentNode.type !== 'block' && parentNode.type !== 'ref') ? parentNode.children.length : 0
    setLayout((prev: LayoutNode) => addChild(prev, path, child))
    setSelectedPath([...path, childCount])
    setSelectedPoolBlockId(null)
    setPropTab('placement')
  }, [layout, setLayout, setSelectedPath])

  const handleMove = useCallback((path: NodePath, dir: -1 | 1) => {
    setLayout((prev: LayoutNode) => moveNode(prev, path, dir))
  }, [setLayout])

  const handleAddBlockToPool = useCallback((path: NodePath, componentKey: string) => {
    const dataKey = generateDataKey(componentKey, collectAllDataKeys(layout, undefined, currentPool as unknown as TemplateDefinition['blockPool']))
    const newEntry: PoolEntry = { componentKey, dataKey, variant: 'simple' }
    setCurrentPool(prev => ({ ...prev, [dataKey]: newEntry }))
    handleAdd(path, { type: 'ref', blockId: dataKey, flex: 1 })
  }, [currentPool, layout, setCurrentPool, handleAdd])

  const handleAddRefFromPool = useCallback((path: NodePath, blockId: string) => {
    handleAdd(path, { type: 'ref', blockId, flex: 1 })
  }, [handleAdd])

  const dragPathRef = useRef<NodePath | null>(null)
  const [isDraggingActive, setIsDraggingActive] = useState(false)
  const [dropTarget, setDropTarget] = useState<{ parentPath: NodePath; insertIdx: number } | null>(null)
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set())
  const toggleCollapsed = (path: NodePath) => {
    const key = path.join('-')
    setCollapsedPaths(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const handleReparent = useCallback((fromPath: NodePath, toParentPath: NodePath, toIdx: number) => {
    setSelectedPath(null)
    setLayout((prev: LayoutNode) => reparentNode(prev, fromPath, toParentPath, toIdx))
    dragPathRef.current = null
    setIsDraggingActive(false)
    setDropTarget(null)
  }, [setLayout])

  const cfg = currentRow.card_config ?? {}
  const grid = orientation === 'card' ? (cfg.card?.grid ?? { cellSize: 8, gap: 4 }) : (cfg.web?.grid ?? { cellSize: 8, gap: 4 })

  // ページ背景（固定モード時は fixedBg、カスタムモード時は localValues[backgroundKey]）
  const bgValue = currentBgMode === 'fixed'
    ? currentFixedBg
    : currentRow.card_config?.backgroundKey
      ? (localValues[currentRow.card_config.backgroundKey] as BackgroundValue | undefined)
      : undefined
  const pageBg = bgValue
    ? (getBackgroundStyle(bgValue.type, bgValue.value, bgValue.base64 ?? null, CARD_BG_FALLBACK) ?? CARD_BG_FALLBACK)
    : CARD_BG_FALLBACK

  function fmtW(cells: number) {
    return `${cells}セル / ${cellsToPixels(cells, grid.cellSize ?? 8)}px`
  }
  function fmtH(cells: number) {
    return `${cells}セル / ${cellsToPixels(cells, grid.cellSize ?? 8)}px`
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
        style={{ height: 4, display: 'flex', alignItems: 'center', padding: '0 8px' }}
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
            isActive ? 'bg-sky-400' : isDraggingActive && canDrop ? 'bg-gray-100' : 'bg-transparent'
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

    if (node.type === 'ref') {
      return (
        <div
          key={path.join('-')}
          draggable={isMovable}
          onDragStart={startDrag}
          onDragEnd={endDrag}
          onClick={() => { setSelectedPath(path); setSelectedOverlay(false); setSelectedPoolBlockId(null); setPropTab('placement') }}
          className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-xs transition-colors ${
            isSelected ? 'bg-sky-100 text-indigo-700' : 'text-indigo-600 hover:bg-indigo-50'
          } ${isDraggingThis ? 'opacity-30' : ''}`}
          style={{ paddingLeft: indent + 8 }}
        >
          <span className="w-2 h-2 rounded-full flex-shrink-0 bg-indigo-400" />
          <span className="font-mono font-medium">{node.blockId}</span>
          {currentPool[node.blockId]?.variant && <span className="text-indigo-400 text-[10px]">:{currentPool[node.blockId]?.variant}</span>}
          <span className="ml-auto flex gap-1 text-[10px] text-indigo-300">
            {node.flex !== undefined && <span>flex:{node.flex}</span>}
            {node.minW !== undefined && <span>w:{node.minW}</span>}
            {node.minH !== undefined && <span>h:{node.minH}</span>}
          </span>
          {isMovable && <span className="text-gray-300 hover:text-gray-500 cursor-grab flex-shrink-0 select-none">⠿</span>}
        </div>
      )
    }

    if (node.type === 'block') {
      const color = blockColor(node.componentKey)
      return (
        <div
          key={path.join('-')}
          draggable={isMovable}
          onDragStart={startDrag}
          onDragEnd={endDrag}
          onClick={() => { setSelectedPath(path); setSelectedOverlay(false); setSelectedPoolBlockId(null); setPropTab('placement') }}
          className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-xs transition-colors ${
            isSelected ? 'bg-sky-100 text-sky-800' : 'hover:bg-gray-100 text-gray-700'
          } ${isDraggingThis ? 'opacity-30' : ''}`}
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
          {isMovable && <span className="text-gray-300 hover:text-gray-500 cursor-grab flex-shrink-0 select-none">⠿</span>}
        </div>
      )
    }

    const typeLabel = node.type === 'row' ? '→ row' : '↓ col'
    const typeColor = node.type === 'row' ? 'text-orange-600' : 'text-purple-600'
    const pathKey = path.join('-')
    const isCollapsed = collapsedPaths.has(pathKey)
    return (
      <div key={pathKey}>
        <div
          draggable={isMovable}
          onDragStart={startDrag}
          onDragEnd={endDrag}
          onClick={() => { setSelectedPath(path); setSelectedOverlay(false); setSelectedPoolBlockId(null); setPropTab('placement') }}
          className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-xs transition-colors ${
            isSelected ? 'bg-sky-100 text-sky-800' : 'hover:bg-gray-100'
          } ${isDraggingThis ? 'opacity-30' : ''}`}
          style={{ paddingLeft: indent + 8 }}
        >
          <button
            type="button"
            onClick={e => { e.stopPropagation(); toggleCollapsed(path) }}
            className="flex-shrink-0 w-3.5 h-3.5 flex items-center justify-center text-gray-400 hover:text-gray-600 leading-none"
          >{isCollapsed ? '▶' : '▼'}</button>
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
          {isMovable && <span className="text-gray-300 hover:text-gray-500 cursor-grab flex-shrink-0 select-none">⠿</span>}
        </div>
        {!isCollapsed && (
          <div>
            {renderDropZone(path, 0)}
            {node.children.map((child, i) => (
              <React.Fragment key={i}>
                {renderTree(child, [...path, i], depth + 1)}
                {renderDropZone(path, i + 1)}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    )
  }

  // 選択ノードのプロパティ編集パネル
  function renderProperties(): React.ReactNode {
    if (selectedOverlay) {
      const value = currentOverlayConfig ?? currentRow.overlay_config ?? overlayComponent.defaultValue
      return (
        <div className="px-3 py-3 flex flex-col gap-2">
          <overlayComponent.FormItem
            value={value as OverlayValue}
            onChange={v => setCurrentOverlayConfig(v as OverlayValue)}
            t={translations.ja}
          />
        </div>
      )
    }
    if (selectedPoolBlockId && !selectedPath) {
      // プール選択時: "ブロック設定"タブのみ有効
      if (propTab !== 'blockConfig') return <p className="text-xs text-gray-400 px-3 py-4 text-center">「ブロック設定」タブを選択してください</p>
      const entry = currentPool[selectedPoolBlockId]
      if (!entry) return <p className="text-xs text-gray-400 px-3 py-4">ブロックが見つかりません</p>
      return renderPoolEntryEditor(selectedPoolBlockId, entry)
    }
    if (!selectedPath || !selectedNode) {
      return <p className="text-xs text-gray-400 px-3 py-4">ノードを選択してください</p>
    }
    if (propTab === 'placement') return renderPlacementTab()
    return renderBlockConfigTab()
  }

  // ── ブロック設定タブ ──────────────────────────────────────────────────────
  function renderPoolEntryEditor(blockId: string, entry: PoolEntry): React.ReactNode {
    const comp = getComponent(entry.componentKey)
    const updatePoolEntry = (patch: Partial<PoolEntry>) =>
      setCurrentPool(prev => ({ ...prev, [blockId]: { ...prev[blockId], ...patch } }))
    return (
      <div className="px-3 py-3 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 rounded px-2 py-0.5">{blockId}</span>
          <span className="text-[10px] text-gray-400">{entry.componentKey}</span>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-gray-500">ラベル</label>
          <input
            type="text"
            value={entry.label ?? ''}
            onChange={e => updatePoolEntry({ label: e.target.value || undefined })}
            placeholder="ラベルなし"
            className="text-xs border rounded px-2 py-1 bg-white"
          />
          <input
            type="text"
            value={entry.subLabel ?? ''}
            onChange={e => updatePoolEntry({ subLabel: e.target.value || undefined })}
            placeholder="サブラベル（任意）"
            className="text-xs border rounded px-2 py-1 bg-white"
          />
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={entry.hideWhenEmpty === true}
            onChange={e => updatePoolEntry({ hideWhenEmpty: e.target.checked || undefined })}
            className="w-3 h-3 accent-sky-500"
          />
          <span className="text-[10px] text-gray-500">値が空のとき非表示</span>
        </label>
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-gray-500 flex-shrink-0">ラベル色</label>
          <ColorPicker
            value={entry.labelColor ?? ''}
            onChange={v => updatePoolEntry({ labelColor: v || undefined })}
            defaultColor="#1f2937"
            presetColors={LABEL_PRESET_COLORS}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-gray-500 flex-shrink-0">ラベルアイコン</label>
          <IconPicker
            value={entry.labelIcon ?? ''}
            onChange={v => updatePoolEntry({ labelIcon: v || undefined })}
          />
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={entry.labelInset === true}
            onChange={e => updatePoolEntry({ labelInset: e.target.checked || undefined })}
            className="w-3 h-3 accent-sky-500"
          />
          <span className="text-[10px] text-gray-500">ラベルをコンポーネント内に描画（labelInset）</span>
        </label>
        {entry.labelInset && (
          <div className="flex flex-col gap-1 pl-4">
            <label className="text-[10px] text-gray-500">labelInsetDir</label>
            <div className="flex gap-1">
              {(['col', 'row'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => updatePoolEntry({ labelInsetDir: d })}
                  className={`px-2 py-1 text-xs border rounded transition-colors bg-white ${(entry.labelInsetDir ?? 'col') === d ? 'bg-sky-100 border-sky-400 text-sky-700 font-semibold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >{d}</button>
              ))}
            </div>
          </div>
        )}
        {comp?.blockConfigForm ? (
          <div className="flex flex-col gap-2 border-t border-gray-100 pt-2">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">ブロック固有設定</p>
            <comp.blockConfigForm
              blockConfig={entry.blockConfig ?? {}}
              onChange={cfg => updatePoolEntry({ blockConfig: cfg })}
            />
          </div>
        ) : (
          <p className="text-[10px] text-gray-400">このコンポーネントには固有設定がありません</p>
        )}
      </div>
    )
  }

  function renderBlockConfigTab(): React.ReactNode {
    const node = selectedNode!
    if (node.type === 'ref') {
      const poolEntry = currentPool[node.blockId]
      if (!poolEntry) return <p className="text-xs text-gray-400 px-3 py-4">プールエントリが見つかりません (blockId: {node.blockId})</p>
      return renderPoolEntryEditor(node.blockId, poolEntry)
    }
    if (node.type === 'block') {
      const comp = getComponent((node as Block).componentKey)
      if (!comp) return null
      const path = selectedPath!
      const displaySettings: BlockDisplaySettings = {
        variant:        node.variant ?? 'simple',
        surface:      (node as Block).surface ?? 'transparent',
        label:          node.label ?? '',
        subLabel:       node.subLabel ?? '',
        labelColor:     (node as Block).labelColor ?? '',
        labelIcon:      (node as Block).labelIcon ?? '',
        labelInset:     (node as Block).labelInset ?? false,
        labelInsetDir:  (node as Block).labelInsetDir ?? 'col',
      }
      const handleDisplayChange = (patch: Partial<BlockDisplaySettings>) => {
        handleUpdate(path, n => {
          const next = { ...n, ...patch }
          if (patch.label !== undefined)     next.label     = patch.label     || undefined
          if (patch.subLabel !== undefined)  next.subLabel  = patch.subLabel  || undefined
          if (patch.labelIcon !== undefined) next.labelIcon = patch.labelIcon || undefined
          if (patch.surface !== undefined && !isBgVariantApplicable(comp, next.variant ?? 'simple')) {
            delete (next as Block).surface
          }
          return next
        })
      }
      return (
        <div className="px-3 py-3">
          <BlockPropertyEditor
            component={comp}
            settings={displaySettings}
            onChange={handleDisplayChange}
            extras={
              <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
                {comp.blockConfigForm && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">ブロック固有設定</p>
                    <comp.blockConfigForm
                      blockConfig={(node as Block).blockConfig ?? {}}
                      onChange={cfg => handleUpdate(path, n => ({ ...n, blockConfig: cfg }))}
                    />
                  </div>
                )}
              </div>
            }
          />
        </div>
      )
    }
    // row / col: no block config
    return <p className="text-xs text-gray-400 px-3 py-4 text-center">コンテナノードにはブロック設定がありません</p>
  }

  // ── 配置タブ ──────────────────────────────────────────────────────────────
  function renderPlacementTab(): React.ReactNode {
    const path = selectedPath!
    const node = selectedNode!

    const isRoot = path.length === 0
    const parentPath = path.slice(0, -1)
    const idx = path[path.length - 1] ?? 0
    const parentNode = parentPath.length > 0 ? getNode(layout, parentPath) : null
    const siblingCount = parentNode && parentNode.type !== 'block' && parentNode.type !== 'ref' ? parentNode.children.length : 0

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

        {/* row / col: align-items */}
        {(node.type === 'col' || node.type === 'row') && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-gray-500">align-items</label>
            <select
              value={(node as LayoutNodeCol).alignItems ?? ''}
              onChange={e => handleUpdate(path, n => ({ ...n, alignItems: e.target.value || undefined }))}
              className="text-xs border rounded px-2 py-1"
            >
              <option value="">stretch（デフォルト）</option>
              <option value="center">center</option>
              <option value="flex-start">flex-start</option>
              <option value="flex-end">flex-end</option>
            </select>
          </div>
        )}

        {/* ref のみ: レイアウト固有設定 (variant / surface / alignSelf / contentAlign / fontScale) */}
        {node.type === 'ref' && (() => {
          const poolEntry = currentPool[node.blockId]
          const comp = poolEntry ? getComponent(poolEntry.componentKey) : undefined
          const variants = comp?.variants ?? []
          const BG_VARIANTS: SurfaceVariant[] = ['simple', 'glass', 'flat', 'transparent', 'outline']
          return (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500">blockId（プール参照）</label>
                <span className="text-xs font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 rounded px-2 py-1">{node.blockId}</span>
              </div>
              {/* variant */}
              {variants.length > 0 && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-500">variant <span className="text-[9px] text-indigo-400">（このレイアウトのみ）</span></label>
                  <div className="flex gap-1 flex-wrap">
                    {variants.map(v => (
                      <button
                        key={v}
                        onClick={() => handleUpdate(path, n => ({ ...n, variant: v === (poolEntry?.variant ?? 'simple') && node.variant === undefined ? undefined : v } as LayoutNode))}
                        className={`px-2 py-1 text-xs border rounded transition-colors ${(node.variant ?? poolEntry?.variant ?? 'simple') === v ? 'bg-sky-100 border-sky-400 text-sky-700 font-semibold' : 'border-gray-200 text-gray-500 hover:bg-gray-50 bg-white'}`}
                      >{v}{node.variant === v ? ' ✓' : ''}</button>
                    ))}
                    {node.variant !== undefined && (
                      <button
                        onClick={() => handleUpdate(path, n => { const { variant: _, ...rest } = n as LayoutNodeRef; return rest as LayoutNode })}
                        className="px-2 py-1 text-xs border rounded border-red-200 text-red-400 hover:bg-red-50 bg-white"
                      >クリア</button>
                    )}
                  </div>
                </div>
              )}
              {/* surface */}
              {comp?.supportsSurface && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-500">surface <span className="text-[9px] text-indigo-400">（このレイアウトのみ）</span></label>
                  <div className="flex gap-1 flex-wrap">
                    {BG_VARIANTS.map(v => (
                      <button
                        key={v}
                        onClick={() => handleUpdate(path, n => ({ ...n, surface: v } as LayoutNode))}
                        className={`px-2 py-1 text-xs border rounded transition-colors ${(node.surface ?? poolEntry?.surface) === v ? 'bg-sky-100 border-sky-400 text-sky-700 font-semibold' : 'border-gray-200 text-gray-500 hover:bg-gray-50 bg-white'}`}
                      >{v}{node.surface === v ? ' ✓' : ''}</button>
                    ))}
                    {node.surface !== undefined && (
                      <button
                        onClick={() => handleUpdate(path, n => { const { surface: _, ...rest } = n as LayoutNodeRef; return rest as LayoutNode })}
                        className="px-2 py-1 text-xs border rounded border-red-200 text-red-400 hover:bg-red-50 bg-white"
                      >クリア</button>
                    )}
                  </div>
                </div>
              )}
              {/* alignSelf */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500">alignSelf</label>
                <select
                  value={node.alignSelf ?? ''}
                  onChange={e => handleUpdate(path, n => ({ ...n, alignSelf: e.target.value || undefined } as LayoutNode))}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="">stretch（デフォルト）</option>
                  <option value="flex-start">flex-start（コンテンツ高さ）</option>
                  <option value="flex-end">flex-end</option>
                  <option value="center">center</option>
                </select>
              </div>
              {/* contentAlign */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500">contentAlign</label>
                <select
                  value={node.contentAlign ?? ''}
                  onChange={e => handleUpdate(path, n => ({ ...n, contentAlign: e.target.value || undefined } as LayoutNode))}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="">stretch（デフォルト）</option>
                  <option value="center">center（縦中央揃え）</option>
                  <option value="flex-start">flex-start（上揃え）</option>
                  <option value="flex-end">flex-end（下揃え）</option>
                </select>
              </div>
              {/* フォント倍率 */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500">フォント倍率</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1 text-[10px] text-gray-500">
                    ラベル
                    <input
                      type="number" step="0.05" min="0.5" max="3"
                      value={node.labelFontScale ?? ''}
                      onChange={e => handleUpdate(path, n => ({ ...n, labelFontScale: e.target.value === '' ? undefined : Number(e.target.value) }))}
                      placeholder="—"
                      className="w-14 border rounded px-1 py-0.5 text-xs text-right"
                    />
                  </label>
                  <label className="flex items-center gap-1 text-[10px] text-gray-500">
                    コンテンツ
                    <input
                      type="number" step="0.05" min="0.5" max="3"
                      value={node.contentFontScale ?? ''}
                      onChange={e => handleUpdate(path, n => ({ ...n, contentFontScale: e.target.value === '' ? undefined : Number(e.target.value) }))}
                      placeholder="—"
                      className="w-14 border rounded px-1 py-0.5 text-xs text-right"
                    />
                  </label>
                  </div>
                </div>
              </div>
          )
        })()}

        {/* block のみ: componentKey / dataKey / contentAlign */}
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
                    return { ...n, componentKey: newComponentKey, dataKey: newDataKey, variant: 'simple' }
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
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={(node as Block).hideWhenEmpty === true}
                onChange={e => handleUpdate(path, n => ({ ...n, hideWhenEmpty: e.target.checked || undefined }))}
                className="w-3 h-3 accent-sky-500"
              />
              <span className="text-[10px] text-gray-500">値が空のとき非表示</span>
            </label>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">contentAlign</label>
              <select
                value={(node as Block).contentAlign ?? ''}
                onChange={e => handleUpdate(path, n => ({ ...n, contentAlign: e.target.value || undefined }))}
                className="text-xs border rounded px-2 py-1"
              >
                <option value="">stretch（デフォルト）</option>
                <option value="center">center（縦中央揃え）</option>
                <option value="flex-start">flex-start（上揃え）</option>
                <option value="flex-end">flex-end（下揃え）</option>
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
            <div className="flex gap-2">
              {(node as Block).label !== undefined && (
                <div className="flex items-center gap-1">
                  <label className="text-[10px] text-gray-500 flex-shrink-0">ラベル倍率</label>
                  <input type="number" step="0.05" min="0.3" max="3" placeholder="1.0"
                    value={(node as Block).labelFontScale ?? ''}
                    onChange={e => handleUpdate(path, n => ({ ...n, labelFontScale: e.target.value === '' ? undefined : Number(e.target.value) }))}
                    className="w-14 px-1 py-0.5 border rounded text-xs font-mono text-right"
                  />
                </div>
              )}
              <div className="flex items-center gap-1">
                <label className="text-[10px] text-gray-500 flex-shrink-0">コンテンツ倍率</label>
                <input type="number" step="0.05" min="0.3" max="3" placeholder="1.0"
                  value={(node as Block).contentFontScale ?? ''}
                  onChange={e => handleUpdate(path, n => ({ ...n, contentFontScale: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  className="w-14 px-1 py-0.5 border rounded text-xs font-mono text-right"
                />
              </div>
            </div>
          </div>
        )}

        {/* row/col のみ: 子追加 */}
        {node.type !== 'block' && node.type !== 'ref' && (
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
              <select
                className="px-2 py-1 text-xs border rounded hover:bg-blue-50 text-blue-700 border-blue-200"
                defaultValue=""
                onChange={e => {
                  if (!e.target.value) return
                  handleAddBlockToPool(path, e.target.value)
                  e.target.value = ''
                }}
              >
                <option value="">+ block</option>
                {allBlocks.map(b => <option key={b.key} value={b.key}>{b.key}</option>)}
              </select>
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

  const cardUsedKeys = collectUsedKeys(cardLayout)
  const webUsedKeys = collectUsedKeys(webLayout)

  const resolvedDefinition = rowToDefinition(
    currentRow,
    cardLayout,
    webLayout,
    orientationScales[currentRow.id]?.card ?? {},
    orientationScales[currentRow.id]?.web  ?? {},
    currentPool,
    currentOverlayConfig,
  )
  // 固定背景モードではプレビューの backgroundKey を外す（固定値を background prop で渡す）
  const previewDefinition = currentBgMode === 'fixed'
    ? { ...resolvedDefinition, backgroundKey: undefined }
    : resolvedDefinition
  const previewBackground = currentBgMode === 'fixed' ? currentFixedBg : undefined

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* 左 aside: テンプレート一覧 + ブロックプール */}
      <div className="bg-white flex flex-col overflow-hidden flex-shrink-0" style={{ width: leftWidth }}>
        <div className="px-3 py-2 border-b flex-shrink-0">
          <p className="text-xs font-medium text-gray-700">テンプレート</p>
        </div>
        <div className="flex-1 overflow-y-auto py-1 min-h-0">
          {rowList.map(row => (
            <button
              key={row.id}
              onClick={() => {
                setSelectedId(row.id)
                setSelectedPath(null)
                setSelectedOverlay(false)
                const p = new URLSearchParams(searchParams.toString())
                p.set('def', row.id)
                router.replace(`${pathname}?${p.toString()}`)
              }}
              className={`w-full text-left px-3 py-2.5 transition-colors ${
                selectedId === row.id ? 'bg-sky-50 border-r-2 border-sky-400' : 'hover:bg-gray-50'
              }`}
            >
              <p className={`text-xs font-medium ${selectedId === row.id ? 'text-sky-700' : 'text-gray-700'}`}>
                {row.label}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{row.id}</p>
            </button>
          ))}
        </div>

        {/* ブロックプールパネル：リサイズハンドル */}
        <div onMouseDown={startDragPool} className="h-1 flex-shrink-0 cursor-row-resize hover:bg-sky-300 active:bg-sky-400 transition-colors border-t border-gray-200" />
        {/* ブロックプールパネル */}
        <div className="flex flex-col overflow-hidden flex-shrink-0" style={{ height: poolHeight }}>
          <div className="px-3 py-2 flex-shrink-0">
            <p className="text-xs font-medium text-gray-700">ブロックプール</p>
          </div>
          <div className="overflow-y-auto flex-1">
            {Object.entries(currentPool).length === 0 && (
              <p className="text-[10px] text-gray-400 px-3 py-2">ブロックなし</p>
            )}
            {Object.entries(currentPool).map(([blockId, entry]) => {
              const lUsed = cardUsedKeys.has(blockId)
              const pUsed = webUsedKeys.has(blockId)
              const color = blockColor(entry.componentKey)
              const isPoolSelected = selectedPoolBlockId === blockId
              return (
                <div
                  key={blockId}
                  className={`flex items-center gap-1.5 px-2 py-1 group cursor-pointer ${isPoolSelected ? 'bg-indigo-50 border-r-2 border-indigo-400' : 'hover:bg-gray-50'}`}
                  onClick={() => {
                    setSelectedPoolBlockId(blockId)
                    setSelectedPath(null)
                    setSelectedOverlay(false)
                    setPropTab('blockConfig')
                  }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono text-gray-700 truncate">{blockId}</p>
                    <p className="text-[9px] text-gray-400 truncate">{entry.componentKey}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-1 rounded ${lUsed ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-300'}`}>カード</span>
                  <span className={`text-[9px] font-bold px-1 rounded ${pUsed ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-300'}`}>Web</span>
                  <button
                    className="opacity-0 group-hover:opacity-100 text-[10px] text-sky-500 hover:text-sky-700 flex-shrink-0 px-1"
                    title="現在のレイアウトに追加"
                    onClick={() => {
                      const path = resolveContainerPath(selectedPath, layout)
                      handleAddRefFromPool(path, blockId)
                    }}
                  >+</button>
                  <button
                    className="opacity-0 group-hover:opacity-100 text-[10px] text-red-400 hover:text-red-600 flex-shrink-0 px-1"
                    title={lUsed || pUsed ? 'レイアウトで使用中（削除すると ref が壊れます）' : 'プールから削除'}
                    onClick={() => {
                      if ((lUsed || pUsed) && !confirm(`"${blockId}" はレイアウトで使用中です。レイアウトからも削除しますか？`)) return
                      setCurrentPool(prev => {
                        const next = { ...prev }
                        delete next[blockId]
                        return next
                      })
                      setLayouts(prev => {
                        const cur = prev[currentRow.id]
                        return {
                          ...prev,
                          [currentRow.id]: {
                            card: removeRefsById(cur.card, blockId),
                            web:  removeRefsById(cur.web,  blockId),
                          },
                        }
                      })
                      setSelectedPath(null)
                    }}
                  >✕</button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 左リサイズハンドル */}
      <div onMouseDown={startDragLeft} className="w-1 flex-shrink-0 cursor-col-resize hover:bg-sky-300 active:bg-sky-400 transition-colors border-r border-gray-200" />

      {/* 中央: カードプレビュー */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* ツールバー */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-white flex-shrink-0 text-xs overflow-hidden">
          {/* テンプレート名インライン編集 */}
          {editingLabel ? (
            <form
              className="flex items-center gap-1"
              onSubmit={e => {
                e.preventDefault()
                const trimmed = labelDraft.trim()
                if (trimmed && trimmed !== currentRow.label) {
                  onLabelChange?.(currentRow.id, trimmed)
                }
                setEditingLabel(false)
              }}
            >
              <input
                autoFocus
                value={labelDraft}
                onChange={e => setLabelDraft(e.target.value)}
                onBlur={() => {
                  const trimmed = labelDraft.trim()
                  if (trimmed && trimmed !== currentRow.label) {
                    onLabelChange?.(currentRow.id, trimmed)
                  }
                  setEditingLabel(false)
                }}
                onKeyDown={e => { if (e.key === 'Escape') setEditingLabel(false) }}
                className="text-xs font-semibold text-gray-800 border border-sky-300 rounded px-2 py-0.5 w-40 focus:outline-none focus:ring-1 focus:ring-sky-300"
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => { setLabelDraft(currentRow.label); setEditingLabel(true) }}
              className="flex items-center gap-1 group min-w-0 shrink"
              title="クリックして名前を編集"
            >
              <span className="text-xs font-semibold text-gray-800 truncate max-w-[160px]">{currentRow.label}</span>
              <span className="text-[10px] text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0">✏</span>
            </button>
          )}
          <div className="w-px h-4 bg-gray-200 mx-1 flex-shrink-0" />
          <div className="flex bg-gray-100 rounded-lg p-0.5 flex-shrink-0">
            {(['card', 'web'] as const).map(ori => (
              <button
                key={ori}
                onClick={() => { setOrientation(ori); setSelectedPath(null) }}
                className={`px-3 py-1.5 font-medium rounded-md transition-all ${
                  orientation === ori ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {ori === 'card' ? 'カード' : 'Web'}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
            {orientation === 'web' && (
              <button
                onClick={() => setScaleMultiplier(390 / o.cardWidth / fitScale)}
                className="px-1.5 py-0.5 text-[10px] border border-gray-200 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                title="スマホ幅 390px でのサイズ感"
              >📱</button>
            )}
            <button onClick={() => setScaleMultiplier(v => Math.max(0.3, +(v - 0.1).toFixed(1)))} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 border border-gray-200 rounded text-xs leading-none">−</button>
            <span className="text-gray-400 font-mono text-xs w-10 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScaleMultiplier(v => Math.min(2.0, +(v + 0.1).toFixed(1)))} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 border border-gray-200 rounded text-xs leading-none">+</button>
            <button onClick={() => setScaleMultiplier(1.0)} className="text-gray-300 hover:text-gray-500 text-[10px]">↺</button>
          </div>
          <button
            onClick={() => {
              const savedLayout = orientation === 'card'
                ? savedLayouts[currentRow.id]?.card_layout
                : savedLayouts[currentRow.id]?.web_layout
              if (!savedLayout) return
              if (!confirm(`${orientation === 'card' ? 'カード' : 'Web'}レイアウトの未保存の変更を破棄しますか？`)) return
              setLayouts(prev => ({
                ...prev,
                [currentRow.id]: {
                  ...prev[currentRow.id],
                  [orientation]: savedLayout,
                },
              }))
              setSelectedPath(null)
            }}
            className="flex-shrink-0 px-3 py-1 text-xs rounded border font-medium border-gray-300 bg-white text-gray-500 hover:bg-gray-50 transition-colors"
          >
            変更を破棄
          </button>
          <button
            onClick={handleSaveSample}
            disabled={sampleState === 'saving'}
            title="現在のプレビュー値をサンプルカードデータとして保存"
            className={`flex-shrink-0 px-3 py-1 text-xs rounded border font-medium transition-colors ${
              sampleState === 'saved'  ? 'border-green-300 bg-green-50 text-green-700' :
              sampleState === 'error'  ? 'border-red-300 bg-red-50 text-red-600' :
              sampleState === 'saving' ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-wait' :
              'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            {sampleState === 'saving' ? '保存中…' : sampleState === 'saved' ? '✓ サンプル保存' : sampleState === 'error' ? 'エラー' : 'サンプルに設定'}
          </button>
          <button
            onClick={handleSave}
            disabled={saveState === 'saving'}
            className={`flex-shrink-0 px-3 py-1 text-xs rounded border font-medium transition-colors ${
              saveState === 'saved'  ? 'border-green-300 bg-green-50 text-green-700' :
              saveState === 'error'  ? 'border-red-300 bg-red-50 text-red-600' :
              saveState === 'saving' ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-wait' :
              'border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100'
            }`}
          >
            {saveState === 'saving' ? '保存中…' : saveState === 'saved' ? '✓ 保存済み' : saveState === 'error' ? 'エラー' : '保存'}
          </button>
        </div>

        {/* フォント・パディングスケール */}
        <div className="flex items-center gap-3 px-4 py-1.5 border-b bg-gray-50 text-[10px] text-gray-500 flex-shrink-0">
          {([
            { key: 'defaultLabelFontScale',   label: 'ラベル倍率' },
            { key: 'defaultContentFontScale',  label: 'コンテンツ倍率' },
            { key: 'defaultPaddingScale',      label: 'パディング倍率' },
          ] as const).map(({ key, label }) => {
            const defVal = 1
            const curVal = currentOrientationScales[key] ?? defVal
            return (
              <label key={key} className="flex items-center gap-1">
                <span className="text-gray-400">{label}</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="3"
                  value={curVal}
                  onChange={e => setOrientationScale({ [key]: Number(e.target.value) || defVal })}
                  className="w-14 border rounded px-1 py-0.5 text-[10px] text-gray-700 text-right"
                />
                {currentOrientationScales[key] !== undefined && currentOrientationScales[key] !== defVal && (
                  <button onClick={() => setOrientationScale({ [key]: defVal })} className="text-gray-300 hover:text-gray-500">↺</button>
                )}
              </label>
            )
          })}
        </div>

        {/* プレビュー（ページ全体に背景を適用） */}
        <div
          ref={containerRef}
          className={`flex-1 flex p-6 ${o.autoHeight ? 'overflow-y-auto items-start justify-center' : 'items-center justify-center overflow-hidden'}`}
          style={{ background: pageBg }}
        >
          {o.autoHeight ? (
            // Web 表示モード：zoom でレイアウトごとスケール（transform は高さに影響しない）
            <div style={{
              width: o.cardWidth,
              zoom: scale,
              flexShrink: 0,
            }}>
              <GenericCardRenderer
                definition={previewDefinition}
                orientation={orientation}
                values={localValues}
                fontFamily={localFontFamily}
                noBackground={currentBgMode !== 'fixed'}
                background={previewBackground ?? undefined}
                highlightPath={selectedPath ?? undefined}
                cardUrl="https://vaacard.com/card/preview"
                userUrl="https://vaacard.com/u/preview"
              />
            </div>
          ) : (
            <div style={{
              width:  o.cardWidth  * scale,
              height: (o.cardHeight ?? o.cardWidth) * scale,
              position: 'relative',
              overflow: 'hidden',
              borderRadius: (currentRow.card_config?.borderRadius ?? 20) * scale,
              flexShrink: 0,
            }}>
              <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: o.cardWidth, height: o.cardHeight }}>
                <GenericCardRenderer
                  definition={previewDefinition}
                  orientation={orientation}
                  values={localValues}
                  fontFamily={localFontFamily}
                  noBackground={currentBgMode !== 'fixed'}
                  background={previewBackground ?? undefined}
                  highlightPath={selectedPath ?? undefined}
                  cardUrl="https://vaacard.com/card/preview"
                  userUrl="https://vaacard.com/u/preview"
                />
              </div>
            </div>
          )}
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
          {/* デザインプリセット */}
          <div className="border-b px-3 py-2">
            <p className="text-[10px] text-gray-400 mb-1.5">デザインプリセット</p>
            <div className="flex gap-1">
              {([
                { key: 'simple', label: 'Simple', desc: '半透明白' },
                { key: 'glass',   label: 'Glass',   desc: 'すりガラス' },
                { key: 'flat',    label: 'Flat',    desc: '不透明白+枠' },
              ] as const).map(({ key, label, desc }) => (
                <button
                  key={key}
                  onClick={() => setCurrentDesignPreset(key)}
                  title={desc}
                  className={`flex-1 py-1 text-[10px] rounded border transition-colors ${
                    currentDesignPreset === key
                      ? 'border-sky-400 bg-sky-50 text-sky-700 font-semibold'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 背景モード — 固定ノード */}
          <div className="border-b">
            <div className="flex items-center gap-2 px-3 py-1.5">
              <span className="text-[10px] text-orange-400">■</span>
              <span className="font-mono font-medium text-gray-600 text-xs">background</span>
              <span className="ml-auto text-[10px] text-gray-300 select-none" title="削除不可">🔒</span>
            </div>
            <div className="flex items-center gap-1 px-3 pb-1.5">
              {(['custom', 'fixed'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setCurrentBgMode(mode)}
                  className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                    currentBgMode === mode
                      ? 'border-orange-300 bg-orange-50 text-orange-700 font-medium'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {mode === 'custom' ? 'カスタム' : '固定'}
                </button>
              ))}
            </div>
            {currentBgMode === 'fixed' && (
              <div className="px-3 pb-2">
                <backgroundComponent.FormItem
                  value={currentFixedBg}
                  onChange={v => setCurrentFixedBg(v as import('@/blocks/types').BackgroundValue)}
                  t={translations.ja}
                />
              </div>
            )}
          </div>

          {/* オーバーレイ — 削除不可の固定ノード */}
          <div
            onClick={() => { setSelectedOverlay(true); setSelectedPath(null) }}
            className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors ${
              selectedOverlay ? 'bg-sky-100 text-sky-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-[10px] text-purple-400">■</span>
            <span className="font-mono font-medium">overlay</span>
            <span className="text-[10px] text-gray-400">
              {currentOverlayConfig?.variant ?? currentRow.overlay_config?.variant ?? '—'}
            </span>
            <span className="ml-auto text-[10px] text-gray-300 select-none" title="削除不可">🔒</span>
          </div>
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
        <div className="flex flex-col flex-shrink-0" style={{ height: propHeight }}>
          {/* タブバー（固定） */}
          <div className="flex border-b flex-shrink-0">
            {(['blockConfig', 'placement'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setPropTab(tab)}
                className={`flex-1 px-2 py-1.5 text-[11px] font-medium transition-colors border-b-2 -mb-px ${propTab === tab ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                {tab === 'blockConfig' ? 'ブロック設定' : '配置'}
              </button>
            ))}
          </div>
          {/* スクロール領域 */}
          <div className="overflow-y-auto flex-1 min-h-0">
            {renderProperties()}
          </div>
        </div>
        </>}

        {rightTab === 'form' && (
          <FormBuilder
            layout={layout}
            allLayouts={[cardLayout, webLayout]}
            backgroundKey={currentRow.card_config?.backgroundKey}
            blockPool={currentPool as unknown as TemplateDefinition['blockPool']}
            localValues={localValues}
            localFontFamily={localFontFamily}
            setLocalFontFamily={setLocalFontFamily}
            updateLocalValue={updateLocalValue}
            resetLocalValues={resetLocalValues}
            formSections={currentFormSections}
            setFormSections={setCurrentFormSections}
          />
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


// ─── FormBuilder ────────────────────────────────────────────────────────────

type FormBuilderProps = {
  layout: LayoutNode
  allLayouts: LayoutNode[]
  backgroundKey?: string
  blockPool: TemplateDefinition['blockPool']
  localValues: BlockValues
  localFontFamily: string
  setLocalFontFamily: (f: string) => void
  updateLocalValue: (key: string, val: unknown) => void
  resetLocalValues: () => void
  formSections: FormSection[]
  setFormSections: (updater: FormSection[] | ((prev: FormSection[]) => FormSection[])) => void
}

function FormBuilder({ layout, allLayouts, backgroundKey, blockPool, localValues, localFontFamily, setLocalFontFamily, updateLocalValue, resetLocalValues, formSections, setFormSections }: FormBuilderProps) {
  const allBlocks = allLayouts.flatMap(l => collectBlockEntries(l, undefined, undefined, blockPool)).filter((b, i, arr) => arr.findIndex(x => x.dataKey === b.dataKey) === i)
  const [editingItemIdx, setEditingItemIdx] = useState<{ sectionIdx: number; itemIdx: number } | null>(null)

  const addSection = () => setFormSections(prev => [...prev, { title: 'セクション', items: [] }])
  const removeSection = (si: number) => { setFormSections(prev => prev.filter((_, i) => i !== si)); setEditingItemIdx(null) }
  const updateSection = (si: number, patch: Partial<FormSection>) => setFormSections(prev => prev.map((s, i) => i === si ? { ...s, ...patch } : s))
  const moveSection = (si: number, dir: -1 | 1) => setFormSections(prev => {
    const next = [...prev]; const swap = si + dir
    if (swap < 0 || swap >= next.length) return prev
    ;[next[si], next[swap]] = [next[swap], next[si]]; return next
  })
  const addBlockItem = (si: number, dataKey: string) => setFormSections(prev => prev.map((s, i) => i === si ? { ...s, items: [...s.items, { type: 'block' as const, dataKey }] } : s))
  const addTextItem = (si: number) => setFormSections(prev => prev.map((s, i) => i === si ? { ...s, items: [...s.items, { type: 'text' as const, content: '', style: 'description' as const }] } : s))
  const removeItem = (si: number, ii: number) => { setFormSections(prev => prev.map((s, i) => i === si ? { ...s, items: s.items.filter((_, j) => j !== ii) } : s)); setEditingItemIdx(null) }
  const moveItem = (si: number, ii: number, dir: -1 | 1) => setFormSections(prev => prev.map((s, i) => {
    if (i !== si) return s; const next = [...s.items]; const swap = ii + dir
    if (swap < 0 || swap >= next.length) return s
    ;[next[ii], next[swap]] = [next[swap], next[ii]]; return { ...s, items: next }
  }))
  const updateItem = (si: number, ii: number, patch: Partial<FormNode>) => setFormSections(prev => prev.map((s, i) => i !== si ? s : {
    ...s, items: s.items.map((item, j) => j !== ii ? item : { ...item, ...patch } as FormNode),
  }))

  const usedDataKeys = new Set(formSections.flatMap(s => s.items.filter(it => it.type === 'block').map(it => (it as FormNodeBlock).dataKey)))
  // background など layout 外の特殊ブロックも選択肢に含める
  const extraBlocks: { componentKey: string; dataKey: string; blockConfig?: Record<string, unknown>; formLabel?: string }[] = []
  if (backgroundKey && !allBlocks.find(b => b.dataKey === backgroundKey)) {
    extraBlocks.push({ componentKey: 'background', dataKey: backgroundKey, formLabel: '背景' })
  }
  const availableBlocks = [...allBlocks, ...extraBlocks].filter(b => !usedDataKeys.has(b.dataKey))
  const fontAlreadyUsed = formSections.some(s => s.items.some(it => it.type === 'font'))
  const addFontItem = (si: number) => setFormSections(prev => prev.map((s, i) => i === si ? { ...s, items: [...s.items, { type: 'font' as const }] } : s))

  const [configCollapsed, setConfigCollapsed] = useState(() => localStorage.getItem('formConfigCollapsed') === '1')
  const toggleConfigCollapsed = (v: boolean) => { setConfigCollapsed(v); localStorage.setItem('formConfigCollapsed', v ? '1' : '0') }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* 左: フォーム構成エディタ */}
      {configCollapsed ? (
        <div className="w-8 flex-shrink-0 border-r bg-gray-50 flex flex-col items-center py-2 gap-2">
          <button type="button" onClick={() => toggleConfigCollapsed(false)} className="text-gray-400 hover:text-gray-600" title="フォーム構成を展開">
            <span className="text-xs">»</span>
          </button>
          <span className="text-[9px] text-gray-300 [writing-mode:vertical-rl] tracking-widest mt-1 select-none">フォーム構成</span>
        </div>
      ) : (
      <div className="w-60 flex-shrink-0 border-r overflow-y-auto flex flex-col">
        <div className="px-3 py-2 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">フォーム構成</span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={addSection} className="text-[10px] text-sky-500 hover:text-sky-700 font-medium">＋ セクション</button>
            <button type="button" onClick={() => toggleConfigCollapsed(true)} className="text-gray-300 hover:text-gray-500 text-xs ml-1" title="最小化">«</button>
          </div>
        </div>

        {formSections.length === 0 && (
          <p className="text-[10px] text-gray-400 px-3 py-4">セクションを追加してください</p>
        )}

        {formSections.map((section, si) => (
          <div key={si} className="border-b">
            {/* セクションタイトル（インライン編集） */}
            <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50">
              <input
                type="text"
                value={section.title}
                onChange={e => updateSection(si, { title: e.target.value })}
                className="flex-1 text-xs font-medium text-gray-700 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-sky-300 rounded px-1"
                placeholder="セクション名"
              />
              <label className="flex items-center gap-0.5 text-[10px] text-gray-400 cursor-pointer shrink-0" title="デフォルトで開く">
                <input type="checkbox" checked={section.defaultOpen ?? false} onChange={e => updateSection(si, { defaultOpen: e.target.checked })} className="w-2.5 h-2.5 accent-sky-500" />
                開
              </label>
              <button type="button" onClick={() => moveSection(si, -1)} className="text-gray-300 hover:text-gray-500 text-[10px] px-0.5">↑</button>
              <button type="button" onClick={() => moveSection(si, 1)} className="text-gray-300 hover:text-gray-500 text-[10px] px-0.5">↓</button>
              <button type="button" onClick={() => removeSection(si)} className="text-gray-300 hover:text-red-400 text-[10px] px-0.5">×</button>
            </div>

            {/* アイテム一覧 */}
            <div className="pl-3">
              {section.items.map((item, ii) => {
                const isEditing = editingItemIdx?.sectionIdx === si && editingItemIdx?.itemIdx === ii
                const label = item.type === 'font' ? '🔤 フォント' : item.type === 'block' ? (item.formLabel || item.dataKey) : `📝 ${item.content || '（テキスト）'}`
                return (
                  <div key={ii}>
                    <div
                      className={`flex items-center gap-1 px-2 py-1 cursor-pointer text-[10px] ${isEditing ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
                      onClick={() => setEditingItemIdx(isEditing ? null : { sectionIdx: si, itemIdx: ii })}
                    >
                      <span className="flex-1 truncate">{label}</span>
                      <button type="button" onClick={e => { e.stopPropagation(); moveItem(si, ii, -1) }} className="text-gray-300 hover:text-gray-500 px-0.5">↑</button>
                      <button type="button" onClick={e => { e.stopPropagation(); moveItem(si, ii, 1) }} className="text-gray-300 hover:text-gray-500 px-0.5">↓</button>
                      <button type="button" onClick={e => { e.stopPropagation(); removeItem(si, ii) }} className="text-gray-300 hover:text-red-400 px-0.5">×</button>
                    </div>

                    {/* アイテム設定（インライン展開） */}
                    {isEditing && (
                      <div className="mx-2 mb-2 px-2 py-2 bg-indigo-50 rounded flex flex-col gap-1.5">
                        {item.type === 'font' && (
                          <p className="text-[10px] text-gray-400">フォント選択UI（設定なし）</p>
                        )}
                        {item.type === 'block' && (
                          <>
                            <input type="text" value={item.formLabel ?? ''} placeholder={`ラベル（${item.dataKey}）`}
                              onChange={e => updateItem(si, ii, { formLabel: e.target.value || undefined })}
                              className="text-[10px] border border-gray-200 rounded px-2 py-1 bg-white w-full" />
                          </>
                        )}
                        {item.type === 'text' && (
                          <>
                            <select value={item.style ?? 'description'}
                              onChange={e => updateItem(si, ii, { style: e.target.value as 'heading' | 'description' })}
                              className="text-[10px] border border-gray-200 rounded px-2 py-1 bg-white">
                              <option value="heading">heading（見出し）</option>
                              <option value="description">description（説明文）</option>
                            </select>
                            <textarea value={item.content} placeholder="テキストを入力"
                              onChange={e => updateItem(si, ii, { content: e.target.value })}
                              className="text-[10px] border border-gray-200 rounded px-2 py-1 bg-white resize-none w-full" rows={2} />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* アイテム追加 */}
              <div className="flex gap-2 px-2 py-1.5">
                {availableBlocks.length > 0 && (
                  <select className="text-[10px] border border-gray-200 rounded px-1 py-0.5 text-gray-500 flex-1 min-w-0"
                    value="" onChange={e => { if (e.target.value) addBlockItem(si, e.target.value) }}>
                    <option value="">＋ ブロック</option>
                    {availableBlocks.map(b => <option key={b.dataKey} value={b.dataKey}>{b.formLabel || b.dataKey}</option>)}
                  </select>
                )}
                {!fontAlreadyUsed && (
                  <button type="button" onClick={() => addFontItem(si)} className="text-[10px] text-gray-400 hover:text-gray-600 shrink-0">＋ フォント</button>
                )}
                <button type="button" onClick={() => addTextItem(si)} className="text-[10px] text-gray-400 hover:text-gray-600 shrink-0">＋ テキスト</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* 右: フォームプレビュー */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">プレビュー</span>
          <button
            type="button"
            onClick={() => { if (confirm('プレビューの入力値をすべてリセットしますか？')) resetLocalValues() }}
            className="text-[10px] text-red-400 hover:text-red-600 font-medium"
          >
            クリア
          </button>
        </div>

        <div className="px-3 py-3 flex flex-col gap-4">

          {/* セクション別フォーム */}
          {formSections.length === 0 ? (
            allBlocks.map(({ componentKey, dataKey, blockConfig, formLabel }) => {
              const block = getComponent(componentKey)
              if (!block?.FormItem) return null
              return (
                <div key={dataKey} className="border-b pb-3">
                  {formLabel && <p className="text-sm font-semibold text-gray-700 mb-1">{formLabel}</p>}
                  <block.FormItem value={localValues[dataKey] ?? block.defaultValue} onChange={v => updateLocalValue(dataKey, v)} t={translations.ja} blockConfig={blockConfig} />
                </div>
              )
            })
          ) : (
            formSections.map((section, si) => (
              <div key={si} className="border rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-gray-50 border-b">
                  <p className="text-xs font-semibold text-gray-600">{section.title || '（無題）'}</p>
                </div>
                <div className="px-3 pt-1 pb-3 flex flex-col divide-y divide-gray-100">
                  {section.items.map((item, ii) => {
                    if (item.type === 'font') {
                      return (
                        <div key={ii} className="pt-3 pb-3">
                          <p className="text-sm font-semibold text-gray-700 mb-1">フォント</p>
                          <div className="flex gap-1 flex-wrap">
                            {(Object.entries(fontMap) as [string, { style: { fontFamily: string } }][]).map(([key, font]) => {
                              const ff = font.style.fontFamily
                              return (
                                <button key={key} type="button" onClick={() => setLocalFontFamily(ff)}
                                  className={`text-[10px] px-2 py-1 rounded border transition-colors ${localFontFamily === ff ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'}`}
                                  style={{ fontFamily: ff }}>{key}</button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    }
                    if (item.type === 'text') {
                      return item.style === 'heading'
                        ? <p key={ii} className="pt-3 pb-1 text-sm font-semibold text-gray-700">{item.content || '（見出し）'}</p>
                        : <p key={ii} className="pt-3 pb-1 text-xs text-gray-500">{item.content || '（説明文）'}</p>
                    }
                    const entry = allBlocks.find(b => b.dataKey === item.dataKey)
                    // allBlocks にない場合（background など layout 外ブロック）は registry から直接取得
                    const block = entry ? getComponent(entry.componentKey) : (item.dataKey === backgroundKey ? backgroundComponent : null)
                    if (!block?.FormItem) return null
                    const label = item.formLabel || entry?.formLabel
                    return (
                      <div key={ii} className="pt-3 pb-3">
                        {label && <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>}
                        <block.FormItem value={(localValues[item.dataKey] ?? block.defaultValue) as never} onChange={v => updateLocalValue(item.dataKey, v)} t={translations.ja} blockConfig={entry?.blockConfig} />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

