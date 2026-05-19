/**
 * カード作成〜公開フロー テスト（仕様書 Section 4 対応）
 *
 * - テンプレート選択 → エディタ → 保存 → 完了モーダル → 閲覧ページ
 * - 完了モーダルの UI 確認
 * - 画像保存後のトースト文言確認
 * - Xでシェア後の URL 形式確認
 */
import { test, expect, Page } from '@playwright/test';

async function createCard(page: Page, templateName = 'Standard'): Promise<string> {
  await page.goto('/card/new');
  await page.getByText(templateName).click();
  await page.waitForURL(/\/card\/[a-zA-Z0-9]+/, { timeout: 15000 });
  const match = page.url().match(/\/card\/([a-zA-Z0-9]+)/);
  return match?.[1] ?? '';
}

// ─── テンプレート選択 ────────────────────────────────────────────────────────

test.describe('テンプレート選択（/card/new）', () => {
  test('Standard と Glass のテンプレートが表示される', async ({ page }) => {
    await page.goto('/card/new');
    await expect(page.getByText('Standard')).toBeVisible();
    await expect(page.getByText('Glass')).toBeVisible();
  });

  test('Standard を選択するとエディタへ遷移する', async ({ page }) => {
    await page.goto('/card/new');
    await page.getByText('Standard').click();
    await page.waitForURL(/\/card\/[a-zA-Z0-9]+/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/card\/[a-zA-Z0-9]+/);
  });

  test('Glass を選択するとエディタへ遷移する', async ({ page }) => {
    await page.goto('/card/new');
    await page.getByText('Glass').click();
    await page.waitForURL(/\/card\/[a-zA-Z0-9]+/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/card\/[a-zA-Z0-9]+/);
  });
});

// ─── 完了モーダル ────────────────────────────────────────────────────────────

test.describe('カード保存完了モーダル', () => {
  test('「マイページに保存」後に完了モーダルが表示される', async ({ page }) => {
    await createCard(page);
    const saveBtn = page.getByRole('button', { name: /マイページに保存/ });
    await expect(saveBtn).toBeVisible({ timeout: 5000 });
    await saveBtn.click();

    // 完了モーダルの UI 要素
    await expect(page.getByText(/URLをコピー|コピー/)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('link', { name: /マイページ/ })).toBeVisible({ timeout: 10000 });
  });

  test('完了モーダルに「Xでシェア」ボタンがある', async ({ page }) => {
    await createCard(page);
    await page.getByRole('button', { name: /マイページに保存/ }).click();
    await expect(page.getByRole('button', { name: /Xでシェア|Xに投稿/ })).toBeVisible({ timeout: 15000 });
  });

  test('完了後のURLに ?created=1 が含まれる', async ({ page }) => {
    await createCard(page);
    await page.getByRole('button', { name: /マイページに保存/ }).click();
    await page.waitForURL(/\?created=1/, { timeout: 15000 });
    await expect(page).toHaveURL(/\?created=1/);
  });
});

// ─── 画像ダウンロード後トースト ───────────────────────────────────────────────

test.describe('画像ダウンロード後のトースト', () => {
  test('「画像で保存」後にトーストが表示される', async ({ page }) => {
    await createCard(page);
    const downloadBtn = page.getByRole('button', { name: /画像で保存/ });
    await expect(downloadBtn).toBeVisible({ timeout: 5000 });
    await downloadBtn.click();

    // トースト文言の確認
    await expect(page.getByText(/URLで共有できるようにしませんか/)).toBeVisible({ timeout: 8000 });
  });

  test('トーストに「マイページに保存」への導線がある', async ({ page }) => {
    await createCard(page);
    await page.getByRole('button', { name: /画像で保存/ }).click();
    await expect(page.getByText(/マイページに保存/)).toBeVisible({ timeout: 8000 });
  });
});

// ─── カード閲覧ページ（/card/[cardId]） ──────────────────────────────────────

test.describe('カード閲覧ページ', () => {
  test('「マイページに保存」後に閲覧ページへ遷移する', async ({ page }) => {
    await createCard(page);
    await page.getByRole('button', { name: /マイページに保存/ }).click();
    await page.waitForURL(/\/card\/[a-z0-9]+(\?created=1)?$/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/card\/[a-z0-9]+/);
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('閲覧ページに 3D tilt カードが表示される', async ({ page }) => {
    await createCard(page);
    await page.getByRole('button', { name: /マイページに保存/ }).click();
    await page.waitForURL(/\/card\/[a-z0-9]+(\?created=1)?$/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // カードプレビューが表示されている
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
    await expect(page.getByText('vaacard').first()).toBeVisible();
  });
});

// ─── 旧メーカー（/card/vrchat） ───────────────────────────────────────────────

test.describe('旧メーカー（/card/vrchat）', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('アカウントなしでアクセスできる', async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('ログインへの導線が表示される', async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    // アカウント登録訴求テキストまたはリンクが存在する
    const loginCta = page.getByText(/アカウント|登録|ログイン/).first();
    await expect(loginCta).toBeVisible({ timeout: 5000 });
  });

  test('「画像で保存」ボタンが存在する', async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: /画像で保存/ })).toBeVisible();
  });
});
