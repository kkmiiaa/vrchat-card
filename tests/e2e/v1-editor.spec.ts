import { test, expect } from '@playwright/test';

test.describe('V1 カードエディタ（ログイン不要）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/card/vrchat/v1');
  });

  test('ページが正常に表示される', async ({ page }) => {
    await expect(page).toHaveURL('/card/vrchat/v1');
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('ログインなしでアクセスできる（リダイレクトされない）', async ({ page }) => {
    await expect(page).toHaveURL('/card/vrchat/v1');
  });

  test('vaacard ロゴがヘッダーに表示される', async ({ page }) => {
    await expect(page.getByText('vaacard').first()).toBeVisible();
  });

  test('「画像で保存」ボタンが表示される', async ({ page }) => {
    await expect(page.getByRole('button', { name: /画像で保存/ })).toBeVisible();
  });

  test('「Xでシェア」ボタンが表示される', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Xでシェア|シェア/ })).toBeVisible();
  });

  test('名前フィールドに入力できる', async ({ page }) => {
    const nameInput = page.getByPlaceholder(/名前|name/i).first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill('テストユーザー');
    await expect(nameInput).toHaveValue('テストユーザー');
  });

  test('カードデザインセクションが開いている', async ({ page }) => {
    await expect(page.getByText('カードデザイン')).toBeVisible();
  });
});

test.describe('V1 カードエディタ — ルーティング', () => {
  test('/card/vrchat/v2 にアクセスできる', async ({ page }) => {
    await page.goto('/card/vrchat/v2');
    await expect(page).toHaveURL('/card/vrchat/v2');
    await expect(page.locator('body')).not.toContainText('500');
  });
});
