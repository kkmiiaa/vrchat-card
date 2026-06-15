/**
 * E2E テスト用シードデータ定義
 *
 * 固定 UUID を使うことでテスト間の依存を排除し、
 * beforeAll/afterAll でのカード作成/削除を不要にする。
 *
 * シード投入: npm run seed:local
 * global-setup.ts から自動実行される（ローカルのみ）
 */

export const SEED_OTHER_USER = {
  email: 'seed-other@example.com',
  password: 'password123',
  // id は動的に決まるため undefined（挿入後に取得）
}

export const SEED_CARD_IDS = {
  /** 男性・日本語・18+・公開 */
  MALE_JP_ADULT:    'e2e00001-0000-0000-0000-000000000001',
  /** 女性・English・18歳未満・公開 */
  FEMALE_EN_MINOR:  'e2e00001-0000-0000-0000-000000000002',
  /** ノンバイナリ・日本語+English・20代（18+）・公開 */
  NB_BILINGUAL:     'e2e00001-0000-0000-0000-000000000003',
  /** 男性・日本語・非公開（検索に出ないことを確認）*/
  PRIVATE_CARD:     'e2e00001-0000-0000-0000-000000000004',
  /** キーワード検索用: 固有ワード入り自己紹介・公開 */
  KEYWORD_CARD:     'e2e00001-0000-0000-0000-000000000005',
  /** テストユーザー自身のカード（オーナー確認用）*/
  OWNER_CARD:       'e2e00001-0000-0000-0000-000000000006',
  /** 追加フィルター検証: 女性・日本語・18歳未満 */
  FEMALE_JP_MINOR:  'e2e00001-0000-0000-0000-000000000007',
  /** 追加フィルター検証: 男性・English・18+ */
  MALE_EN_ADULT:    'e2e00001-0000-0000-0000-000000000008',
}

/** E2E テストで使う一意キーワード（他のデータと衝突しないよう固定値） */
export const SEED_KEYWORD = 'e2eTestUniqueKeyword_vaacard_2026'

/** seed-other ユーザーが所有するカードのデータ定義 */
export const SEED_CARDS = [
  {
    id: SEED_CARD_IDS.MALE_JP_ADULT,
    visibility: 'public',
    template_id: 'vrchat-simple',
    card_data: {
      name: 'シードテスト太郎',
      genderTag: 'male',
      gender: { tag: 'male', display: '男性' },
      language: { preset: ['日本語'], custom: [] },
      age: { searchTag: '18+', display: '20代' },
      selfIntro: '男性・日本語・18以上のシードカード',
    },
  },
  {
    id: SEED_CARD_IDS.FEMALE_EN_MINOR,
    visibility: 'public',
    template_id: 'vrchat-simple',
    card_data: {
      name: 'Seed Hanako',
      genderTag: 'female',
      gender: { tag: 'female', display: '女性' },
      language: { preset: ['English'], custom: [] },
      age: { searchTag: '18歳未満', display: '10代' },
      selfIntro: 'Female English minor seed card',
    },
  },
  {
    id: SEED_CARD_IDS.NB_BILINGUAL,
    visibility: 'public',
    template_id: 'vrchat-simple',
    card_data: {
      name: 'シードバイリンガル',
      genderTag: 'other',
      gender: { tag: 'other', display: 'その他' },
      language: { preset: ['日本語', 'English'], custom: [] },
      age: { searchTag: '18+', display: '20代' },
      selfIntro: 'バイリンガルのシードカード',
    },
  },
  {
    id: SEED_CARD_IDS.PRIVATE_CARD,
    visibility: 'private',
    template_id: 'vrchat-simple',
    card_data: {
      name: 'シード非公開カード',
      genderTag: 'male',
      gender: { tag: 'male', display: '男性' },
      language: { preset: ['日本語'], custom: [] },
      age: { searchTag: '18+', display: '30代' },
      selfIntro: '非公開のシードカード',
    },
  },
  {
    id: SEED_CARD_IDS.KEYWORD_CARD,
    visibility: 'public',
    template_id: 'vrchat-simple',
    card_data: {
      name: `キーワード検索用_${SEED_KEYWORD}`,
      genderTag: 'female',
      gender: { tag: 'female', display: '女性' },
      language: { preset: ['日本語'], custom: [] },
      age: { searchTag: '18+', display: '20代' },
      selfIntro: SEED_KEYWORD,
    },
  },
  {
    id: SEED_CARD_IDS.FEMALE_JP_MINOR,
    visibility: 'public',
    template_id: 'vrchat-simple',
    card_data: {
      name: 'シード女性日本語未成年',
      genderTag: 'female',
      gender: { tag: 'female', display: '女性' },
      language: { preset: ['日本語'], custom: [] },
      age: { searchTag: '18歳未満', display: '10代' },
      selfIntro: '女性・日本語・18歳未満のシードカード',
    },
  },
  {
    id: SEED_CARD_IDS.MALE_EN_ADULT,
    visibility: 'public',
    template_id: 'vrchat-simple',
    card_data: {
      name: 'Seed Male English Adult',
      genderTag: 'male',
      gender: { tag: 'male', display: '男性' },
      language: { preset: ['English'], custom: [] },
      age: { searchTag: '18+', display: '30代' },
      selfIntro: 'Male English adult seed card',
    },
  },
]

/** テストユーザー自身のカード（OWNER_CARD はテストユーザーが作成） */
export const OWNER_CARD_DATA = {
  id: SEED_CARD_IDS.OWNER_CARD,
  visibility: 'public',
  template_id: 'vrchat-simple',
  card_data: {
    name: 'テストユーザーの公開カード',
    genderTag: 'male',
    gender: { tag: 'male', display: '男性' },
    language: { preset: ['日本語'], custom: [] },
    age: { searchTag: '18+', display: '20代' },
    selfIntro: 'オーナーテスト用シードカード',
  },
}
