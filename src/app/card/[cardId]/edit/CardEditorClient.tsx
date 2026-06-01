'use client'

import { Suspense, useState, useEffect } from 'react'
import CardEditor from '@/components/CardEditor'
import type { CardTemplate, FormSection } from '@/blocks/types'
import type { CardRow } from '@/lib/types'
import type { TemplateLayoutRow } from '@/lib/templateLayout'
import { buildCardTemplateFromDefinition } from '@/lib/buildCardTemplate'

type Props = {
  card: CardRow
  templateId: string
  templateDbRow?: TemplateLayoutRow | null
  isOwner: boolean
  ogpVersion: number
}

export default function CardEditorClient({ card, templateId, templateDbRow, isOwner, ogpVersion }: Props) {
  const [template, setTemplate] = useState<CardTemplate | null>(null)
  const [formSections, setFormSections] = useState<FormSection[]>([])

  useEffect(() => {
    const { template: built, formSections: sections } = buildCardTemplateFromDefinition(null, templateDbRow ?? null)
    setTemplate(built)
    setFormSections(sections)
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
        initialBackground={card.background}
        readOnly={!isOwner}
        formSections={formSections.length ? formSections : undefined}
        ogpVersion={ogpVersion}
      />
    </Suspense>
  )
}
