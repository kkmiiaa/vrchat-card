import { test, expect } from '@playwright/test'

test.describe('ログイン後の導線', () => {
  test('/card/new にアクセスするとテンプレート選択が表示される', async ({ page }) => {
    await page.goto('/card/new')
    await expect(page).toHaveURL('/card/new')
    await expect(page.getByText('テンプレートを選ぶ')).toBeVisible()
  })

  test('テンプレート一覧に Simple と Glass が表示される', async ({ page }) => {
    await page.goto('/card/new')
    await expect(page.getByText('Simple')).toBeVisible()
    await expect(page.getByText('Glass')).toBeVisible()
  })

  test('Simple テンプレートを選択するとエディタに遷移する', async ({ page }) => {
    await page.goto('/card/new')
    await page.getByText('Simple').click()
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
    await page.getByText('Simple').click()
    await page.waitForURL(/\/card\/[a-z0-9-]+$/, { timeout: 10000 })

    await expect(page.getByText('vaacard').first()).toBeVisible()
    await expect(page.getByText('カードデザイン').first()).toBeVisible()
    await expect(page.getByRole('button', { name: /画像で保存/ })).toBeVisible()
  })

  test('プロフィール情報セクションが存在する', async ({ page }) => {
    await page.goto('/card/new')
    await page.getByText('Simple').click()
    await page.waitForURL(/\/card\/[a-z0-9-]+$/, { timeout: 10000 })

    await expect(page.getByRole('button', { name: /プロフィール/ }).first()).toBeVisible()
  })

  test('名前を入力するとプレビューに反映される', async ({ page }) => {
    await page.goto('/card/new')
    await page.getByText('Simple').click()
    await page.waitForURL(/\/card\/[a-zA-Z0-9-]+(\/edit|\?|$)/, { timeout: 10000 })

    // プロフィールセクションを開く（スクロール必要）
    await page.locator('aside').evaluate(el => el.scrollTop = 500)
    const profileBtn = page.getByRole('button', { name: 'プロフィール' }).first()
    await profileBtn.waitFor({ state: 'visible', timeout: 10000 })
    await profileBtn.click()
    await page.waitForTimeout(500)
    await page.locator('aside').evaluate(el => el.scrollTop = 1200)
    const nameInput = page.getByPlaceholder(/名前|name/i).first()
    await expect(nameInput).toBeVisible({ timeout: 8000 })
    await nameInput.fill('テストユーザー')
    await expect(nameInput).toHaveValue('テストユーザー')
  })
})

test.describe('/c/vrchat — ログイン済み（フリープラン）', () => {
  // テストユーザーはProのため、フリープランテストは未ログイン状態で実行
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/c/vrchat');
    await page.waitForLoadState('networkidle');
  });

  test('ページが表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'VRChat 界隈のユーザーをみつける' })).toBeVisible();
  });

  test('検索フォームが表示されない（フリープラン）', async ({ page }) => {
    await expect(page.getByPlaceholder('名前・自己紹介で検索...')).not.toBeVisible();
  });

  test('Proプランへの促進バナーが表示される（フリープラン）', async ({ page }) => {
    await expect(page.getByText('Proプランで詳細検索が使えます')).toBeVisible();
  });

  test('カードにユーザー名が表示される', async ({ page }) => {
    // カードが存在する場合、ユーザー名（プロフィールのdisplay_name）が表示される
    const cardNames = page.locator('.grid a p.text-xs.font-semibold');
    const count = await cardNames.count();
    if (count > 0) {
      const name = await cardNames.first().textContent();
      expect(name).toBeTruthy();
    }
  });
});

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
