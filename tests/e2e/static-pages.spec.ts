import { test, expect } from '@playwright/test';

test.describe('静的ページ', () => {
  test('プライバシーポリシーページが表示される', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.locator('body')).not.toContainText('404');
    await expect(page.getByText('vaacard').first()).toBeVisible();
  });

  test('利用規約ページが表示される', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.locator('body')).not.toContainText('404');
    await expect(page.getByText('vaacard').first()).toBeVisible();
  });
});

test.describe('存在しないページ', () => {
  test('存在しないカードIDにアクセスすると適切に処理される', async ({ page }) => {
    await page.goto('/card/nonexistent-card-id-12345');
    // ローディング表示かエラー表示になること（500 は出ないこと）
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('存在しないユーザースラッグにアクセスすると適切に処理される', async ({ page }) => {
    await page.goto('/u/this-user-does-not-exist-12345');
    await expect(page.locator('body')).not.toContainText('500');
  });
});
