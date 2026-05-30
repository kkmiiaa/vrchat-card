'use client'

import { Suspense, useState, useEffect } from 'react'
import CardEditor from '@/components/CardEditor'
import type { CardTemplate, FormSection } from '@/blocks/types'
import type { CardRow } from '@/lib/types'
import type { TemplateLayoutRow } from '@/lib/templateLayout'
import { buildCardTemplateFromDefinition } from '@/lib/buildCardTemplate'
import { cardV1Definition } from '@/templates/v1Definition'
import { cardV2Definition } from '@/templates/v2Definition'

type Announcement = { id: string; title: string; body: string; published_at: string }

const definitionMap = {
  v1: cardV1Definition,
  v2: cardV2Definition,
}

type Props = {
  card: CardRow
  templateId: string
  templateDbRow?: TemplateLayoutRow | null
  isOwner: boolean
  announcements: Announcement[]
}

export default function CardEditorClient({ card, templateId, templateDbRow, isOwner, announcements }: Props) {
  const [template, setTemplate] = useState<CardTemplate | null>(null)
  const [formSections, setFormSections] = useState<FormSection[]>([])

  useEffect(() => {
    const definition = definitionMap[templateId as keyof typeof definitionMap]
    if (definition) {
      const { template: built, formSections: sections } = buildCardTemplateFromDefinition(definition, templateDbRow ?? null)
      setTemplate(built)
      setFormSections(sections)
      return
    }
    // フォールバック: 旧 CardTemplate の動的インポート
    const loaders: Record<string, () => Promise<CardTemplate>> = {
      v1: () => import('@/templates/v1').then(m => m.v1Template),
      v2: () => import('@/templates/v2').then(m => m.v2Template),
    }
    loaders[templateId]?.().then(t => { setTemplate(t); setFormSections([]) })
  }, [templateId, templateDbRow])

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-300 border-t-[#00AADB] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Suspense>
      <CardEditor
        template={template}
        cardId={card.id}
        initialValues={card.card_data}
        readOnly={!isOwner}
        announcements={announcements}
        formSections={formSections.length ? formSections : undefined}
      />
    </Suspense>
  )
}
