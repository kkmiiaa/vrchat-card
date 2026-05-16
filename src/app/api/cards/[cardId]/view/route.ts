import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: Promise<{ cardId: string }> }

export async function POST(_: NextRequest, { params }: Params) {
  const { cardId } = await params
  const supabase = await createClient()
  await supabase.rpc('increment_view_count', { card_id: cardId })
  return NextResponse.json({ ok: true })
}
