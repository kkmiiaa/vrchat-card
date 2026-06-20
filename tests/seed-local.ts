/**
 * ローカル Supabase にテスト用シードデータを投入するスクリプト
 *
 * 使い方: npm run seed:local
 * global-setup.ts から自動実行される（ローカル環境のみ）
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import { SEED_CARDS, SEED_OTHER_USER, OWNER_CARD_DATA } from './fixtures/seed-cards'

dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL ?? ''

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'apikey': SERVICE_ROLE_KEY,
}

const restUrl = SUPABASE_URL + '/rest/v1'
const authUrl = SUPABASE_URL + '/auth/v1'

async function getOrCreateUser(email: string, password: string): Promise<string | null> {
  const listRes = await fetch(`${authUrl}/admin/users?per_page=1000`, { headers })
  const listJson = await listRes.json()
  const existing = (listJson.users ?? []).find((u: { email: string }) => u.email === email)

  if (existing) {
    console.log(`  [seed] ユーザー確認済み: ${email}`)
    return existing.id
  }

  const createRes = await fetch(`${authUrl}/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password, email_confirm: true }),
  })
  if (!createRes.ok) {
    console.error(`  [seed] ユーザー作成失敗: ${await createRes.text()}`)
    return null
  }
  const created = await createRes.json()
  console.log(`  [seed] ユーザー作成: ${email} (${created.id})`)
  return created.id
}

async function ensureUserRow(userId: string, plan: 'free' | 'pro' = 'free') {
  const res = await fetch(`${restUrl}/users`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ id: userId, plan }),
  })
  if (!res.ok) {
    const text = await res.text()
    if (!text.includes('duplicate')) {
      console.warn(`  [seed] users 行挿入失敗 (${userId}): ${text}`)
    }
  }
}

async function upsertCard(card: typeof SEED_CARDS[0] & { user_id?: string }, userId: string) {
  const body = { ...card, user_id: userId }
  const res = await fetch(`${restUrl}/cards`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    console.warn(`  [seed] カード upsert 失敗 (${card.id}): ${await res.text()}`)
  }
}

export async function seedLocalData() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.warn('[seed] SUPABASE_URL / SERVICE_ROLE_KEY 未設定のためスキップ')
    return
  }

  // ローカル環境のみ実行
  if (!SUPABASE_URL.includes('127.0.0.1') && !SUPABASE_URL.includes('localhost')) {
    console.warn('[seed] ローカル環境以外ではシードをスキップ')
    return
  }

  console.log('[seed] シードデータ投入開始...')

  // seed-other ユーザーの作成
  const otherId = await getOrCreateUser(SEED_OTHER_USER.email, SEED_OTHER_USER.password)
  if (!otherId) {
    console.error('[seed] seed-other ユーザーの作成に失敗')
    return
  }
  await ensureUserRow(otherId, 'free')

  // seed-other のカードを upsert
  for (const card of SEED_CARDS) {
    await upsertCard(card, otherId)
    console.log(`  [seed] カード upsert: ${card.id} (${card.card_data.name})`)
  }

  // テストユーザー自身のカード
  if (TEST_USER_EMAIL) {
    const listRes = await fetch(`${authUrl}/admin/users?per_page=1000`, { headers })
    const listJson = await listRes.json()
    const testUser = (listJson.users ?? []).find((u: { email: string }) => u.email === TEST_USER_EMAIL)
    if (testUser) {
      await upsertCard(OWNER_CARD_DATA, testUser.id)
      console.log(`  [seed] オーナーカード upsert: ${OWNER_CARD_DATA.id}`)
    }
  }

  console.log('[seed] シードデータ投入完了')
}

// CLI として直接実行された場合
if (require.main === module) {
  seedLocalData().catch(e => {
    console.error(e)
    process.exit(1)
  })
}
