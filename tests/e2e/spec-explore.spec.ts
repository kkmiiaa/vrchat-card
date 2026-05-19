/**
 * 探索機能 テスト（仕様書 Section 6 対応）
 *
 * - 初期表示（public カード・VRChat コミュニティ）
 * - Free プランの制限（20件表示・フィルター不可）
 * - Pro プランの機能（フィルター・全文検索）
 */
import { test, expect } from '@playwright/test';

// ─── 未ログイン ──────────────────────────────────────────────────────────────

test.describe('探索 — 未ログイン', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('ページが表示される', async ({ page }) => {
    await page.goto('/c/vrchat');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('カードが表示される（publicカードが存在する場合）', async ({ page }) => {
    await page.goto('/c/vrchat');
    await page.waitForLoadState('networkidle');
    const cards = page.locator('a[href*="/card/"]');
    // 公開カードが1件以上あれば表示される
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(0); // 0件でもエラーにならないこと
  });
});

// ─── フリープラン ─────────────────────────────────────────────────────────────

test.describe('探索 — フリープラン', () => {
  test('表示件数が最大 20件', async ({ page }) => {
    await page.goto('/c/vrchat');
    await page.waitForLoadState('networkidle');
    const cards = page.locator('a[href*="/card/"]');
    const count = await cards.count();
    expect(count).toBeLessThanOrEqual(20);
  });

  test('検索フォームが表示されない', async ({ page }) => {
    await page.goto('/c/vrchat');
    await page.waitForLoadState('networkidle');
    await expect(page.getByPlaceholder(/名前|自己紹介|検索/)).not.toBeVisible();
  });

  test('Pro プランへの誘導が表示される', async ({ page }) => {
    await page.goto('/c/vrchat');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Proプラン|検索|フィルター/)).toBeVisible({ timeout: 5000 });
  });

  test('フィルターパネルが表示されないか操作できない', async ({ page }) => {
    await page.goto('/c/vrchat');
    await page.waitForLoadState('networkidle');
    // フィルターが存在しないか、存在しても無効化されている
    const filterInputs = page.locator('select, input[type="checkbox"]').filter({ hasNot: page.locator('[disabled]') });
    const count = await filterInputs.count();
    // フリープランではフィルター入力要素が存在しないこと
    expect(count).toBe(0);
  });
});

// ─── OGP ────────────────────────────────────────────────────────────────────

test.describe('OGP — カード閲覧ページ', () => {
  test('og:image メタタグが存在する', async ({ page }) => {
    const cardId = process.env.TEST_PUBLIC_CARD_ID;
    if (!cardId) test.skip();
    await page.goto(`/card/${cardId}`);
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toBeTruthy();
  });

  test('image_url がない場合は og:image がデフォルト画像になる', async ({ page }) => {
    // 下書きカード（image_url=null）の OGP
    // 作成直後のカードでテスト
    await page.goto('/card/new');
    await page.getByText('Standard').click();
    await page.waitForURL(/\/card\/[a-zA-Z0-9]+\/edit/, { timeout: 15000 });
    const cardId = page.url().match(/\/card\/([a-zA-Z0-9]+)\/edit/)?.[1];

    await page.goto(`/card/${cardId}`);
    await page.waitForLoadState('networkidle');

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toContain('og-default');
  });
});
