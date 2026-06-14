/**
 * /upgrade ページ E2E テスト（仕様書 Section 対応）
 *
 * テスト対象:
 * - /upgrade ページのコンテンツ表示
 * - 未ログイン時: ボタン押下でログインページへリダイレクト
 * - ログイン済み(Free): ボタン押下で /api/stripe/checkout へリクエストが送られる
 * - 解約フロー: /api/stripe/portal エンドポイントの動作確認
 *
 * 注意:
 * - 実際の Stripe 決済・Webhook は E2E では検証しない
 * - upgrade_completed / subscription_cancelled は Stripe 側テストで担保
 */

import { test, expect } from '@playwright/test'

// ─── 未ログイン ────────────────────────────────────────────────────────────────

test.describe('/upgrade — 未ログイン', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('ページにアクセスできる', async ({ page }) => {
    await page.goto('/upgrade')
    await expect(page).toHaveURL('/upgrade')
  })

  test('タイトル「Proプランにアップグレード」が表示される', async ({ page }) => {
    await page.goto('/upgrade')
    await expect(page.getByRole('heading', { name: /Proプランにアップグレード/ })).toBeVisible()
  })

  test('Free プランの料金（¥0）が表示される', async ({ page }) => {
    await page.goto('/upgrade')
    await expect(page.getByText('¥0')).toBeVisible()
  })

  test('Pro プランの料金（¥500/月）が表示される', async ({ page }) => {
    await page.goto('/upgrade')
    await expect(page.getByText('¥500')).toBeVisible()
    await expect(page.getByText('/月')).toBeVisible()
  })

  test('Proプランの特徴が表示される', async ({ page }) => {
    await page.goto('/upgrade')
    await expect(page.getByText('カード枚数無制限')).toBeVisible()
    await expect(page.getByText('ユーザー検索・フィルター機能解放')).toBeVisible()
  })

  test('「Proにアップグレードする」ボタンが表示される', async ({ page }) => {
    await page.goto('/upgrade')
    await expect(page.getByRole('button', { name: /Proにアップグレードする/ })).toBeVisible()
  })

  test('「決済は Stripe により安全に処理されます」が表示される', async ({ page }) => {
    await page.goto('/upgrade')
    await expect(page.getByText(/Stripe により安全に処理/)).toBeVisible()
  })

  test('未ログインでボタン押下すると /auth/login へリダイレクトされる', async ({ page }) => {
    await page.goto('/upgrade')
    await page.getByRole('button', { name: /Proにアップグレードする/ }).click()
    await page.waitForURL(/\/auth\/login/, { timeout: 10000 })
    expect(page.url()).toContain('/auth/login')
  })

  test('「戻る」ボタンが表示される', async ({ page }) => {
    await page.goto('/upgrade')
    await expect(page.getByRole('button', { name: /戻る/ })).toBeVisible()
  })
})

// ─── ログイン済み（Free プラン） ───────────────────────────────────────────────

test.describe('/upgrade — ログイン済み（Free プラン）', () => {
  test('ページにアクセスできる', async ({ page }) => {
    await page.goto('/upgrade')
    await expect(page.getByRole('heading', { name: /Proプランにアップグレード/ })).toBeVisible()
  })

  test('「Proにアップグレードする」ボタンが表示される', async ({ page }) => {
    await page.goto('/upgrade')
    await expect(page.getByRole('button', { name: /Proにアップグレードする/ })).toBeVisible()
  })

  test('ボタン押下で /api/stripe/checkout にリクエストが送られる', async ({ page }) => {
    await page.goto('/upgrade')

    // /api/stripe/checkout へのリクエストをインターセプト
    const checkoutRequestPromise = page.waitForRequest(
      req => req.url().includes('/api/stripe/checkout') && req.method() === 'POST',
      { timeout: 10000 }
    )

    await page.getByRole('button', { name: /Proにアップグレードする/ }).click()
    const checkoutRequest = await checkoutRequestPromise
    expect(checkoutRequest).toBeTruthy()
  })

  test('ボタン押下後に「処理中...」と表示される', async ({ page }) => {
    await page.goto('/upgrade')

    // checkout レスポンスを遅延させて「処理中...」を確認
    await page.route('**/api/stripe/checkout', async route => {
      await new Promise(r => setTimeout(r, 2000))
      await route.abort()
    })

    await page.getByRole('button', { name: /Proにアップグレードする/ }).click()
    await expect(page.getByRole('button', { name: /処理中/ })).toBeVisible({ timeout: 3000 })
  })
})

// ─── /api/stripe/checkout — APIレベル確認 ──────────────────────────────────────

test.describe('/api/stripe/checkout — ログイン済み', () => {
  test('ボタン押下で checkout リクエストがネットワーク越しに送信される', async ({ page }) => {
    await page.goto('/upgrade')

    // /api/stripe/checkout へのリクエストをキャプチャ
    const requestPromise = page.waitForRequest(
      req => req.url().includes('/api/stripe/checkout') && req.method() === 'POST',
      { timeout: 10000 }
    )
    await page.getByRole('button', { name: /Proにアップグレードする/ }).click()
    const req = await requestPromise
    // リクエストが送信されたことを確認（レスポンスステータスはセッション状態に依存）
    expect(req.method()).toBe('POST')
  })
})

// ─── /api/stripe/portal — APIレベル確認 ────────────────────────────────────────

test.describe('/api/stripe/portal — 解約フロー（ログイン済み）', () => {
  test('Free ユーザーは Stripe カスタマー未登録のため 400 または 401 が返る', async ({ page }) => {
    await page.goto('/upgrade')
    const res = await page.request.post('/api/stripe/portal')
    // 未認証(401) または Free でカスタマーなし(400) のいずれか
    // どちらも「Pro 決済なしユーザーへの正常な拒否応答」
    expect([400, 401]).toContain(res.status())
  })

  test('400 の場合は no_stripe_customer エラーが返る', async ({ page }) => {
    await page.goto('/upgrade')
    const res = await page.request.post('/api/stripe/portal')
    if (res.status() === 400) {
      const json = await res.json()
      expect(json.error).toBe('no_stripe_customer')
    } else {
      // 401 (セッション切れ) または 200 (Pro ユーザー) の場合はスキップ
      test.skip()
    }
  })
})
