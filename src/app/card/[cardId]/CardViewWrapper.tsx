'use client'

import { Suspense } from 'react'
import CardViewClient from './CardViewClient'
import type { TemplateLayoutRow } from '@/lib/templateLayout'

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
  /** DB から取得したテンプレート定義行（GenericCardRenderer 用） */
  templateDbRow?: TemplateLayoutRow | null
}

export default function CardViewWrapper(props: CardViewWrapperProps) {
  return (
    <Suspense>
      <CardViewClient {...props} />
    </Suspense>
  )
}
