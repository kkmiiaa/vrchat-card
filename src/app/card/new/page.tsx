import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { fetchTemplateLayouts } from '@/lib/templateLayout'
import TemplateSelector from './TemplateSelector'

export default async function NewCardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/card/new')

  const savedLayouts = await fetchTemplateLayouts()
  return <TemplateSelector savedLayouts={savedLayouts} />
}
