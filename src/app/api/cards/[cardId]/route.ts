import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: Promise<{ cardId: string }> }

// GET /api/cards/[cardId]
export async function GET(_: NextRequest, { params }: Params) {
  const { cardId } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .single()

  if (error || !data) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json(data)
}

// PATCH /api/cards/[cardId] — card_data・画像・タイトル等の更新
export async function PATCH(request: NextRequest, { params }: Params) {
  const { cardId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const body = await request.json()
  const { cardData, background, imageBase64, title, visibility, ogp_version } = body

  const updates: Record<string, unknown> = {}
  if (cardData !== undefined) updates.card_data = cardData
  if (background !== undefined) updates.background = background
  if (title !== undefined) updates.title = title
  if (visibility !== undefined) updates.visibility = visibility
  if (ogp_version !== undefined) updates.ogp_version = ogp_version

  // 画像がある場合は Storage にアップロード
  if (imageBase64) {
    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const base64Data = imageBase64.replace(/^data:image\/png;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const filename = `${user.id}/${cardId}.png`

    const { error: uploadError } = await admin.storage
      .from('card-images')
      .upload(filename, buffer, { upsert: true, contentType: 'image/png' })

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

    const { data: { publicUrl } } = admin.storage.from('card-images').getPublicUrl(filename)
    // ogp_version をクエリパラメータに付与することで SNS・CDN のキャッシュを破壊する
    const version = ogp_version ?? (updates.ogp_version as number | undefined)
    updates.image_url = version ? `${publicUrl}?v=${version}` : publicUrl
  }

  const { error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', cardId)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/cards/[cardId]
export async function DELETE(_: NextRequest, { params }: Params) {
  const { cardId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // card-images バケットから画像を削除
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const slots = ['profile', 'gallery-0', 'gallery-1', 'gallery-2']
  const paths = slots.map(s => `${user.id}/${cardId}/${s}.jpg`)
  await admin.storage.from('card-images').remove(paths)

  return NextResponse.json({ ok: true })
}
