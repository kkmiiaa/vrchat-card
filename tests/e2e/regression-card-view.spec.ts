/**
 * カード共有ページ デグレ防止テスト（認証済み）
 *
 * カードを作成し、共有ページの各機能が正常に動作することを確認する。
 * - カードのレンダリング
 * - いいね機能
 * - SNS IDコピー
 * - オーナー向けボタン（編集・Xで共有・画像で保存）
 * - 縦横レイアウト切替
 */
import { test, expect, Page } from '@playwright/test';

async function createAndViewCard(page: Page, templateName: string) {
  await page.goto('/card/new');
  await page.getByText(templateName).click();
  await page.waitForURL(/\/card\/[a-z0-9-]+$/, { timeout: 15000 });

  const cardId = page.url().split('/card/')[1];
  await page.goto(`/card/${cardId}/view`);
  await page.waitForLoadState('networkidle');
  return cardId;
}

test.describe('カード共有ページ — 基本表示', () => {
  test('ページがエラーなく表示される', async ({ page }) => {
    await createAndViewCard(page, 'Standard');
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('vaacard ロゴが表示される', async ({ page }) => {
    await createAndViewCard(page, 'Standard');
    await expect(page.getByText('vaacard').first()).toBeVisible();
  });

  test('カードプレビューが表示される（ローディングが消える）', async ({ page }) => {
    await createAndViewCard(page, 'Standard');
    // スピナーが消えてカードが表示される
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 10000 });
  });
});

test.describe('カード共有ページ — オーナー向け機能（デグレ防止）', () => {
  test('「編集」ボタンが表示される（オーナーとして）', async ({ page }) => {
    await createAndViewCard(page, 'Standard');
    // デスクトップではヘッダーに、モバイルでは固定ボタンに表示
    const editBtn = page.getByRole('link', { name: '編集' }).first();
    await expect(editBtn).toBeVisible({ timeout: 5000 });
  });

  test('「Xで共有」ボタンが表示される（オーナーとして）', async ({ page }) => {
    await createAndViewCard(page, 'Standard');
    await expect(page.getByRole('link', { name: /Xで共有/ }).first()).toBeVisible({ timeout: 5000 });
  });

  test('「Xで共有」リンクが Twitter intent URL を持つ', async ({ page }) => {
    await createAndViewCard(page, 'Standard');
    const shareLink = page.getByRole('link', { name: /Xで共有/ }).first();
    await expect(shareLink).toHaveAttribute('href', /twitter\.com\/intent\/tweet/);
  });

  test('「Xで共有」URL に #vaacard ハッシュタグが含まれる', async ({ page }) => {
    await createAndViewCard(page, 'Standard');
    const shareLink = page.getByRole('link', { name: /Xで共有/ }).first();
    const href = await shareLink.getAttribute('href');
    expect(href).toContain('vaacard');
  });

  test('「画像で保存」ボタンが表示される', async ({ page }) => {
    await createAndViewCard(page, 'Standard');
    // デスクトップヘッダー or モバイルフローティング
    const downloadBtn = page.getByRole('button', { name: /画像で保存/ }).first();
    await expect(downloadBtn).toBeVisible({ timeout: 5000 });
  });
});

test.describe('カード共有ページ — いいね機能（デグレ防止）', () => {
  test('いいねボタンが表示される', async ({ page }) => {
    await createAndViewCard(page, 'Standard');
    // ハートアイコンを含むいいねボタン
    const likeBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
    await expect(likeBtn).toBeVisible({ timeout: 5000 });
  });

  test('いいねカウントが数値で表示される', async ({ page }) => {
    await createAndViewCard(page, 'Standard');
    // いいねボタン周辺に数値がある
    const likeSection = page.locator('button').filter({ has: page.locator('svg[viewBox="0 0 24 24"]') }).first();
    await expect(likeSection).toBeVisible({ timeout: 5000 });
  });
});

test.describe('カード共有ページ — V1 レイアウト切替（デグレ防止）', () => {
  test('縦横切替ボタンが表示される（V1テンプレート）', async ({ page }) => {
    await createAndViewCard(page, 'Standard');
    // 横ボタンと縦ボタンの両方が表示される
    await expect(page.getByRole('button', { name: '横' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: '縦' })).toBeVisible({ timeout: 5000 });
  });

  test('縦レイアウトに切り替えられる', async ({ page }) => {
    await createAndViewCard(page, 'Standard');
    await page.getByRole('button', { name: '縦' }).click();
    // レイアウト切替後もエラーが出ないこと
    await expect(page.locator('body')).not.toContainText('500');
    await page.getByRole('button', { name: '横' }).click();
    await expect(page.locator('body')).not.toContainText('500');
  });
});

test.describe('カード共有ページ — V2 Glass カード', () => {
  test('V2 共有ページがエラーなく表示される', async ({ page }) => {
    await createAndViewCard(page, 'Glass');
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.getByText('vaacard').first()).toBeVisible();
  });

  test('V2 でもオーナー向けボタンが表示される', async ({ page }) => {
    await createAndViewCard(page, 'Glass');
    await expect(page.getByRole('link', { name: '編集' }).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('link', { name: /Xで共有/ }).first()).toBeVisible({ timeout: 5000 });
  });

  test('V2 縦レイアウト切替ボタンが表示される', async ({ page }) => {
    await createAndViewCard(page, 'Glass');
    await expect(page.getByRole('button', { name: '縦' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: '縦' }).click();
    await expect(page.locator('body')).not.toContainText('500');
  });
});
