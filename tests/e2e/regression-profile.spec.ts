/**
 * プロフィールページ デグレ防止テスト（認証済み）
 *
 * - カード一覧の表示
 * - カード追加・編集への遷移
 * - プロフィール編集
 */
import { test, expect, Page } from '@playwright/test';

async function getMyProfileUrl(page: Page): Promise<string | null> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const myPageLink = page.getByRole('link', { name: 'マイページ' });
  if (!await myPageLink.isVisible({ timeout: 3000 }).catch(() => false)) return null;
  const href = await myPageLink.getAttribute('href');
  return href;
}

test.describe('プロフィールページ — 基本表示', () => {
  test('マイページリンクがトップページに表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'マイページ' })).toBeVisible({ timeout: 5000 });
  });

  test('マイページに遷移できる', async ({ page }) => {
    const url = await getMyProfileUrl(page);
    if (!url) return test.skip();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.getByText('vaacard').first()).toBeVisible();
  });

  test('プロフィールページにアバターが表示される', async ({ page }) => {
    const url = await getMyProfileUrl(page);
    if (!url) return test.skip();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    // アバター画像 or イニシャルアイコン
    const avatarArea = page.locator('.rounded-full').first();
    await expect(avatarArea).toBeVisible({ timeout: 5000 });
  });
});

test.describe('プロフィールページ — カード一覧（デグレ防止）', () => {
  test('カードが存在する場合、カードプレビューが表示される', async ({ page }) => {
    const url = await getMyProfileUrl(page);
    if (!url) return test.skip();

    // カードがなければ先に作成
    await page.goto('/card/new');
    await page.getByText('Standard').click();
    await page.waitForURL(/\/card\/[a-z0-9-]+$/, { timeout: 15000 });

    // マイページに戻る
    await page.goto(url);
    await page.waitForLoadState('networkidle');

    // カードプレビューが表示されていること
    await expect(page.locator('a[href*="/card/"][href*="/view"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('カードにタイトルがあっても、プロフィールページには表示されない', async ({ page }) => {
    const url = await getMyProfileUrl(page);
    if (!url) return test.skip();

    await page.goto(url);
    await page.waitForLoadState('networkidle');

    // カードタイトル用の要素が存在しないこと
    await expect(page.locator('p.text-sm.font-bold.text-gray-700')).toHaveCount(0);
  });

  test('「カードを追加」ボタンが表示される', async ({ page }) => {
    const url = await getMyProfileUrl(page);
    if (!url) return test.skip();

    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('link', { name: /カードを追加/ })).toBeVisible({ timeout: 5000 });
  });

  test('カードをクリックすると共有ページに遷移する', async ({ page }) => {
    const url = await getMyProfileUrl(page);
    if (!url) return test.skip();

    // カード作成
    await page.goto('/card/new');
    await page.getByText('Standard').click();
    await page.waitForURL(/\/card\/[a-z0-9-]+$/, { timeout: 15000 });

    await page.goto(url);
    await page.waitForLoadState('networkidle');

    const cardLink = page.locator('a[href*="/card/"][href*="/view"]').first();
    if (await cardLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await cardLink.click();
      await expect(page).toHaveURL(/\/card\/[a-z0-9-]+\/view/);
      await expect(page.locator('body')).not.toContainText('500');
    }
  });
});

test.describe('プロフィールページ — 編集機能（デグレ防止）', () => {
  test('編集モードに入れる', async ({ page }) => {
    const url = await getMyProfileUrl(page);
    if (!url) return test.skip();

    await page.goto(url);
    await page.waitForLoadState('networkidle');

    const editBtn = page.getByRole('button', { name: '編集' }).first();
    await expect(editBtn).toBeVisible({ timeout: 5000 });
    await editBtn.click();

    // 保存ボタンが出現
    await expect(page.getByRole('button', { name: '保存する' })).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole('button', { name: 'キャンセル' })).toBeVisible({ timeout: 3000 });
  });

  test('キャンセルボタンで編集モードを終了できる', async ({ page }) => {
    const url = await getMyProfileUrl(page);
    if (!url) return test.skip();

    await page.goto(url);
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: '編集' }).first().click();
    await expect(page.getByRole('button', { name: 'キャンセル' })).toBeVisible();
    await page.getByRole('button', { name: 'キャンセル' }).click();

    // 編集モード終了 → 保存ボタンが消える
    await expect(page.getByRole('button', { name: '保存する' })).not.toBeVisible({ timeout: 3000 });
  });

  test('表示名を変更して保存できる', async ({ page }) => {
    const url = await getMyProfileUrl(page);
    if (!url) return test.skip();

    await page.goto(url);
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: '編集' }).first().click();

    const nameInput = page.getByPlaceholder('あなたの名前');
    await expect(nameInput).toBeVisible({ timeout: 3000 });
    await nameInput.fill('テストユーザー編集後');

    await page.getByRole('button', { name: '保存する' }).click();
    await expect(page.getByText('✓ 保存しました')).toBeVisible({ timeout: 5000 });
  });
});
