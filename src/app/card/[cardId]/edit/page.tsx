import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { v1Template } from '@/templates/v1'
import { v2Template } from '@/templates/v2'
import { fetchTemplateLayout } from '@/lib/templateLayout'
import { buildCardTemplateFromDefinition } from '@/lib/buildCardTemplate'
import { cardV1Definition } from '@/templates/v1Definition'
import { cardV2Definition } from '@/templates/v2Definition'
import { migrateLegacyCardData } from '@/lib/legacyCardDataMigration'
import CardEditorClient from './CardEditorClient'

/** TS 静的定義のフォールバックマップ（DB に定義がない場合に使用） */
const legacyTemplateMap = {
  v1: v1Template,
  v2: v2Template,
}

/** TemplateDefinition の静的設定マップ（アダプター生成に使用） */
const definitionMap = {
  v1: cardV1Definition,
  v2: cardV2Definition,
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

  const isOwner = user?.id === card.user_id

  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, body, published_at')
    .eq('is_active', true)
    .order('published_at', { ascending: false })

  const templateId = card.template_id as string

  // DB からテンプレート定義を取得し、あればアダプター経由で GenericCardRenderer を使用
  const definition = definitionMap[templateId as keyof typeof definitionMap]
  if (definition) {
    const dbRow = await fetchTemplateLayout(templateId)
    const { template, formSections } = buildCardTemplateFromDefinition(definition, dbRow)
    const migratedCardData = migrateLegacyCardData(templateId, card.card_data ?? {})

    return (
      <CardEditorClient
        card={{ ...card, card_data: migratedCardData }}
        template={template}
        isOwner={isOwner}
        announcements={announcements ?? []}
        formSections={formSections}
      />
    )
  }

  // フォールバック: 旧 CardTemplate ベースの処理
  const legacyTemplate = legacyTemplateMap[templateId as keyof typeof legacyTemplateMap]
  if (!legacyTemplate) notFound()

  return (
    <CardEditorClient
      card={card}
      template={legacyTemplate}
      isOwner={isOwner}
      announcements={announcements ?? []}
    />
  )
}
