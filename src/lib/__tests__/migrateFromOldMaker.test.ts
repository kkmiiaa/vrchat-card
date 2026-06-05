/**
 * 旧メーカー（main ブランチ /tools/vrchat-introduction-card）が localStorage に保存する
 * 実際のデータ形式を正義として、2段マイグレーションを検証するテスト。
 *
 * 旧メーカーの LocalStorageCache 型（main ブランチより）:
 *   name: string
 *   language: string[]          ← プリセット表示文字列 + カスタム文字列の混在配列
 *   gender: string              ← ユーザー入力テキスト
 *   playEnv: string[]           ← キー文字列配列
 *   micOnRate: number           ← 0〜100
 *   selfIntro: string
 *   vrchatId: string
 *   twitterId: string
 *   discordId: string
 *   statusBlue/Green/Yellow/Red: string
 *   friendPolicy: string[]      ← キー文字列の配列（複数選択可）
 *   interactions: { label: string, mark: string, isCustom: boolean }[]
 *                               ← デフォルト項目の label はキー文字列（言語非依存）
 *   backgroundType: "color" | "gradient" | "image"
 *   backgroundValue: string | [string, string]
 *   galleryEnabled: boolean
 *   galleryImages: null[]       ← File は serialize 不可
 *   fontFamily: string
 *   showBalloon: boolean
 *   ※ age フィールドは vrchat-simple のブロック定義に存在しない（マイグレーション対象外）
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
function fullMigrate(data: Record<string, unknown>) {
  return migrateLegacyCardData('vrchat-simple', migrateFromOld(data) as Record<string, unknown>)
}

// friendPolicy の有効キー（旧メーカーのフィルタリング対象）
const VALID_FRIEND_POLICY_KEYS = [
  'frPolicyAnyone',
  'frPolicyAfterGettingToKnow',
  'frPolicyIfInterested',
  'frPolicyMutualsOnX',
  'frPolicyNo',
]

// interactions のデフォルト項目キー（旧メーカーの translations.ja.okNgDefaults のキー）
const DEFAULT_INTERACTION_KEYS = ['touch', 'closeRange', 'romantic', 'weapons', 'abuseViolence', 'dirtyJokes']
const DEFAULT_MARK = '-'

describe('旧メーカー実データ形式 → 2段マイグレーション テスト', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // vrchatId / twitterId / discordId
  // ──────────────────────────────────────────────────────────────────────────
  describe('SNS ID（vrchatId / twitterId / discordId）', () => {
    it('最小: すべて空文字 → vrchat/x/discord が空文字', () => {
      const result = fullMigrate({ vrchatId: '', twitterId: '', discordId: '' })
      expect(result.vrchat).toBe('')
      expect(result.x).toBe('')
      expect(result.discord).toBe('')
    })

    it('通常: 典型的なID値 → そのまま変換される', () => {
      const result = fullMigrate({ vrchatId: 'usr_abc123', twitterId: '@taro_vrc', discordId: 'taro#1234' })
      expect(result.vrchat).toBe('usr_abc123')
      expect(result.x).toBe('@taro_vrc')
      expect(result.discord).toBe('taro#1234')
    })

    it('最大: 100文字の長いID → そのまま変換される', () => {
      const long = 'a'.repeat(100)
      const result = fullMigrate({ vrchatId: long, twitterId: long, discordId: long })
      expect(result.vrchat).toBe(long)
      expect(result.x).toBe(long)
      expect(result.discord).toBe(long)
    })

    it('特殊文字（スペース・Unicode・記号）を含むID → そのまま変換される', () => {
      const special = 'ユーザー名 🎮 @#!'
      const result = fullMigrate({ vrchatId: special, twitterId: special, discordId: special })
      expect(result.vrchat).toBe(special)
      expect(result.x).toBe(special)
      expect(result.discord).toBe(special)
    })

    it('未設定 → 空文字になる', () => {
      const result = fullMigrate({})
      expect(result.vrchat).toBe('')
      expect(result.x).toBe('')
      expect(result.discord).toBe('')
    })

    it('変換後に sns キーが残らない', () => {
      const result = fullMigrate({ vrchatId: 'x', twitterId: 'y', discordId: 'z' })
      expect(result.sns).toBeUndefined()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // friendPolicy
  // ──────────────────────────────────────────────────────────────────────────
  describe('friendPolicy（旧: string[]、新: string）', () => {
    it('最小: 空配列 → 空文字', () => {
      const result = fullMigrate({ friendPolicy: [] })
      expect(result.friendPolicy).toBe('')
      expect(Array.isArray(result.friendPolicy)).toBe(false)
    })

    it('通常: 1要素の配列 → 先頭要素の string', () => {
      const result = fullMigrate({ friendPolicy: ['frPolicyAnyone'] })
      expect(result.friendPolicy).toBe('frPolicyAnyone')
    })

    it('最大: 全5種類が選択されている → 先頭要素のみ使用', () => {
      const result = fullMigrate({ friendPolicy: VALID_FRIEND_POLICY_KEYS })
      expect(result.friendPolicy).toBe('frPolicyAnyone')
      expect(Array.isArray(result.friendPolicy)).toBe(false)
    })

    it('有効キー5種類それぞれが単独選択で正しく変換される', () => {
      for (const key of VALID_FRIEND_POLICY_KEYS) {
        const result = fullMigrate({ friendPolicy: [key] })
        expect(result.friendPolicy).toBe(key)
      }
    })

    it('未設定 → 空文字', () => {
      const result = fullMigrate({})
      expect(result.friendPolicy).toBe('')
    })

    it('翻訳ラベル（日本語表示テキスト）は旧メーカーには保存されない（キーが保存される）', () => {
      // 旧メーカーは「だれでもOK」等のラベルではなく 'frPolicyAnyone' キーを保存する
      const result = fullMigrate({ friendPolicy: ['frPolicyAnyone'] })
      expect(result.friendPolicy).toBe('frPolicyAnyone')
      expect(result.friendPolicy).not.toBe('だれでもOK')
      expect(result.friendPolicy).not.toBe('Anyone is welcome')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // gender
  // ──────────────────────────────────────────────────────────────────────────
  describe('gender（string → { tag, display }）', () => {
    it('最小: 空文字 → { tag: "", display: "" }', () => {
      const result = fullMigrate({ gender: '' })
      expect(result.gender).toEqual({ tag: '', display: '' })
    })

    it('通常: 日本語性別文字列 → { tag: 値, display: "" }', () => {
      for (const g of ['男性', '女性', 'ノンバイナリー', 'その他']) {
        const result = fullMigrate({ gender: g })
        expect(result.gender).toEqual({ tag: g, display: '' })
      }
    })

    it('最大: 100文字のカスタム入力 → { tag: 値, display: "" }', () => {
      const long = 'あ'.repeat(100)
      const result = fullMigrate({ gender: long })
      expect(result.gender).toEqual({ tag: long, display: '' })
    })

    it('未設定 → { tag: "", display: "" }', () => {
      const result = fullMigrate({})
      expect(result.gender).toEqual({ tag: '', display: '' })
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // language
  // ──────────────────────────────────────────────────────────────────────────
  describe('language（string[] → { preset, custom }）', () => {
    it('最小: 空配列 → { preset: [], custom: [] }', () => {
      const result = fullMigrate({ language: [] })
      expect(result.language).toEqual({ preset: [], custom: [] })
    })

    it('通常: プリセット2言語 → { preset: [...], custom: [] }', () => {
      const result = fullMigrate({ language: ['日本語', '英語'] })
      expect(result.language).toEqual({ preset: ['日本語', '英語'], custom: [] })
    })

    it('最大: 多数の言語 → すべて preset に格納される', () => {
      const many = ['日本語', '英語', '韓国語', 'フランス語', 'スペイン語', 'ドイツ語']
      const result = fullMigrate({ language: many })
      expect(result.language).toEqual({ preset: many, custom: [] })
    })

    it('カスタム言語を含む場合 → すべて preset に格納される（custom は空）', () => {
      // 旧メーカーはプリセット・カスタムを区別せず同一配列に保存するため、
      // マイグレーション後は全要素が preset に入る
      const result = fullMigrate({ language: ['日本語', 'カスタム言語'] })
      expect(result.language).toEqual({ preset: ['日本語', 'カスタム言語'], custom: [] })
    })

    it('未設定 → { preset: [], custom: [] }', () => {
      const result = fullMigrate({})
      expect(result.language).toEqual({ preset: [], custom: [] })
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // micOnRate
  // ──────────────────────────────────────────────────────────────────────────
  describe('micOnRate（number）', () => {
    it('最小: 0 → そのまま', () => {
      const result = fullMigrate({ micOnRate: 0 })
      expect(result.micOnRate).toBe(0)
    })

    it('通常: 50 → そのまま', () => {
      const result = fullMigrate({ micOnRate: 50 })
      expect(result.micOnRate).toBe(50)
    })

    it('最大: 100 → そのまま', () => {
      const result = fullMigrate({ micOnRate: 100 })
      expect(result.micOnRate).toBe(100)
    })

    it('未設定 → 0', () => {
      const result = fullMigrate({})
      expect(result.micOnRate).toBe(0)
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // name / selfIntro
  // ──────────────────────────────────────────────────────────────────────────
  describe('name / selfIntro（string）', () => {
    it('最小: 空文字 → 空文字', () => {
      const result = fullMigrate({ name: '', selfIntro: '' })
      expect(result.name).toBe('')
      expect(result.selfIntro).toBe('')
    })

    it('通常: 日本語テキスト → そのまま', () => {
      const result = fullMigrate({ name: '太郎', selfIntro: 'よろしくお願いします！' })
      expect(result.name).toBe('太郎')
      expect(result.selfIntro).toBe('よろしくお願いします！')
    })

    it('最大: 改行・絵文字を含む長文 → そのまま', () => {
      const long = '🎮 VRChat が大好きです！\n'.repeat(10)
      const result = fullMigrate({ selfIntro: long })
      expect(result.selfIntro).toBe(long)
    })

    it('未設定 → 空文字', () => {
      const result = fullMigrate({})
      expect(result.name).toBe('')
      expect(result.selfIntro).toBe('')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // statusBlue/Green/Yellow/Red → status オブジェクト
  // ──────────────────────────────────────────────────────────────────────────
  describe('status（statusBlue/Green/Yellow/Red → status.{blue,green,yellow,red}）', () => {
    it('最小: すべて空文字 → status の各値が空文字', () => {
      const result = fullMigrate({ statusBlue: '', statusGreen: '', statusYellow: '', statusRed: '' })
      const s = result.status as Record<string, string>
      expect(s).toEqual({ blue: '', green: '', yellow: '', red: '' })
    })

    it('通常: 典型的なステータステキスト → そのまま変換', () => {
      const result = fullMigrate({
        statusBlue: '探索中', statusGreen: 'いつでも歓迎',
        statusYellow: 'ちょっと忙しい', statusRed: 'フレンド満員',
      })
      const s = result.status as Record<string, string>
      expect(s.blue).toBe('探索中')
      expect(s.green).toBe('いつでも歓迎')
      expect(s.yellow).toBe('ちょっと忙しい')
      expect(s.red).toBe('フレンド満員')
    })

    it('最大: 100文字のカスタムテキスト → そのまま変換', () => {
      const long = 'あ'.repeat(100)
      const result = fullMigrate({ statusBlue: long, statusGreen: long, statusYellow: long, statusRed: long })
      const s = result.status as Record<string, string>
      expect(s.blue).toBe(long)
    })

    it('未設定 → 各値が空文字', () => {
      const result = fullMigrate({})
      const s = result.status as Record<string, string>
      expect(s).toEqual({ blue: '', green: '', yellow: '', red: '' })
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // background（backgroundType/backgroundValue → background オブジェクト）
  // ──────────────────────────────────────────────────────────────────────────
  describe('background（backgroundType/backgroundValue → { type, value }）', () => {
    it('最小(color): 空文字の色 → { type: "color", value: "" }', () => {
      const result = fullMigrate({ backgroundType: 'color', backgroundValue: '' })
      const bg = result.background as Record<string, unknown>
      expect(bg.type).toBe('color')
      expect(bg.value).toBe('')
    })

    it('通常(color): カラーコード → { type: "color", value: "#rrggbb" }', () => {
      const result = fullMigrate({ backgroundType: 'color', backgroundValue: '#ff6b6b' })
      const bg = result.background as Record<string, unknown>
      expect(bg.type).toBe('color')
      expect(bg.value).toBe('#ff6b6b')
    })

    it('通常(gradient): 2色配列 → { type: "gradient", value: [色1, 色2] }', () => {
      const result = fullMigrate({ backgroundType: 'gradient', backgroundValue: ['#fcd5ce', '#e0f7fa'] })
      const bg = result.background as Record<string, unknown>
      expect(bg.type).toBe('gradient')
      expect(bg.value).toEqual(['#fcd5ce', '#e0f7fa'])
    })

    it('通常(image): 画像パス → { type: "image", value: "/backgrounds/bg_N.webp" }', () => {
      for (let i = 1; i <= 5; i++) {
        const path = `/backgrounds/bg_${i}.webp`
        const result = fullMigrate({ backgroundType: 'image', backgroundValue: path })
        const bg = result.background as Record<string, unknown>
        expect(bg.type).toBe('image')
        expect(bg.value).toBe(path)
      }
    })

    it('backgroundType 未設定 → background は undefined（CardEditor がデフォルトを使う）', () => {
      const result = fullMigrate({ name: '太郎' })
      expect(result.background).toBeUndefined()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // gallery（galleryEnabled → gallery.enabled）
  // ──────────────────────────────────────────────────────────────────────────
  describe('gallery（galleryEnabled → gallery.enabled）', () => {
    it('最小: galleryEnabled=false → gallery.enabled=false', () => {
      const result = fullMigrate({ galleryEnabled: false, galleryImages: [null, null, null] })
      const g = result.gallery as Record<string, unknown>
      expect(g.enabled).toBe(false)
    })

    it('通常: galleryEnabled=true → gallery.enabled=true', () => {
      const result = fullMigrate({ galleryEnabled: true, galleryImages: [null, null, null] })
      const g = result.gallery as Record<string, unknown>
      expect(g.enabled).toBe(true)
    })

    it('images は常に null 配列（File はシリアライズ不可のため）', () => {
      const result = fullMigrate({ galleryEnabled: true, galleryImages: [null, null, null] })
      const g = result.gallery as Record<string, unknown>
      expect(g.images).toEqual([null, null, null])
    })

    it('galleryImages が欠損していても gallery オブジェクトが生成される', () => {
      const result = fullMigrate({ galleryEnabled: true })
      const g = result.gallery as Record<string, unknown>
      expect(g.enabled).toBe(true)
      expect(g.images).toEqual([null, null, null])
    })

    it('galleryEnabled 未設定 → gallery は undefined', () => {
      const result = fullMigrate({ name: '太郎' })
      expect(result.gallery).toBeUndefined()
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // interactions
  // ──────────────────────────────────────────────────────────────────────────
  describe('interactions（{ label, mark, isCustom }[]）', () => {
    const defaultInteractions = DEFAULT_INTERACTION_KEYS.map(key => ({
      label: key, mark: DEFAULT_MARK, isCustom: false,
    }))

    it('最小: 空配列 → 空配列', () => {
      const result = fullMigrate({ interactions: [] })
      expect(result.interactions).toEqual([])
    })

    it('通常: デフォルト6項目（キー文字列ラベル）→ そのまま保持', () => {
      const result = fullMigrate({ interactions: defaultInteractions })
      const i = result.interactions as Array<Record<string, unknown>>
      expect(i).toHaveLength(6)
      expect(i[0]).toEqual({ label: 'touch', mark: DEFAULT_MARK, isCustom: false })
      expect(i[5]).toEqual({ label: 'dirtyJokes', mark: DEFAULT_MARK, isCustom: false })
    })

    it('通常: デフォルト6項目 + カスタム3項目 → 計9項目が保持される', () => {
      const custom = [
        { label: 'カスタム1', mark: '○', isCustom: true },
        { label: 'カスタム2', mark: '×', isCustom: true },
        { label: 'カスタム3', mark: '△', isCustom: true },
      ]
      const result = fullMigrate({ interactions: [...defaultInteractions, ...custom] })
      const i = result.interactions as Array<Record<string, unknown>>
      expect(i).toHaveLength(9)
      expect(i[6]).toEqual({ label: 'カスタム1', mark: '○', isCustom: true })
    })

    it('最大: マーク値のすべてのパターン（○ △ × - ）が保持される', () => {
      const items = [
        { label: 'touch',      mark: '○', isCustom: false },
        { label: 'closeRange', mark: '△', isCustom: false },
        { label: 'romantic',   mark: '×', isCustom: false },
        { label: 'weapons',    mark: '-',  isCustom: false },
      ]
      const result = fullMigrate({ interactions: items })
      const i = result.interactions as Array<Record<string, unknown>>
      expect(i[0].mark).toBe('○')
      expect(i[1].mark).toBe('△')
      expect(i[2].mark).toBe('×')
      expect(i[3].mark).toBe('-')
    })

    it('デフォルト項目のラベルは言語非依存のキー文字列（翻訳テキストは保存されない）', () => {
      // 旧メーカーは translations.ja.okNgDefaults のキー名を label に使う
      // 日本語表示テキスト（'触る' 等）は保存されない
      const result = fullMigrate({ interactions: defaultInteractions })
      const i = result.interactions as Array<Record<string, unknown>>
      expect(i[0].label).toBe('touch')
      expect(i[0].label).not.toBe('触る')
      expect(i[0].label).not.toBe('Touching')
    })

    it('未設定 → 空配列', () => {
      const result = fullMigrate({})
      expect(result.interactions).toEqual([])
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // 冪等性（新フォーマットを再変換しても壊れない）
  // ──────────────────────────────────────────────────────────────────────────
  describe('冪等性（新フォーマットを再変換しても同じ結果）', () => {
    it('新フォーマットのデータを migrateLegacyCardData に通しても壊れない', () => {
      const newFormat = {
        vrchat: 'vrc', x: 'tw', discord: 'disc',
        friendPolicy: 'frPolicyAnyone',
        gender: { tag: '男性', display: '' },
        language: { preset: ['日本語'], custom: [] },
        background: { type: 'gradient', value: ['#fcd5ce', '#e0f7fa'] },
        gallery: { enabled: true, images: [null, null, null], base64: [null, null, null] },
      }
      const result = migrateLegacyCardData('vrchat-simple', newFormat)
      expect(result.vrchat).toBe('vrc')
      expect(result.friendPolicy).toBe('frPolicyAnyone')
      expect((result.gender as Record<string, unknown>).tag).toBe('男性')
      expect(result.language).toEqual({ preset: ['日本語'], custom: [] })
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // エッジケース・クラッシュしないこと
  // ──────────────────────────────────────────────────────────────────────────
  describe('エッジケース', () => {
    it('完全に空のオブジェクト → クラッシュしない', () => {
      expect(() => fullMigrate({})).not.toThrow()
    })

    it('すべてのフィールドが空値 → クラッシュしない', () => {
      expect(() => fullMigrate({
        name: '', gender: '', selfIntro: '', vrchatId: '', twitterId: '', discordId: '',
        friendPolicy: [], language: [], playEnv: [], micOnRate: 0,
        statusBlue: '', statusGreen: '', statusYellow: '', statusRed: '',
        interactions: [], backgroundType: 'color', backgroundValue: '',
        galleryEnabled: false, galleryImages: [null, null, null],
      })).not.toThrow()
    })

    it('想定外の型（null 等）がフィールドに入っても クラッシュしない', () => {
      expect(() => fullMigrate({
        name: null, micOnRate: null, language: null, interactions: null,
      })).not.toThrow()
    })
  })
})
