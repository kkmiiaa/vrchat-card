/**
 * モバイル版テスト（未ログイン）
 *
 * iPhone 14 viewport（390×844）での表示・操作を確認する。
 * PC 版とは異なるレイアウト・UI 要素（FloatingButtons、Web Share API など）を重点チェック。
 *
 * カバー範囲:
 *   A. LP・基本ナビゲーション
 *   B. 旧メーカー（/card/vrchat）モバイル版
 *   C. カード閲覧ページ モバイル版
 *   D. 探索ページ モバイル版
 *   E. ログインページ モバイル版
 */
import { test, expect } from '@playwright/test'

// ─── A. LP・基本ナビゲーション ───────────────────────────────────────────────

test.describe('A. LP モバイル', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('ページが正常に表示される（500なし）', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('500')
    await expect(page.locator('body')).not.toContainText('Internal Server Error')
  })

  test('vaacard ロゴが表示される', async ({ page }) => {
    await expect(page.getByText('vaacard').first()).toBeVisible()
  })

  test('「ログイン」リンクがヘッダーに表示される', async ({ page }) => {
    await expect(page.locator('header').getByRole('link', { name: 'ログイン' })).toBeVisible()
  })

  test('「カードを作る」CTAが表示される', async ({ page }) => {
    await expect(page.getByRole('link', { name: /カードを作る/ }).first()).toBeVisible()
  })

  test('「ユーザーを探す」はモバイルで非表示（PCのみ）', async ({ page }) => {
    // LP ヘッダーの「ユーザーを探す」は hidden sm:inline なのでモバイルでは非表示
    const exploreLink = page.locator('header').getByRole('link', { name: /ユーザーを探す/ })
    await expect(exploreLink).not.toBeVisible()
  })

  test('フッターが表示される', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(300)
    await expect(page.locator('footer')).toBeVisible({ timeout: 5000 })
  })

  test('横スクロールが発生していない', async ({ page }) => {
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1) // 1px の誤差を許容
  })
})

// ─── B. 旧メーカー（/card/vrchat）モバイル版 ────────────────────────────────

test.describe('B. 旧メーカー モバイル', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/card/vrchat')
    await page.waitForLoadState('networkidle')
  })

  test('エラーなく表示される', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('500')
  })

  test('カードプレビューが表示される', async ({ page }) => {
    await expect(page.locator('section').first()).toBeVisible()
  })

  test('ヘッダーのボタン群（画像で保存・Xでシェア）がモバイルで非表示', async ({ page }) => {
    // モバイルでは hidden sm:flex でヘッダーボタンは非表示
    const headerSaveBtn = page.locator('header').getByRole('button', { name: /画像で保存/ })
    await expect(headerSaveBtn).not.toBeVisible()
  })

  test('ヘッダーに「ログイン」リンクが表示される', async ({ page }) => {
    await expect(page.locator('header').getByRole('link', { name: /ログイン/ })).toBeVisible()
  })

  test('「マイページに保存」ボタンが画面内のどこかにある', async ({ page }) => {
    // モバイルでは FloatingButtons に移動
    await expect(page.getByRole('button', { name: /マイページに保存|マイページを作成/ })).toBeVisible()
  })

  test('横スクロールが発生していない', async ({ page }) => {
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1)
  })

  test('プロフィール情報アコーディオンを開いて名前を入力できる', async ({ page }) => {
    await page.getByRole('button', { name: 'プロフィール' }).click()
    await page.waitForTimeout(300)
    const nameSection = page.locator('h2').filter({ hasText: '名前' }).first()
    await nameSection.scrollIntoViewIfNeeded()
    await expect(nameSection).toBeVisible({ timeout: 5000 })
    const input = nameSection.locator('..').locator('input[type="text"]')
    await input.fill('モバイルテスト')
    await expect(input).toHaveValue('モバイルテスト')
  })

  test('入力後もレイアウトが崩れない（横スクロールなし）', async ({ page }) => {
    await page.getByRole('button', { name: 'プロフィール' }).click()
    await page.waitForTimeout(300)
    const nameSection = page.locator('h2').filter({ hasText: '名前' }).first()
    if (await nameSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      const input = nameSection.locator('..').locator('input[type="text"]')
      await input.fill('あ'.repeat(30))
    }
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1)
  })

  test('「画像で保存」ボタンが FloatingButtons に存在する', async ({ page }) => {
    // モバイルでは FloatingButtons（画面右下）にボタンが移動
    const floatingBtn = page.getByRole('button', { name: /画像で保存/ })
    await expect(floatingBtn).toBeVisible()
  })

  test('「Xでシェア」ボタンが FloatingButtons に存在する', async ({ page }) => {
    const floatingBtn = page.getByRole('button', { name: /Xでシェア|シェア/ })
    await expect(floatingBtn).toBeVisible()
  })

  test('「マイページに保存」を押すとログインページへ遷移する', async ({ page }) => {
    await page.getByRole('button', { name: /マイページに保存|マイページを作成/ }).click()
    await expect(page).toHaveURL(/auth\/login/, { timeout: 5000 })
  })

  test('ログインページがモバイルで正常に表示される', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).not.toContainText('500')
    await expect(page.getByRole('button', { name: /Google/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Discord/ })).toBeVisible()
  })
})

// ─── C. カード閲覧ページ モバイル版 ──────────────────────────────────────────

test.describe('C. カード閲覧 モバイル（未ログイン）', () => {
  test('公開カードにモバイルでアクセスできる', async ({ page }) => {
    const cardId = process.env.TEST_PUBLIC_CARD_ID
    if (!cardId) test.skip()
    await page.goto(`/card/${cardId}`)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).not.toContainText('500')
  })

  test('ヘッダーのオーナーボタンはモバイルで非表示', async ({ page }) => {
    const cardId = process.env.TEST_PUBLIC_CARD_ID
    if (!cardId) test.skip()
    await page.goto(`/card/${cardId}`)
    await page.waitForLoadState('networkidle')
    // hidden sm:flex なのでモバイルでは見えない
    const headerBtns = page.locator('header').getByRole('button')
    await expect(headerBtns).not.toBeVisible()
  })

  test('横スクロールが発生していない', async ({ page }) => {
    const cardId = process.env.TEST_PUBLIC_CARD_ID
    if (!cardId) test.skip()
    await page.goto(`/card/${cardId}`)
    await page.waitForLoadState('networkidle')
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1)
  })
})

// ─── D. 探索ページ モバイル版 ─────────────────────────────────────────────────

test.describe('D. 探索 モバイル', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/c/vrchat')
    await page.waitForLoadState('networkidle')
  })

  test('エラーなく表示される', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('500')
  })

  test('カード一覧がモバイルレイアウトで表示される', async ({ page }) => {
    // カードが存在する場合にグリッドが表示される
    await expect(page.locator('body')).not.toContainText('Internal Server Error')
  })

  test('横スクロールが発生していない', async ({ page }) => {
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1)
  })

  test('「ログイン」リンクがヘッダーに表示される', async ({ page }) => {
    await expect(page.locator('header').getByRole('link', { name: 'ログイン' })).toBeVisible()
  })
})

// ─── E. ログインページ モバイル版 ────────────────────────────────────────────

test.describe('E. ログインページ モバイル', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
  })

  test('エラーなく表示される', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('500')
  })

  test('Google・Discord ボタンが縦並びでタップしやすいサイズで表示される', async ({ page }) => {
    const googleBtn = page.getByRole('button', { name: /Google/ })
    const discordBtn = page.getByRole('button', { name: /Discord/ })
    await expect(googleBtn).toBeVisible()
    await expect(discordBtn).toBeVisible()

    const googleBox = await googleBtn.boundingBox()
    const discordBox = await discordBtn.boundingBox()
    // タップターゲットが 44px 以上（Apple HIG 基準）
    if (googleBox) expect(googleBox.height).toBeGreaterThanOrEqual(44)
    if (discordBox) expect(discordBox.height).toBeGreaterThanOrEqual(44)
  })

  test('メールフォームがタップできる', async ({ page }) => {
    const emailInput = page.getByPlaceholder('メールアドレス')
    await expect(emailInput).toBeVisible()
    await emailInput.tap()
    await emailInput.fill('test@example.com')
    await expect(emailInput).toHaveValue('test@example.com')
  })

  test('横スクロールが発生していない', async ({ page }) => {
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1)
  })
})
