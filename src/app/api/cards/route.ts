import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
  }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await request.json()
  const { imageBase64, cardData, title, cardId } = body

  const base64Data = imageBase64.replace(/^data:image\/png;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')
  const filename = `${user.id}/${cardId ?? crypto.randomUUID()}.png`

  const { error: uploadError } = await admin.storage
    .from('cards')
    .upload(filename, buffer, { upsert: true, contentType: 'image/png' })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = admin.storage
    .from('cards')
    .getPublicUrl(filename)

  if (cardId) {
    const { error } = await admin
      .from('cards')
      .update({ card_data: cardData, image_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', cardId)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ cardId, imageUrl: publicUrl })
  } else {
    const { data, error } = await admin
      .from('cards')
      .insert({ user_id: user.id, title, card_data: cardData, image_url: publicUrl })
      .select('id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ cardId: data.id, imageUrl: publicUrl })
  }
}
