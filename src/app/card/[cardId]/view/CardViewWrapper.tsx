'use client'

import CardViewClient from './CardViewClient'

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
}

export default function CardViewWrapper(props: CardViewWrapperProps) {
  return <CardViewClient {...props} />
}
