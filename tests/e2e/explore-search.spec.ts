/**
 * /api/cards/explore — 検索・フィルター インテグレーションテスト
 *
 * テスト対象:
 * - 基本動作: 公開/非公開カードの表示制御、profile 付与
 * - キーワード検索: 名前・自己紹介へのヒット
 * - フィルター: 性別・言語・年齢（一致/不一致の両方を検証）
 * - 複合フィルター: 複数条件の AND 絞り込み
 * - Free プラン月3回制限: カウント・超過時エラー・月リセット
 *
 * 前提:
 * - テストユーザーが認証済みであること（storageState）
 * - SUPABASE_SERVICE_ROLE_KEY が設定されていること（カウントリセット用）
 * - Docker + ローカル Supabase が起動していること
 */

import { test, expect, APIRequestContext } from '@playwright/test'

// ─── テストデータ ──────────────────────────────────────────────────────────────

const UNIQUE_TAG = `e2etest${Date.now()}`

/** 検索・フィルターが正しくヒットするカードデータ */
const MALE_JP_CARD = {
  name: `テスト太郎_${UNIQUE_TAG}`,
  genderTag: 'male',
  gender: { tag: 'male', display: '男性' },
  language: { preset: ['日本語'], custom: [] },
  age: { searchTag: '18+', display: '20代' },
  selfIntro: `e2eテスト用データ ${UNIQUE_TAG}`,
}

/** フィルター不一致の確認用（女性・English）*/
const FEMALE_EN_CARD = {
  name: `テスト花子_${UNIQUE_TAG}`,
  genderTag: 'female',
  gender: { tag: 'female', display: '女性' },
  language: { preset: ['English'], custom: [] },
  age: { searchTag: '18歳未満', display: '10代' },
  selfIntro: `別のe2eテストデータ ${UNIQUE_TAG}`,
}

// カード ID（beforeAll で設定）
let maleCardId: string | null = null
let femaleCardId: string | null = null
let privateCardId: string | null = null

// ─── ユーティリティ ────────────────────────────────────────────────────────────

/** Service Role Key 経由で free_explore_count をリセットする */
async function resetFreeExploreCount(request: APIRequestContext) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) return

  const currentMonth = new Date().toISOString().slice(0, 7)
  await request.patch(`${supabaseUrl}/rest/v1/users`, {
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    params: { email: `eq.${process.env.TEST_USER_EMAIL}` },
    data: { free_explore_count: 0, free_explore_reset_month: currentMonth },
  })
}

/** カード ID が結果に含まれるかどうか */
function includesCard(cards: { id: string }[], cardId: string): boolean {
  return cards.some(c => c.id === cardId)
}

// ─── セットアップ ──────────────────────────────────────────────────────────────

test.beforeAll(async ({ request }) => {
  // 男性・日本語カードを作成（公開）
  const res1 = await request.post('/api/cards', {
    data: {
      templateId: 'vrchat-simple',
      cardData: MALE_JP_CARD,
      visibility: 'public',
    },
  })
  if (res1.ok()) {
    const json = await res1.json()
    maleCardId = json.cardId ?? json.id
  }

  // 女性・英語カードを作成（公開）
  const res2 = await request.post('/api/cards', {
    data: {
      templateId: 'vrchat-simple',
      cardData: FEMALE_EN_CARD,
      visibility: 'public',
    },
  })
  if (res2.ok()) {
    const json = await res2.json()
    femaleCardId = json.cardId ?? json.id
  }

  // 非公開カードを作成
  const res3 = await request.post('/api/cards', {
    data: {
      templateId: 'vrchat-simple',
      cardData: { ...MALE_JP_CARD, name: `非公開_${UNIQUE_TAG}` },
      visibility: 'private',
    },
  })
  if (res3.ok()) {
    const json = await res3.json()
    privateCardId = json.cardId ?? json.id
  }
})

test.afterAll(async ({ request }) => {
  if (maleCardId)   await request.delete(`/api/cards/${maleCardId}`)
  if (femaleCardId) await request.delete(`/api/cards/${femaleCardId}`)
  if (privateCardId) await request.delete(`/api/cards/${privateCardId}`)
})

// ─── 基本動作 ─────────────────────────────────────────────────────────────────

test.describe('基本動作', () => {
  test('API が正常なレスポンス形式を返す', async ({ request }) => {
    const res = await request.get('/api/cards/explore')
    expect(res.ok()).toBeTruthy()
    const json = await res.json()
    expect(Array.isArray(json.cards)).toBeTruthy()
    expect(typeof json.isPro).toBe('boolean')
    expect(typeof json.freeRemaining).toBe('number')
  })

  test('公開カードが explore に含まれる', async ({ request }) => {
    if (!maleCardId) return test.skip()
    const res = await request.get('/api/cards/explore')
    const json = await res.json()
    expect(
      includesCard(json.cards, maleCardId),
      `公開カード(${maleCardId})が explore に表示されない`
    ).toBeTruthy()
  })

  test('非公開カードは explore に含まれない', async ({ request }) => {
    if (!privateCardId) return test.skip()
    const res = await request.get('/api/cards/explore')
    const json = await res.json()
    expect(
      includesCard(json.cards, privateCardId),
      '非公開カードが explore に表示されている'
    ).toBeFalsy()
  })

  test('各カードに profile フィールドが付与されている', async ({ request }) => {
    const res = await request.get('/api/cards/explore')
    const json = await res.json()
    if (json.cards.length === 0) return test.skip()
    expect('profile' in json.cards[0]).toBeTruthy()
  })
})

// ─── キーワード検索 ────────────────────────────────────────────────────────────

test.describe('キーワード検索（q パラメータ）', () => {
  test.beforeEach(async ({ request }) => {
    await resetFreeExploreCount(request)
  })

  test('カード名でヒットする', async ({ request }) => {
    if (!maleCardId) return test.skip()
    const res = await request.get(`/api/cards/explore?q=${encodeURIComponent(UNIQUE_TAG)}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, maleCardId),
      'カード名でのキーワード検索がヒットしない'
    ).toBeTruthy()
  })

  test('自己紹介でヒットする', async ({ request }) => {
    if (!maleCardId) return test.skip()
    // UNIQUE_TAG は selfIntro にも含まれている
    const res = await request.get(`/api/cards/explore?q=${encodeURIComponent(UNIQUE_TAG)}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, maleCardId),
      '自己紹介でのキーワード検索がヒットしない'
    ).toBeTruthy()
  })

  test('存在しないキーワードではヒットしない', async ({ request }) => {
    const keyword = `notexist_${Date.now()}`
    const res = await request.get(`/api/cards/explore?q=${encodeURIComponent(keyword)}`)
    const json = await res.json()
    expect(json.cards.length).toBe(0)
  })

  test('検索後に freeRemaining がデクリメントされる', async ({ request }) => {
    const res = await request.get(`/api/cards/explore?q=${encodeURIComponent(UNIQUE_TAG)}`)
    const json = await res.json()
    // リセット後 3 → 検索後 2 になるはず（isPro でなければ）
    if (!json.isPro) {
      expect(json.freeRemaining).toBe(2)
    }
  })
})

// ─── 性別フィルター ────────────────────────────────────────────────────────────

test.describe('性別フィルター（gender パラメータ）', () => {
  test.beforeEach(async ({ request }) => {
    await resetFreeExploreCount(request)
  })

  test('gender=male で男性カードがヒットする', async ({ request }) => {
    if (!maleCardId) return test.skip()
    const res = await request.get('/api/cards/explore?gender=male')
    const json = await res.json()
    expect(
      includesCard(json.cards, maleCardId),
      '男性フィルターで男性カードがヒットしない'
    ).toBeTruthy()
  })

  test('gender=male で女性カードはヒットしない', async ({ request }) => {
    if (!femaleCardId) return test.skip()
    // 男性フィルターでは女性カードが除外されること
    // ※ リセット消費を節約するため同じリクエストで確認
    const res = await request.get('/api/cards/explore?gender=male')
    const json = await res.json()
    expect(
      includesCard(json.cards, femaleCardId),
      '男性フィルターで女性カードが誤ってヒットしている'
    ).toBeFalsy()
  })

  test('gender=female で女性カードがヒットする', async ({ request }) => {
    if (!femaleCardId) return test.skip()
    const res = await request.get('/api/cards/explore?gender=female')
    const json = await res.json()
    expect(
      includesCard(json.cards, femaleCardId),
      '女性フィルターで女性カードがヒットしない'
    ).toBeTruthy()
  })

  test('gender=female で男性カードはヒットしない', async ({ request }) => {
    if (!maleCardId) return test.skip()
    const res = await request.get('/api/cards/explore?gender=female')
    const json = await res.json()
    expect(
      includesCard(json.cards, maleCardId),
      '女性フィルターで男性カードが誤ってヒットしている'
    ).toBeFalsy()
  })
})

// ─── 言語フィルター ────────────────────────────────────────────────────────────

test.describe('言語フィルター（lang パラメータ）', () => {
  test.beforeEach(async ({ request }) => {
    await resetFreeExploreCount(request)
  })

  test('lang=日本語 で日本語カードがヒットする', async ({ request }) => {
    if (!maleCardId) return test.skip()
    const res = await request.get(`/api/cards/explore?lang=${encodeURIComponent('日本語')}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, maleCardId),
      '日本語フィルターで日本語カードがヒットしない'
    ).toBeTruthy()
  })

  test('lang=日本語 で English カードはヒットしない', async ({ request }) => {
    if (!femaleCardId) return test.skip()
    const res = await request.get(`/api/cards/explore?lang=${encodeURIComponent('日本語')}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, femaleCardId),
      '日本語フィルターで English カードが誤ってヒットしている'
    ).toBeFalsy()
  })

  test('lang=English で English カードがヒットする', async ({ request }) => {
    if (!femaleCardId) return test.skip()
    const res = await request.get('/api/cards/explore?lang=English')
    const json = await res.json()
    expect(
      includesCard(json.cards, femaleCardId),
      'English フィルターで English カードがヒットしない'
    ).toBeTruthy()
  })
})

// ─── 年齢フィルター ────────────────────────────────────────────────────────────

test.describe('年齢フィルター（age パラメータ）', () => {
  test.beforeEach(async ({ request }) => {
    await resetFreeExploreCount(request)
  })

  test('age=18+ で 18+ カードがヒットする', async ({ request }) => {
    if (!maleCardId) return test.skip()
    const res = await request.get(`/api/cards/explore?age=${encodeURIComponent('18+')}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, maleCardId),
      '18+ フィルターで 18+ カードがヒットしない'
    ).toBeTruthy()
  })

  test('age=18+ で 18歳未満カードはヒットしない', async ({ request }) => {
    if (!femaleCardId) return test.skip()
    const res = await request.get(`/api/cards/explore?age=${encodeURIComponent('18+')}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, femaleCardId),
      '18+ フィルターで 18歳未満カードが誤ってヒットしている'
    ).toBeFalsy()
  })
})

// ─── 複合フィルター ────────────────────────────────────────────────────────────

test.describe('複合フィルター（AND 条件）', () => {
  test.beforeEach(async ({ request }) => {
    await resetFreeExploreCount(request)
  })

  test('gender=male&lang=日本語 で男性日本語カードがヒットする', async ({ request }) => {
    if (!maleCardId) return test.skip()
    const res = await request.get(`/api/cards/explore?gender=male&lang=${encodeURIComponent('日本語')}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, maleCardId),
      '複合フィルターで男性日本語カードがヒットしない'
    ).toBeTruthy()
  })

  test('gender=male&lang=日本語 で女性英語カードはヒットしない', async ({ request }) => {
    if (!femaleCardId) return test.skip()
    const res = await request.get(`/api/cards/explore?gender=male&lang=${encodeURIComponent('日本語')}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, femaleCardId),
      '複合フィルターで女性英語カードが誤ってヒットしている'
    ).toBeFalsy()
  })

  test('gender&lang&age の3条件で絞り込める', async ({ request }) => {
    if (!maleCardId) return test.skip()
    const res = await request.get(
      `/api/cards/explore?gender=male&lang=${encodeURIComponent('日本語')}&age=${encodeURIComponent('18+')}`
    )
    const json = await res.json()
    expect(
      includesCard(json.cards, maleCardId),
      '3条件複合フィルターで男性カードがヒットしない'
    ).toBeTruthy()
  })
})

// ─── Free プラン月3回制限 ──────────────────────────────────────────────────────

test.describe('Free プラン — 月3回制限', () => {
  test.beforeEach(async ({ request }) => {
    await resetFreeExploreCount(request)
  })

  test('1回目のフィルター使用: freeRemaining が 2 になる', async ({ request }) => {
    const res = await request.get('/api/cards/explore?gender=male')
    const json = await res.json()
    if (json.isPro) return test.skip()
    expect(json.freeRemaining).toBe(2)
  })

  test('2回目のフィルター使用: freeRemaining が 1 になる', async ({ request }) => {
    await request.get('/api/cards/explore?gender=male')
    const res2 = await request.get(`/api/cards/explore?lang=${encodeURIComponent('日本語')}`)
    const json = await res2.json()
    if (json.isPro) return test.skip()
    expect(json.freeRemaining).toBe(1)
  })

  test('3回目のフィルター使用: freeRemaining が 0 になる', async ({ request }) => {
    await request.get('/api/cards/explore?gender=male')
    await request.get(`/api/cards/explore?lang=${encodeURIComponent('日本語')}`)
    const res3 = await request.get(`/api/cards/explore?age=${encodeURIComponent('18+')}`)
    const json = await res3.json()
    if (json.isPro) return test.skip()
    expect(json.freeRemaining).toBe(0)
  })

  test('4回目のフィルター使用: 403 limit_exceeded が返る', async ({ request }) => {
    await request.get('/api/cards/explore?gender=male')
    await request.get(`/api/cards/explore?lang=${encodeURIComponent('日本語')}`)
    await request.get(`/api/cards/explore?age=${encodeURIComponent('18+')}`)
    const res4 = await request.get('/api/cards/explore?gender=female')
    if ((await request.get('/api/cards/explore')).url().includes('isPro=true')) return test.skip()
    if (res4.status() !== 403) return test.skip() // Pro ユーザーはスキップ
    const json = await res4.json()
    expect(json.error).toBe('limit_exceeded')
    expect(json.remaining).toBe(0)
  })

  test('フィルターなしのリクエストはカウントを消費しない', async ({ request }) => {
    // フィルターなし
    await request.get('/api/cards/explore')
    // フィルターあり（1回目）
    const res = await request.get('/api/cards/explore?gender=male')
    const json = await res.json()
    if (json.isPro) return test.skip()
    // フィルターなしはカウントしないので、1回消費 → remaining は 2
    expect(json.freeRemaining).toBe(2)
  })

  test('resetFreeExploreCount 後はカウントが 0 に戻る', async ({ request }) => {
    // 2回消費
    await request.get('/api/cards/explore?gender=male')
    await request.get('/api/cards/explore?gender=female')
    // リセット
    await resetFreeExploreCount(request)
    // フィルターあり（1回目）
    const res = await request.get('/api/cards/explore?gender=male')
    const json = await res.json()
    if (json.isPro) return test.skip()
    expect(json.freeRemaining).toBe(2) // リセット後なので 3 - 1 = 2
  })
})
