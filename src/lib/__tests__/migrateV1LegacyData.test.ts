import { describe, it, expect } from 'vitest'
import { migrateLegacyCardData } from '../legacyCardDataMigration'

describe('migrateLegacyCardData（V1）', () => {
  describe('templateId !== v1', () => {
    it('無変換で返す', () => {
      const data = { sns: { vrchatId: 'abc' }, name: 'test' }
      expect(migrateLegacyCardData('vrchat-glass', data)).not.toHaveProperty('vrchat')
    })
  })

  describe('冪等性（新フォーマット入力）', () => {
    it('sns も旧フォーマットキーもなければそのまま返す', () => {
      const data = {
        vrchat: 'vrc_id',
        x: 'twitter',
        discord: 'disc',
        friendPolicy: 'frPolicyAnyone',
        gender: { tag: 'male', display: '男性' },
        language: { preset: ['ja'], custom: [] },
        age: { searchTag: '20s' },
      }
      const result = migrateLegacyCardData('vrchat-simple', data)
      expect(result).toEqual(data)
    })
  })

  describe('SNS 変換', () => {
    it('sns.vrchatId → vrchat に変換される', () => {
      const result = migrateLegacyCardData('vrchat-simple', {
        sns: { vrchatId: 'vrc_id', twitterId: '', discordId: '', friendPolicy: '' },
      })
      expect(result.vrchat).toBe('vrc_id')
    })

    it('sns.twitterId → x に変換される', () => {
      const result = migrateLegacyCardData('vrchat-simple', {
        sns: { vrchatId: '', twitterId: 'my_twitter', discordId: '', friendPolicy: '' },
      })
      expect(result.x).toBe('my_twitter')
    })

    it('sns.discordId → discord に変換される', () => {
      const result = migrateLegacyCardData('vrchat-simple', {
        sns: { vrchatId: '', twitterId: '', discordId: 'my_discord', friendPolicy: '' },
      })
      expect(result.discord).toBe('my_discord')
    })

    it('sns.friendPolicy → friendPolicy（string[]）に変換される', () => {
      const result = migrateLegacyCardData('vrchat-simple', {
        sns: { vrchatId: '', twitterId: '', discordId: '', friendPolicy: 'frPolicyAnyone' },
      })
      expect(result.friendPolicy).toEqual(['frPolicyAnyone'])
    })

    it('変換後に sns キーが削除される', () => {
      const result = migrateLegacyCardData('vrchat-simple', {
        sns: { vrchatId: 'x', twitterId: '', discordId: '', friendPolicy: '' },
      })
      expect(result.sns).toBeUndefined()
    })

    it('既存の vrchat / x / discord / friendPolicy があれば上書きしない', () => {
      const result = migrateLegacyCardData('vrchat-simple', {
        vrchat: 'existing_vrc',
        x: 'existing_x',
        discord: 'existing_discord',
        friendPolicy: 'frPolicyNo',
        sns: { vrchatId: 'new_vrc', twitterId: 'new_x', discordId: 'new_disc', friendPolicy: 'frPolicyAnyone' },
      })
      expect(result.vrchat).toBe('existing_vrc')
      expect(result.x).toBe('existing_x')
      expect(result.discord).toBe('existing_discord')
      expect(result.friendPolicy).toBe('frPolicyNo')
    })
  })

  describe('gender 変換', () => {
    it('gender: string → { tag, display: "" } に変換される', () => {
      const result = migrateLegacyCardData('vrchat-simple', { gender: 'male' })
      expect(result.gender).toEqual({ tag: 'male', display: '' })
    })

    it('gender がすでにオブジェクトなら変換しない', () => {
      const gender = { tag: 'male', display: '男性' }
      const result = migrateLegacyCardData('vrchat-simple', { gender })
      expect(result.gender).toEqual(gender)
    })
  })

  describe('language 変換', () => {
    it('language: string[] → { preset, custom: [] } に変換される', () => {
      const result = migrateLegacyCardData('vrchat-simple', { language: ['ja', 'en'] })
      expect(result.language).toEqual({ preset: ['ja', 'en'], custom: [] })
    })

    it('language がすでにオブジェクトなら変換しない', () => {
      const language = { preset: ['ja'], custom: ['ks'] }
      const result = migrateLegacyCardData('vrchat-simple', { language })
      expect(result.language).toEqual(language)
    })
  })

  describe('age 変換', () => {
    it('age.mode → age.searchTag に変換される', () => {
      const result = migrateLegacyCardData('vrchat-simple', { age: { mode: '20s' } })
      expect((result.age as Record<string, unknown>).searchTag).toBe('20s')
      expect((result.age as Record<string, unknown>).mode).toBeUndefined()
    })

    it('age.searchTag が既にあれば age.mode を上書きしない', () => {
      const result = migrateLegacyCardData('vrchat-simple', { age: { mode: '20s', searchTag: '30s' } })
      expect((result.age as Record<string, unknown>).searchTag).toBe('30s')
    })

    it('age がなければ何もしない', () => {
      const result = migrateLegacyCardData('vrchat-simple', { name: 'test' })
      expect(result.age).toBeUndefined()
    })
  })
})
