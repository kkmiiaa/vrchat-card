import { FullConfig } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

async function ensureTestUser(email: string, password: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) return

  // ローカルスタック（127.0.0.1）のみ自動作成を試みる
  if (!supabaseUrl.includes('127.0.0.1') && !supabaseUrl.includes('localhost')) return

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${serviceRoleKey}`,
    'apikey': serviceRoleKey,
  }

  // ユーザー一覧を取得して存在確認
  const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, { headers })
  const listJson = await listRes.json()
  const existing = (listJson.users ?? []).find((u: { email: string }) => u.email === email)

  let userId: string | undefined

  if (!existing) {
    const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password, email_confirm: true }),
    })
    if (!createRes.ok) {
      console.warn(`[global-setup] テストユーザー作成失敗: ${await createRes.text()}`)
      return
    }
    const created = await createRes.json()
    userId = created.id
    console.log(`[global-setup] テストユーザー作成: ${email}`)
  } else {
    userId = existing.id
    // パスワードを確実に同期する
    await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ password, email_confirm: true }),
    })
    console.log(`[global-setup] テストユーザー確認済み（パスワード同期）: ${email}`)
  }

  // テストユーザーをProプランに設定（ローカル環境）
  if (userId) {
    const postgrestUrl = supabaseUrl.replace('/auth/v1', '') + '/rest/v1'
    const updateRes = await fetch(`${postgrestUrl}/users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ plan: 'pro', plan_expires_at: null }),
    })
    if (updateRes.ok) {
      console.log(`[global-setup] テストユーザーをProプランに設定: ${email}`)
    } else {
      console.warn(`[global-setup] Proプラン設定失敗: ${await updateRes.text()}`)
    }
  }
}

async function ensurePublicCardByOtherUser(publicCardId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) return
  if (!supabaseUrl.includes('127.0.0.1') && !supabaseUrl.includes('localhost')) return

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${serviceRoleKey}`,
    'apikey': serviceRoleKey,
  }
  const restUrl = supabaseUrl.replace('/auth/v1', '') + '/rest/v1'

  const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, { headers })
  const listJson = await listRes.json()
  const testUserId = (listJson.users ?? []).find((u: { email: string }) => u.email === process.env.TEST_USER_EMAIL)?.id

  // 既にそのカードが別ユーザー所有で存在するか確認
  const cardRes = await fetch(`${restUrl}/cards?id=eq.${publicCardId}`, { headers })
  const cards = await cardRes.json()
  if (cards.length > 0 && cards[0].user_id !== testUserId) return

  // 別ユーザーを作成
  const otherEmail = 'other@example.com'
  let otherId = (listJson.users ?? []).find((u: { email: string }) => u.email === otherEmail)?.id

  if (!otherId) {
    const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email: otherEmail, password: 'password123', email_confirm: true }),
    })
    otherId = (await createRes.json()).id
  }

  // usersテーブルに行を作成（FK制約のため）
  await fetch(`${restUrl}/users`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=minimal,resolution=ignore-duplicates' },
    body: JSON.stringify({ id: otherId, plan: 'free' }),
  })

  // テストユーザー所有の同IDカードがあれば削除
  if (cards.length > 0) {
    await fetch(`${restUrl}/cards?id=eq.${publicCardId}`, { method: 'DELETE', headers })
  }

  // 公開カードをそのユーザーで作成
  await fetch(`${restUrl}/cards`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify({ id: publicCardId, user_id: otherId, template_id: 'v1', card_data: {}, visibility: 'public' }),
  })
  console.log(`[global-setup] 非オーナー用公開カード作成: ${publicCardId}`)
}

export default async function globalSetup(_config: FullConfig) {
  fs.mkdirSync(path.join(__dirname, '.auth'), { recursive: true })

  const email = process.env.TEST_USER_EMAIL
  const password = process.env.TEST_USER_PASSWORD
  if (!email || !password) {
    console.warn('[global-setup] TEST_USER_EMAIL / TEST_USER_PASSWORD が未設定のためスキップ')
    return
  }

  await ensureTestUser(email, password)

  const publicCardId = process.env.TEST_PUBLIC_CARD_ID
  if (publicCardId) await ensurePublicCardByOtherUser(publicCardId)
}
