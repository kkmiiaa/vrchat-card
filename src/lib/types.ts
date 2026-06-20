export type Plan = 'free' | 'pro'

export type Visibility = 'public' | 'limited' | 'private'

export type UserRow = {
  id: string
  username_slug: string
  plan: Plan
  plan_expires_at: string | null
  created_at: string
  updated_at: string
}

export type ProfileLink = {
  id: string
  url: string
  label: string
  sort_order: number
}

export type ProfileRow = {
  id: string
  user_id: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
  profile_links: ProfileLink[]
}

import type { BackgroundValue } from '@/blocks/types'

export type CardRow = {
  id: string
  user_id: string
  template_id: string
  title: string | null
  card_data: Record<string, unknown>
  background: BackgroundValue | null
  image_url: string | null
  visibility: Visibility
  view_count: number
  like_count: number
  created_at: string
  updated_at: string
}
