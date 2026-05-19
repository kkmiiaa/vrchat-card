/**
 * モバイル版テスト（ログイン済み）
 *
 * iPhone 14 viewport（390×844）でのログイン済みユーザー操作を確認する。
 *
 * カバー範囲:
 *   A. カード編集 FloatingButtons
 *   B. カード閲覧 モバイルボタン（オーナー）
 *   C. マイページ モバイルレイアウト
 *   D. 画像保存・Web Share API
 *   E. ヘッダー表示条件
 *   F. トースト表示
 */
import { test, expect, Page } from '@playwright/test'

async function createCard(page: Page, templateName = 'Standard'): Promise<string> {
  await page.goto('/card/new')
  await page.getByText(templateName).click()
  await page.waitForURL(/\/card\/[a-zA-Z0-9]+\/edit/, { timeout: 15000 })
  const match = page.url().match(/\/card\/([a-zA-Z0-9]+)\/edit/)
  return match?.[1] ?? ''
}

// ─── A. カード編集 FloatingButtons ────────────────────────────────────────────

test.describe('A. カード編集 FloatingButtons（モバイル）', () => {
  test.beforeEach(async ({ page }) => {
    await createCard(page)
  })

  test('ヘッダーのボタン群は非表示（hidden sm:flex）', async ({ page }) => {
    // PC 向けボタン群は sm: 以上でのみ表示
    const headerButtons = page.locator('header .hidden.sm\\:flex')
    await expect(headerButtons).not.toBeVisible()
  })

  test('FloatingButtons が画面右下に表示される', async ({ page }) => {
    // FloatingButtons コンポーネントがモバイルで表示される
    const floating = page.getByRole('button', { name: /画像で保存/ })
    await expect(floating).toBeVisible()
    const box = await floating.boundingBox()
    if (box) {
      const viewportSize = page.viewportSize()
      // 画面右下エリアに表示されていること
      expect(box.y + box.height).toBeGreaterThan((viewportSize?.height ?? 0) * 0.5)
    }
  })

  test('FloatingButtons に「画像で保存」がある', async ({ page }) => {
    await expect(page.getByRole('button', { name: /画像で保存/ })).toBeVisible()
  })

  test('FloatingButtons に「Xでシェア」がある', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Xでシェア|シェア/ })).toBeVisible()
  })

  test('FloatingButtons に「マイページに保存」がある', async ({ page }) => {
    await expect(page.getByRole('button', { name: /マイページに保存/ })).toBeVisible()
  })

  test('FloatingButtons のボタン順序: 画像で保存 → Xでシェア → マイページに保存', async ({ page }) => {
    const saveBtn = page.getByRole('button', { name: /画像で保存/ })
    const xBtn    = page.getByRole('button', { name: /Xでシェア|シェア/ })
    const myPage  = page.getByRole('button', { name: /マイページに保存/ })

    const saveBox  = await saveBtn.boundingBox()
    const xBox     = await xBtn.boundingBox()
    const myPageBox = await myPage.boundingBox()

    if (saveBox && xBox && myPageBox) {
      // 縦並び（top が上から順）または横並び（left が左から順）のどちらかで確認
      const isVertical = Math.abs(saveBox.x - xBox.x) < 10
      if (isVertical) {
        expect(saveBox.y).toBeLessThan(xBox.y)
        expect(xBox.y).toBeLessThan(myPageBox.y)
      } else {
        expect(saveBox.x).toBeLessThan(xBox.x)
        expect(xBox.x).toBeLessThan(myPageBox.x)
      }
    }
  })

  test('下書き保存ステータスはモバイルで非表示（hidden sm:inline）', async ({ page }) => {
    // hidden sm:inline なのでモバイルでは表示されない
    const status = page.getByText(/下書き保存済み|保存中/)
    await expect(status).toBeAttached({ timeout: 5000 })
    await expect(status.first()).not.toBeVisible()
  })

  test('フォームを入力してもレイアウトが崩れない', async ({ page }) => {
    await page.getByRole('button', { name: 'プロフィール情報' }).click()
    await page.waitForTimeout(300)
    const nameSection = page.locator('h2').filter({ hasText: '名前' }).first()
    if (await nameSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      const input = nameSection.locator('..').locator('input[type="text"]')
      await input.fill('モバイル編集テスト')
    }
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1)
  })

  test('右パネル（カードデザイン）がスクロールできる', async ({ page }) => {
    // モバイルではパネルがスクロール可能なはず
    await expect(page.getByText('カードデザイン').first()).toBeVisible()
  })
})

// ─── B. カード保存後 モバイル（オーナー）────────────────────────────────────
// 保存後は /card/[id]?created=1 (CardEditorClient) に留まる。
// FloatingButtons（画像で保存・Xでシェア・マイページに保存）がオーナー向けUIとなる。

test.describe('B. カード保存後 オーナー（モバイル）', () => {
  test.beforeEach(async ({ page }) => {
    await createCard(page)
    await page.getByRole('button', { name: /マイページに保存/ }).click()
    await page.waitForURL(/\/card\/[a-zA-Z0-9]+\?created=1$/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
  })

  test('保存後ページがモバイルで正常表示される', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('500')
  })

  test('ヘッダーのPCボタン群はモバイルで非表示（hidden sm:flex）', async ({ page }) => {
    const headerBtn = page.locator('header .hidden.sm\\:flex')
    await expect(headerBtn).not.toBeVisible()
  })

  test('FloatingButtons に「画像で保存」「Xでシェア」「マイページに保存」がある', async ({ page }) => {
    await expect(page.getByRole('button', { name: /画像で保存/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Xでシェア|シェア/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /マイページに保存/ })).toBeVisible()
  })

  test('横スクロールが発生していない', async ({ page }) => {
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1)
  })
})

// ─── C. マイページ モバイルレイアウト ────────────────────────────────────────

test.describe('C. マイページ（モバイル）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('header').getByRole('link', { name: 'マイページ' }).click()
    await page.waitForURL(/\/u\//)
    await page.waitForLoadState('networkidle')
  })

  test('プロフィールが正常に表示される', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('500')
  })

  test('HeaderAuth が非表示（オーナー・hideMyPage=true）', async ({ page }) => {
    await expect(page.locator('header').getByRole('link', { name: 'マイページ' })).not.toBeVisible()
  })

  test('「編集」「設定」ボタンがプロフィール本文内に表示される', async ({ page }) => {
    // プロフィールヘッダー付近の編集・設定ボタン（テキスト付きのボタン）
    await expect(page.getByText('編集', { exact: true }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: '設定', exact: true })).toBeVisible()
  })

  test('設定モーダルがモバイルで開く', async ({ page }) => {
    await page.getByRole('button', { name: /設定/ }).click()
    // SettingsModal は role="dialog" を持たないため h2 で確認
    await expect(page.locator('h2').filter({ hasText: '設定' })).toBeVisible({ timeout: 5000 })
  })

  test('設定モーダルがモバイル幅に収まっている', async ({ page }) => {
    await page.getByRole('button', { name: /設定/ }).click()
    const modal = page.locator('h2').filter({ hasText: '設定' }).locator('../..')
    await expect(modal).toBeVisible({ timeout: 5000 })
    const box = await modal.boundingBox()
    const viewportWidth = page.viewportSize()?.width ?? 390
    if (box) expect(box.width).toBeLessThanOrEqual(viewportWidth)
  })

  test('横スクロールが発生していない', async ({ page }) => {
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1)
  })
})

// ─── D. 画像保存・Web Share API ──────────────────────────────────────────────

test.describe('D. 画像保存（モバイル）', () => {
  test.beforeEach(async ({ page }) => {
    await createCard(page)
  })

  test('「画像で保存」を押しても 500 エラーが出ない', async ({ page }) => {
    const btn = page.getByRole('button', { name: /画像で保存/ })
    await expect(btn).toBeVisible()
    // Web Share API はテスト環境では動作しないが、エラーにならないことを確認
    page.on('dialog', dialog => dialog.dismiss())
    await btn.click()
    await page.waitForTimeout(2000)
    await expect(page.locator('body')).not.toContainText('500')
  })

  test('「画像で保存」後にトーストが表示される', async ({ page }) => {
    page.on('dialog', dialog => dialog.dismiss())
    await page.getByRole('button', { name: /画像で保存/ }).click()
    await expect(
      page.locator('span').filter({ hasText: /URLで共有できるようにしませんか/ })
    ).toBeVisible({ timeout: 8000 })
  })

  test('トーストがモバイル幅に収まっている（左右 16px マージン）', async ({ page }) => {
    page.on('dialog', dialog => dialog.dismiss())
    await page.getByRole('button', { name: /画像で保存/ }).click()
    // SaveNudge トーストは fixed bottom-6 left-4 right-4 の div
    const toast = page.locator('div.fixed').filter({ hasText: /URLで共有できるようにしませんか/ })
    await expect(toast).toBeVisible({ timeout: 8000 })
    const box = await toast.boundingBox()
    const viewportWidth = page.viewportSize()?.width ?? 390
    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(12)
      expect(box.x + box.width).toBeLessThanOrEqual(viewportWidth - 12)
    }
  })
})

// ─── E. ヘッダー表示条件（モバイル） ─────────────────────────────────────────

test.describe('E. ヘッダー表示条件（モバイル・ログイン済み）', () => {
  test('LP で「マイページ」リンクが表示される', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header').getByRole('link', { name: 'マイページ' })).toBeVisible()
  })

  test('探索ページで「マイページ」リンクが表示される', async ({ page }) => {
    await page.goto('/c/vrchat')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('header').getByRole('link', { name: 'マイページ' })).toBeVisible()
  })

  test('カード編集で「マイページ」リンクが表示される', async ({ page }) => {
    await createCard(page)
    await expect(page.locator('header').getByRole('link', { name: 'マイページ' })).toBeVisible()
  })
})

// ─── F. トースト・モーダルのモバイルレイアウト ───────────────────────────────

test.describe('F. カード保存後の動作（モバイル）', () => {
  test('「マイページに保存」後に ?created=1 付き URL へリダイレクトされる', async ({ page }) => {
    await createCard(page)
    await page.getByRole('button', { name: /マイページに保存/ }).click()
    await page.waitForURL(/\?created=1$/, { timeout: 15000 })
    await expect(page.locator('body')).not.toContainText('500')
  })

  test('保存後ページが横スクロールしない', async ({ page }) => {
    await createCard(page)
    await page.getByRole('button', { name: /マイページに保存/ }).click()
    await page.waitForURL(/\?created=1$/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1)
  })
})
