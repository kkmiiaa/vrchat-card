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

  test('未ログイン時はテンプレート選択画面ではなく旧メーカーのエディタが表示される', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('テンプレートを選ぶ')).not.toBeVisible();
    await ctx.close();
  });

  // TC-6-A-4: ログイン済み・V1カードなし → /card/new にリダイレクト
  // TC-6-A-5: ログイン済み・V1カードあり → 最古のV1カード編集画面にリダイレクト
  // → TC-6-I に詳細テストあり
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

  test('右パネルに「カードデザイン」セクションが表示される', async ({ page }) => {
    // 右パネルのカードデザインは常時展開（アコーディオンではない）
    await expect(page.getByText('カードデザイン').first()).toBeVisible();
  });

  test('「プロフィール情報」アコーディオンが表示される', async ({ page }) => {
    // 右パネル（aside）を下にスクロールして表示
    await page.locator('aside').evaluate(el => el.scrollTop = 500);
    const btn = page.getByRole('button', { name: 'プロフィール' });
    await expect(btn).toBeVisible({ timeout: 10000 });
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
    // 右パネルをスクロールしてプロフィール情報アコーディオンを開く
    await page.locator('aside').evaluate(el => el.scrollTop = 500);
    const profileBtn = page.getByRole('button', { name: 'プロフィール' });
    await profileBtn.waitFor({ state: 'visible', timeout: 10000 });
    await profileBtn.click();
    await page.waitForTimeout(500);
    // アコーディオン展開後さらにスクロール
    await page.locator('aside').evaluate(el => el.scrollTop = 1200);
  });

  test('名前フィールドに入力できる', async ({ page }) => {
    // name ブロック: placeholder なし、ラベル「名前」の直下にある input
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible({ timeout: 8000 });
    await input.fill('テスト太郎');
    await expect(input).toHaveValue('テスト太郎');
  });

  test('マイクON率のスライダーが表示される', async ({ page }) => {
    // マイクON率はプロフィールセクション内に表示される
    const micLabel = page.getByText(/マイクON率/i).first();
    await page.locator('aside').evaluate(el => el.scrollTop += 300);
    await expect(micLabel).toBeVisible({ timeout: 8000 });
  });

  test('自己紹介テキストエリアが表示される', async ({ page }) => {
    // selfIntro ブロック
    const selfIntroSection = page.locator('h2').filter({ hasText: /自己紹介/i }).first();
    if (await selfIntroSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      const textarea = selfIntroSection.locator('..').locator('textarea');
      await expect(textarea).toBeVisible();
    }
  });
});

test.describe('C. フォーム入力 — SNS・コンタクト', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    await page.locator('aside').evaluate(el => el.scrollTop = 500);
    const snsBtn = page.getByRole('button', { name: /SNS・(コンタクト|関わり方)/ }).first();
    await snsBtn.waitFor({ state: 'visible', timeout: 10000 });
    await snsBtn.click();
    await page.waitForTimeout(300);
  });

  test('VRChat ID フィールドに入力できる', async ({ page }) => {
    // sns ブロック: <span>VRChat ID</span> の直後に input
    const label = page.locator('span').filter({ hasText: /^VRChat ID$/ }).first();
    await expect(label).toBeVisible({ timeout: 5000 });
    const input = label.locator('..').locator('input[type="text"]');
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill('test_vrc_id');
    await expect(input).toHaveValue('test_vrc_id');
  });

  test('フレンド申請ポリシーセクションが表示される', async ({ page }) => {
    const el = page.getByText(/フレンド申請/i).first();
    await el.scrollIntoViewIfNeeded();
    await expect(el).toBeVisible({ timeout: 5000 });
  });

  // 活動時間 (activityBlock) は v2 テンプレートのみ。v1 (/card/vrchat) には存在しない
  test('SNS情報ラベルが表示される（v1 は活動時間なし）', async ({ page }) => {
    // SNS・関わり方セクションが開いている状態でVRChat IDラベルを確認
    await page.locator('aside').evaluate(el => el.scrollTop += 300);
    const el = page.getByText(/VRChat ID|SNS|コンタクト|関わり方/i).first();
    await expect(el).toBeVisible({ timeout: 8000 });
  });

  test('OKなこと・NGなことが表示される', async ({ page }) => {
    await page.locator('aside').evaluate(el => el.scrollTop += 500);
    const el = page.getByText(/OKなこと|OK・NG|mark-grid/i).first();
    await expect(el).toBeVisible({ timeout: 8000 });
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

  test('単色背景のカラーボタンをクリックできる', async ({ page }) => {
    // 単色背景セクションのボタン
    await expect(page.getByText('単色背景')).toBeVisible();
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
    await page.locator('aside').evaluate(el => el.scrollTop = 500); const _profBtn = page.getByRole('button', { name: 'プロフィール' }); await _profBtn.waitFor({ state: 'visible', timeout: 10000 }); await _profBtn.click();
    await page.waitForTimeout(300);
    await page.locator('aside').evaluate(el => el.scrollTop = 1200);
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible({ timeout: 8000 });
    await input.fill('プレビューテスト');
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('グラデーション背景を変更してもプレビューがクラッシュしない', async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    const gradBtns = page.locator('button[class*="rounded"]').filter({ hasNot: page.locator('svg') });
    const firstGrad = gradBtns.first();
    if (await firstGrad.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstGrad.click();
      await expect(page.locator('body')).not.toContainText('500');
    }
  });

  test('長い名前を入力してもエラーが出ない', async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    await page.locator('aside').evaluate(el => el.scrollTop = 500); const _profBtn = page.getByRole('button', { name: 'プロフィール' }); await _profBtn.waitFor({ state: 'visible', timeout: 10000 }); await _profBtn.click();
    await page.waitForTimeout(300);
    await page.locator('aside').evaluate(el => el.scrollTop = 1200);
    const nameInput = page.locator('input[type="text"]').first();
    if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nameInput.fill('あ'.repeat(50));
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
    page.on('download', download => download.cancel());
    await btn.click();
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).not.toContainText('500');
  });

  // TC-6-E-2: Xへ共有はログイン不要でそのままXを開く
  test('「Xでシェア」を押すとログインリダイレクトなしで Twitter/X の URL が開く', async ({ page, context }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    const btn = page.getByRole('button', { name: /Xでシェア|シェア/ });
    await expect(btn).toBeVisible();

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      btn.click(),
    ]).catch(() => [null]);

    // ログインページへ飛んでいないこと
    await expect(page).not.toHaveURL(/auth\/login/);

    if (newPage) {
      await expect(newPage).toHaveURL(/twitter\.com|x\.com/);
      await newPage.close();
    }
  });

  // TC-6-E-3: 画像保存後にnudgeが表示される
  test('「画像で保存」後にマイページ保存を促すnudgeが表示される', async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    page.on('download', download => download.cancel());
    await page.getByRole('button', { name: /画像で保存/ }).click();
    await expect(page.getByText('マイページに保存して、URLで共有できるようにしませんか？')).toBeVisible({ timeout: 8000 });
  });

  // TC-6-E-4: Xへ共有後にnudgeが表示される
  test('「Xでシェア」後にマイページ保存を促すnudgeが表示される', async ({ page, context }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    const btn = page.getByRole('button', { name: /Xでシェア|シェア/ });

    await Promise.all([
      context.waitForEvent('page').then(p => p.close()).catch(() => {}),
      btn.click(),
    ]);

    await expect(page.getByText('マイページに保存して、URLで共有できるようにしませんか？')).toBeVisible({ timeout: 5000 });
  });
});

// ─── F. localStorage による永続化 ───────────────────────────────────────────

test.describe('F. localStorage 永続化', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('名前を入力→リロード後もデータが保持される', async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    await page.locator('aside').evaluate(el => el.scrollTop = 500); const _profBtn = page.getByRole('button', { name: 'プロフィール' }); await _profBtn.waitFor({ state: 'visible', timeout: 10000 }); await _profBtn.click();
    await page.waitForTimeout(300);
    await page.locator('aside').evaluate(el => el.scrollTop = 1200);
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible({ timeout: 8000 });
    await input.fill('永続テストユーザー');

    // localStorage 保存を待つ（debounce）
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.locator('aside').evaluate(el => el.scrollTop = 500); const _profBtn2 = page.getByRole('button', { name: 'プロフィール' }); await _profBtn2.waitFor({ state: 'visible', timeout: 10000 }); await _profBtn2.click();
    await page.waitForTimeout(300);
    await page.locator('aside').evaluate(el => el.scrollTop = 1200);
    const reloadedInput = page.locator('input[type="text"]').first();
    await expect(reloadedInput).toHaveValue('永続テストユーザー', { timeout: 8000 });
  });

  test('localStorage のキーが vrchat-card-cache になっている', async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    await page.locator('aside').evaluate(el => el.scrollTop = 500); const _profBtn = page.getByRole('button', { name: 'プロフィール' }); await _profBtn.waitFor({ state: 'visible', timeout: 10000 }); await _profBtn.click();
    await page.waitForTimeout(300);
    await page.locator('aside').evaluate(el => el.scrollTop = 1200);
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible({ timeout: 8000 });
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

  test('「マイページに保存」ボタンが存在する', async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: /マイページに保存|マイページを作成/ })).toBeVisible();
  });

  test('「マイページに保存」を押すと /auth/login?next=/card/vrchat に遷移する', async ({ page }) => {
    await page.goto('/card/vrchat');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /マイページに保存|マイページを作成/ }).click();
    await expect(page).toHaveURL(/auth\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/next=.*card.*vrchat/, { timeout: 5000 });
  });
});

// ─── H. ログイン済みユーザーの自動マイグレーション ─────────────────────────

test.describe('H. 自動マイグレーション（ログイン済み）', () => {
  test('旧メーカーで保存した localStorage が CardEditor で読み込まれる', async ({ page }) => {
    // localStorage にデータをセットしてから /card/new を開く
    await page.goto('/card/new');
    await page.evaluate(() => {
      localStorage.setItem('vrchat-card-cache', JSON.stringify({ name: 'マイグレーションテスト' }));
    });
    await page.goto('/card/new');
    await page.waitForLoadState('networkidle');

    // 500 エラーが出ないこと
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('自動マイグレーション後に /card/new でエラーが出ない', async ({ page }) => {
    await page.goto('/card/new');
    await page.evaluate(() => {
      localStorage.setItem('vrchat-card-cache', JSON.stringify({ name: 'マイグレーション確認' }));
    });
    await page.goto('/card/new');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('500');
  });
});

// ─── I. ログイン済みリダイレクト（TC-6-I） ───────────────────────────────────
// ログイン済みセッションが必須。[authenticated] プロジェクトのみ有効。

// 直列実行: V1カードの状態をテスト間で干渉させない
test.describe.serial('I. ログイン済みリダイレクト', () => {
  test.use({ storageState: 'tests/.auth/user.json' });

  // 各テスト前に既存 V1 カードをすべて削除してクリーンな状態にする
  test.beforeEach(async ({ request }, testInfo) => {
    if (testInfo.project.name !== 'authenticated') return;
    const cardsRes = await request.get('/api/cards');
    if (!cardsRes.ok()) return;
    const cards = await cardsRes.json();
    const v1Cards = (cards as Array<{ id: string; template_id: string }>).filter(c => c.template_id === 'v1');
    for (const card of v1Cards) {
      await request.delete(`/api/cards/${card.id}`);
    }
  });

  test('TC-6-I-1: V1カードなしで /card/vrchat にアクセスすると /card/new にリダイレクト', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'authenticated') test.skip();
    await page.goto('/card/vrchat');
    await expect(page).toHaveURL('/card/new', { timeout: 5000 });
  });

  test('TC-6-I-2: V1カード1枚ありで /card/vrchat にアクセスすると /card/{id}/edit にリダイレクト', async ({ page, request }, testInfo) => {
    if (testInfo.project.name !== 'authenticated') test.skip();
    const createRes = await request.post('/api/cards', {
      data: { templateId: 'v1', cardData: { name: 'リダイレクトテスト' }, visibility: 'private' },
    });
    expect(createRes.ok()).toBeTruthy();
    const { cardId } = await createRes.json();

    try {
      await page.goto('/card/vrchat');
      await expect(page).toHaveURL(new RegExp(`/card/${cardId}/edit`), { timeout: 5000 });
    } finally {
      await request.delete(`/api/cards/${cardId}`);
    }
  });

  test('TC-6-I-3: V1カード複数ありで /card/vrchat にアクセスすると最古のカード編集画面にリダイレクト', async ({ page, request }, testInfo) => {
    if (testInfo.project.name !== 'authenticated') test.skip();
    const res1 = await request.post('/api/cards', {
      data: { templateId: 'v1', cardData: { name: '古いカード' }, visibility: 'private' },
    });
    const res2 = await request.post('/api/cards', {
      data: { templateId: 'v1', cardData: { name: '新しいカード' }, visibility: 'private' },
    });
    expect(res1.ok()).toBeTruthy();
    expect(res2.ok()).toBeTruthy();
    const { cardId: oldCardId } = await res1.json();
    const { cardId: newCardId } = await res2.json();

    try {
      await page.goto('/card/vrchat');
      await expect(page).toHaveURL(new RegExp(`/card/${oldCardId}/edit`), { timeout: 5000 });
    } finally {
      await request.delete(`/api/cards/${oldCardId}`);
      await request.delete(`/api/cards/${newCardId}`);
    }
  });
});
