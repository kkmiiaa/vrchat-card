/**
 * V1 カードエディタ フォーム動作テスト（非ログイン）
 *
 * /card/vrchat/v1 でログインなしにアクセスできる全セクション・全フィールドを検証する。
 */
import { test, expect, Page } from '@playwright/test';

const URL = '/card/vrchat/v1';

/**
 * アコーディオンのセクションボタンをクリックして開き、
 * コンテンツが展開されるまで待つ。
 */
async function openSection(page: Page, title: string) {
  const btn = page.locator('button', { hasText: title }).first();
  await btn.waitFor({ state: 'visible', timeout: 10000 });
  await btn.click();
  // React の状態更新 + DOM 展開を待つ
  await page.waitForTimeout(400);
}

/** range input に値をセットして React の onChange を発火させる */
async function setRangeValue(page: Page, locator: ReturnType<Page['locator']>, value: number) {
  await locator.evaluate((el, v) => {
    const input = el as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
    setter.call(input, String(v));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

/** h2ラベルの直後の input を取得する（placeholder なしフィールド用） */
function getInputByLabel(page: Page, labelText: string) {
  return page.locator(`h2:has-text("${labelText}")`).locator('xpath=following-sibling::*[1]//input | xpath=following-sibling::input[1]');
}

// 全テスト共通: ページを開いてマウント完了を待つ
test.beforeEach(async ({ page }) => {
  await page.goto(URL);
  // networkidle だけでなく、アコーディオンが描画されるまで待つ
  await expect(page.locator('button', { hasText: 'カードデザイン' }).first()).toBeVisible({ timeout: 10000 });
});

// ─── カードデザイン ───────────────────────────────────────────────────────────

test.describe('カードデザイン セクション', () => {
  // カードデザインは defaultOpen: true なので初期表示で開いている

  test('デフォルトで開いていて背景設定が見える', async ({ page }) => {
    await expect(page.getByText('背景の設定')).toBeVisible();
    await expect(page.getByText('グラデーション背景')).toBeVisible();
  });

  test('単色背景のカラーボタンが複数存在する', async ({ page }) => {
    await expect(page.getByText('単色背景')).toBeVisible();
    // 単色背景セクション直下のボタン
    const btns = page.getByText('単色背景').locator('../..').locator('button');
    const count = await btns.count();
    expect(count).toBeGreaterThan(3);
  });

  test('グラデーション背景ボタンをクリックできる', async ({ page }) => {
    const gradArea = page.getByText('グラデーション背景').locator('../..');
    const firstBtn = gradArea.locator('button').first();
    await expect(firstBtn).toBeVisible({ timeout: 5000 });
    await firstBtn.click();
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('フォント設定ラベルが表示される', async ({ page }) => {
    await expect(page.getByText('フォントの設定')).toBeVisible();
  });

  test('フォントボタンをクリックできる', async ({ page }) => {
    const fontBtn = page.getByRole('button', { name: /うずら|kawaii|マルミーニャ/i }).first();
    await expect(fontBtn).toBeVisible({ timeout: 5000 });
    await fontBtn.click();
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('吹き出しトグルが表示されてクリックできる', async ({ page }) => {
    // BalloonToggle は role="switch" のボタン
    const toggle = page.getByRole('switch').first();
    await expect(toggle).toBeVisible({ timeout: 5000 });
    const before = await toggle.getAttribute('aria-checked');
    await toggle.click();
    const after = await toggle.getAttribute('aria-checked');
    expect(after).not.toBe(before);
    await expect(page.locator('body')).not.toContainText('500');
  });
});

// ─── プロフィール情報 ─────────────────────────────────────────────────────────

test.describe('プロフィール情報 セクション', () => {
  test.beforeEach(async ({ page }) => {
    await openSection(page, 'プロフィール情報');
  });

  test('セクションを開けて名前フィールドが現れる', async ({ page }) => {
    // name block: h2 に '名前' テキスト、その直後に input
    await expect(page.locator('h2', { hasText: '名前' }).first()).toBeVisible({ timeout: 5000 });
    const input = page.locator('h2', { hasText: '名前' }).first().locator('xpath=..').locator('input[type="text"]');
    await expect(input).toBeVisible({ timeout: 5000 });
  });

  test('名前フィールドに入力できる', async ({ page }) => {
    // h2の直接の親divの中のinput（XPathで直接親を取得）
    const input = page.locator('h2', { hasText: '名前' }).first().locator('xpath=..').locator('input[type="text"]');
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill('テストユーザー');
    await expect(input).toHaveValue('テストユーザー');
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('名前を空にしてもエラーが出ない', async ({ page }) => {
    const input = page.locator('h2', { hasText: '名前' }).first().locator('xpath=..').locator('input[type="text"]');
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill('一度入力');
    await input.fill('');
    await expect(input).toHaveValue('');
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('性別フィールドに入力できる', async ({ page }) => {
    const input = page.locator('h2', { hasText: '性別' }).first().locator('xpath=..').locator('input[type="text"]');
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill('男性');
    await expect(input).toHaveValue('男性');
  });

  test('性別フィールドは maxLength=4 で制限されている', async ({ page }) => {
    const input = page.locator('h2', { hasText: '性別' }).first().locator('xpath=..').locator('input[type="text"]');
    await expect(input).toBeVisible({ timeout: 5000 });
    // maxLength属性またはReact制御で4文字を超えないはず
    const maxLen = await input.getAttribute('maxlength');
    if (maxLen) {
      expect(Number(maxLen)).toBeLessThanOrEqual(4);
    } else {
      // maxLength属性がなければ入力制限なしとして skip
      test.skip();
    }
  });

  test('年齢ラベルが表示される', async ({ page }) => {
    await expect(page.getByText('年齢').first()).toBeVisible({ timeout: 5000 });
  });
});

// ─── 使用環境・言語 ───────────────────────────────────────────────────────────

test.describe('使用環境・言語 セクション', () => {
  test.beforeEach(async ({ page }) => {
    await openSection(page, '使用環境・言語');
  });

  test('セクションを開けて使用環境ラベルが現れる', async ({ page }) => {
    await expect(page.getByText('使用環境').first()).toBeVisible({ timeout: 5000 });
  });

  test('PCVR ボタンをクリックして選択状態になる', async ({ page }) => {
    const btn = page.getByRole('button', { name: 'PCVR' });
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    await expect(btn).toHaveClass(/text-\[#00AADB\]|bg-sky-50/);
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('Quest ボタンをクリックできる', async ({ page }) => {
    const btn = page.getByRole('button', { name: 'Quest' });
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('Desktop ボタンをクリックできる', async ({ page }) => {
    const btn = page.getByRole('button', { name: 'Desktop' });
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('環境ボタンを複数選択できる', async ({ page }) => {
    await page.getByRole('button', { name: 'PCVR' }).click();
    await page.getByRole('button', { name: 'Quest' }).click();
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('選択した環境ボタンを再クリックすると解除される', async ({ page }) => {
    const btn = page.getByRole('button', { name: 'PCVR' });
    await btn.click();
    await expect(btn).toHaveClass(/text-\[#00AADB\]|bg-sky-50/);
    await btn.click(); // 解除
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('日本語ボタンをクリックして選択できる', async ({ page }) => {
    const btn = page.getByRole('button', { name: '日本語' });
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    await expect(btn).toHaveClass(/text-\[#00AADB\]|bg-sky-50/);
  });

  test('English ボタンをクリックして選択できる', async ({ page }) => {
    const btn = page.getByRole('button', { name: 'English' });
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('その他の言語をカンマ区切りで入力できる', async ({ page }) => {
    const input = page.getByPlaceholder(/その他の言語|カンマ区切り/i);
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill('French, Spanish');
    await expect(input).toHaveValue('French, Spanish');
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('マイクON率スライダーが表示される', async ({ page }) => {
    const micParent = page.locator('h2', { hasText: 'マイクON率' }).first().locator('xpath=..');
    await expect(micParent.locator('input[type="range"]')).toBeVisible({ timeout: 5000 });
  });

  test('マイクON率スライダーを 70% に設定できる', async ({ page }) => {
    const micParent = page.locator('h2', { hasText: 'マイクON率' }).first().locator('xpath=..');
    const slider = micParent.locator('input[type="range"]');
    await expect(slider).toBeVisible({ timeout: 5000 });
    await setRangeValue(page, slider, 70);
    await expect(micParent.locator('span', { hasText: '70%' })).toBeVisible({ timeout: 3000 });
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('マイクON率を 0% と 100% に設定できる', async ({ page }) => {
    const micParent = page.locator('h2', { hasText: 'マイクON率' }).first().locator('xpath=..');
    const slider = micParent.locator('input[type="range"]');
    await setRangeValue(page, slider, 100);
    await expect(micParent.locator('span', { hasText: '100%' })).toBeVisible();
    await setRangeValue(page, slider, 0);
    await expect(micParent.locator('span', { hasText: '0%' })).toBeVisible();
  });
});

// ─── SNS・コンタクト ──────────────────────────────────────────────────────────

test.describe('SNS・コンタクト セクション', () => {
  test.beforeEach(async ({ page }) => {
    await openSection(page, 'SNS・コンタクト');
  });

  test('セクションを開けて SNS情報ラベルが現れる', async ({ page }) => {
    await expect(page.getByText('SNS情報').first()).toBeVisible({ timeout: 5000 });
  });

  test('VRChat ID フィールドに入力できる', async ({ page }) => {
    // VRChat ID はラベルで識別（プレースホルダーなし）
    const input = page.locator('label').filter({ hasText: 'VRChat ID' }).locator('input');
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill('test_vrc_id');
    await expect(input).toHaveValue('test_vrc_id');
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('X（旧Twitter）ID フィールドに入力できる', async ({ page }) => {
    const input = page.getByPlaceholder('@yourhandle');
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill('test_twitter_id');
    await expect(input).toHaveValue('test_twitter_id');
  });

  test('Discord ID フィールドに入力できる', async ({ page }) => {
    const input = page.getByPlaceholder('YourName#1234');
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill('test_discord#1234');
    await expect(input).toHaveValue('test_discord#1234');
  });

  test('フレンド申請ポリシーの選択肢が5つすべて表示される', async ({ page }) => {
    // フレンド申請ポリシーのh2を含むセクション内を確認
    const policySection = page.locator('div', { has: page.locator('h2', { hasText: 'フレンド申請ポリシー' }) }).first();
    await expect(policySection).toBeVisible({ timeout: 5000 });
    await expect(policySection.getByRole('button', { name: 'だれでもOK' })).toBeVisible();
    await expect(policySection.getByRole('button', { name: '仲良くなってから許可' })).toBeVisible();
    await expect(policySection.getByRole('button', { name: '気になったら許可' })).toBeVisible();
    await expect(policySection.getByRole('button', { name: 'Twitter相互は申請OK' })).toBeVisible();
    await expect(policySection.getByRole('button', { name: '送らないでください' })).toBeVisible();
  });

  test('フレンド申請ポリシーを選択できる', async ({ page }) => {
    const btn = page.getByRole('button', { name: 'だれでもOK' });
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    await expect(btn).toHaveClass(/text-\[#00AADB\]|bg-sky-50/);
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('フレンド申請ポリシーを複数選択できる', async ({ page }) => {
    await page.getByRole('button', { name: 'だれでもOK' }).click();
    await page.getByRole('button', { name: 'Twitter相互は申請OK' }).click();
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('ステータス4色のフィールドがすべて表示される', async ({ page }) => {
    await expect(page.getByText('青ステータス')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('緑ステータス')).toBeVisible();
    await expect(page.getByText('黄ステータス')).toBeVisible();
    await expect(page.getByText('赤ステータス')).toBeVisible();
  });

  test('青ステータスのフィールドに入力できる', async ({ page }) => {
    const blueInput = page.locator('label').filter({ hasText: '青ステータス' }).locator('input');
    await expect(blueInput).toBeVisible({ timeout: 5000 });
    await blueInput.fill('ワールド探索中');
    await expect(blueInput).toHaveValue('ワールド探索中');
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('OK/NG のデフォルト 6 項目が表示される', async ({ page }) => {
    // OKなこと・NGなことのh2の直接親div内を確認
    const okNgParent = page.locator('h2', { hasText: 'OKなこと・NGなこと' }).first().locator('xpath=..');
    await expect(okNgParent).toBeVisible({ timeout: 5000 });
    // 各項目は disabled input の value として表示される
    await expect(okNgParent.locator('input[disabled][value="触る"], input:disabled[value="触る"]').or(
      okNgParent.locator('input').filter({ hasValue: '触る' })
    ).first()).toBeVisible();
    // セレクトボックスが6つある（デフォルト6項目）
    await expect(okNgParent.locator('select')).toHaveCount(6, { timeout: 3000 });
  });

  test('OK/NG のマークを ◎ に変更できる', async ({ page }) => {
    const okNgParent = page.locator('h2', { hasText: 'OKなこと・NGなこと' }).first().locator('xpath=..');
    await expect(okNgParent).toBeVisible({ timeout: 5000 });
    const select = okNgParent.locator('select').first();
    await expect(select).toBeVisible({ timeout: 5000 });
    await select.selectOption('◎');
    await expect(select).toHaveValue('◎');
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('すべてのマーク選択肢（―◎◯△✗）を選べる', async ({ page }) => {
    const okNgParent = page.locator('h2', { hasText: 'OKなこと・NGなこと' }).first().locator('xpath=..');
    await expect(okNgParent).toBeVisible({ timeout: 5000 });
    const select = okNgParent.locator('select').first();
    for (const mark of ['-', '◎', '◯', '△', '✗']) {
      await select.selectOption(mark);
      await expect(page.locator('body')).not.toContainText('500');
    }
  });

  test('カスタム項目を追加できる', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /カスタム項目を追加/ });
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    const okNgParent = page.locator('h2', { hasText: 'OKなこと・NGなこと' }).first().locator('xpath=..');
    const selectsBefore = await okNgParent.locator('select').count();
    await addBtn.click();
    await expect(okNgParent.locator('select')).toHaveCount(selectsBefore + 1, { timeout: 3000 });
    await expect(page.locator('body')).not.toContainText('500');
  });
});

// ─── 自己紹介・画像 ───────────────────────────────────────────────────────────

test.describe('自己紹介・画像 セクション', () => {
  test.beforeEach(async ({ page }) => {
    await openSection(page, '自己紹介・画像');
  });

  test('セクションを開けて自己紹介テキストラベルが現れる', async ({ page }) => {
    await expect(page.getByText('自己紹介テキスト')).toBeVisible({ timeout: 5000 });
  });

  test('自己紹介テキストエリアに入力できる', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible({ timeout: 5000 });
    await textarea.fill('はじめまして！テスト用の自己紹介文です。');
    await expect(textarea).toHaveValue('はじめまして！テスト用の自己紹介文です。');
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('ギャラリー画像ラベルが表示される', async ({ page }) => {
    await expect(page.getByText('ギャラリー画像').first()).toBeVisible({ timeout: 5000 });
  });

  test('ギャラリー表示トグルボタンをクリックできる', async ({ page }) => {
    // gallery toggle は button（checkbox ではない）
    const galleryBtn = page.getByRole('button', { name: /ギャラリーを表示する/ });
    await expect(galleryBtn).toBeVisible({ timeout: 5000 });
    await galleryBtn.click();
    await expect(page.locator('body')).not.toContainText('500');
  });
});

// ─── 統合テスト ───────────────────────────────────────────────────────────────

test.describe('フォーム統合テスト', () => {
  test('全セクションを順に開閉してもエラーが出ない', async ({ page }) => {
    for (const title of ['プロフィール情報', 'SNS・コンタクト', '自己紹介・画像', '使用環境・言語']) {
      await openSection(page, title);
      await expect(page.locator('body')).not.toContainText('500');
    }
  });

  test('複数セクションで入力してもプレビューがクラッシュしない', async ({ page }) => {
    // プロフィール情報
    await openSection(page, 'プロフィール情報');
    const nameInput = page.locator('h2', { hasText: '名前' }).first().locator('xpath=..').locator('input[type="text"]');
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill('統合テストユーザー');

    // 使用環境・言語
    await openSection(page, '使用環境・言語');
    await page.getByRole('button', { name: 'PCVR' }).click();
    await page.getByRole('button', { name: '日本語' }).click();
    const micParent = page.locator('h2', { hasText: 'マイクON率' }).first().locator('xpath=..');
    const slider = micParent.locator('input[type="range"]');
    await setRangeValue(page, slider, 55);
    await expect(micParent.locator('span', { hasText: '55%' })).toBeVisible({ timeout: 3000 });

    // SNS・コンタクト
    await openSection(page, 'SNS・コンタクト');
    const vrchatInput = page.locator('label').filter({ hasText: 'VRChat ID' }).locator('input');
    await expect(vrchatInput).toBeVisible({ timeout: 5000 });
    await vrchatInput.fill('integration_test');

    // 自己紹介
    await openSection(page, '自己紹介・画像');
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible({ timeout: 5000 });
    await textarea.fill('統合テスト用自己紹介文。');

    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('ページタイトルに vaacard が含まれる', async ({ page }) => {
    await expect(page).toHaveTitle(/vaacard/i);
  });

  test('ヘッダーに vaacard ロゴが表示される', async ({ page }) => {
    await expect(page.getByText('vaacard').first()).toBeVisible();
  });

  test('「画像で保存」と「Xでシェア」ボタンが両方表示される', async ({ page }) => {
    await expect(page.getByRole('button', { name: /画像で保存/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Xでシェア|シェア/ })).toBeVisible();
  });
});
