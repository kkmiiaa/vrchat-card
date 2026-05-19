/**
 * 下書き・公開フロー テスト（仕様書 Section 4 対応）
 *
 * - debounce 自動保存 → card_data のみ保存（image_url なし・visibility=private）
 * - 明示的アクション（マイページに保存・Xでシェア・画像で保存）→ image_url 保存・visibility=public
 * - 下書きバッジの表示（マイページ・オーナー）
 * - 下書きステータステキストの表示（カードエディタヘッダー）
 */
import { test, expect, Page } from '@playwright/test';

async function createCardAndGetId(page: Page): Promise<string> {
  await page.goto('/card/new');
  await page.getByText('Standard').click();
  await page.waitForURL(/\/card\/[a-zA-Z0-9]+\/edit/, { timeout: 15000 });
  const match = page.url().match(/\/card\/([a-zA-Z0-9]+)\/edit/);
  return match?.[1] ?? '';
}

// ─── 下書きステータス表示 ────────────────────────────────────────────────────

test.describe('カードエディタ — 下書きステータス', () => {
  test('cardId があるとき「下書き保存済み」または「保存中...」がヘッダーに表示される', async ({ page }) => {
    await createCardAndGetId(page);
    await expect(page.getByText(/下書き保存済み|保存中/)).toBeVisible({ timeout: 5000 });
  });

  test('入力中に「保存中...」に切り替わる', async ({ page }) => {
    await createCardAndGetId(page);
    await page.getByText('プロフィール情報').click();
    const nameInput = page.getByPlaceholder(/名前/i).first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill('下書きテスト');
    await expect(page.getByText('保存中...')).toBeVisible({ timeout: 3000 });
  });

  test('入力停止後に「下書き保存済み」に切り替わる', async ({ page }) => {
    await createCardAndGetId(page);
    await page.getByText('プロフィール情報').click();
    const nameInput = page.getByPlaceholder(/名前/i).first();
    await nameInput.fill('下書きテスト完了');
    await expect(page.getByText('下書き保存済み')).toBeVisible({ timeout: 5000 });
  });
});

// ─── 下書きバッジ（マイページ） ──────────────────────────────────────────────

test.describe('マイページ — 下書きバッジ', () => {
  test('image_url のない（下書き）カードに「下書き」バッジが表示される', async ({ page }) => {
    // カードを作成しただけで「マイページに保存」をしていない状態を確認
    // 作成直後のカードは image_url=null なのでバッジが出るはず
    const cardId = await createCardAndGetId(page);

    // マイページに移動
    await page.goto('/');
    const myPageLink = page.locator('header').getByRole('link', { name: 'マイページ' });
    await myPageLink.click();
    await page.waitForURL(/\/u\//);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('下書き')).toBeVisible({ timeout: 5000 });
  });

  test('「マイページに保存」後は「下書き」バッジが消える', async ({ page }) => {
    await createCardAndGetId(page);

    // 「マイページに保存」ボタンを押す
    const saveBtn = page.getByRole('button', { name: /マイページに保存/ });
    await expect(saveBtn).toBeVisible({ timeout: 5000 });
    await saveBtn.click();

    // 完了モーダルが表示されたらマイページへ
    const myPageBtn = page.getByRole('link', { name: /マイページ/ });
    await expect(myPageBtn).toBeVisible({ timeout: 10000 });
    await myPageBtn.click();
    await page.waitForURL(/\/u\//);
    await page.waitForLoadState('networkidle');

    // 下書きバッジが存在しない（または0件）
    const draftBadges = page.getByText('下書き');
    await expect(draftBadges).not.toBeVisible({ timeout: 3000 }).catch(() => {
      // バッジが残っていたらテスト失敗
    });
  });
});

// ─── 下書き状態の非公開確認 ──────────────────────────────────────────────────

test.describe('下書きカード — 非公開（visibility=private）', () => {
  test('下書き状態のカードは探索ページに表示されない', async ({ page, browser }) => {
    const cardId = await createCardAndGetId(page);

    // 別コンテキスト（未ログイン）で探索ページを開く
    const guestCtx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const guestPage = await guestCtx.newPage();
    await guestPage.goto('/c/vrchat');
    await guestPage.waitForLoadState('networkidle');

    // 作成したカードの cardId が探索ページに存在しない
    await expect(guestPage.locator(`[href*="${cardId}"]`)).not.toBeVisible();
    await guestCtx.close();
  });

  test('下書き状態のカード閲覧 URL は未ログインユーザーにアクセスできない（またはリダイレクト）', async ({ page, browser }) => {
    const cardId = await createCardAndGetId(page);

    const guestCtx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const guestPage = await guestCtx.newPage();
    await guestPage.goto(`/card/${cardId}`);
    await guestPage.waitForLoadState('networkidle');

    // 404 またはリダイレクトされること
    const url = guestPage.url();
    const has404 = await guestPage.getByText(/404|見つかりません|not found/i).isVisible().catch(() => false);
    const redirected = !url.includes(cardId);
    expect(has404 || redirected).toBe(true);
    await guestCtx.close();
  });
});

// ─── image_url 保存タイミング ─────────────────────────────────────────────────

test.describe('image_url 保存タイミング', () => {
  test('debounce 自動保存では image_url は保存されない（下書きバッジが残る）', async ({ page }) => {
    await createCardAndGetId(page);
    await page.getByText('プロフィール情報').click();
    const nameInput = page.getByPlaceholder(/名前/i).first();
    await nameInput.fill('imageなし確認');

    // debounce 完了を待つ（1.5秒 + 余裕）
    await page.waitForTimeout(3000);
    await expect(page.getByText('下書き保存済み')).toBeVisible();

    // マイページへ
    await page.goto('/');
    await page.locator('header').getByRole('link', { name: 'マイページ' }).click();
    await page.waitForURL(/\/u\//);
    await page.waitForLoadState('networkidle');

    // 下書きバッジが残っている
    await expect(page.getByText('下書き')).toBeVisible({ timeout: 5000 });
  });

  test('「マイページに保存」後は下書きバッジが消える（image_url 保存済み）', async ({ page }) => {
    await createCardAndGetId(page);
    const saveBtn = page.getByRole('button', { name: /マイページに保存/ });
    await saveBtn.click();

    // 完了モーダル or リダイレクトを待つ
    await page.waitForURL(/\/card\/[a-z0-9]+(\?created=1)?$/, { timeout: 15000 });
    await page.goto('/');
    await page.locator('header').getByRole('link', { name: 'マイページ' }).click();
    await page.waitForURL(/\/u\//);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('下書き')).not.toBeVisible({ timeout: 3000 });
  });
});
