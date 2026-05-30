import { describe, it, expect } from 'vitest'
import { migrateLegacyCardData } from '../legacyCardDataMigration'

describe('migrateLegacyCardData', () => {
  describe('templateId !== v2', () => {
    it('無変換で返す', () => {
      const data = { sns: { vrchatId: 'abc' }, name: 'test' }
      expect(migrateLegacyCardData('v1', data)).toBe(data)
    })
  })

  describe('v2 / 新フォーマット（冪等性）', () => {
    it('sns も micOnRate もなければそのまま返す', () => {
      const data = { name: 'test', x: 'foo', discord: 'bar' }
      const result = migrateLegacyCardData('v2', data)
      expect(result).toEqual(data)
    })
  })

  describe('v2 / SNS 変換', () => {
    it('twitterId → x、discordId → discord に変換される', () => {
      const result = migrateLegacyCardData('v2', {
        sns: { twitterId: 'my_twitter', discordId: 'my_discord', vrchatId: '', friendPolicy: '' },
      })
      expect(result.x).toBe('my_twitter')
      expect(result.discord).toBe('my_discord')
    })

    it('vrchatId + friendPolicy → sns-with-friend-policy1 にまとまる', () => {
      const result = migrateLegacyCardData('v2', {
        sns: { vrchatId: 'vrc_id', friendPolicy: 'frPolicyAnyone', twitterId: '', discordId: '' },
      })
      expect(result['sns-with-friend-policy1']).toEqual({ id: 'vrc_id', friendPolicy: 'frPolicyAnyone' })
    })

    it('変換後に sns キーが削除される', () => {
      const result = migrateLegacyCardData('v2', {
        sns: { vrchatId: 'x', twitterId: '', discordId: '', friendPolicy: '' },
      })
      expect(result.sns).toBeUndefined()
    })

    it('既存の x / discord があれば上書きしない', () => {
      const result = migrateLegacyCardData('v2', {
        x: 'existing_x',
        discord: 'existing_discord',
        sns: { twitterId: 'new_twitter', discordId: 'new_discord', vrchatId: '', friendPolicy: '' },
      })
      expect(result.x).toBe('existing_x')
      expect(result.discord).toBe('existing_discord')
    })

    it('既存の sns-with-friend-policy1 があれば上書きしない', () => {
      const result = migrateLegacyCardData('v2', {
        'sns-with-friend-policy1': { id: 'existing', friendPolicy: 'frPolicyNo' },
        sns: { vrchatId: 'new_id', friendPolicy: 'frPolicyAnyone', twitterId: '', discordId: '' },
      })
      expect((result['sns-with-friend-policy1'] as Record<string, unknown>).id).toBe('existing')
    })
  })

  describe('v2 / micOnRate → gauge1', () => {
    it('gauge1 未設定時は micOnRate を gauge1 に移し、旧キーを削除', () => {
      const result = migrateLegacyCardData('v2', { micOnRate: 80 })
      expect(result.gauge1).toBe(80)
      expect(result.micOnRate).toBeUndefined()
    })

    it('gauge1 が既にあれば micOnRate を上書きしない', () => {
      const result = migrateLegacyCardData('v2', { micOnRate: 80, gauge1: 50 })
      expect(result.gauge1).toBe(50)
    })
  })

  describe('v2 / gender 変換', () => {
    it('gender: string → { tag, display: "" } に変換される', () => {
      const result = migrateLegacyCardData('v2', { gender: 'male' })
      expect(result.gender).toEqual({ tag: 'male', display: '' })
    })

    it('gender がすでにオブジェクトなら変換しない', () => {
      const gender = { tag: 'male', display: '男性' }
      const result = migrateLegacyCardData('v2', { gender })
      expect(result.gender).toEqual(gender)
    })
  })

  describe('v2 / language 変換', () => {
    it('language: string[] → { preset, custom: [] } に変換される', () => {
      const result = migrateLegacyCardData('v2', { language: ['ja', 'en'] })
      expect(result.language).toEqual({ preset: ['ja', 'en'], custom: [] })
    })

    it('language がすでにオブジェクトなら変換しない', () => {
      const language = { preset: ['ja'], custom: ['ks'] }
      const result = migrateLegacyCardData('v2', { language })
      expect(result.language).toEqual(language)
    })
  })
})
