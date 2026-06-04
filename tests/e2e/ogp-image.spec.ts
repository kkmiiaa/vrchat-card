/**
 * OGP 画像生成テスト
 *
 * カード保存時に生成される OGP 画像（imageBase64）に
 * 設定した背景色が実際に含まれているかを検証する。
 *
 * 背景を単色（#ef4444 = 赤）に設定し、保存時の PATCH リクエストを
 * インターセプトして imageBase64 をデコード、指定色のピクセルが
 * 存在するかを Canvas API で確認する。
 */
import { test, expect, Page } from '@playwright/test';

/** base64 画像データから指定 RGB に近いピクセルが存在するか検証 */
async function imageContainsColor(
  page: Page,
  base64: string,
  target: { r: number; g: number; b: number },
  tolerance = 20,
): Promise<boolean> {
  return page.evaluate(
    ({ base64, target, tolerance }) =>
      new Promise<boolean>(resolve => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          const { data } = ctx.getImageData(0, 0, img.width, img.height);
          for (let i = 0; i < data.length; i += 4) {
            if (
              Math.abs(data[i]     - target.r) <= tolerance &&
              Math.abs(data[i + 1] - target.g) <= tolerance &&
              Math.abs(data[i + 2] - target.b) <= tolerance &&
              data[i + 3] > 128 // 半透明以上
            ) {
              resolve(true);
              return;
            }
          }
          resolve(false);
        };
        img.onerror = () => resolve(false);
        img.src = base64;
      }),
    { base64, target, tolerance },
  );
}

/** PATCH リクエストの imageBase64 をキャプチャする */
async function captureOgpImage(page: Page): Promise<string | null> {
  let captured: string | null = null;
  page.on('request', request => {
    if (request.method() !== 'PATCH') return;
    if (!request.url().includes('/api/cards/')) return;
    try {
      const body = request.postDataJSON();
      if (body?.imageBase64) captured = body.imageBase64 as string;
    } catch { /* ignore */ }
  });
  return new Promise(resolve => {
    // 30 秒以内にキャプチャできなければ null を返す
    const timer = setTimeout(() => resolve(null), 30000);
    const interval = setInterval(() => {
      if (captured !== null) {
        clearInterval(interval);
        clearTimeout(timer);
        resolve(captured);
      }
    }, 200);
  });
}

test.describe('OGP 画像に背景が含まれる', () => {
  test('単色（赤）背景がOGP画像に反映される', async ({ page }) => {
    // カード作成
    await page.goto('/card/new');
    await page.getByText('Standard').click();
    await page.waitForURL(/\/card\/[a-z0-9-]+$/, { timeout: 15000 });

    // 背景設定セクションを開く
    const bgSection = page.getByText('背景設定');
    await expect(bgSection).toBeVisible({ timeout: 5000 });

    // 「カラフル」テーマを展開して #ef4444（赤）を選択
    await page.getByText('カラフル').click();
    // title 属性または aria-label で特定の色スウォッチをクリック
    const redSwatch = page.locator(`[style*="ef4444"], button[title="#ef4444"]`).first();
    if (await redSwatch.isVisible({ timeout: 2000 }).catch(() => false)) {
      await redSwatch.click();
    } else {
      // フォールバック：カラフルテーマの17番目のスウォッチ（#ef4444 の位置）
      const swatches = page.locator('button').filter({ hasAttribute: 'style' });
      // カラフルテーマが展開された後のスウォッチ一覧から赤系を探す
      const allSwatches = await page.locator('.grid button').all();
      for (const swatch of allSwatches) {
        const style = await swatch.getAttribute('style');
        if (style?.includes('ef4444') || style?.includes('238, 68, 68')) {
          await swatch.click();
          break;
        }
      }
    }

    // imageBase64 キャプチャを開始
    const imagePromise = captureOgpImage(page);

    // 「カードをシェア」ボタンを押す
    const shareBtn = page.getByRole('button', { name: /カードをシェア|マイページへ保存/ }).first();
    await expect(shareBtn).toBeVisible({ timeout: 5000 });
    await shareBtn.click();

    // 保存完了を待つ（最大 30 秒）
    await page.waitForURL(/\/card\/[a-z0-9-]+(\?|$)/, { timeout: 30000 });

    const imageBase64 = await imagePromise;
    expect(imageBase64, 'imageBase64 が PATCH リクエストに含まれること').toBeTruthy();

    // 画像に赤（#ef4444 = rgb(239,68,68)）のピクセルが存在するか検証
    const hasRed = await imageContainsColor(
      page,
      imageBase64!,
      { r: 239, g: 68, b: 68 },
      25,
    );
    expect(hasRed, 'OGP 画像に設定した赤背景色のピクセルが含まれること').toBe(true);
  });

  test('グラデーション背景がOGP画像に反映される（白一色でない）', async ({ page }) => {
    await page.goto('/card/new');
    await page.getByText('Standard').click();
    await page.waitForURL(/\/card\/[a-z0-9-]+$/, { timeout: 15000 });

    // imageBase64 キャプチャを開始
    const imagePromise = captureOgpImage(page);

    // デフォルト背景（プリセット画像）のままシェア
    const shareBtn = page.getByRole('button', { name: /カードをシェア|マイページへ保存/ }).first();
    await expect(shareBtn).toBeVisible({ timeout: 5000 });
    await shareBtn.click();
    await page.waitForURL(/\/card\/[a-z0-9-]+(\?|$)/, { timeout: 30000 });

    const imageBase64 = await imagePromise;
    expect(imageBase64, 'imageBase64 が PATCH リクエストに含まれること').toBeTruthy();

    // 全ピクセルが白（255,255,255）でないことを確認（= 背景が描画されている）
    const isAllWhite = await page.evaluate(
      (base64) =>
        new Promise<boolean>(resolve => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0);
            const { data } = ctx.getImageData(0, 0, img.width, img.height);
            let nonWhiteCount = 0;
            for (let i = 0; i < data.length; i += 4) {
              if (data[i + 3] < 128) continue; // 透明は無視
              if (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250) {
                nonWhiteCount++;
              }
            }
            // 1% 以上のピクセルが非白なら背景あり
            resolve(nonWhiteCount < (data.length / 4) * 0.01);
          };
          img.onerror = () => resolve(true);
          img.src = base64!;
        }),
      imageBase64,
    );

    expect(isAllWhite, 'OGP 画像が白一色でないこと（背景が描画されている）').toBe(false);
  });
});
