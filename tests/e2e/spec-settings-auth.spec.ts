/**
 * 認証・設定モーダル テスト（仕様書 Section 3, 8 対応）
 *
 * - 設定モーダルの表示内容
 * - ログアウト動作
 * - /settings ページが削除済みであること
 */
import { test, expect } from '@playwright/test';

// ─── /settings ページ削除確認 ─────────────────────────────────────────────────

test.describe('/settings ページ', () => {
  test('/settings にアクセスすると 404 またはリダイレクトされる', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const is404 = await page.getByText(/404|見つかりません|not found/i).isVisible().catch(() => false);
    const redirected = !page.url().includes('/settings');
    expect(is404 || redirected).toBe(true);
  });
});

// ─── 設定モーダル ────────────────────────────────────────────────────────────

test.describe('SettingsModal — フリープラン', () => {
  test.beforeEach(async ({ page }) => {
    // マイページに移動して「設定」ボタンを押す
    await page.goto('/');
    await page.locator('header').getByRole('link', { name: 'マイページ' }).click();
    await page.waitForURL(/\/u\//);
    await page.getByRole('button', { name: /設定/ }).click();
  });

  test('設定モーダルが開く', async ({ page }) => {
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
  });

  test('ログイン中のメールアドレスが表示される', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL ?? '';
    await expect(page.getByText(email)).toBeVisible({ timeout: 5000 });
  });

  test('「フリープラン」と表示される', async ({ page }) => {
    await expect(page.getByText(/フリープラン/)).toBeVisible({ timeout: 5000 });
  });

  test('「アップグレード」リンクが表示される', async ({ page }) => {
    await expect(page.getByRole('link', { name: /アップグレード/ })).toBeVisible({ timeout: 5000 });
  });

  test('「ログアウト」ボタンが表示される', async ({ page }) => {
    await expect(page.getByRole('button', { name: /ログアウト/ })).toBeVisible({ timeout: 5000 });
  });

  test('ログアウト後は / にリダイレクトされる', async ({ page }) => {
    await page.getByRole('button', { name: /ログアウト/ }).click();
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page).toHaveURL('/');
  });
});

// ─── 認証コールバック ──────────────────────────────────────────────────────────

test.describe('認証フロー — ログインページ', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('/auth/login にアクセスするとログインフォームが表示される', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByPlaceholder('メールアドレス')).toBeVisible();
    await expect(page.getByPlaceholder('パスワード')).toBeVisible();
  });

  test('Google ログインボタンが表示される', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('button', { name: /Google/ })).toBeVisible();
  });

  test('Discord ログインボタンが表示される', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('button', { name: /Discord/ })).toBeVisible();
  });
});
