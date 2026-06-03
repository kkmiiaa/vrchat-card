/**
 * 既存カードの base64 画像を Supabase Storage に一括移行するスクリプト。
 *
 * 実行方法:
 *   npx ts-node --project tsconfig.json -e "require('./scripts/migrateImagesToStorage')"
 * または:
 *   npx tsx scripts/migrateImagesToStorage.ts
 *
 * 環境変数（.env.local から自動読み込み）:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BUCKET       = 'card-images'
const WEBP_QUALITY = 0.85
const MAX_WIDTH    = 800
const JPEG_MAX_DIM = 1200
const JPEG_QUALITY = 0.80

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定です')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// base64 data URL → Buffer
function base64ToBuffer(dataUrl: string): { buffer: Buffer; mimeType: string } {
  const [header, data] = dataUrl.split(',')
  const mimeType = header.match(/data:([^;]+)/)?.[1] ?? 'image/jpeg'
  return { buffer: Buffer.from(data, 'base64'), mimeType }
}

async function uploadBuffer(
  userId: string,
  cardId: string,
  slot: string,
  buffer: Buffer,
  contentType: string,
  ext: string,
): Promise<string> {
  const path = `${userId}/${cardId}/${slot}.${ext}`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: true })
  if (error) throw new Error(`upload failed [${path}]: ${error.message}`)
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

async function migrateCard(card: {
  id: string
  user_id: string
  card_data: Record<string, unknown> | null
  background: Record<string, unknown> | null
}): Promise<boolean> {
  const { id: cardId, user_id: userId, card_data, background } = card
  let changed = false
  const newCardData = { ...(card_data ?? {}) }

  // ── gallery ──
  const gallery = newCardData.gallery as Record<string, unknown> | undefined
  if (gallery && Array.isArray(gallery.base64) && (gallery.base64 as (string|null)[]).some(Boolean)) {
    const newUrls = [...((gallery.urls as (string|null)[] | undefined) ?? [null, null, null])]
    for (let i = 0; i < 3; i++) {
      const b64 = (gallery.base64 as (string|null)[])[i]
      if (!b64 || newUrls[i]) continue
      try {
        const { buffer, mimeType } = base64ToBuffer(b64)
        const url = await uploadBuffer(userId, cardId, `gallery-${i}`, buffer, mimeType, 'jpg')
        newUrls[i] = url
        changed = true
      } catch (e) { console.warn(`  gallery-${i} skip:`, (e as Error).message) }
    }
    if (changed) {
      newCardData.gallery = { ...gallery, urls: newUrls, base64: [null, null, null] }
    }
  }

  // ── heightRuler ──
  const ruler = newCardData.heightRuler as Record<string, unknown> | undefined
  if (ruler && typeof ruler.avatarImage === 'string' && ruler.avatarImage.startsWith('data:') && !ruler.avatarImageUrl) {
    try {
      const { buffer } = base64ToBuffer(ruler.avatarImage)
      const url = await uploadBuffer(userId, cardId, 'avatar', buffer, 'image/webp', 'webp')
      newCardData.heightRuler = { ...ruler, avatarImageUrl: url, avatarImage: null }
      changed = true
    } catch (e) { console.warn('  heightRuler skip:', (e as Error).message) }
  }

  // ── background ──
  const bg = background as Record<string, unknown> | null
  let newBg = bg
  if (bg?.type === 'image' && typeof bg.base64 === 'string' && bg.base64.startsWith('data:') && !bg.url) {
    try {
      const { buffer } = base64ToBuffer(bg.base64)
      const url = await uploadBuffer(userId, cardId, 'background', buffer, 'image/webp', 'webp')
      newBg = { ...bg, url, base64: null }
      changed = true
    } catch (e) { console.warn('  background skip:', (e as Error).message) }
  }

  if (!changed) return false

  // DB 更新
  const { error } = await supabase
    .from('cards')
    .update({ card_data: newCardData, background: newBg })
    .eq('id', cardId)
  if (error) throw new Error(`DB update failed [${cardId}]: ${error.message}`)
  return true
}

async function main() {
  console.log('🚀 画像ストレージ移行を開始します...')

  // base64 を含むカードだけフェッチ（全件取得・ページネーション）
  let offset = 0
  const PAGE = 100
  let total = 0, migrated = 0, errors = 0

  while (true) {
    const { data, error } = await supabase
      .from('cards')
      .select('id, user_id, card_data, background')
      .range(offset, offset + PAGE - 1)

    if (error) { console.error('fetch error:', error.message); break }
    if (!data || data.length === 0) break

    for (const card of data) {
      total++
      try {
        const ok = await migrateCard(card as Parameters<typeof migrateCard>[0])
        if (ok) { migrated++; console.log(`  ✅ ${card.id}`) }
      } catch (e) {
        errors++
        console.error(`  ❌ ${card.id}:`, (e as Error).message)
      }
    }

    if (data.length < PAGE) break
    offset += PAGE
  }

  console.log(`\n完了: 合計 ${total} 件 / 移行 ${migrated} 件 / エラー ${errors} 件`)
}

main().catch(e => { console.error(e); process.exit(1) })
