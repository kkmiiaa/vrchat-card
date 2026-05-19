import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

export const metadata = { title: 'Admin | vaacard' }

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userRow?.role !== 'admin') redirect('/')

  // サンプルカードデータ（最新10件）
  const { data: cards } = await supabase
    .from('cards')
    .select('id, title, card_data, template_id, created_at, visibility')
    .order('created_at', { ascending: false })
    .limit(10)

  return <AdminClient sampleCards={cards ?? []} />
}
