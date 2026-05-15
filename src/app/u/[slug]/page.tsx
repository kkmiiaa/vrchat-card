import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { type Metadata } from 'next'
import ProfilePage from './ProfilePage'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: userRow } = await supabase.from('users').select('id').eq('username_slug', slug).single()
  if (!userRow) return {}

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio, avatar_url')
    .eq('user_id', userRow.id)
    .single()
  if (!profile) return {}

  const name = profile.display_name || slug
  const title = `${name} — vaacard`
  const description = profile.bio ? profile.bio.slice(0, 100) : `${name} の自己紹介カードページ`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(profile.avatar_url ? { images: [{ url: profile.avatar_url }] } : {}),
    },
    twitter: {
      card: 'summary',
      title,
      description,
      ...(profile.avatar_url ? { images: [profile.avatar_url] } : {}),
    },
  }
}

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

  if (!profile) notFound()

  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', userRow.id)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === userRow.id

  return <ProfilePage profile={profile} slug={slug} userRowId={userRow.id} cards={cards ?? []} isOwner={isOwner} />
}
