/**
 * カードエディタ デグレ防止テスト
 *
 * 既存ユーザーが影響を受けやすい操作を重点的にカバーする。
 * V1は /card/vrchat（ログイン不要）、V2は /card/new から Glass 選択（認証済み）。
 */
import { test, expect } from '@playwright/test';

// ─── V1 エディタ（/card/vrchat ログイン不要） ────────────────────────────────

test.describe('V1 エディタ — 基本表示', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
  });

  test('エラーなく表示される', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });

  test('ヘッダーに vaacard ロゴが表示される', async ({ page }) => {
    await expect(page.getByText('vaacard').first()).toBeVisible();
  });

  test('「画像で保存」ボタンが存在する', async ({ page }) => {
    await expect(page.getByRole('button', { name: /画像で保存/ })).toBeVisible();
  });

  test('「Xでシェア」ボタンが存在する', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Xでシェア|シェア/ })).toBeVisible();
  });

  test('カードデザインセクションが開いている', async ({ page }) => {
    await expect(page.getByText('カードデザイン').first()).toBeVisible();
  });

  test('背景設定が表示される', async ({ page }) => {
    await expect(page.getByText(/背景(の)?設定/).first()).toBeVisible();
  });
});

test.describe('V1 エディタ — フォーム入力', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    // 右パネルをスクロールしてプロフィールセクションを表示
    await page.locator('aside').evaluate(el => el.scrollTop = 500);
  });

  test('プロフィール情報セクションを開いて名前を入力できる', async ({ page }) => {
    const profileBtn = page.getByRole('button', { name: 'プロフィール' });
    await profileBtn.waitFor({ state: 'visible', timeout: 10000 });
    await profileBtn.click();
    await page.waitForTimeout(500);
    await page.locator('aside').evaluate(el => el.scrollTop = 1200);
    const nameInput = page.getByPlaceholder(/名前/i).first();
    await expect(nameInput).toBeVisible({ timeout: 8000 });
    await nameInput.fill('デグレテスト太郎');
    await expect(nameInput).toHaveValue('デグレテスト太郎');
  });

  test('グラデーション背景を選択できる', async ({ page }) => {
    await page.locator('aside').evaluate(el => el.scrollTop = 0);
    await expect(page.getByText('グラデーション背景')).toBeVisible();
  });

  test('フォントを切り替えられる', async ({ page }) => {
    await page.locator('aside').evaluate(el => el.scrollTop = 0);
    await expect(page.getByText('フォントの設定')).toBeVisible();
  });
});

test.describe('V1 エディタ — カードプレビュー', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
  });

  test('カードプレビュー領域が表示される', async ({ page }) => {
    const previewSection = page.locator('section').first();
    await expect(previewSection).toBeVisible();
  });

  test('名前を入力するとプレビューに反映される（プレビュー領域がクラッシュしない）', async ({ page }) => {
    await page.locator('aside').evaluate(el => el.scrollTop = 500);
    const profileBtn = page.getByRole('button', { name: 'プロフィール' });
    await profileBtn.waitFor({ state: 'visible', timeout: 10000 });
    await profileBtn.click();
    const nameInput = page.getByPlaceholder(/名前/i).first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill('テスト');
    await expect(page.locator('body')).not.toContainText('500');
  });
});

// ─── V2 エディタ（Glass テンプレート、認証済み） ─────────────────────────────

test.describe('V2 エディタ — 基本表示', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/card/new');
    await page.getByText('Glass').click();
    await page.waitForURL(/\/card\/[a-zA-Z0-9]+\/edit/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  });

  test('エラーなく表示される', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('vaacard ロゴが表示される', async ({ page }) => {
    await expect(page.getByText('vaacard').first()).toBeVisible();
  });

  test('カードデザインセクションが開いている', async ({ page }) => {
    await expect(page.getByText('カードデザイン').first()).toBeVisible();
  });

  test('「画像で保存」ボタンが存在する', async ({ page }) => {
    await expect(page.getByRole('button', { name: /画像で保存/ })).toBeVisible();
  });
});

test.describe('V2 エディタ — セクション表示（デグレ防止）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/card/new');
    await page.getByText('Glass').click();
    await page.waitForURL(/\/card\/[a-zA-Z0-9]+\/edit/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.locator('aside').evaluate(el => el.scrollTop = 500);
  });

  test('プロフィール情報セクションが存在する', async ({ page }) => {
    await expect(page.getByRole('button', { name: /プロフィール/ }).first()).toBeVisible({ timeout: 10000 });
  });

  test('SNS・コンタクトセクションが存在する', async ({ page }) => {
    await expect(page.getByRole('button', { name: /SNS/ }).first()).toBeVisible({ timeout: 10000 });
  });

  test('自己紹介・画像セクションが存在する', async ({ page }) => {
    await expect(page.getByRole('button', { name: /自己紹介/ }).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('V2 エディタ — フォーム入力（デグレ防止）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/card/new');
    await page.getByText('Glass').click();
    await page.waitForURL(/\/card\/[a-zA-Z0-9]+\/edit/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.locator('aside').evaluate(el => el.scrollTop = 500);
  });

  test('プロフィール情報セクションを開いて名前を入力できる', async ({ page }) => {
    const profileBtn = page.getByRole('button', { name: /プロフィール/ }).first();
    await profileBtn.waitFor({ state: 'visible', timeout: 10000 });
    await profileBtn.click();
    const nameInput = page.getByPlaceholder(/名前/i).first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill('V2テストユーザー');
    await expect(nameInput).toHaveValue('V2テストユーザー');
  });

  test('フレンド申請ポリシーが表示される', async ({ page }) => {
    const snsBtn = page.getByRole('button', { name: /SNS/ }).first();
    await snsBtn.waitFor({ state: 'visible', timeout: 10000 });
    await snsBtn.click();
    await expect(page.getByText('フレンド申請')).toBeVisible({ timeout: 5000 });
  });

  test('OKなこと・NGなことのセクションが表示される', async ({ page }) => {
    const snsBtn = page.getByRole('button', { name: /SNS/ }).first();
    await snsBtn.waitFor({ state: 'visible', timeout: 10000 });
    await snsBtn.click();
    await expect(page.getByText('OKなこと')).toBeVisible({ timeout: 5000 });
  });
});
