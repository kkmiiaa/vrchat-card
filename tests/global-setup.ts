import { chromium, FullConfig } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

export default async function globalSetup(config: FullConfig) {
  const authFile = path.join(__dirname, '.auth/user.json')
  fs.mkdirSync(path.dirname(authFile), { recursive: true })

  const email = process.env.TEST_USER_EMAIL
  const password = process.env.TEST_USER_PASSWORD
  if (!email || !password) {
    console.warn('[global-setup] TEST_USER_EMAIL / TEST_USER_PASSWORD が未設定のためスキップ')
    return
  }

  const browser = await chromium.launch()
  const page = await browser.newPage()

  const baseURL = config.projects[0].use.baseURL ?? 'http://localhost:3001'
  await page.goto(`${baseURL}/auth/login`)

  // メール・パスワードでログイン
  await page.getByPlaceholder('メールアドレス').fill(email)
  await page.getByPlaceholder('パスワード').fill(password)
  await page.getByRole('button', { name: 'ログイン' }).click()

  // ログイン後のリダイレクト待ち
  await page.waitForURL(/\/(profile\/edit|u\/)/, { timeout: 10000 })

  // セッションを保存
  await page.context().storageState({ path: authFile })
  await browser.close()

  console.log('[global-setup] 認証済みセッションを保存しました:', authFile)
}
