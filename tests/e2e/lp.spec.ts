import { test, expect } from '@playwright/test';

test.describe('トップページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ページが正常に表示される', async ({ page }) => {
    await expect(page).toHaveTitle(/vaacard/i);
  });

  test('ヘッダーに vaacard ロゴが表示される', async ({ page }) => {
    await expect(page.getByText('vaacard').first()).toBeVisible();
  });

  test('ログインリンクが表示される（未ログイン時）', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'ログイン' })).toBeVisible();
  });

  test('「カードを作る」ボタンが存在する', async ({ page }) => {
    await expect(page.getByRole('link', { name: /カードを作る/ }).first()).toBeVisible();
  });

  test('「カードを作る」を押すと /auth/login にリダイレクト（未ログイン時）', async ({ page }) => {
    await page.getByRole('link', { name: /カードを作る/ }).first().click();
    await expect(page).toHaveURL(/auth\/login/);
  });
});
