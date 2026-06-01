'use client'

import { Suspense } from 'react'
import CardViewClient from './CardViewClient'
import type { TemplateLayoutRow } from '@/lib/templateLayout'
import type { BackgroundValue } from '@/blocks/types'

export type CardViewWrapperProps = {
  cardId: string
  templateId: string
  isOwner: boolean
  likeCount: number
  viewCount: number
  ownerSlug: string | null
  ownerName: string | null
  ownerAvatar: string | null
  createdAt: string | null
  imageUrl: string | null
  ogpVersion: number
  templateDbRow?: TemplateLayoutRow | null
  background?: BackgroundValue | null
}

export default function CardViewWrapper(props: CardViewWrapperProps) {
  return (
    <Suspense>
      <CardViewClient {...props} />
    </Suspense>
  )
}
