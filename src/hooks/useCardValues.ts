import { useState, useEffect, useCallback } from 'react'
import type { BlockValues } from '@/blocks/types'
import { BlockValuesSchema } from '@/blocks/schemas'

const STORAGE_KEY = 'vrchat-card-cache'

type Block = { key: string; defaultValue: unknown }

/** 旧フォーマット互換マイグレーション（CardEditor から移植） */
function migrateFromOld(raw: Record<string, unknown>): BlockValues {
  if (raw.sns) return raw as BlockValues
  const presets = ['18歳未満', '18+', '非公開']
  const ageDisplay = (raw.ageDisplay as string) ?? ''
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
      friendPolicy: raw.friendPolicy ?? '',
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
    background:   raw.background   ?? undefined,
    font:         raw.font         ?? 'rounded',
    interactions: raw.interactions ?? [],
    activity:     raw.activity     ?? undefined,
    gallery:      raw.gallery      ?? undefined,
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
          const migrated = BlockValuesSchema.parse(migrateFromOld(raw))
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
