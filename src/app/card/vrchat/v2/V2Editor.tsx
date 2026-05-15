'use client'

import { Suspense } from 'react'
import CardEditor from '@/components/CardEditor'
import { v2Template } from '@/templates/v2'

export default function V2Editor({ userId }: { userId: string }) {
  void userId
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CardEditor template={v2Template} />
    </Suspense>
  )
}
