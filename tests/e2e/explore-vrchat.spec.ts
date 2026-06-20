import { test, expect } from '@playwright/test';

/**
 * /c/vrchat — VRChat界隈 探すページ テスト
 *
 * あるべき姿（SPEC.md 参照）:
 * - ログイン不要で閲覧できる
 * - タイトル「VRChat 界隈のユーザーをみつける」が表示される
 * - ヘッダー: ロゴ・カードを作る・ログイン（未ログイン）/ ロゴ・カードを作る・マイページ（ログイン済み）
 * - 未ログイン・フリープラン: 最新20件のみ表示、検索不可、ログイン/Proへの促進バナーを表示
 * - プロプラン: 検索・フィルター・人気順ソートが使える
 * - カードのユーザー名はプロフィールから取得する（card_data.nameではない）
 */

test.describe('/c/vrchat — 基本表示', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/c/vrchat');
    await page.waitForLoadState('networkidle');
  });

  test('ログインページにリダイレクトされない', async ({ page }) => {
    await expect(page).not.toHaveURL(/auth\/login/);
  });

  test('ページタイトルが正しい', async ({ page }) => {
    await expect(page).toHaveTitle(/VRChat 界隈のユーザーをみつける/);
  });

  test('見出しが表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'VRChat 界隈のユーザーをみつける' })).toBeVisible();
  });

  test('500エラーが発生していない', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });
});

test.describe('/c/vrchat — ヘッダー（未ログイン）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/c/vrchat');
    await page.waitForLoadState('networkidle');
  });

  test('vaacardロゴが表示される', async ({ page }) => {
    await expect(page.locator('header').getByRole('link', { name: 'vaacard' })).toBeVisible();
  });

  test('「カードを作る」ボタンが表示される', async ({ page }) => {
    await expect(page.locator('header').getByRole('link', { name: 'カードを作る' })).toBeVisible();
  });

  test('「ログイン」リンクが表示される', async ({ page }) => {
    const loginLink = page.locator('header').getByRole('link', { name: /ログイン/i });
    await expect(loginLink).toBeVisible();
  });
});

test.describe('/c/vrchat — 未ログイン時の制限', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/c/vrchat');
    await page.waitForLoadState('networkidle');
  });

  test('検索フォームが表示されない', async ({ page }) => {
    await expect(page.getByPlaceholder('名前・自己紹介で検索...')).not.toBeVisible();
  });

  test('ログイン促進バナーが表示される', async ({ page }) => {
    await expect(page.getByText('ログインすると検索機能が利用できます')).toBeVisible();
  });

  test('バナーにログインリンクが表示される', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: 'ログイン' }).nth(1);
    await expect(loginLink).toBeVisible();
  });

  test('件数表示に「最新20件」と表示される', async ({ page }) => {
    await expect(page.getByText('最新20件')).toBeVisible();
  });
});
