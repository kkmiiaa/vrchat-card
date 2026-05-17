import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import SettingsClient from './SettingsClient'

export const metadata: Metadata = { title: '設定 | vaacard' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/settings')

  const { data: userRow } = await supabase
    .from('users')
    .select('plan, plan_expires_at, stripe_customer_id, username_slug')
    .eq('id', user.id)
    .single()

  const isPro = userRow?.plan === 'pro' &&
    (userRow.plan_expires_at == null || new Date(userRow.plan_expires_at) > new Date())

  return (
    <SettingsClient
      email={user.email ?? ''}
      isPro={isPro}
      planExpiresAt={userRow?.plan_expires_at ?? null}
      hasStripeCustomer={!!userRow?.stripe_customer_id}
      slug={userRow?.username_slug ?? null}
    />
  )
}
