import { test, expect } from '@playwright/test';

test.describe('ログインページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('ページが正常に表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
  });

  test('vaacard ロゴが表示される', async ({ page }) => {
    await expect(page.getByText('vaacard').first()).toBeVisible();
  });

  test('Google ログインボタンが表示される', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Google/ })).toBeVisible();
  });

  test('Discord ログインボタンが表示される', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Discord/ })).toBeVisible();
  });

  test('メールアドレス入力欄が表示される', async ({ page }) => {
    await expect(page.getByPlaceholder('メールアドレス')).toBeVisible();
  });

  test('パスワード入力欄が表示される', async ({ page }) => {
    await expect(page.getByPlaceholder('パスワード')).toBeVisible();
  });

  test('next パラメータが渡された場合も正常に表示される', async ({ page }) => {
    await page.goto('/auth/login?next=/card/new');
    await expect(page.getByRole('button', { name: 'ログイン', exact: true })).toBeVisible();
  });

  test('ヘッダーの vaacard ロゴをクリックすると / に遷移する', async ({ page }) => {
    await page.getByRole('link', { name: 'vaacard' }).click();
    await expect(page).toHaveURL('/');
  });
});
