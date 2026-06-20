import { test, expect } from '@playwright/test';

/**
 * /card/vrchat — VRChat自己紹介カードメーカーのリグレッションテスト
 *
 * あるべき姿（SPEC.md 参照）:
 * - ログイン不要でアクセスできる（既存ユーザーの主要導線）
 * - CardEditor のUIで表示される（旧VRChatCardGeneratorではない）
 * - ヘッダーに Xでシェア・画像で保存・マイページに保存 がデスクトップで表示される
 * - /tools/vrchat-introduction-card からリダイレクトされる
 */

test.describe('/card/vrchat — ログイン不要アクセス', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/card/vrchat');
  });

  test('ログインページにリダイレクトされない', async ({ page }) => {
    await expect(page).not.toHaveURL(/auth\/login/);
    await expect(page).not.toHaveURL(/card\/new/);
  });

  test('vaacardのCardEditorが表示される', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
    // CardEditor のヘッダーロゴ
    await expect(page.getByRole('link', { name: 'vaacard' })).toBeVisible();
  });

  test('ページタイトルに「VRChat」が含まれる', async ({ page }) => {
    await expect(page).toHaveTitle(/VRChat/i);
  });
});

test.describe('/card/vrchat — ヘッダーボタン（デスクトップ）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
  });

  test('「Xでシェア」ボタンがヘッダーで見える', async ({ page }) => {
    const btn = page.locator('header').getByRole('button', { name: /シェア|share/i });
    await expect(btn).toBeVisible();
  });

  test('「画像で保存」ボタンがヘッダーで見える', async ({ page }) => {
    const btn = page.locator('header').getByRole('button', { name: /保存|save/i }).first();
    await expect(btn).toBeVisible();
  });

  test('「マイページに保存」ボタンがヘッダーで見える', async ({ page }) => {
    const btn = page.locator('header').getByRole('button', { name: /マイページに保存|マイページを作成/ });
    await expect(btn).toBeVisible();
  });

  test('「ログイン」リンクがヘッダーで見える（未ログイン）', async ({ page }) => {
    const link = page.locator('header').getByRole('link', { name: /ログイン|login/i });
    await expect(link).toBeVisible();
  });
});

test.describe('/card/vrchat — フォーム入力', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
  });

  test('フォームに入力できる', async ({ page }) => {
    // 右パネルをスクロールしてプロフィール情報セクションを開く
    await page.locator('aside').evaluate(el => el.scrollTop = 500);
    const profileBtn = page.getByRole('button', { name: 'プロフィール' });
    await profileBtn.waitFor({ state: 'visible', timeout: 10000 });
    await profileBtn.click();
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill('テストユーザー');
    await expect(input).toHaveValue('テストユーザー');
  });

  test('背景色を変更できる', async ({ page }) => {
    const colorBtn = page.locator('button[style*="background-color"]').first();
    await expect(colorBtn).toBeVisible();
    await colorBtn.click();
  });
});

test.describe('/card/vrchat — リダイレクト', () => {
  test('/tools/vrchat-introduction-card は /card/vrchat にリダイレクトされる', async ({ page }) => {
    await page.goto('/tools/vrchat-introduction-card');
    await expect(page).toHaveURL('/card/vrchat');
  });
});
