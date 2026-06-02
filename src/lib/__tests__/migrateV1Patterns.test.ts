/**
 * V1 旧メーカーデータパターン網羅テスト
 *
 * /card/vrchat → handleShareByUrl → DB 保存 の実際のデータフローで
 * 発生しうるあらゆるパターンを検証する。
 *
 * データ変換レイヤー:
 *   localStorage (最古フラット形式)
 *     → migrateFromOld() [useCardValues.ts]
 *     → sns オブジェクト形式 (values)
 *     → migrateLegacyCardData('vrchat-simple', values) [handleShareByUrl]
 *     → 新フォーマット (DB 保存)
 */
import { describe, it, expect } from 'vitest'
import { migrateLegacyCardData } from '../legacyCardDataMigration'

// migrateFromOld の出力（useCardValues が生成する形式）をシミュレート
function migrateFromOld(raw: Record<string, unknown>): Record<string, unknown> {
  if (raw.sns) return raw
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

/** migrateFromOld → migrateLegacyCardData の2段変換を実行 */
function fullMigrate(localStorage: Record<string, unknown>) {
  const afterFromOld = migrateFromOld(localStorage)
  return migrateLegacyCardData('vrchat-simple', afterFromOld)
}

describe('V1 旧メーカー データパターン網羅テスト', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // パターン A: 最古フラット形式（/card/vrchat が誕生した初期のユーザー）
  // ──────────────────────────────────────────────────────────────────────────
  describe('パターン A: 最古フラット形式（vrchatId, twitterId がトップレベル）', () => {
    const localStorage = {
      vrchatId:     'vrc_user',
      twitterId:    'tw_user',
      discordId:    'disc_user',
      friendPolicy: 'frPolicyAnyone',
      name:         '太郎',
      gender:       '男性',
      playEnv:      ['pcvr', 'quest'],
      language:     ['ja', 'en'],
      micOnRate:    75,
      selfIntro:    '自己紹介です',
      statusBlue:   '探索中',
      statusGreen:  'いつでも歓迎',
      ageDisplay:   '20代',
    }

    it('vrchat / x / discord がトップレベルに展開される', () => {
      const result = fullMigrate(localStorage)
      expect(result.vrchat).toBe('vrc_user')
      expect(result.x).toBe('tw_user')
      expect(result.discord).toBe('disc_user')
    })

    it('friendPolicy が string でトップレベルに展開される', () => {
      const result = fullMigrate(localStorage)
      expect(result.friendPolicy).toBe('frPolicyAnyone')
    })

    it('sns キーが残らない', () => {
      const result = fullMigrate(localStorage)
      expect(result.sns).toBeUndefined()
    })

    it('gender が { tag, display } に変換される', () => {
      const result = fullMigrate(localStorage)
      expect(result.gender).toEqual({ tag: '男性', display: '' })
    })

    it('language が { preset, custom } に変換される', () => {
      const result = fullMigrate(localStorage)
      expect(result.language).toEqual({ preset: ['ja', 'en'], custom: [] })
    })

    it('age.mode が age.searchTag に変換される（ageDisplay = 20代 → mode = custom）', () => {
      const result = fullMigrate(localStorage)
      const age = result.age as Record<string, unknown>
      expect(age.searchTag).toBeDefined()
      expect(age.mode).toBeUndefined()
    })

    it('name / selfIntro がそのまま保持される', () => {
      const result = fullMigrate(localStorage)
      expect(result.name).toBe('太郎')
      expect(result.selfIntro).toBe('自己紹介です')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // パターン B: sns オブジェクト形式（中間世代ユーザー）
  // ──────────────────────────────────────────────────────────────────────────
  describe('パターン B: sns オブジェクト形式（migrateFromOld 出力そのまま）', () => {
    const snsFormat = {
      sns: {
        vrchatId:     'vrc_b',
        twitterId:    'tw_b',
        discordId:    'disc_b',
        friendPolicy: 'frPolicyMutualsOnX',
      },
      name:     '花子',
      gender:   'female',
      language: ['ja'],
      age:      { mode: '18+', display: '' },
      micOnRate: 50,
    }

    it('sns.vrchatId → vrchat', () => {
      const result = migrateLegacyCardData('vrchat-simple', snsFormat)
      expect(result.vrchat).toBe('vrc_b')
    })

    it('sns.twitterId → x', () => {
      const result = migrateLegacyCardData('vrchat-simple', snsFormat)
      expect(result.x).toBe('tw_b')
    })

    it('sns.discordId → discord', () => {
      const result = migrateLegacyCardData('vrchat-simple', snsFormat)
      expect(result.discord).toBe('disc_b')
    })

    it('sns.friendPolicy → friendPolicy（string）', () => {
      const result = migrateLegacyCardData('vrchat-simple', snsFormat)
      expect(result.friendPolicy).toBe('frPolicyMutualsOnX')
    })

    it('gender string → { tag, display }', () => {
      const result = migrateLegacyCardData('vrchat-simple', snsFormat)
      expect(result.gender).toEqual({ tag: 'female', display: '' })
    })

    it('language string[] → { preset, custom }', () => {
      const result = migrateLegacyCardData('vrchat-simple', snsFormat)
      expect(result.language).toEqual({ preset: ['ja'], custom: [] })
    })

    it('age.mode → age.searchTag', () => {
      const result = migrateLegacyCardData('vrchat-simple', snsFormat)
      const age = result.age as Record<string, unknown>
      expect(age.searchTag).toBe('18+')
      expect(age.mode).toBeUndefined()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // パターン C: 部分的なデータ（フィールドが一部欠損）
  // ──────────────────────────────────────────────────────────────────────────
  describe('パターン C: フィールド欠損パターン', () => {
    it('sns の一部フィールドが空文字でも変換される', () => {
      const result = migrateLegacyCardData('vrchat-simple', {
        sns: { vrchatId: 'vrc', twitterId: '', discordId: '', friendPolicy: '' },
      })
      expect(result.vrchat).toBe('vrc')
      expect(result.x).toBe('')
      expect(result.discord).toBe('')
      expect(result.friendPolicy).toBe('')
    })

    it('sns フィールドが完全に空でも変換される', () => {
      const result = migrateLegacyCardData('vrchat-simple', {
        sns: { vrchatId: '', twitterId: '', discordId: '', friendPolicy: '' },
        name: 'テスト',
      })
      expect(result.sns).toBeUndefined()
      expect(result.name).toBe('テスト')
    })

    it('gender が未設定でも変換処理でエラーにならない', () => {
      const result = migrateLegacyCardData('vrchat-simple', {
        sns: { vrchatId: '', twitterId: '', discordId: '', friendPolicy: '' },
      })
      expect(result.gender).toBeUndefined()
    })

    it('language が未設定でも変換処理でエラーにならない', () => {
      const result = migrateLegacyCardData('vrchat-simple', {
        sns: { vrchatId: '', twitterId: '', discordId: '', friendPolicy: '' },
      })
      expect(result.language).toBeUndefined()
    })

    it('age が未設定でも変換処理でエラーにならない', () => {
      const result = migrateLegacyCardData('vrchat-simple', {
        sns: { vrchatId: '', twitterId: '', discordId: '', friendPolicy: '' },
      })
      expect(result.age).toBeUndefined()
    })

    it('micOnRate だけある場合も変換は正常終了する', () => {
      const result = migrateLegacyCardData('vrchat-simple', {
        sns: { vrchatId: '', twitterId: '', discordId: '', friendPolicy: '' },
        micOnRate: 60,
      })
      expect(result.micOnRate).toBe(60)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // パターン D: 冪等性（すでに新フォーマットのデータを再変換しても壊れない）
  // ──────────────────────────────────────────────────────────────────────────
  describe('パターン D: 冪等性（新フォーマットを再変換しても同じ結果）', () => {
    const newFormat = {
      vrchat:       'vrc_new',
      x:            'tw_new',
      discord:      'disc_new',
      friendPolicy: 'frPolicyNo',
      gender:       { tag: 'male', display: '男性' },
      language:     { preset: ['ja'], custom: ['ks'] },
      age:          { searchTag: '20s' },
      name:         'ユーザー',
    }

    it('再変換しても vrchat / x / discord / friendPolicy が変わらない', () => {
      const result = migrateLegacyCardData('vrchat-simple', newFormat)
      expect(result.vrchat).toBe('vrc_new')
      expect(result.x).toBe('tw_new')
      expect(result.discord).toBe('disc_new')
      expect(result.friendPolicy).toBe('frPolicyNo')
    })

    it('再変換しても gender が変わらない', () => {
      const result = migrateLegacyCardData('vrchat-simple', newFormat)
      expect(result.gender).toEqual({ tag: 'male', display: '男性' })
    })

    it('再変換しても language が変わらない', () => {
      const result = migrateLegacyCardData('vrchat-simple', newFormat)
      expect(result.language).toEqual({ preset: ['ja'], custom: ['ks'] })
    })

    it('再変換しても age.searchTag が変わらない', () => {
      const result = migrateLegacyCardData('vrchat-simple', newFormat)
      expect((result.age as Record<string, unknown>).searchTag).toBe('20s')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // パターン E: 既存キーが衝突する場合（既存値を上書きしない）
  // ──────────────────────────────────────────────────────────────────────────
  describe('パターン E: 既存の新フォーマットキーがある場合は上書きしない', () => {
    it('vrchat が既にあれば sns.vrchatId で上書きしない', () => {
      const result = migrateLegacyCardData('vrchat-simple', {
        vrchat: 'existing_vrc',
        sns: { vrchatId: 'new_vrc', twitterId: '', discordId: '', friendPolicy: '' },
      })
      expect(result.vrchat).toBe('existing_vrc')
    })

    it('friendPolicy が既にあれば sns.friendPolicy で上書きしない', () => {
      const result = migrateLegacyCardData('vrchat-simple', {
        friendPolicy: 'frPolicyNo',
        sns: { vrchatId: '', twitterId: '', discordId: '', friendPolicy: 'frPolicyAnyone' },
      })
      expect(result.friendPolicy).toBe('frPolicyNo')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // パターン F: エンドツーエンド（最古フラット → migrateFromOld → 新フォーマット）
  // ──────────────────────────────────────────────────────────────────────────
  describe('パターン F: フルパイプライン（最古フラット形式 → 新フォーマット）', () => {
    it('最古フラット形式が2段変換で完全に新フォーマットになる', () => {
      const result = fullMigrate({
        vrchatId:     'vrc_full',
        twitterId:    'tw_full',
        discordId:    'disc_full',
        friendPolicy: 'frPolicyAfterGettingToKnow',
        name:         'フルテスト',
        gender:       'male',
        playEnv:      ['pcvr'],
        language:     ['ja', 'en'],
        micOnRate:    80,
        ageDisplay:   '18+',
      })

      // SNS
      expect(result.vrchat).toBe('vrc_full')
      expect(result.x).toBe('tw_full')
      expect(result.discord).toBe('disc_full')
      expect(result.friendPolicy).toBe('frPolicyAfterGettingToKnow')
      expect(result.sns).toBeUndefined()

      // gender
      expect(result.gender).toEqual({ tag: 'male', display: '' })

      // language
      expect(result.language).toEqual({ preset: ['ja', 'en'], custom: [] })

      // age（ageDisplay='18+' → migrateFromOld で mode='18+' → searchTag='18+'）
      expect((result.age as Record<string, unknown>).searchTag).toBe('18+')
      expect((result.age as Record<string, unknown>).mode).toBeUndefined()

      // その他
      expect(result.name).toBe('フルテスト')
      expect(result.micOnRate).toBe(80)
    })

    it('完全に空のデータでも変換がクラッシュしない', () => {
      expect(() => fullMigrate({})).not.toThrow()
    })

    it('フレンドポリシー全5パターンが変換される', () => {
      const policies = [
        'frPolicyAnyone',
        'frPolicyIfInterested',
        'frPolicyMutualsOnX',
        'frPolicyAfterGettingToKnow',
        'frPolicyNo',
      ]
      for (const policy of policies) {
        const result = fullMigrate({ friendPolicy: policy })
        expect(result.friendPolicy).toBe(policy)
      }
    })
  })
})
