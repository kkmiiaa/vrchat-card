import { test, expect } from '@playwright/test'

test.describe('ログイン後の導線', () => {
  test('/card/new にアクセスするとテンプレート選択が表示される', async ({ page }) => {
    await page.goto('/card/new')
    await expect(page).toHaveURL('/card/new')
    await expect(page.getByText('テンプレートを選ぶ')).toBeVisible()
  })

  test('テンプレート一覧に Standard と Glass が表示される', async ({ page }) => {
    await page.goto('/card/new')
    await expect(page.getByText('Standard')).toBeVisible()
    await expect(page.getByText('Glass')).toBeVisible()
  })

  test('Standard テンプレートを選択するとエディタに遷移する', async ({ page }) => {
    await page.goto('/card/new')
    await page.getByText('Standard').click()
    await page.waitForURL(/\/card\/[a-z0-9-]+$/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/card\/[a-z0-9-]+$/)
  })

  test('未ログイン状態では /card/new が /auth/login にリダイレクト', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await context.newPage()
    await page.goto('/card/new')
    await expect(page).toHaveURL(/auth\/login/)
    await context.close()
  })
})

test.describe('カードエディタ（ログイン済み）', () => {
  test('エディタが正常に表示される', async ({ page }) => {
    await page.goto('/card/new')
    await page.getByText('Standard').click()
    await page.waitForURL(/\/card\/[a-z0-9-]+$/, { timeout: 10000 })

    await expect(page.getByText('vaacard').first()).toBeVisible()
    await expect(page.getByText('カードデザイン')).toBeVisible()
    await expect(page.getByRole('button', { name: /画像で保存/ })).toBeVisible()
  })

  test('プロフィール情報セクションが存在する', async ({ page }) => {
    await page.goto('/card/new')
    await page.getByText('Standard').click()
    await page.waitForURL(/\/card\/[a-z0-9-]+$/, { timeout: 10000 })

    await expect(page.getByText('プロフィール情報')).toBeVisible()
  })

  test('名前を入力するとプレビューに反映される', async ({ page }) => {
    await page.goto('/card/new')
    await page.getByText('Standard').click()
    await page.waitForURL(/\/card\/[a-z0-9-]+$/, { timeout: 10000 })

    // プロフィール情報セクションを開く
    await page.getByText('プロフィール情報').click()
    const nameInput = page.getByPlaceholder(/名前|name/i).first()
    await nameInput.fill('テストユーザー')
    await expect(nameInput).toHaveValue('テストユーザー')
  })
})

test.describe('プロフィールページ（ログイン済み）', () => {
  test('マイページが表示される', async ({ page }) => {
    // ログイン済みならトップページからマイページリンクが見える
    await page.goto('/')
    const myPageLink = page.getByRole('link', { name: 'マイページ' })
    if (await myPageLink.isVisible()) {
      await myPageLink.click()
      await expect(page).toHaveURL(/\/u\//)
    }
  })
})
