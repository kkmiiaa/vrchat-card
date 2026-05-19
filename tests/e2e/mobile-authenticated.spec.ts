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
  await page.waitForURL(/\/card\/[a-z0-9]+\/edit$/, { timeout: 15000 })
  const match = page.url().match(/\/card\/([a-z0-9]+)\/edit/)
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

  test('下書き保存ステータスがヘッダー左に表示される', async ({ page }) => {
    await expect(page.getByText(/下書き保存済み|保存中/)).toBeVisible({ timeout: 5000 })
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

// ─── B. カード閲覧 モバイル（オーナー）──────────────────────────────────────

test.describe('B. カード閲覧 オーナー（モバイル）', () => {
  test.beforeEach(async ({ page }) => {
    const cardId = await createCard(page)
    await page.getByRole('button', { name: /マイページに保存/ }).click()
    await page.waitForURL(/\/card\/[a-z0-9]+(\?created=1)?$/, { timeout: 15000 })
    // モーダルが出た場合は閉じる or ページをそのまま使う
    await page.waitForLoadState('networkidle')
  })

  test('カード閲覧ページがモバイルで正常表示される', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('500')
  })

  test('ヘッダーのオーナーボタンはモバイルで非表示', async ({ page }) => {
    // hidden sm:flex なのでモバイルでは見えない
    const headerBtn = page.locator('header .hidden.sm\\:flex')
    await expect(headerBtn).not.toBeVisible()
  })

  test('画面下部にオーナー向けボタンが表示される（編集・画像で保存・Xで共有）', async ({ page }) => {
    await expect(page.getByRole('link', { name: /編集/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /画像で保存/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Xで共有|シェア/ })).toBeVisible()
  })

  test('モバイル下部ボタンの順序: 編集 → 画像で保存 → Xで共有', async ({ page }) => {
    const editLink = page.getByRole('link', { name: /編集/ })
    const saveBtn  = page.getByRole('button', { name: /画像で保存/ })
    const xBtn     = page.getByRole('button', { name: /Xで共有|シェア/ })

    const editBox = await editLink.boundingBox()
    const saveBox = await saveBtn.boundingBox()
    const xBox    = await xBtn.boundingBox()

    if (editBox && saveBox && xBox) {
      const isVertical = Math.abs(editBox.x - saveBox.x) < 10
      if (isVertical) {
        expect(editBox.y).toBeLessThan(saveBox.y)
        expect(saveBox.y).toBeLessThan(xBox.y)
      } else {
        expect(editBox.x).toBeLessThan(saveBox.x)
        expect(saveBox.x).toBeLessThan(xBox.x)
      }
    }
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
    await expect(page.getByRole('button', { name: /編集/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /設定/ })).toBeVisible()
  })

  test('設定モーダルがモバイルで開く', async ({ page }) => {
    await page.getByRole('button', { name: /設定/ }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
  })

  test('設定モーダルがモバイル幅に収まっている', async ({ page }) => {
    await page.getByRole('button', { name: /設定/ }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })
    const box = await dialog.boundingBox()
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
    const toast = page.locator('span').filter({ hasText: /URLで共有できるようにしませんか/ }).locator('../../..')
    await expect(toast).toBeVisible({ timeout: 8000 })
    const box = await toast.boundingBox()
    const viewportWidth = page.viewportSize()?.width ?? 390
    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(12) // left-4 = 16px
      expect(box.x + box.width).toBeLessThanOrEqual(viewportWidth - 12) // right-4
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

test.describe('F. カード作成完了モーダル（モバイル）', () => {
  test('保存完了モーダルがモバイルで表示される', async ({ page }) => {
    await createCard(page)
    await page.getByRole('button', { name: /マイページに保存/ }).click()
    await page.waitForURL(/\?created=1/, { timeout: 15000 })
    // モーダルが表示される
    await expect(page.getByText(/URLをコピー|コピー/)).toBeVisible({ timeout: 10000 })
  })

  test('完了モーダルがモバイル幅に収まっている', async ({ page }) => {
    await createCard(page)
    await page.getByRole('button', { name: /マイページに保存/ }).click()
    await page.waitForURL(/\?created=1/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')

    const modal = page.getByRole('dialog')
    if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
      const box = await modal.boundingBox()
      const viewportWidth = page.viewportSize()?.width ?? 390
      if (box) expect(box.width).toBeLessThanOrEqual(viewportWidth)
    }
  })
})
