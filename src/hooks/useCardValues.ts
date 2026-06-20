import { useState, useEffect, useCallback } from 'react'
import type { BlockValues } from '@/blocks/types'
import { BlockValuesSchema } from '@/blocks/schemas'
import { migrateLegacyCardData } from '@/lib/legacyCardDataMigration'

const STORAGE_KEY = 'vrchat-card-cache'

type Block = { key: string; defaultValue: unknown }

/** 旧フォーマット互換マイグレーション（CardEditor から移植）
 * @internal テスト用にエクスポート */
export function migrateFromOld(raw: Record<string, unknown>): BlockValues {
  // 中間フォーマット（sns オブジェクトあり）→ migrateLegacyCardData に委ねる
  if (raw.sns) return raw as BlockValues
  // 新フォーマット（vrchat / x がトップレベルにある）→ 変換不要
  if ('vrchat' in raw || 'x' in raw) return raw as BlockValues
  const presets = ['18歳未満', '18+', '非公開']
  const ageDisplay = (raw.ageDisplay as string) ?? ''

  // friendPolicy: 旧メーカーも新メーカーも string[]（複数選択）
  const rawFriendPolicy = raw.friendPolicy
  const friendPolicyArray = Array.isArray(rawFriendPolicy)
    ? rawFriendPolicy
    : (rawFriendPolicy ? [rawFriendPolicy as string] : [])

  // background: 旧メーカーは backgroundType/backgroundValue、新メーカーは background オブジェクト
  const background = raw.backgroundType
    ? { type: raw.backgroundType, value: raw.backgroundValue ?? '' }
    : (raw.background ?? undefined)

  // gallery: 旧メーカーは galleryEnabled/galleryImages、新メーカーは gallery オブジェクト
  const gallery = raw.galleryEnabled !== undefined
    ? {
        enabled: raw.galleryEnabled,
        images:  Array.isArray(raw.galleryImages) ? raw.galleryImages.map(() => null) : [null, null, null],
        base64:  [null, null, null],
      }
    : (raw.gallery ?? undefined)

  // interactions → mark-grid1: 旧メーカーの interactions を新テンプレートの mark-grid 形式に変換
  // 旧: [{ label: 'touch', mark: '○', isCustom: false }, ...]
  // 新: { marks: { 0: '◯', 1: '△', ... }, custom: [{ label, mark }] }
  // デフォルト項目の順序は旧メーカーの translations.ja.okNgDefaults のキー順と一致
  const OLD_MARK_MAP: Record<string, string> = { '○': '◯', '◎': '◎', '△': '△', '×': '✕', '-': '-' }
  const DEFAULT_INTERACTION_KEYS = ['touch', 'closeRange', 'romantic', 'weapons', 'abuseViolence', 'dirtyJokes']
  const markGrid1 = (() => {
    const rawInteractions = raw.interactions
    if (!Array.isArray(rawInteractions) || rawInteractions.length === 0) return undefined
    type OldItem = { label: string; mark: string; isCustom?: boolean }
    const items = rawInteractions as OldItem[]
    const marks: Record<number, string> = {}
    const custom: { label: string; mark: string }[] = []
    for (const item of items) {
      const idx = DEFAULT_INTERACTION_KEYS.indexOf(item.label)
      if (idx !== -1) {
        marks[idx] = OLD_MARK_MAP[item.mark] ?? item.mark
      } else {
        custom.push({ label: item.label, mark: OLD_MARK_MAP[item.mark] ?? item.mark })
      }
    }
    return { marks, custom }
  })()

  return {
    name:        raw.name        ?? '',
    gender:      raw.gender      ?? '',
    playEnv:     raw.playEnv     ?? [],
    language:    raw.language    ?? [],
    micOnRate:   raw.micOnRate   ?? 0,
    selfIntro:   raw.selfIntro   ?? '',
    trustRank:   raw.trustRank   ?? '',
    sns: {
      vrchatId:     raw.vrchatId    ?? '',
      twitterId:    raw.twitterId   ?? '',
      discordId:    raw.discordId   ?? '',
      friendPolicy: friendPolicyArray,
    },
    status: {
      blue:   raw.statusBlue   ?? '',
      green:  raw.statusGreen  ?? '',
      yellow: raw.statusYellow ?? '',
      red:    raw.statusRed    ?? '',
    },
    age: {
      mode:    presets.includes(ageDisplay) ? ageDisplay : (ageDisplay ? 'custom' : ''),
      display: presets.includes(ageDisplay) ? '' : ageDisplay,
    },
    background,
    font:         raw.font         ?? 'rounded',
    interactions: raw.interactions ?? [],
    'mark-grid1': markGrid1,
    activity:     raw.activity     ?? undefined,
    gallery,
  }
}

type UseCardValuesReturn = {
  values: BlockValues
  updateValue: (key: string, val: unknown) => void
  initialized: boolean
}

/**
 * ブロック値の状態管理・localStorage 同期を担う hook。
 * CardEditor から抽出。
 */
export function useCardValues(
  blocks: Block[],
  initialValues?: Record<string, unknown> | null,
  templateId?: string,
): UseCardValuesReturn {
  const [values, setValues] = useState<BlockValues>(() => {
    const v: BlockValues = {}
    for (const b of blocks) v[b.key] = b.defaultValue
    return v
  })
  const [hasMounted, setHasMounted] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const updateValue = useCallback((key: string, val: unknown) => {
    setValues(prev => ({ ...prev, [key]: val }))
  }, [])

  // マウント検知
  useEffect(() => {
    setHasMounted(true)
  }, [])

  // 初期値読み込み（バックエンド優先、なければ localStorage）
  useEffect(() => {
    if (!hasMounted || initialized) return
    const blockKeys = new Set(blocks.map(b => b.key))
    if (initialValues) {
      const safe = BlockValuesSchema.parse(initialValues)
      setValues(prev => {
        const next = { ...prev }
        for (const key of blockKeys) {
          if (safe[key] !== undefined) next[key] = safe[key]
        }
        if (safe.profileImageUrl) next.profileImageUrl = safe.profileImageUrl
        return next
      })
    } else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const raw = JSON.parse(saved)
          const oldMigrated = migrateFromOld(raw)
          const legacyMigrated = templateId ? migrateLegacyCardData(templateId, oldMigrated as Record<string, unknown>) : oldMigrated
          const migrated = BlockValuesSchema.parse(legacyMigrated)
          setValues(prev => {
            const next = { ...prev }
            for (const key of blockKeys) {
              if (migrated[key] !== undefined) next[key] = migrated[key]
            }
            return next
          })
        }
      } catch (e) {
        console.warn('localStorage 読み込み失敗:', e)
      }
    }
    setInitialized(true)
  }, [hasMounted, initialized, blocks, initialValues])

  // localStorage 保存
  useEffect(() => {
    if (!initialized) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
    } catch (e) {
      console.warn('localStorage 保存失敗:', e)
    }
  }, [values, initialized])

  return { values, updateValue, initialized }
}
