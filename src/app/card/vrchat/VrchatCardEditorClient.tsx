'use client'

import { useState, useEffect, Suspense } from 'react'
import CardEditor from '@/components/CardEditor'
import type { CardTemplate } from '@/blocks/types'
import type { TemplateLayoutRow } from '@/lib/templateLayout'
import { buildCardTemplateFromDefinition } from '@/lib/buildCardTemplate'

type Props = {
  templateDbRow: TemplateLayoutRow | null
}

export default function VrchatCardEditorClient({ templateDbRow }: Props) {
  const [template, setTemplate] = useState<CardTemplate | null>(null)

  useEffect(() => {
    const { template: built } = buildCardTemplateFromDefinition(null, templateDbRow)
    setTemplate(built)
  }, [templateDbRow])

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-300 border-t-[#00AADB] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Suspense>
      <CardEditor template={template} />
    </Suspense>
  )
}
