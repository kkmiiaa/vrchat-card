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
  url: string
  label: string
}

export type ProfileRow = {
  id: string
  user_id: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  sns_links: Record<string, string>
  links: ProfileLink[]
  template: string | null
  platform_data: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type CardRow = {
  id: string
  user_id: string
  template_id: string
  title: string | null
  card_data: Record<string, unknown>
  image_url: string | null
  visibility: Visibility
  view_count: number
  like_count: number
  created_at: string
  updated_at: string
}
