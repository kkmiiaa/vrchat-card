export type Plan = 'free' | 'pro'
export type Template = 'vrchat' | 'gamer' | 'creator' | 'general'

export type UserRow = {
  id: string
  username_slug: string
  plan: Plan
  plan_expires_at: string | null
}

export type ProfileRow = {
  id: string
  user_id: string
  template: Template
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  sns_links: Record<string, string>
  platform_data: Record<string, unknown>
  is_searchable: boolean
  search_tags: string[]
}
