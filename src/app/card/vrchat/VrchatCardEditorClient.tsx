'use client'

import { useMemo, Suspense } from 'react'
import CardEditor from '@/components/CardEditor'
import type { TemplateLayoutRow } from '@/lib/templateLayout'
import { buildCardTemplateFromDefinition } from '@/lib/buildCardTemplate'
import { cardV1Definition } from '@/templates/v1Definition'

type Props = {
  templateDbRow: TemplateLayoutRow | null
}

export default function VrchatCardEditorClient({ templateDbRow }: Props) {
  // クライアント側で同期的に構築（ローディング状態なし）
  // テンプレート描画構造は v1Definition（TS・安定）から
  // フォームセクションは DB から（テンプレートビルダーで管理）
  const { template, formSections } = useMemo(
    () => buildCardTemplateFromDefinition(cardV1Definition, templateDbRow),
    [templateDbRow],
  )

  return (
    <Suspense>
      <CardEditor template={template} formSections={formSections} />
    </Suspense>
  )
}
