import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProfilePage from './ProfilePage'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: userRow } = await supabase
    .from('users')
    .select('*')
    .eq('username_slug', slug)
    .single()

  if (!userRow) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userRow.id)
    .single()

  if (!profile || !profile.is_searchable) notFound()

  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', userRow.id)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === userRow.id

  return <ProfilePage profile={profile} slug={slug} cards={cards ?? []} isOwner={isOwner} />
}
