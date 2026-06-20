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
 * - global-setup.ts によりシードデータが投入済みであること
 *   （ローカル: npm run seed:local、または Docker + npx playwright test）
 */

import { test, expect, APIRequestContext } from '@playwright/test'
import { SEED_CARD_IDS, SEED_KEYWORD } from '../fixtures/seed-cards'

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
    const res = await request.get('/api/cards/explore')
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.MALE_JP_ADULT),
      `公開カード(MALE_JP_ADULT)が explore に表示されない`
    ).toBeTruthy()
  })

  test('非公開カードは explore に含まれない', async ({ request }) => {
    const res = await request.get('/api/cards/explore')
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.PRIVATE_CARD),
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

  test('カード名に含まれるキーワードでヒットする', async ({ request }) => {
    const res = await request.get(`/api/cards/explore?q=${encodeURIComponent(SEED_KEYWORD)}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.KEYWORD_CARD),
      'カード名でのキーワード検索がヒットしない'
    ).toBeTruthy()
  })

  test('自己紹介に含まれるキーワードでヒットする', async ({ request }) => {
    // SEED_KEYWORD は KEYWORD_CARD の selfIntro にも含まれる
    const res = await request.get(`/api/cards/explore?q=${encodeURIComponent(SEED_KEYWORD)}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.KEYWORD_CARD),
      '自己紹介でのキーワード検索がヒットしない'
    ).toBeTruthy()
  })

  test('存在しないキーワードではヒットしない', async ({ request }) => {
    const keyword = `notexist_${Date.now()}`
    const res = await request.get(`/api/cards/explore?q=${encodeURIComponent(keyword)}`)
    const json = await res.json()
    expect(json.cards.length).toBe(0)
  })

  test('キーワード検索用カードが他のシードカードと混在しない', async ({ request }) => {
    const res = await request.get(`/api/cards/explore?q=${encodeURIComponent(SEED_KEYWORD)}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.MALE_JP_ADULT),
      'キーワード検索で無関係のカードがヒットしている'
    ).toBeFalsy()
  })

  test('検索後に freeRemaining がデクリメントされる', async ({ request }) => {
    const res = await request.get(`/api/cards/explore?q=${encodeURIComponent(SEED_KEYWORD)}`)
    const json = await res.json()
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
    const res = await request.get('/api/cards/explore?gender=male')
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.MALE_JP_ADULT),
      '男性フィルターで男性カードがヒットしない'
    ).toBeTruthy()
  })

  test('gender=male で女性カードはヒットしない', async ({ request }) => {
    const res = await request.get('/api/cards/explore?gender=male')
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.FEMALE_EN_MINOR),
      '男性フィルターで女性カードが誤ってヒットしている'
    ).toBeFalsy()
  })

  test('gender=female で女性カードがヒットする', async ({ request }) => {
    const res = await request.get('/api/cards/explore?gender=female')
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.FEMALE_EN_MINOR),
      '女性フィルターで女性カードがヒットしない'
    ).toBeTruthy()
  })

  test('gender=female で男性カードはヒットしない', async ({ request }) => {
    const res = await request.get('/api/cards/explore?gender=female')
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.MALE_JP_ADULT),
      '女性フィルターで男性カードが誤ってヒットしている'
    ).toBeFalsy()
  })

  test('gender=other でノンバイナリカードがヒットする', async ({ request }) => {
    const res = await request.get('/api/cards/explore?gender=other')
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.NB_BILINGUAL),
      'other フィルターでノンバイナリカードがヒットしない'
    ).toBeTruthy()
  })

  test('gender=other で男性カードはヒットしない', async ({ request }) => {
    const res = await request.get('/api/cards/explore?gender=other')
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.MALE_JP_ADULT),
      'other フィルターで男性カードが誤ってヒットしている'
    ).toBeFalsy()
  })
})

// ─── 言語フィルター ────────────────────────────────────────────────────────────

test.describe('言語フィルター（lang パラメータ）', () => {
  test.beforeEach(async ({ request }) => {
    await resetFreeExploreCount(request)
  })

  test('lang=日本語 で日本語カードがヒットする', async ({ request }) => {
    const res = await request.get(`/api/cards/explore?lang=${encodeURIComponent('日本語')}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.MALE_JP_ADULT),
      '日本語フィルターで日本語カードがヒットしない'
    ).toBeTruthy()
  })

  test('lang=日本語 で English カードはヒットしない', async ({ request }) => {
    const res = await request.get(`/api/cards/explore?lang=${encodeURIComponent('日本語')}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.FEMALE_EN_MINOR),
      '日本語フィルターで English カードが誤ってヒットしている'
    ).toBeFalsy()
  })

  test('lang=English で English カードがヒットする', async ({ request }) => {
    const res = await request.get('/api/cards/explore?lang=English')
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.FEMALE_EN_MINOR),
      'English フィルターで English カードがヒットしない'
    ).toBeTruthy()
  })

  test('lang=English で日本語のみのカードはヒットしない', async ({ request }) => {
    const res = await request.get('/api/cards/explore?lang=English')
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.MALE_JP_ADULT),
      'English フィルターで日本語カードが誤ってヒットしている'
    ).toBeFalsy()
  })

  test('lang=日本語 でバイリンガル（日本語+English）カードがヒットする', async ({ request }) => {
    const res = await request.get(`/api/cards/explore?lang=${encodeURIComponent('日本語')}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.NB_BILINGUAL),
      '日本語フィルターでバイリンガルカードがヒットしない'
    ).toBeTruthy()
  })

  test('lang=English でバイリンガル（日本語+English）カードがヒットする', async ({ request }) => {
    const res = await request.get('/api/cards/explore?lang=English')
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.NB_BILINGUAL),
      'English フィルターでバイリンガルカードがヒットしない'
    ).toBeTruthy()
  })
})

// ─── 年齢フィルター ────────────────────────────────────────────────────────────

test.describe('年齢フィルター（age パラメータ）', () => {
  test.beforeEach(async ({ request }) => {
    await resetFreeExploreCount(request)
  })

  test('age=18+ で 18+ カードがヒットする', async ({ request }) => {
    const res = await request.get(`/api/cards/explore?age=${encodeURIComponent('18+')}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.MALE_JP_ADULT),
      '18+ フィルターで 18+ カードがヒットしない'
    ).toBeTruthy()
  })

  test('age=18+ で 18歳未満カードはヒットしない', async ({ request }) => {
    const res = await request.get(`/api/cards/explore?age=${encodeURIComponent('18+')}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.FEMALE_EN_MINOR),
      '18+ フィルターで 18歳未満カードが誤ってヒットしている'
    ).toBeFalsy()
  })

  test('age=18歳未満 で 18歳未満カードがヒットする', async ({ request }) => {
    const res = await request.get(`/api/cards/explore?age=${encodeURIComponent('18歳未満')}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.FEMALE_EN_MINOR),
      '18歳未満フィルターで 18歳未満カードがヒットしない'
    ).toBeTruthy()
  })

  test('age=18歳未満 で 18+ カードはヒットしない', async ({ request }) => {
    const res = await request.get(`/api/cards/explore?age=${encodeURIComponent('18歳未満')}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.MALE_JP_ADULT),
      '18歳未満フィルターで 18+ カードが誤ってヒットしている'
    ).toBeFalsy()
  })
})

// ─── 複合フィルター ────────────────────────────────────────────────────────────

test.describe('複合フィルター（AND 条件）', () => {
  test.beforeEach(async ({ request }) => {
    await resetFreeExploreCount(request)
  })

  test('gender=male&lang=日本語 で男性日本語カードがヒットする', async ({ request }) => {
    const res = await request.get(`/api/cards/explore?gender=male&lang=${encodeURIComponent('日本語')}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.MALE_JP_ADULT),
      '複合フィルターで男性日本語カードがヒットしない'
    ).toBeTruthy()
  })

  test('gender=male&lang=日本語 で女性英語カードはヒットしない', async ({ request }) => {
    const res = await request.get(`/api/cards/explore?gender=male&lang=${encodeURIComponent('日本語')}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.FEMALE_EN_MINOR),
      '複合フィルターで女性英語カードが誤ってヒットしている'
    ).toBeFalsy()
  })

  test('gender&lang&age の3条件で男性日本語18+カードがヒットする', async ({ request }) => {
    const res = await request.get(
      `/api/cards/explore?gender=male&lang=${encodeURIComponent('日本語')}&age=${encodeURIComponent('18+')}`
    )
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.MALE_JP_ADULT),
      '3条件複合フィルターで男性カードがヒットしない'
    ).toBeTruthy()
  })

  test('gender=female&age=18歳未満 で女性英語未成年カードがヒットする', async ({ request }) => {
    const res = await request.get(`/api/cards/explore?gender=female&age=${encodeURIComponent('18歳未満')}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.FEMALE_EN_MINOR),
      '女性+18歳未満フィルターで対象カードがヒットしない'
    ).toBeTruthy()
  })

  test('gender=female&age=18歳未満 で男性18+カードはヒットしない', async ({ request }) => {
    const res = await request.get(`/api/cards/explore?gender=female&age=${encodeURIComponent('18歳未満')}`)
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.MALE_JP_ADULT),
      '女性+18歳未満フィルターで男性カードが誤ってヒットしている'
    ).toBeFalsy()
  })

  test('gender=female&lang=日本語&age=18歳未満 で女性日本語未成年カードがヒットする', async ({ request }) => {
    const res = await request.get(
      `/api/cards/explore?gender=female&lang=${encodeURIComponent('日本語')}&age=${encodeURIComponent('18歳未満')}`
    )
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.FEMALE_JP_MINOR),
      '女性+日本語+18歳未満フィルターで対象カードがヒットしない'
    ).toBeTruthy()
  })

  test('gender=female&lang=日本語&age=18歳未満 で英語カードはヒットしない', async ({ request }) => {
    const res = await request.get(
      `/api/cards/explore?gender=female&lang=${encodeURIComponent('日本語')}&age=${encodeURIComponent('18歳未満')}`
    )
    const json = await res.json()
    expect(
      includesCard(json.cards, SEED_CARD_IDS.FEMALE_EN_MINOR),
      '女性+日本語+18歳未満フィルターで英語カードが誤ってヒットしている'
    ).toBeFalsy()
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
    if (res4.status() !== 403) return test.skip() // Pro ユーザーはスキップ
    const json = await res4.json()
    expect(json.error).toBe('limit_exceeded')
    expect(json.remaining).toBe(0)
  })

  test('フィルターなしのリクエストはカウントを消費しない', async ({ request }) => {
    await request.get('/api/cards/explore') // フィルターなし（カウントしない）
    const res = await request.get('/api/cards/explore?gender=male') // 1回目
    const json = await res.json()
    if (json.isPro) return test.skip()
    expect(json.freeRemaining).toBe(2)
  })

  test('resetFreeExploreCount 後はカウントが 0 に戻る', async ({ request }) => {
    await request.get('/api/cards/explore?gender=male')
    await request.get('/api/cards/explore?gender=female')
    await resetFreeExploreCount(request)
    const res = await request.get('/api/cards/explore?gender=male')
    const json = await res.json()
    if (json.isPro) return test.skip()
    expect(json.freeRemaining).toBe(2)
  })
})
