import { test, expect } from '@playwright/test';

/**
 * /api/cards/explore — 検索APIのインテグレーションテスト
 *
 * あるべき姿:
 * - 公開カードがexploreに返ってくること
 * - 性別・環境・言語・フレンドポリシーのフィルターが正しく機能すること
 * - フルテキスト検索が名前・自己紹介にヒットすること
 * - 非公開カードは返ってこないこと
 *
 * 注意: フィルター検索はProプランのみ有効。
 * テストユーザーがフリープランの場合、フィルターテストは vacuous になる可能性がある。
 */

const UNIQUE_TAG = `e2etest${Date.now()}`
const BASE_CARD_DATA = {
  name: `テスト太郎_${UNIQUE_TAG}`,
  genderTag: 'male',
  gender: '男性',
  playEnv: ['PCVR'],
  language: { preset: ['日本語'], custom: [] },
  friendPolicy: 'frPolicyAnyone',
  selfIntro: `e2eテスト用データ ${UNIQUE_TAG}`,
}

let publicCardId: string | null = null
let privateCardId: string | null = null

test.describe('/api/cards/explore — 検索テスト', () => {
  test.beforeAll(async ({ request }) => {
    // 公開テストカードを作成
    const res = await request.post('/api/cards', {
      data: {
        templateId: 'vrchat-simple',
        cardData: BASE_CARD_DATA,
        visibility: 'public',
        communitySlug: 'vrchat',
        communities: ['VRChat'],
      },
    });
    expect(res.ok(), `カード作成失敗: ${await res.text()}`).toBeTruthy();
    const json = await res.json();
    publicCardId = json.cardId ?? json.id;

    // 非公開テストカードを作成
    const res2 = await request.post('/api/cards', {
      data: {
        templateId: 'vrchat-simple',
        cardData: { ...BASE_CARD_DATA, name: `非公開_${UNIQUE_TAG}` },
        visibility: 'private',
        communitySlug: 'vrchat',
        communities: ['VRChat'],
      },
    });
    if (res2.ok()) {
      const res2Json = await res2.json(); privateCardId = res2Json.cardId ?? res2Json.id;
    }
  });

  test.afterAll(async ({ request }) => {
    if (publicCardId) await request.delete(`/api/cards/${publicCardId}`);
    if (privateCardId) await request.delete(`/api/cards/${privateCardId}`);
  });

  test('exploreAPIが正常なレスポンスを返す', async ({ request }) => {
    const res = await request.get('/api/cards/explore');
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(Array.isArray(json.cards)).toBeTruthy();
    expect(typeof json.isPro).toBe('boolean');
  });

  test('公開カードがexploreに含まれる', async ({ request }) => {
    if (!publicCardId) return test.skip();
    const res = await request.get('/api/cards/explore');
    const json = await res.json();
    const found = json.cards.some((c: { id: string }) => c.id === publicCardId);
    expect(found, `作成した公開カード(${publicCardId})がexploreに表示されない`).toBeTruthy();
  });

  test('非公開カードはexploreに含まれない', async ({ request }) => {
    if (!privateCardId) return test.skip();
    const res = await request.get('/api/cards/explore');
    const json = await res.json();
    const found = json.cards.some((c: { id: string }) => c.id === privateCardId);
    expect(found, '非公開カードがexploreに表示されてしまっている').toBeFalsy();
  });

  test('各カードにprofileが付与されている', async ({ request }) => {
    const res = await request.get('/api/cards/explore');
    const json = await res.json();
    if (json.cards.length === 0) return test.skip();
    // profile フィールドが存在すること（null可）
    const card = json.cards[0];
    expect('profile' in card).toBeTruthy();
  });

  test.describe('フィルター検索（Proプランのみ有効）', () => {
    test('性別フィルターで絞り込める', async ({ request }) => {
      if (!publicCardId) return test.skip();
      const res = await request.get('/api/cards/explore?gender=male');
      const json = await res.json();
      if (!json.isPro) return test.skip(); // フリープランはスキップ

      const found = json.cards.some((c: { id: string }) => c.id === publicCardId);
      expect(found, '性別フィルターで作成済みカードがヒットしない').toBeTruthy();

      // 非一致の性別では返ってこないこと
      const res2 = await request.get('/api/cards/explore?gender=female');
      const json2 = await res2.json();
      const notFound = !json2.cards.some((c: { id: string }) => c.id === publicCardId);
      expect(notFound, '性別フィルターが効いていない（女性検索で男性カードがヒットした）').toBeTruthy();
    });

    test('使用環境フィルターで絞り込める', async ({ request }) => {
      if (!publicCardId) return test.skip();
      const res = await request.get('/api/cards/explore?env=PCVR');
      const json = await res.json();
      if (!json.isPro) return test.skip();

      const found = json.cards.some((c: { id: string }) => c.id === publicCardId);
      expect(found, '使用環境フィルターで作成済みカードがヒットしない').toBeTruthy();

      const res2 = await request.get('/api/cards/explore?env=Quest');
      const json2 = await res2.json();
      const notFound = !json2.cards.some((c: { id: string }) => c.id === publicCardId);
      expect(notFound, '使用環境フィルターが効いていない').toBeTruthy();
    });

    test('言語フィルターで絞り込める', async ({ request }) => {
      if (!publicCardId) return test.skip();
      const res = await request.get('/api/cards/explore?lang=日本語');
      const json = await res.json();
      if (!json.isPro) return test.skip();

      const found = json.cards.some((c: { id: string }) => c.id === publicCardId);
      expect(found, '言語フィルターで作成済みカードがヒットしない').toBeTruthy();
    });

    test('フレンドポリシーフィルターで絞り込める', async ({ request }) => {
      if (!publicCardId) return test.skip();
      const res = await request.get('/api/cards/explore?friendPolicy=frPolicyAnyone');
      const json = await res.json();
      if (!json.isPro) return test.skip();

      const found = json.cards.some((c: { id: string }) => c.id === publicCardId);
      expect(found, 'フレンドポリシーフィルターで作成済みカードがヒットしない').toBeTruthy();
    });

    test('名前でフルテキスト検索できる', async ({ request }) => {
      if (!publicCardId) return test.skip();
      const res = await request.get(`/api/cards/explore?q=${encodeURIComponent(UNIQUE_TAG)}`);
      const json = await res.json();
      if (!json.isPro) return test.skip();

      const found = json.cards.some((c: { id: string }) => c.id === publicCardId);
      expect(found, 'フルテキスト検索で作成済みカードがヒットしない').toBeTruthy();
    });

    test('複数フィルターの組み合わせで絞り込める', async ({ request }) => {
      if (!publicCardId) return test.skip();
      const res = await request.get('/api/cards/explore?gender=male&env=PCVR&lang=日本語');
      const json = await res.json();
      if (!json.isPro) return test.skip();

      const found = json.cards.some((c: { id: string }) => c.id === publicCardId);
      expect(found, '複合フィルターで作成済みカードがヒットしない').toBeTruthy();
    });
  });
});
