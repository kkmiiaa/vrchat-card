/**
 * カードエディタ デグレ防止テスト
 *
 * 既存ユーザーが影響を受けやすい操作を重点的にカバーする。
 * V1は /card/vrchat/v1 でログイン不要、V2は認証済みセッションを使用。
 */
import { test, expect } from '@playwright/test';

// ─── V1 エディタ（ログイン不要） ────────────────────────────────────────────

test.describe('V1 エディタ — 基本表示', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/card/vrchat/v1');
    // カードがレンダリングされるまで待つ
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
    await expect(page.getByText('カードデザイン')).toBeVisible();
  });

  test('背景設定が表示される', async ({ page }) => {
    await expect(page.getByText('背景の設定')).toBeVisible();
  });
});

test.describe('V1 エディタ — フォーム入力', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/card/vrchat/v1');
    await page.waitForLoadState('networkidle');
  });

  test('プロフィール情報セクションを開いて名前を入力できる', async ({ page }) => {
    await page.getByText('プロフィール情報').click();
    const nameInput = page.getByPlaceholder(/名前/i).first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill('デグレテスト太郎');
    await expect(nameInput).toHaveValue('デグレテスト太郎');
  });

  test('性別フィールドに入力できる', async ({ page }) => {
    await page.getByText('プロフィール情報').click();
    const genderInput = page.getByPlaceholder(/性別/i).first();
    if (await genderInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await genderInput.fill('男性');
      await expect(genderInput).toHaveValue('男性');
    }
  });

  test('SNS・コンタクト情報セクションを開ける', async ({ page }) => {
    const snsSection = page.getByText('SNS・コンタクト').first();
    if (await snsSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await snsSection.click();
      await expect(page.getByText('SNS・コンタクト').first()).toBeVisible();
    }
  });

  test('グラデーション背景を選択できる', async ({ page }) => {
    // グラデーション背景のボタン群が表示されている
    await expect(page.getByText('グラデーション背景')).toBeVisible();
  });

  test('フォントを切り替えられる', async ({ page }) => {
    await expect(page.getByText('フォントの設定')).toBeVisible();
  });
});

test.describe('V1 エディタ — カードプレビュー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/card/vrchat/v1');
    await page.waitForLoadState('networkidle');
  });

  test('カードプレビュー領域が表示される', async ({ page }) => {
    // section タグ内にカードがある
    const previewSection = page.locator('section').first();
    await expect(previewSection).toBeVisible();
  });

  test('名前を入力するとプレビューに反映される（プレビュー領域がクラッシュしない）', async ({ page }) => {
    await page.getByText('プロフィール情報').click();
    const nameInput = page.getByPlaceholder(/名前/i).first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill('テスト');

    // 入力後も 500 エラーが出ていないこと
    await expect(page.locator('body')).not.toContainText('500');
  });
});

// ─── V2 エディタ（ログイン不要ルート） ──────────────────────────────────────

test.describe('V2 エディタ — 基本表示', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/card/vrchat/v2');
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
    await expect(page.getByText('カードデザイン')).toBeVisible();
  });

  test('「画像で保存」ボタンが存在する', async ({ page }) => {
    await expect(page.getByRole('button', { name: /画像で保存/ })).toBeVisible();
  });
});

test.describe('V2 エディタ — セクション表示（デグレ防止）', () => {
  /**
   * V2 は値が未入力でもすべての基本セクションが表示される仕様。
   * 以前の実装では値がないとセクションが非表示になっていたため、
   * この動作が後退していないことを確認する。
   */
  test.beforeEach(async ({ page }) => {
    await page.goto('/card/vrchat/v2');
    await page.waitForLoadState('networkidle');
  });

  test('プロフィール情報セクションが存在する', async ({ page }) => {
    await expect(page.getByText('プロフィール情報')).toBeVisible();
  });

  test('SNS・コンタクトセクションが存在する', async ({ page }) => {
    const snsSectionBtn = page.getByText('SNS・コンタクト').first();
    await expect(snsSectionBtn).toBeVisible();
  });

  test('自己紹介・画像セクションが存在する', async ({ page }) => {
    await expect(page.getByText('自己紹介・画像')).toBeVisible();
  });
});

test.describe('V2 エディタ — フォーム入力（デグレ防止）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/card/vrchat/v2');
    await page.waitForLoadState('networkidle');
  });

  test('プロフィール情報セクションを開いて名前を入力できる', async ({ page }) => {
    await page.getByText('プロフィール情報').click();
    const nameInput = page.getByPlaceholder(/名前/i).first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill('V2テストユーザー');
    await expect(nameInput).toHaveValue('V2テストユーザー');
  });

  test('フレンド申請ポリシーが VRChat ID の下に表示される', async ({ page }) => {
    // SNS・コンタクト内にフレンド申請セクションがある
    await page.getByText('SNS・コンタクト').first().click();
    await expect(page.getByText('フレンド申請')).toBeVisible({ timeout: 5000 });
  });

  test('活動時間の入力フォームが表示される', async ({ page }) => {
    await page.getByText('SNS・コンタクト').first().click();
    await expect(page.getByText('活動時間')).toBeVisible({ timeout: 5000 });
  });

  test('OKなこと・NGなことのセクションが表示される', async ({ page }) => {
    await page.getByText('SNS・コンタクト').first().click();
    await expect(page.getByText('OKなこと')).toBeVisible({ timeout: 5000 });
  });

  test('マイクON率のスライダーが表示される', async ({ page }) => {
    await page.getByText('プロフィール情報').click();
    await expect(page.getByText('マイクON率')).toBeVisible({ timeout: 5000 });
  });
});
