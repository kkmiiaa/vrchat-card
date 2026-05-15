'use client'

import { Suspense } from 'react'
import CardEditor from '@/components/CardEditor'
import { v1Template } from '@/templates/v1'

export default function VrchatV1Page() {
  return (
    <Suspense>
      <CardEditor template={v1Template} />
    </Suspense>
  )
}
