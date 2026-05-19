'use client'

import { Suspense } from 'react'
import CardEditor from '@/components/CardEditor'
import type { CardTemplate } from '@/blocks/types'
import type { CardRow } from '@/lib/types'

type Announcement = { id: string; title: string; body: string; published_at: string }

type Props = {
  card: CardRow
  template: CardTemplate
  isOwner: boolean
  announcements: Announcement[]
}

export default function CardEditorClient({ card, template, isOwner, announcements }: Props) {
  return (
    <Suspense>
      <CardEditor
        template={template}
        cardId={card.id}
        initialValues={card.card_data}
        readOnly={!isOwner}
        announcements={announcements}
      />
    </Suspense>
  )
}
