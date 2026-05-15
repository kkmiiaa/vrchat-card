import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TemplateSelector from './TemplateSelector'

export default async function NewCardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/card/new')

  return <TemplateSelector />
}
