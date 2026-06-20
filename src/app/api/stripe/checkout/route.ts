import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_PRO_PRICE_ID } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const { data: userRow } = await supabase
    .from('users')
    .select('username_slug')
    .eq('id', user.id)
    .single()

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: STRIPE_PRO_PRICE_ID, quantity: 1 }],
    success_url: `${baseUrl}/u/${userRow?.username_slug}?upgraded=1`,
    cancel_url: `${baseUrl}/u/${userRow?.username_slug}`,
    metadata: { user_id: user.id },
    subscription_data: { metadata: { user_id: user.id } },
  })

  return NextResponse.json({ url: session.url })
}
