import { createClient } from '@/lib/supabase/server'
import CardsClient from './CardsClient'

export default async function AdminCardsPage() {
  const supabase = await createClient()
  const { data: cards } = await supabase
    .from('cards')
    .select('id, title, card_data, template_id, created_at, visibility')
    .order('created_at', { ascending: false })
    .limit(50)

  return <CardsClient cards={cards ?? []} />
}
