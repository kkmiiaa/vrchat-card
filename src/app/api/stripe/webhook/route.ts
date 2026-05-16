import { stripe } from '@/lib/stripe'
import { createClient as createServiceClient, SupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ''

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function setProPlan(supabase: SupabaseClient<any>, userId: string, periodEnd: number) {
  const expiresAt = new Date(periodEnd * 1000).toISOString()
  await supabase
    .from('users')
    .update({ plan: 'pro', plan_expires_at: expiresAt })
    .eq('id', userId)
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      if (!userId || !session.subscription) break

      const sub = await stripe.subscriptions.retrieve(session.subscription as string)
      await setProPlan(supabase, userId, (sub as unknown as { current_period_end: number }).current_period_end)
      break
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription }
      const subId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id
      if (!subId) break

      const sub = await stripe.subscriptions.retrieve(subId)
      const userId = sub.metadata?.user_id
      if (!userId) break
      await setProPlan(supabase, userId, (sub as unknown as { current_period_end: number }).current_period_end)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.user_id
      if (!userId) break
      await supabase
        .from('users')
        .update({ plan: 'free', plan_expires_at: null })
        .eq('id', userId)
      break
    }
  }

  return NextResponse.json({ ok: true })
}
