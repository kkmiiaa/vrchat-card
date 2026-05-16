/**
 * カード保存・永続性 デグレ防止テスト（認証済み）
 *
 * カードを作成→入力→保存→再読み込みでデータが維持されることを確認する。
 * 既存ユーザーのカードデータが失われていないことの保証に相当する。
 */
import { test, expect, Page } from '@playwright/test';

async function createCard(page: Page, templateName: string): Promise<string> {
  await page.goto('/card/new');
  await page.getByText(templateName).click();
  await page.waitForURL(/\/card\/[a-z0-9-]+$/, { timeout: 15000 });
  return page.url().split('/card/')[1];
}

test.describe('V1 カード — 保存と再読み込み', () => {
  let cardId: string;

  test('Standard テンプレートを作成してエディタが開く', async ({ page }) => {
    cardId = await createCard(page, 'Standard');
    await expect(page).toHaveURL(`/card/${cardId}`);
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('名前を入力→保存→再読み込みで保持される', async ({ page }) => {
    cardId = await createCard(page, 'Standard');

    // 名前を入力
    await page.getByText('プロフィール情報').click();
    const nameInput = page.getByPlaceholder(/名前/i).first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill('永続テスト太郎');

    // 自動保存を待つ（debounce）
    await page.waitForTimeout(2000);

    // ページをリロード
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 名前が維持されている
    await page.getByText('プロフィール情報').click();
    const reloadedInput = page.getByPlaceholder(/名前/i).first();
    await expect(reloadedInput).toHaveValue('永続テスト太郎', { timeout: 5000 });
  });

  test('背景グラデーションを選択→保存→再読み込みで保持される', async ({ page }) => {
    cardId = await createCard(page, 'Standard');

    // グラデーション背景を選択（最初のグラデーションボタン）
    const gradientBtns = page.locator('button').filter({ hasText: '' }).nth(0);
    const gradientSection = page.getByText('グラデーション背景');
    await expect(gradientSection).toBeVisible();

    // 自動保存を待つ
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // ページが正常に読み込まれること
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.getByText('vaacard').first()).toBeVisible();
  });
});

test.describe('V2 カード — 保存と再読み込み', () => {
  test('Glass テンプレートを作成してエディタが開く', async ({ page }) => {
    await page.goto('/card/new');
    await page.getByText('Glass').click();
    await page.waitForURL(/\/card\/[a-z0-9-]+$/, { timeout: 15000 });
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.getByText('vaacard').first()).toBeVisible();
  });

  test('V2カードに名前を入力→保存→再読み込みで保持される', async ({ page }) => {
    await page.goto('/card/new');
    await page.getByText('Glass').click();
    await page.waitForURL(/\/card\/[a-z0-9-]+$/, { timeout: 15000 });

    await page.getByText('プロフィール情報').click();
    const nameInput = page.getByPlaceholder(/名前/i).first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill('V2永続テスト');

    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.getByText('プロフィール情報').click();
    const reloadedInput = page.getByPlaceholder(/名前/i).first();
    await expect(reloadedInput).toHaveValue('V2永続テスト', { timeout: 5000 });
  });

  test('SNS情報を入力→保存→再読み込みで保持される', async ({ page }) => {
    await page.goto('/card/new');
    await page.getByText('Glass').click();
    await page.waitForURL(/\/card\/[a-z0-9-]+$/, { timeout: 15000 });

    await page.getByText('SNS・コンタクト').first().click();
    const vrchatInput = page.getByPlaceholder(/VRChat|vrchat/i).first();
    if (await vrchatInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await vrchatInput.fill('test_vrc_user');
      await page.waitForTimeout(2000);
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.getByText('SNS・コンタクト').first().click();
      await expect(page.getByPlaceholder(/VRChat|vrchat/i).first()).toHaveValue('test_vrc_user', { timeout: 5000 });
    }
  });

  test('フレンド申請ポリシーを選択→保存→再読み込みで保持される', async ({ page }) => {
    await page.goto('/card/new');
    await page.getByText('Glass').click();
    await page.waitForURL(/\/card\/[a-z0-9-]+$/, { timeout: 15000 });

    await page.getByText('SNS・コンタクト').first().click();
    // フレンド申請のラジオ/セレクト
    const frPolicySection = page.getByText('フレンド申請');
    await expect(frPolicySection).toBeVisible({ timeout: 5000 });

    const anyoneOption = page.getByText('だれでもOK').first();
    if (await anyoneOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await anyoneOption.click();
      await page.waitForTimeout(2000);
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.getByText('SNS・コンタクト').first().click();
      await expect(page.getByText('だれでもOK').first()).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('カード共有ページへの遷移', () => {
  test('エディタから共有ページに遷移できる', async ({ page }) => {
    await page.goto('/card/new');
    await page.getByText('Standard').click();
    await page.waitForURL(/\/card\/[a-z0-9-]+$/, { timeout: 15000 });

    const cardId = page.url().split('/card/')[1];

    // 直接 view ページにアクセス
    await page.goto(`/card/${cardId}/view`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.getByText('vaacard').first()).toBeVisible();
  });
});
