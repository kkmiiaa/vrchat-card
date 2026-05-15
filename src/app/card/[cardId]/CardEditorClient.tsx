'use client'

import { Suspense } from 'react'
import CardEditor from '@/components/CardEditor'
import type { CardTemplate } from '@/blocks/types'
import type { CardRow } from '@/lib/types'

type Props = {
  card: CardRow
  template: CardTemplate
  isOwner: boolean
}

export default function CardEditorClient({ card, template, isOwner }: Props) {
  return (
    <Suspense>
      <CardEditor
        template={template}
        cardId={card.id}
        initialValues={card.card_data}
        readOnly={!isOwner}
      />
    </Suspense>
  )
}
