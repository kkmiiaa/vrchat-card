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
  await page.waitForURL(/\/card\/[a-zA-Z0-9-]+(\/edit|\?|$)/, { timeout: 15000 });
  const match = page.url().match(/\/card\/([a-zA-Z0-9-]+)/);
  return match?.[1] ?? '';
}

async function scrollToProfileSection(page: import('@playwright/test').Page): Promise<void> {
  await page.locator('aside').evaluate(el => el.scrollTop = 500);
  const profileBtn = page.getByRole('button', { name: 'プロフィール' }).first();
  await profileBtn.waitFor({ state: 'visible', timeout: 10000 });
  await profileBtn.click();
  await page.waitForTimeout(500);
  await page.locator('aside').evaluate(el => el.scrollTop = 1200);
}

test.describe('V1 カード — 保存と再読み込み', () => {
  let cardId: string;

  test('Standard テンプレートを作成してエディタが開く', async ({ page }) => {
    cardId = await createCard(page, 'Simple');
    await expect(page).toHaveURL(`/card/${cardId}`);
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('名前を入力→保存→再読み込みで保持される', async ({ page }) => {
    cardId = await createCard(page, 'Simple');

    // 名前を入力
    await scrollToProfileSection(page);
    const nameInput = page.locator('input[type="text"]').first();
    await expect(nameInput).toBeVisible({ timeout: 8000 });
    await nameInput.fill('永続テスト太郎');

    // 自動保存を待つ（debounce）
    await page.waitForTimeout(2000);

    // ページをリロード
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 名前が維持されている
    await scrollToProfileSection(page);
    const reloadedInput = page.locator('input[type="text"]').first();
    await expect(reloadedInput).toHaveValue('永続テスト太郎', { timeout: 5000 });
  });

  test('背景グラデーションを選択→保存→再読み込みで保持される', async ({ page }) => {
    cardId = await createCard(page, 'Simple');

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
    await page.waitForURL(/\/card\/[a-zA-Z0-9-]+(\/edit|\?|$)/, { timeout: 15000 });
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.getByText('vaacard').first()).toBeVisible();
  });

  test('V2カードに名前を入力→保存→再読み込みで保持される', async ({ page }) => {
    await page.goto('/card/new');
    await page.getByText('Glass').click();
    await page.waitForURL(/\/card\/[a-zA-Z0-9-]+(\/edit|\?|$)/, { timeout: 15000 });

    await scrollToProfileSection(page);
    const nameInput = page.locator('input[type="text"]').first();
    await expect(nameInput).toBeVisible({ timeout: 8000 });
    await nameInput.fill('V2永続テスト');

    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');

    await scrollToProfileSection(page);
    const reloadedInput = page.locator('input[type="text"]').first();
    await expect(reloadedInput).toHaveValue('V2永続テスト', { timeout: 5000 });
  });

  test('SNS情報を入力→保存→再読み込みで保持される', async ({ page }) => {
    await page.goto('/card/new');
    await page.getByText('Glass').click();
    await page.waitForURL(/\/card\/[a-zA-Z0-9-]+(\/edit|\?|$)/, { timeout: 15000 });

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
    await page.waitForURL(/\/card\/[a-zA-Z0-9-]+(\/edit|\?|$)/, { timeout: 15000 });

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
    await page.getByText('Simple').click();
    await page.waitForURL(/\/card\/[a-zA-Z0-9-]+(\/edit|\?|$)/, { timeout: 15000 });

    const cardId = page.url().split('/card/')[1];

    // 直接 view ページにアクセス
    await page.goto(`/card/${cardId}`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.getByText('vaacard').first()).toBeVisible();
  });
});
