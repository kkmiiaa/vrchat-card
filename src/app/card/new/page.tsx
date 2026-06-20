import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { fetchTemplateLayouts, fetchCommunities } from '@/lib/templateLayout'
import TemplateSelector from './TemplateSelector'

export default async function NewCardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/card/new')

  const [savedLayouts, communities] = await Promise.all([
    fetchTemplateLayouts({ publishedOnly: true }),
    fetchCommunities(),
  ])
  return <TemplateSelector savedLayouts={savedLayouts} communities={communities} />
}
