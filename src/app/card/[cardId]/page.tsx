import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { v1Template } from '@/templates/v1'
import { v2Template } from '@/templates/v2'
import CardEditorClient from './CardEditorClient'

const templateMap = {
  v1: v1Template,
  v2: v2Template,
}

export default async function CardPage({ params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: card, error: cardError } = await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .single()

  if (cardError) console.error('[CardPage] card fetch error:', cardError)
  if (!card) notFound()

  // 非公開カードは本人のみ
  if (card.visibility === 'private' && card.user_id !== user?.id) {
    redirect('/auth/login')
  }

  const template = templateMap[card.template_id as keyof typeof templateMap]
  if (!template) notFound()

  const isOwner = user?.id === card.user_id

  return <CardEditorClient card={card} template={template} isOwner={isOwner} />
}
