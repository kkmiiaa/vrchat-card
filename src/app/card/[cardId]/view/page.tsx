import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { type Metadata } from 'next'
import CardViewWrapper from './CardViewWrapper'
// CardViewWrapper が内部で動的インポートするため、ここでは直接 import

const validTemplates = ['v1', 'v2']

export async function generateMetadata({ params }: { params: Promise<{ cardId: string }> }): Promise<Metadata> {
  const { cardId } = await params
  const supabase = await createClient()

  const { data: card } = await supabase
    .from('cards')
    .select('title, image_url, user_id, visibility')
    .eq('id', cardId)
    .single()
  if (!card || card.visibility === 'private') return {}

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('user_id', card.user_id)
    .single()

  const ownerName = profile?.display_name || 'vaacard ユーザー'
  const title = card.title ? `${card.title} — ${ownerName}` : `${ownerName} の自己紹介カード`
  const description = `${ownerName} が vaacard で作った自己紹介カードです。`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(card.image_url ? { images: [{ url: card.image_url, width: 900, height: 506 }] } : {}),
    },
    twitter: {
      card: card.image_url ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(card.image_url ? { images: [card.image_url] } : {}),
    },
  }
}

export default async function CardViewPage({ params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // card_data (base64画像等) は含めず軽量なメタデータのみ取得
  const { data: card } = await supabase
    .from('cards')
    .select('id, user_id, template_id, title, image_url, visibility, view_count, like_count, created_at, updated_at')
    .eq('id', cardId)
    .single()

  if (!card) notFound()

  if (card.visibility === 'private' && card.user_id !== user?.id) {
    redirect('/auth/login')
  }

  if (!validTemplates.includes(card.template_id)) notFound()

  const isOwner = user?.id === card.user_id

  const { data: userRow } = await supabase.from('users').select('username_slug').eq('id', card.user_id).single()
  const { data: profile } = await supabase.from('profiles').select('display_name, avatar_url').eq('user_id', card.user_id).single()

  return <CardViewWrapper cardId={cardId} templateId={card.template_id} isOwner={isOwner} likeCount={card.like_count ?? 0} viewCount={card.view_count ?? 0} ownerSlug={userRow?.username_slug ?? null} ownerName={profile?.display_name ?? null} ownerAvatar={profile?.avatar_url ?? null} createdAt={card.created_at ?? null} imageUrl={card.image_url ?? null} />
}
