/**
 * 旧メーカー（main ブランチ /tools/vrchat-introduction-card）が localStorage に保存する
 * 実際のデータ形式を正義として、2段マイグレーションを網羅的に検証するテスト。
 *
 * 旧メーカーの LocalStorageCache 型（main ブランチより）:
 *   name: string
 *   language: string[]
 *   gender: string
 *   playEnv: string[]
 *   micOnRate: number
 *   selfIntro: string
 *   vrchatId: string
 *   twitterId: string
 *   discordId: string
 *   statusBlue/Green/Yellow/Red: string
 *   friendPolicy: string[]   ← 配列！
 *   interactions: { label: string, mark: string, isCustom: boolean }[]
 *   backgroundType: "color" | "gradient" | "image"
 *   backgroundValue: string | [string, string]
 *   galleryEnabled: boolean
 *   galleryImages: (File|null)[]   ← File は serialize 不可なので実質 null[]
 *   fontFamily: string
 *   showBalloon: boolean
 *
 * データフロー:
 *   localStorage (旧メーカー形式)
 *     → migrateFromOld()    [useCardValues.ts]
 *     → migrateV1CardData() [legacyCardDataMigration.ts]
 *     → 新フォーマット (CardEditor / DB 保存)
 */
import { describe, it, expect } from 'vitest'
import { migrateLegacyCardData } from '../legacyCardDataMigration'
import { migrateFromOld } from '@/hooks/useCardValues'

/** フルパイプライン: migrateFromOld → migrateLegacyCardData */
function fullMigrate(localStorage: Record<string, unknown>) {
  const afterFromOld = migrateFromOld(localStorage)
  return migrateLegacyCardData('vrchat-simple', afterFromOld)
}

// ─────────────────────────────────────────────────────────────────────────────
// 旧メーカーの典型的な localStorage データ
// ─────────────────────────────────────────────────────────────────────────────
const OLD_MAKER_TYPICAL = {
  name:          '太郎',
  gender:        '男性',
  playEnv:       ['pcvr', 'quest'],
  language:      ['ja', 'en'],
  micOnRate:     75,
  selfIntro:     '自己紹介テキスト',
  vrchatId:      'vrc_taro',
  twitterId:     'tw_taro',
  discordId:     'disc_taro',
  statusBlue:    '探索中',
  statusGreen:   'いつでも歓迎',
  statusYellow:  'ちょっと忙しい',
  statusRed:     'フレンド満員',
  friendPolicy:  ['frPolicyAnyone'],       // 配列
  interactions:  [
    { label: 'touch',       mark: '○', isCustom: false },
    { label: 'closeRange',  mark: '△', isCustom: false },
    { label: 'romantic',    mark: '×', isCustom: false },
    { label: 'weapons',     mark: '-', isCustom: false },
    { label: 'abuseViolence', mark: '×', isCustom: false },
    { label: 'dirtyJokes',  mark: '-', isCustom: false },
  ],
  backgroundType:  'gradient',
  backgroundValue: ['#fcd5ce', '#e0f7fa'],
  galleryEnabled:  true,
  galleryImages:   [null, null, null],
  fontFamily:      'Rounded M+',
  showBalloon:     false,
}

describe('旧メーカー実データ形式 → 2段マイグレーション 網羅テスト', () => {

  // ────────────────────────────────────────────────────────────────────────
  // 1. SNS フィールド
  // ────────────────────────────────────────────────────────────────────────
  describe('1. SNS フィールド', () => {
    it('vrchatId → vrchat', () => {
      const result = fullMigrate(OLD_MAKER_TYPICAL)
      expect(result.vrchat).toBe('vrc_taro')
    })

    it('twitterId → x', () => {
      const result = fullMigrate(OLD_MAKER_TYPICAL)
      expect(result.x).toBe('tw_taro')
    })

    it('discordId → discord', () => {
      const result = fullMigrate(OLD_MAKER_TYPICAL)
      expect(result.discord).toBe('disc_taro')
    })

    it('sns キーが残らない', () => {
      const result = fullMigrate(OLD_MAKER_TYPICAL)
      expect(result.sns).toBeUndefined()
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // 2. friendPolicy（string[] → string 変換が最重要）
  // ────────────────────────────────────────────────────────────────────────
  describe('2. friendPolicy（旧: string[]、新: string）', () => {
    it('friendPolicy が string[] のとき、先頭要素が string として取り出される', () => {
      const result = fullMigrate({ ...OLD_MAKER_TYPICAL, friendPolicy: ['frPolicyAnyone'] })
      expect(result.friendPolicy).toBe('frPolicyAnyone')
      expect(Array.isArray(result.friendPolicy)).toBe(false)
    })

    it('friendPolicy が複数選択のとき、先頭要素のみが使われる', () => {
      const result = fullMigrate({ ...OLD_MAKER_TYPICAL, friendPolicy: ['frPolicyMutualsOnX', 'frPolicyAfterGettingToKnow'] })
      expect(result.friendPolicy).toBe('frPolicyMutualsOnX')
    })

    it('friendPolicy が空配列のとき、空文字になる', () => {
      const result = fullMigrate({ ...OLD_MAKER_TYPICAL, friendPolicy: [] })
      expect(result.friendPolicy).toBe('')
    })

    it('friendPolicy が未設定のとき、空文字になる', () => {
      const result = fullMigrate({ ...OLD_MAKER_TYPICAL, friendPolicy: undefined })
      expect(result.friendPolicy).toBe('')
    })

    it('5種類すべてのポリシーが正しく変換される', () => {
      const policies = [
        'frPolicyAnyone',
        'frPolicyIfInterested',
        'frPolicyMutualsOnX',
        'frPolicyAfterGettingToKnow',
        'frPolicyNo',
      ]
      for (const policy of policies) {
        const result = fullMigrate({ ...OLD_MAKER_TYPICAL, friendPolicy: [policy] })
        expect(result.friendPolicy).toBe(policy)
      }
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // 3. gender（string → { tag, display }）
  // ────────────────────────────────────────────────────────────────────────
  describe('3. gender（string → { tag, display }）', () => {
    it('gender が string のとき { tag, display: "" } に変換される', () => {
      const result = fullMigrate(OLD_MAKER_TYPICAL)
      expect(result.gender).toEqual({ tag: '男性', display: '' })
    })

    it('gender が空文字のとき { tag: "", display: "" } になる', () => {
      const result = fullMigrate({ ...OLD_MAKER_TYPICAL, gender: '' })
      expect(result.gender).toEqual({ tag: '', display: '' })
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // 4. language（string[] → { preset, custom }）
  // ────────────────────────────────────────────────────────────────────────
  describe('4. language（string[] → { preset, custom }）', () => {
    it('language が string[] のとき { preset, custom: [] } に変換される', () => {
      const result = fullMigrate(OLD_MAKER_TYPICAL)
      expect(result.language).toEqual({ preset: ['ja', 'en'], custom: [] })
    })

    it('language が空配列のとき { preset: [], custom: [] } になる', () => {
      const result = fullMigrate({ ...OLD_MAKER_TYPICAL, language: [] })
      expect(result.language).toEqual({ preset: [], custom: [] })
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // 5. status（statusBlue/Green/Yellow/Red → status オブジェクト）
  // ────────────────────────────────────────────────────────────────────────
  describe('5. status フィールド', () => {
    it('statusBlue/Green/Yellow/Red が status.{blue,green,yellow,red} にまとまる', () => {
      const result = fullMigrate(OLD_MAKER_TYPICAL)
      const status = result.status as Record<string, string>
      expect(status.blue).toBe('探索中')
      expect(status.green).toBe('いつでも歓迎')
      expect(status.yellow).toBe('ちょっと忙しい')
      expect(status.red).toBe('フレンド満員')
    })

    it('status フィールドが未設定のとき空文字になる', () => {
      const { statusBlue: _, statusGreen: __, statusYellow: ___, statusRed: ____, ...rest } = OLD_MAKER_TYPICAL
      const result = fullMigrate(rest)
      const status = result.status as Record<string, string>
      expect(status.blue).toBe('')
      expect(status.green).toBe('')
      expect(status.yellow).toBe('')
      expect(status.red).toBe('')
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // 6. background（backgroundType/backgroundValue → background オブジェクト）
  // ────────────────────────────────────────────────────────────────────────
  describe('6. background（backgroundType/backgroundValue → background オブジェクト）', () => {
    it('backgroundType="gradient" + backgroundValue=配列 → background.{type,value} に変換される', () => {
      const result = fullMigrate(OLD_MAKER_TYPICAL)
      const bg = result.background as Record<string, unknown>
      expect(bg.type).toBe('gradient')
      expect(bg.value).toEqual(['#fcd5ce', '#e0f7fa'])
    })

    it('backgroundType="color" + backgroundValue=文字列 → background.{type,value} に変換される', () => {
      const result = fullMigrate({
        ...OLD_MAKER_TYPICAL,
        backgroundType: 'color',
        backgroundValue: '#ff0000',
      })
      const bg = result.background as Record<string, unknown>
      expect(bg.type).toBe('color')
      expect(bg.value).toBe('#ff0000')
    })

    it('backgroundType="image" + backgroundValue=パス → background.{type,value} に変換される', () => {
      const result = fullMigrate({
        ...OLD_MAKER_TYPICAL,
        backgroundType: 'image',
        backgroundValue: '/backgrounds/bg_2.webp',
      })
      const bg = result.background as Record<string, unknown>
      expect(bg.type).toBe('image')
      expect(bg.value).toBe('/backgrounds/bg_2.webp')
    })

    it('backgroundType が未設定のとき background は undefined', () => {
      const { backgroundType: _, backgroundValue: __, ...rest } = OLD_MAKER_TYPICAL
      const result = fullMigrate(rest)
      expect(result.background).toBeUndefined()
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // 7. gallery（galleryEnabled → gallery.enabled）
  // ────────────────────────────────────────────────────────────────────────
  describe('7. gallery（galleryEnabled → gallery.enabled）', () => {
    it('galleryEnabled=true → gallery.enabled=true に変換される', () => {
      const result = fullMigrate(OLD_MAKER_TYPICAL)
      const gallery = result.gallery as Record<string, unknown>
      expect(gallery.enabled).toBe(true)
    })

    it('galleryEnabled=false → gallery.enabled=false に変換される', () => {
      const result = fullMigrate({ ...OLD_MAKER_TYPICAL, galleryEnabled: false })
      const gallery = result.gallery as Record<string, unknown>
      expect(gallery.enabled).toBe(false)
    })

    it('galleryEnabled が未設定のとき gallery は undefined', () => {
      const { galleryEnabled: _, galleryImages: __, ...rest } = OLD_MAKER_TYPICAL
      const result = fullMigrate(rest)
      expect(result.gallery).toBeUndefined()
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // 8. interactions（そのまま保持）
  // ────────────────────────────────────────────────────────────────────────
  describe('8. interactions（旧形式のまま保持）', () => {
    it('interactions 配列がそのまま保持される', () => {
      const result = fullMigrate(OLD_MAKER_TYPICAL)
      const interactions = result.interactions as Array<Record<string, unknown>>
      expect(interactions).toHaveLength(6)
      expect(interactions[0]).toEqual({ label: 'touch', mark: '○', isCustom: false })
      expect(interactions[2]).toEqual({ label: 'romantic', mark: '×', isCustom: false })
    })

    it('カスタム interactions も保持される', () => {
      const result = fullMigrate({
        ...OLD_MAKER_TYPICAL,
        interactions: [
          { label: 'touch', mark: '○', isCustom: false },
          { label: 'カスタム項目', mark: '△', isCustom: true },
        ],
      })
      const interactions = result.interactions as Array<Record<string, unknown>>
      expect(interactions).toHaveLength(2)
      expect(interactions[1]).toEqual({ label: 'カスタム項目', mark: '△', isCustom: true })
    })

    it('interactions が未設定のとき空配列になる', () => {
      const { interactions: _, ...rest } = OLD_MAKER_TYPICAL
      const result = fullMigrate(rest)
      expect(result.interactions).toEqual([])
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // 9. その他フィールド保持
  // ────────────────────────────────────────────────────────────────────────
  describe('9. その他フィールド', () => {
    it('name がそのまま保持される', () => {
      const result = fullMigrate(OLD_MAKER_TYPICAL)
      expect(result.name).toBe('太郎')
    })

    it('selfIntro がそのまま保持される', () => {
      const result = fullMigrate(OLD_MAKER_TYPICAL)
      expect(result.selfIntro).toBe('自己紹介テキスト')
    })

    it('micOnRate がそのまま保持される', () => {
      const result = fullMigrate(OLD_MAKER_TYPICAL)
      expect(result.micOnRate).toBe(75)
    })

    it('playEnv がそのまま保持される', () => {
      const result = fullMigrate(OLD_MAKER_TYPICAL)
      expect(result.playEnv).toEqual(['pcvr', 'quest'])
    })
  })

  // ────────────────────────────────────────────────────────────────────────
  // 10. エッジケース
  // ────────────────────────────────────────────────────────────────────────
  describe('10. エッジケース', () => {
    it('完全に空のデータでもクラッシュしない', () => {
      expect(() => fullMigrate({})).not.toThrow()
    })

    it('すべてのフィールドが空文字でもクラッシュしない', () => {
      expect(() => fullMigrate({
        name: '', gender: '', selfIntro: '', vrchatId: '', twitterId: '', discordId: '',
        friendPolicy: [], language: [], playEnv: [], micOnRate: 0,
        statusBlue: '', statusGreen: '', statusYellow: '', statusRed: '',
        interactions: [], backgroundType: 'color', backgroundValue: '', galleryEnabled: false,
      })).not.toThrow()
    })

    it('新フォーマット（vrchat キーあり）を再変換しても壊れない（冪等性）', () => {
      const newFormat = {
        vrchat: 'vrc', x: 'tw', discord: 'disc',
        friendPolicy: 'frPolicyAnyone',
        gender: { tag: 'male', display: '' },
        language: { preset: ['ja'], custom: [] },
        background: { type: 'gradient', value: ['#fff', '#000'] },
      }
      const result = migrateLegacyCardData('vrchat-simple', newFormat)
      expect(result.vrchat).toBe('vrc')
      expect(result.friendPolicy).toBe('frPolicyAnyone')
      expect((result.gender as Record<string,unknown>).tag).toBe('male')
    })
  })
})
