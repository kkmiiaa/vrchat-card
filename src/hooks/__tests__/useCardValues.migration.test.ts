/**
 * useCardValues の localStorage 読み込みパスにおけるマイグレーション統合テスト
 *
 * 今回修正したバグ（useCardValues が localStorage から読む際に migrateLegacyCardData を
 * 呼んでいなかったため旧フォーマット値がすべて空になっていた）のリグレッション防止。
 *
 * テスト対象のデータフロー:
 *   localStorage (旧フォーマット)
 *     → migrateFromOld() [最古フラット → sns オブジェクト形式]
 *     → migrateLegacyCardData('v1', ...) [sns オブジェクト → フラット新フォーマット]
 *     → BlockValuesSchema.parse()
 *     → values に反映
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCardValues } from '../useCardValues'

const STORAGE_KEY = 'vrchat-card-cache'

// V1 定義のブロックキー（表示に使われる主要なもの）
const V1_BLOCKS = [
  { key: 'name',         defaultValue: '' },
  { key: 'vrchat',       defaultValue: '' },
  { key: 'x',           defaultValue: '' },
  { key: 'discord',     defaultValue: '' },
  { key: 'friendPolicy',defaultValue: [] },
  { key: 'gender',      defaultValue: { tag: '', display: '' } },
  { key: 'language',    defaultValue: { preset: [], custom: [] } },
  { key: 'micOnRate',   defaultValue: 0 },
  { key: 'selfIntro',   defaultValue: '' },
  { key: 'age',         defaultValue: { searchTag: '', display: '' } },
]

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

describe('useCardValues / localStorage マイグレーション', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // パターン A: 最古フラット形式（vrchatId, twitterId がトップレベル）
  // ──────────────────────────────────────────────────────────────────────────
  describe('パターン A: 最古フラット形式', () => {
    beforeEach(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        vrchatId:     'vrc_user',
        twitterId:    'tw_user',
        discordId:    'disc_user',
        friendPolicy: ['frPolicyAnyone'],
        name:         '太郎',
        gender:       '男性',
        language:     ['ja', 'en'],
        micOnRate:    75,
        selfIntro:    '自己紹介',
        ageDisplay:   '18+',
      }))
    })

    it('vrchat に値が入る', async () => {
      const { result } = renderHook(() => useCardValues(V1_BLOCKS, undefined, 'vrchat-simple'))
      await waitFor(() => expect(result.current.initialized).toBe(true))
      expect(result.current.values.vrchat).toBe('vrc_user')
    })

    it('x に値が入る', async () => {
      const { result } = renderHook(() => useCardValues(V1_BLOCKS, undefined, 'vrchat-simple'))
      await waitFor(() => expect(result.current.initialized).toBe(true))
      expect(result.current.values.x).toBe('tw_user')
    })

    it('discord に値が入る', async () => {
      const { result } = renderHook(() => useCardValues(V1_BLOCKS, undefined, 'vrchat-simple'))
      await waitFor(() => expect(result.current.initialized).toBe(true))
      expect(result.current.values.discord).toBe('disc_user')
    })

    it('friendPolicy に値が入る', async () => {
      const { result } = renderHook(() => useCardValues(V1_BLOCKS, undefined, 'vrchat-simple'))
      await waitFor(() => expect(result.current.initialized).toBe(true))
      expect(result.current.values.friendPolicy).toEqual(['frPolicyAnyone'])
    })

    it('gender が { tag, display } 形式になる', async () => {
      const { result } = renderHook(() => useCardValues(V1_BLOCKS, undefined, 'vrchat-simple'))
      await waitFor(() => expect(result.current.initialized).toBe(true))
      expect(result.current.values.gender).toEqual({ tag: '男性', display: '' })
    })

    it('language が { preset, custom } 形式になる', async () => {
      const { result } = renderHook(() => useCardValues(V1_BLOCKS, undefined, 'vrchat-simple'))
      await waitFor(() => expect(result.current.initialized).toBe(true))
      expect(result.current.values.language).toEqual({ preset: ['ja', 'en'], custom: [] })
    })

    it('name がそのまま入る', async () => {
      const { result } = renderHook(() => useCardValues(V1_BLOCKS, undefined, 'vrchat-simple'))
      await waitFor(() => expect(result.current.initialized).toBe(true))
      expect(result.current.values.name).toBe('太郎')
    })

    it('micOnRate がそのまま入る', async () => {
      const { result } = renderHook(() => useCardValues(V1_BLOCKS, undefined, 'vrchat-simple'))
      await waitFor(() => expect(result.current.initialized).toBe(true))
      expect(result.current.values.micOnRate).toBe(75)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // パターン B: sns オブジェクト形式（中間世代ユーザー）
  // ──────────────────────────────────────────────────────────────────────────
  describe('パターン B: sns オブジェクト形式', () => {
    beforeEach(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sns: {
          vrchatId:     'vrc_b',
          twitterId:    'tw_b',
          discordId:    'disc_b',
          friendPolicy: ['frPolicyMutualsOnX'],
        },
        name:     '花子',
        gender:   'female',
        language: ['ja'],
        age:      { mode: '18+', display: '' },
        micOnRate: 50,
      }))
    })

    it('vrchat に値が入る', async () => {
      const { result } = renderHook(() => useCardValues(V1_BLOCKS, undefined, 'vrchat-simple'))
      await waitFor(() => expect(result.current.initialized).toBe(true))
      expect(result.current.values.vrchat).toBe('vrc_b')
    })

    it('x に値が入る', async () => {
      const { result } = renderHook(() => useCardValues(V1_BLOCKS, undefined, 'vrchat-simple'))
      await waitFor(() => expect(result.current.initialized).toBe(true))
      expect(result.current.values.x).toBe('tw_b')
    })

    it('discord に値が入る', async () => {
      const { result } = renderHook(() => useCardValues(V1_BLOCKS, undefined, 'vrchat-simple'))
      await waitFor(() => expect(result.current.initialized).toBe(true))
      expect(result.current.values.discord).toBe('disc_b')
    })

    it('friendPolicy に値が入る', async () => {
      const { result } = renderHook(() => useCardValues(V1_BLOCKS, undefined, 'vrchat-simple'))
      await waitFor(() => expect(result.current.initialized).toBe(true))
      expect(result.current.values.friendPolicy).toEqual(['frPolicyMutualsOnX'])
    })

    it('gender が { tag, display } 形式になる', async () => {
      const { result } = renderHook(() => useCardValues(V1_BLOCKS, undefined, 'vrchat-simple'))
      await waitFor(() => expect(result.current.initialized).toBe(true))
      expect(result.current.values.gender).toEqual({ tag: 'female', display: '' })
    })

    it('language が { preset, custom } 形式になる', async () => {
      const { result } = renderHook(() => useCardValues(V1_BLOCKS, undefined, 'vrchat-simple'))
      await waitFor(() => expect(result.current.initialized).toBe(true))
      expect(result.current.values.language).toEqual({ preset: ['ja'], custom: [] })
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // templateId なし（旧メーカー以外）では変換されない
  // ──────────────────────────────────────────────────────────────────────────
  describe('templateId 未指定では migrateLegacyCardData は実行されない', () => {
    beforeEach(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sns: { vrchatId: 'vrc_x', twitterId: 'tw_x', discordId: '', friendPolicy: '' },
        name: 'テスト',
      }))
    })

    it('templateId なしでは vrchat キーは undefined のまま', async () => {
      const { result } = renderHook(() => useCardValues(V1_BLOCKS, undefined, undefined))
      await waitFor(() => expect(result.current.initialized).toBe(true))
      expect(result.current.values.vrchat).toBeFalsy()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // initialValues がある場合は localStorage を無視する
  // ──────────────────────────────────────────────────────────────────────────
  describe('initialValues がある場合は localStorage を無視する', () => {
    beforeEach(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sns: { vrchatId: 'from_storage', twitterId: '', discordId: '', friendPolicy: '' },
      }))
    })

    it('initialValues の値が使われる', async () => {
      const initial = { vrchat: 'from_initial', x: '', discord: '', name: '初期値' }
      const { result } = renderHook(() => useCardValues(V1_BLOCKS, initial, 'vrchat-simple'))
      await waitFor(() => expect(result.current.initialized).toBe(true))
      expect(result.current.values.vrchat).toBe('from_initial')
      expect(result.current.values.name).toBe('初期値')
    })
  })
})
