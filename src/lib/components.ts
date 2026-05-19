export type InputType = 'select' | 'expressive-select' | 'multi-select' | 'text' | 'number' | 'boolean' | 'sns' | 'gallery'

export type Component = {
  key: string
  label: string
  input_type: InputType
  is_searchable: boolean
  is_required: boolean
  sort_order: number
}

export type Community = {
  slug: string
  label: string
  description: string | null
  sort_order: number
}

export type CommunityComponent = {
  community_slug: string
  component_key: string
  label_override: string | null
  options: string[] | null
  is_searchable_override: boolean | null
  sort_order: number
}

/** コンポーネントの実効値（界隈による上書きを反映済み） */
export type ResolvedComponent = {
  key: string
  label: string
  input_type: InputType
  is_searchable: boolean
  is_required: boolean
  options: string[] | null
  sort_order: number
}

/**
 * VRChat界隈における component_key → card_data のキーのマッピング
 * 既存のcard_dataスキーマとの橋渡し
 */
export const VRCHAT_COMPONENT_KEY_MAP: Record<string, string> = {
  gender:        'genderTag',
  platform:      'playEnv',
  language:      'language',
  friend_policy: 'friendPolicy',
  self_intro:    'selfIntro',
  sns:           'sns',
  image_gallery: 'gallery',
}

/**
 * VRChat界隈の検索可能コンポーネント一覧（ハードコード版）
 * DBから取得する前の静的定義として使用
 */
export const VRCHAT_SEARCHABLE_COMPONENTS: ResolvedComponent[] = [
  {
    key: 'gender',
    label: '性別',
    input_type: 'expressive-select',
    is_searchable: true,
    is_required: false,
    options: ['male', 'female', 'nonbinary', 'none'],
    sort_order: 10,
  },
  {
    key: 'platform',
    label: 'プレイ環境',
    input_type: 'multi-select',
    is_searchable: true,
    is_required: false,
    options: ['PCVR', 'Quest', 'Desktop'],
    sort_order: 20,
  },
  {
    key: 'language',
    label: '使用言語',
    input_type: 'multi-select',
    is_searchable: true,
    is_required: false,
    options: ['日本語', 'English', 'Korean'],
    sort_order: 30,
  },
  {
    key: 'friend_policy',
    label: 'フレンド申請',
    input_type: 'select',
    is_searchable: true,
    is_required: false,
    options: ['frPolicyAnyone', 'frPolicyAfterGettingToKnow', 'frPolicyIfInterested', 'frPolicyMutualsOnX', 'frPolicyNo'],
    sort_order: 40,
  },
]
