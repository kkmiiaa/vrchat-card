import { test as setup, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const authFile = path.join(__dirname, '../.auth/user.json')

setup('認証済みセッションを取得', async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL
  const password = process.env.TEST_USER_PASSWORD

  if (!email || !password) {
    throw new Error('TEST_USER_EMAIL / TEST_USER_PASSWORD を .env.test に設定してください')
  }

  await page.goto('/auth/login')
  await page.getByPlaceholder('メールアドレス').fill(email)
  await page.getByPlaceholder('パスワード').fill(password)
  await page.getByRole('button', { name: 'ログイン', exact: true }).click()

  // エラーメッセージが表示されたか確認
  const errorVisible = await page.getByText('メールアドレスまたはパスワードが正しくありません').isVisible().catch(() => false)
  if (errorVisible) {
    throw new Error(
      'Supabase GoTrueの認証に失敗しました。\n' +
      'このプロジェクトのGoTrueインスタンスにスキーマ互換性の問題があります。\n' +
      '新しいSupabaseプロジェクトを作成してください。\n' +
      `試したメール: ${email}`
    )
  }

  await page.waitForURL(/\/(profile\/edit|u\/|card\/)?$/, { timeout: 15000 })

  await page.context().storageState({ path: authFile })
})
