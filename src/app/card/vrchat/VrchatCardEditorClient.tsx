'use client'

import { useMemo, Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CardEditor from '@/components/CardEditor'
import type { TemplateLayoutRow } from '@/lib/templateLayout'
import { buildCardTemplateFromDefinition } from '@/lib/buildCardTemplate'
import { cardV1Definition } from '@/templates/v1Definition'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY = 'vrchat-card-cache'

type Props = {
  templateDbRow: TemplateLayoutRow | null
}

export default function VrchatCardEditorClient({ templateDbRow }: Props) {
  const router = useRouter()

  // ログイン済み かつ localStorage にデータなし → テンプレート選択へ
  // ログイン済み かつ localStorage にデータあり → CardEditor の autoMigrate が処理
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) router.replace('/card/new')
    })
  }, [router])

  const { template, formSections } = useMemo(
    () => buildCardTemplateFromDefinition(cardV1Definition, templateDbRow),
    [templateDbRow],
  )

  return (
    <Suspense>
      <CardEditor template={template} formSections={formSections} showImageMigrationHint />
    </Suspense>
  )
}
