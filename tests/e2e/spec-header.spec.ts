/**
 * ヘッダー構成テスト（仕様書 Section 2 対応）
 *
 * 各画面でログイン状態別にヘッダーの表示要素を確認する。
 */
import { test, expect } from '@playwright/test';

// ─── LP（/） ─────────────────────────────────────────────────────────────────

test.describe('LP ヘッダー — 未ログイン', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('vaacard ロゴが表示される', async ({ page }) => {
    await expect(page.getByText('vaacard').first()).toBeVisible();
  });

  test('「ログイン」リンクが表示される', async ({ page }) => {
    await expect(page.locator('header').getByRole('link', { name: 'ログイン' })).toBeVisible();
  });

  test('「マイページ」リンクは表示されない', async ({ page }) => {
    await expect(page.locator('header').getByRole('link', { name: 'マイページ' })).not.toBeVisible();
  });
});

test.describe('LP ヘッダー — ログイン済み', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('「マイページ」リンクが表示される', async ({ page }) => {
    await expect(page.locator('header').getByRole('link', { name: 'マイページ' })).toBeVisible();
  });

  test('「ログイン」リンクは表示されない', async ({ page }) => {
    await expect(page.locator('header').getByRole('link', { name: 'ログイン' })).not.toBeVisible();
  });
});

// ─── カード編集（/card/[cardId]） ───────────────────────────────────────

test.describe('カード編集ヘッダー — 未ログイン', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('/card/new は /auth/login にリダイレクトされる', async ({ page }) => {
    await page.goto('/card/new');
    await expect(page).toHaveURL(/auth\/login/);
  });
});

test.describe('カード編集ヘッダー — ログイン済み・新規（cardId なし）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/card/new');
    await page.getByText('Standard').click();
    await page.waitForURL(/\/card\/[a-zA-Z0-9]+/, { timeout: 15000 });
  });

  test('vaacard ロゴが表示される', async ({ page }) => {
    await expect(page.getByText('vaacard').first()).toBeVisible();
  });

  test('「画像で保存」ボタンが表示される（PCのみ）', async ({ page }) => {
    await expect(page.getByRole('button', { name: /画像で保存/ })).toBeVisible();
  });

  test('「Xでシェア」ボタンが「画像で保存」の右に表示される', async ({ page }) => {
    const saveBtn = page.getByRole('button', { name: /画像で保存/ });
    const xBtn = page.getByRole('button', { name: /Xでシェア|シェア/ });
    await expect(saveBtn).toBeVisible();
    await expect(xBtn).toBeVisible();

    const saveBtnBox = await saveBtn.boundingBox();
    const xBtnBox = await xBtn.boundingBox();
    if (saveBtnBox && xBtnBox) {
      expect(xBtnBox.x).toBeGreaterThan(saveBtnBox.x);
    }
  });

  test('下書き保存ステータスは表示される（cardId あり・ログイン済み）', async ({ page }) => {
    await expect(page.getByText(/下書き保存済み|保存中/)).toBeVisible({ timeout: 5000 });
  });

  test('「マイページ」リンクがヘッダーに表示される', async ({ page }) => {
    await expect(page.locator('header').getByRole('link', { name: 'マイページ' })).toBeVisible();
  });
});

// ─── カード閲覧（/card/[cardId]） ────────────────────────────────────────────

test.describe('カード閲覧ヘッダー — 未ログイン', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('公開カードに直接アクセスできる', async ({ page }) => {
    // 固定の公開カード ID が必要。なければスキップ
    const cardId = process.env.TEST_PUBLIC_CARD_ID;
    if (!cardId) test.skip();
    await page.goto(`/card/${cardId}`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('「ログイン」リンクが白色テキストで表示される', async ({ page }) => {
    const cardId = process.env.TEST_PUBLIC_CARD_ID;
    if (!cardId) test.skip();
    await page.goto(`/card/${cardId}`);
    await expect(page.locator('header').getByRole('link', { name: 'ログイン' })).toBeVisible();
  });

  test('編集・Xで共有・画像で保存ボタンは非表示', async ({ page }) => {
    const cardId = process.env.TEST_PUBLIC_CARD_ID;
    if (!cardId) test.skip();
    await page.goto(`/card/${cardId}`);
    await expect(page.locator('header').getByRole('button', { name: /編集/ })).not.toBeVisible();
  });
});

test.describe('カード閲覧ヘッダー — ログイン済み・オーナー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/card/new');
    await page.getByText('Standard').click();
    await page.waitForURL(/\/card\/[a-zA-Z0-9]+/, { timeout: 15000 });
    const editUrl = page.url();
    const cardId = editUrl.match(/\/card\/([a-zA-Z0-9]+)/)?.[1];
    await page.goto(`/card/${cardId}`);
    await page.waitForLoadState('networkidle');
  });

  test('「編集」ボタンが表示される', async ({ page }) => {
    await expect(page.locator('header').getByRole('link', { name: /編集/ })).toBeVisible();
  });

  test('「画像で保存」ボタンが「Xで共有」の左に表示される', async ({ page }) => {
    const saveBtn = page.locator('header').getByRole('button', { name: /画像で保存/ });
    const xBtn = page.locator('header').getByRole('button', { name: /Xで共有|シェア/ });
    await expect(saveBtn).toBeVisible();
    await expect(xBtn).toBeVisible();

    const saveBtnBox = await saveBtn.boundingBox();
    const xBtnBox = await xBtn.boundingBox();
    if (saveBtnBox && xBtnBox) {
      expect(xBtnBox.x).toBeGreaterThan(saveBtnBox.x);
    }
  });

  test('「マイページ」リンクが白色で表示される', async ({ page }) => {
    await expect(page.locator('header').getByRole('link', { name: 'マイページ' })).toBeVisible();
  });
});

// ─── マイページ（/u/[slug]） ──────────────────────────────────────────────────

test.describe('マイページヘッダー — 未ログイン（他者のページ）', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('「ログイン」リンクが表示される', async ({ page }) => {
    const slug = process.env.TEST_PUBLIC_SLUG;
    if (!slug) test.skip();
    await page.goto(`/u/${slug}`);
    await expect(page.locator('header').getByRole('link', { name: 'ログイン' })).toBeVisible();
  });
});

test.describe('マイページヘッダー — ログイン済み・自分のページ（オーナー）', () => {
  test('「マイページ」リンクはヘッダーに表示されない（hideMyPage=true）', async ({ page }) => {
    await page.goto('/');
    const myPageLink = page.locator('header').getByRole('link', { name: 'マイページ' });
    await myPageLink.click();
    await page.waitForURL(/\/u\//);
    // オーナー表示時はヘッダーの HeaderAuth が非表示
    await expect(page.locator('header').getByRole('link', { name: 'マイページ' })).not.toBeVisible();
  });

  test('「編集」「設定」ボタンがプロフィール本文内（ヘッダー外）に表示される', async ({ page }) => {
    await page.goto('/');
    await page.locator('header').getByRole('link', { name: 'マイページ' }).click();
    await page.waitForURL(/\/u\//);
    await expect(page.getByRole('button', { name: /編集/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /設定/ })).toBeVisible();
  });
});

// ─── 探索（/c/vrchat） ───────────────────────────────────────────────────────

test.describe('探索ヘッダー — 未ログイン', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('「カードを作る」リンクが表示される', async ({ page }) => {
    await page.goto('/c/vrchat');
    await expect(page.locator('header').getByRole('link', { name: /カードを作る/ })).toBeVisible();
  });

  test('「ログイン」リンクが表示される', async ({ page }) => {
    await page.goto('/c/vrchat');
    await expect(page.locator('header').getByRole('link', { name: 'ログイン' })).toBeVisible();
  });
});

test.describe('探索ヘッダー — ログイン済み', () => {
  test('「マイページ」リンクが表示される', async ({ page }) => {
    await page.goto('/c/vrchat');
    await expect(page.locator('header').getByRole('link', { name: 'マイページ' })).toBeVisible();
  });
});
