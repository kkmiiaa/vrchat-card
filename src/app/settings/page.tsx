import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: userRow } = await supabase
    .from('users')
    .select('username_slug')
    .eq('id', user.id)
    .single()

  redirect(`/u/${userRow?.username_slug ?? ''}`)
}
