import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: Promise<{ cardId: string }> }

// delta: +1 or -1
export async function POST(req: NextRequest, { params }: Params) {
  const { cardId } = await params
  const { delta } = await req.json() as { delta: 1 | -1 }
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('increment_like_count', { card_id: cardId, delta })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ like_count: data })
}
