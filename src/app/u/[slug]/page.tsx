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

  const ogImage = profile.avatar_url
    ? { url: profile.avatar_url }
    : { url: '/og-default.png', width: 1200, height: 630 }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.url],
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

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === userRow.id

  // オーナーの場合は全カード取得（visibility問わず）、他者は公開のみ
  const cardsQuery = supabase
    .from('cards')
    .select('*')
    .eq('user_id', userRow.id)
    .order('created_at', { ascending: false })
  if (!isOwner) cardsQuery.eq('visibility', 'public')
  const { data: cards } = await cardsQuery

  const plan = (userRow.plan ?? 'free') as 'free' | 'pro'
  const isPro = plan === 'pro' &&
    (userRow.plan_expires_at == null || new Date(userRow.plan_expires_at) > new Date())

  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, body, published_at')
    .eq('is_active', true)
    .order('published_at', { ascending: false })

  return (
    <ProfilePage
      profile={profile}
      slug={slug}
      userRowId={userRow.id}
      cards={cards ?? []}
      isOwner={isOwner}
      plan={isPro ? 'pro' : 'free'}
      announcements={announcements ?? []}
    />
  )
}
