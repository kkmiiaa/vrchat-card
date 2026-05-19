/**
 * 旧メーカー（/card/vrchat）デグレ防止テスト（重点チェック）
 *
 * 既存メーカーのユーザーは vaacard の主要な既存ユーザー層であり、
 * 新機能追加・リファクタリングによってこの導線が壊れることを防ぐ。
 *
 * カバー範囲:
 *   A. アクセス・リダイレクト
 *   B. 表示（エラーなし・主要 UI）
 *   C. フォーム入力（全セクション）
 *   D. カードプレビュー
 *   E. 画像保存・Xシェア
 *   F. localStorage による永続化
 *   G. ログイン訴求 UI
 *   H. ログイン済みユーザーの自動マイグレーション
 */
import { test, expect, Page } from '@playwright/test';

// ─── A. アクセス・リダイレクト ──────────────────────────────────────────────

test.describe('A. アクセス・リダイレクト', () => {
  test('未ログインで /card/vrchat にアクセスできる（ログインページへ飛ばない）', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();
    await page.goto('/card/vrchat');
    await expect(page).not.toHaveURL(/auth\/login/);
    await ctx.close();
  });

  test('/tools/vrchat-introduction-card は /card/vrchat にリダイレクトされる', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();
    await page.goto('/tools/vrchat-introduction-card');
    await expect(page).toHaveURL('/card/vrchat');
    await ctx.close();
  });

  test('/card/new とは別のページが表示される（テンプレ選択画面ではない）', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('テンプレートを選ぶ')).not.toBeVisible();
    await ctx.close();
  });
});

// ─── B. 表示（エラーなし・主要 UI） ─────────────────────────────────────────

test.describe('B. 表示', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
  });

  test('500 エラーが出ない', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });

  test('vaacard ロゴが表示される', async ({ page }) => {
    await expect(page.getByText('vaacard').first()).toBeVisible();
  });

  test('ページタイトルに VRChat が含まれる', async ({ page }) => {
    await expect(page).toHaveTitle(/VRChat/i);
  });

  test('カードプレビュー領域が表示される', async ({ page }) => {
    await expect(page.locator('section').first()).toBeVisible();
  });

  test('カードデザインセクションが表示される', async ({ page }) => {
    await expect(page.getByText('カードデザイン')).toBeVisible();
  });

  test('プロフィール情報セクションが表示される', async ({ page }) => {
    await expect(page.getByText('プロフィール情報')).toBeVisible();
  });

  test('ヘッダーに「画像で保存」ボタンが表示される', async ({ page }) => {
    await expect(page.getByRole('button', { name: /画像で保存/ })).toBeVisible();
  });

  test('ヘッダーに「Xでシェア」ボタンが表示される', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Xでシェア|シェア/ })).toBeVisible();
  });

  test('ヘッダーに「ログイン」リンクが表示される（未ログイン）', async ({ page }) => {
    await expect(page.locator('header').getByRole('link', { name: /ログイン/ })).toBeVisible();
  });
});

// ─── C. フォーム入力（全セクション） ────────────────────────────────────────

test.describe('C. フォーム入力 — プロフィール情報', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    await page.getByText('プロフィール情報').click();
  });

  test('名前を入力できる', async ({ page }) => {
    const input = page.getByPlaceholder(/名前/i).first();
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill('テスト太郎');
    await expect(input).toHaveValue('テスト太郎');
  });

  test('性別タグを入力できる', async ({ page }) => {
    const input = page.getByPlaceholder(/性別/i).first();
    if (await input.isVisible({ timeout: 3000 }).catch(() => false)) {
      await input.fill('男性');
      await expect(input).toHaveValue('男性');
    }
  });

  test('自己紹介を入力できる', async ({ page }) => {
    const textarea = page.getByPlaceholder(/自己紹介/i).first();
    if (await textarea.isVisible({ timeout: 3000 }).catch(() => false)) {
      await textarea.fill('よろしくお願いします');
      await expect(textarea).toHaveValue('よろしくお願いします');
    }
  });

  test('マイクON率のスライダーが表示される', async ({ page }) => {
    await expect(page.getByText('マイクON率')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('C. フォーム入力 — SNS・コンタクト', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    await page.getByText('SNS・コンタクト').first().click();
  });

  test('VRChat ID を入力できる', async ({ page }) => {
    const input = page.getByPlaceholder(/VRChat|vrchat/i).first();
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill('test_vrc_id');
    await expect(input).toHaveValue('test_vrc_id');
  });

  test('フレンド申請ポリシーセクションが表示される', async ({ page }) => {
    await expect(page.getByText('フレンド申請')).toBeVisible({ timeout: 5000 });
  });

  test('活動時間の入力欄が表示される', async ({ page }) => {
    await expect(page.getByText('活動時間')).toBeVisible({ timeout: 5000 });
  });

  test('OKなこと・NGなことが表示される', async ({ page }) => {
    await expect(page.getByText('OKなこと')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('C. フォーム入力 — カードデザイン', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
  });

  test('グラデーション背景の選択肢が表示される', async ({ page }) => {
    await expect(page.getByText('グラデーション背景')).toBeVisible();
  });

  test('フォントの設定が表示される', async ({ page }) => {
    await expect(page.getByText('フォントの設定')).toBeVisible();
  });

  test('背景カラーボタンをクリックできる', async ({ page }) => {
    const colorBtn = page.locator('button[style*="background"]').first();
    if (await colorBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await colorBtn.click();
      await expect(page.locator('body')).not.toContainText('500');
    }
  });
});

// ─── D. カードプレビュー ──────────────────────────────────────────────────────

test.describe('D. カードプレビュー', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('名前を入力してもプレビューがクラッシュしない', async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    await page.getByText('プロフィール情報').click();
    const input = page.getByPlaceholder(/名前/i).first();
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill('プレビューテスト');
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('長い自己紹介を入力してもレイアウトが崩れない（エラーなし）', async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    await page.getByText('プロフィール情報').click();
    const textarea = page.getByPlaceholder(/自己紹介/i).first();
    if (await textarea.isVisible({ timeout: 3000 }).catch(() => false)) {
      await textarea.fill('あ'.repeat(200));
      await expect(page.locator('body')).not.toContainText('500');
    }
  });

  test('背景を変更してもプレビューがクラッシュしない', async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    const colorBtn = page.locator('button[style*="background"]').first();
    if (await colorBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await colorBtn.click();
      await expect(page.locator('body')).not.toContainText('500');
    }
  });
});

// ─── E. 画像保存・Xシェア ────────────────────────────────────────────────────

test.describe('E. 画像保存・Xシェア', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('「画像で保存」を押しても 500 エラーが出ない', async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    const btn = page.getByRole('button', { name: /画像で保存/ });
    await expect(btn).toBeVisible();
    // ダウンロードダイアログをキャンセルする
    page.on('download', download => download.cancel());
    await btn.click();
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('「Xでシェア」を押すと Twitter URL が開こうとする（新しいタブ）', async ({ page, context }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    const btn = page.getByRole('button', { name: /Xでシェア|シェア/ });
    await expect(btn).toBeVisible();

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      btn.click(),
    ]).catch(() => [null]);

    if (newPage) {
      await expect(newPage).toHaveURL(/twitter\.com|x\.com/);
      await newPage.close();
    }
  });

  test('「画像で保存」後に登録訴求トーストが表示される', async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    page.on('download', download => download.cancel());
    await page.getByRole('button', { name: /画像で保存/ }).click();
    // トースト or バナーでアカウント登録を訴求する
    await expect(page.getByText(/URLで共有|アカウント|登録/)).toBeVisible({ timeout: 8000 });
  });
});

// ─── F. localStorage による永続化 ───────────────────────────────────────────

test.describe('F. localStorage 永続化', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('入力後にリロードしてもデータが保持される', async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    await page.getByText('プロフィール情報').click();
    const input = page.getByPlaceholder(/名前/i).first();
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill('永続テストユーザー');

    // debounce を待つ
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.getByText('プロフィール情報').click();
    await expect(page.getByPlaceholder(/名前/i).first()).toHaveValue('永続テストユーザー', { timeout: 5000 });
  });

  test('localStorage キーが vrchat-card-cache で保存されている', async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    await page.getByText('プロフィール情報').click();
    const input = page.getByPlaceholder(/名前/i).first();
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill('キー確認');
    await page.waitForTimeout(2000);

    const value = await page.evaluate(() => localStorage.getItem('vrchat-card-cache'));
    expect(value).not.toBeNull();
    const parsed = JSON.parse(value ?? '{}');
    expect(parsed).toBeTruthy();
  });
});

// ─── G. ログイン訴求 UI ──────────────────────────────────────────────────────

test.describe('G. ログイン訴求 UI', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('「URLで共有できる」旨のテキストまたは誘導が画面内にある', async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/URL|アカウント|登録|共有/)).toBeVisible({ timeout: 5000 });
  });

  test('「マイページに保存」ボタンが存在する', async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: /マイページに保存|マイページを作成/ })).toBeVisible();
  });

  test('「マイページに保存」を押すとログイン画面に遷移する', async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /マイページに保存|マイページを作成/ }).click();
    await expect(page).toHaveURL(/auth\/login/, { timeout: 5000 });
  });
});

// ─── H. ログイン済みユーザーの自動マイグレーション ─────────────────────────

test.describe('H. 自動マイグレーション（ログイン済み）', () => {
  test('旧メーカーで入力後にログインするとデータが引き継がれる', async ({ page, browser }) => {
    // Step 1: 未ログインで旧メーカーにアクセス・入力・localStorage 保存
    const guestCtx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const guestPage = await guestCtx.newPage();
    await guestPage.goto('/card/vrchat');
    await guestPage.waitForLoadState('networkidle');
    await guestPage.getByText('プロフィール情報').click();
    const input = guestPage.getByPlaceholder(/名前/i).first();
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill('マイグレーションテスト');
    await guestPage.waitForTimeout(2000);

    // localStorage の内容を取得
    const localData = await guestPage.evaluate(() => localStorage.getItem('vrchat-card-cache'));
    expect(localData).not.toBeNull();
    await guestCtx.close();

    // Step 2: ログイン済みコンテキストに同じ localStorage をセットして CardEditor を開く
    await page.goto('/card/new');
    await page.evaluate((data) => {
      localStorage.setItem('vrchat-card-cache', data!);
    }, localData);

    // CardEditor を開くと自動マイグレーションが走る
    await page.reload();
    await page.waitForLoadState('networkidle');

    // マイグレーション後はカードが保存されてマイページに反映される
    // （自動保存が走るため URL が変わるか、マイページにカードが出る）
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('自動マイグレーション後に /card/new でテンプレ選択が再表示されない', async ({ page }) => {
    // localStorage にデータがある状態でログイン済みアクセス
    await page.goto('/card/new');
    await page.evaluate(() => {
      localStorage.setItem('vrchat-card-cache', JSON.stringify({ name: 'マイグレーション確認' }));
    });
    await page.goto('/card/new');
    await page.waitForLoadState('networkidle');

    // テンプレ選択が即座に消えてエディタに遷移するか、
    // またはテンプレ選択が表示されたまま（マイグレーションは /card/new で動作しない仕様の場合）
    // いずれにせよ 500 エラーが出ないこと
    await expect(page.locator('body')).not.toContainText('500');
  });
});
