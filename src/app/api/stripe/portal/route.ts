import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const { data: userRow } = await supabase
    .from('users')
    .select('stripe_customer_id, username_slug')
    .eq('id', user.id)
    .single()

  if (!userRow?.stripe_customer_id) {
    return NextResponse.json({ error: 'no_stripe_customer' }, { status: 400 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const session = await stripe.billingPortal.sessions.create({
    customer: userRow.stripe_customer_id,
    return_url: `${baseUrl}/u/${userRow.username_slug}`,
  })

  return NextResponse.json({ url: session.url })
}
