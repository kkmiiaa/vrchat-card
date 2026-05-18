import type { ReactNode } from 'react'
import type { translations } from '@/utils/translations'

export type Translations = typeof translations.ja

export type BlockFormProps<T> = {
  value: T
  onChange: (v: T) => void
  t: Translations
}

export type BlockCardProps<T> = {
  value: T
  fontFamily?: string
}

/** ブロック定義: フォームUIとカードUIをセットで持つ単位 */
export type Block<T = unknown> = {
  key: string
  defaultValue: T
  /** フォームエリアに描画されるUI */
  FormItem: (props: BlockFormProps<T>) => ReactNode
  /** カードエリアに描画されるUI（テンプレートが参照可能） */
  CardItem?: (props: BlockCardProps<T>) => ReactNode
}

/** ブロック値の集合 */
export type BlockValues = Record<string, unknown>

/** フォームのセクション定義 */
export type TemplateSection = {
  titleKey: string          // translations キー or そのままタイトル文字列
  blockKeys: string[]       // このセクションに含むブロックの key 一覧
  defaultOpen?: boolean
}

/** テンプレート定義 */
export type CardTemplate = {
  id: 'v1' | 'v2'
  title: string
  desc: string
  badge: string
  badgeColor: string
  communities: string[]
  communitySlug?: string  // DBの communities.slug に対応
  cardWidth: number
  cardHeight: number
  PreviewCard: () => ReactNode
  /** このテンプレートで使用するブロック一覧 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocks: Block<any>[]
  /** フォームのセクション構成 */
  sections: TemplateSection[]
  /** カード全体のレンダラー。全ブロック値を受け取り描画する */
  portraitWidth?: number
  portraitHeight?: number
  CardRenderer: (props: {
    values: BlockValues
    fontFamily: string
    t: Translations
    isInteractive?: boolean
    noBackground?: boolean
    orientation?: 'landscape' | 'portrait'
  }) => ReactNode
}

// --- 各ブロックの値型 ---

export type ProfileImageValue = {
  file: File | null
  base64: string | null
}

export type SnsValue = {
  vrchatId: string
  twitterId: string
  discordId: string
  friendPolicy?: string
}

export type StatusValue = {
  blue: string
  green: string
  yellow: string
  red: string
}

export type AgeValue = {
  mode: '' | '18歳未満' | '18+' | '非公開' | '自由入力'
  display: string
}

export type ActivityValue = {
  days: boolean[]
  daysMode?: '' | 'irregular'
  weekdayStart: string
  weekdayEnd: string
  weekdayTimesMode?: 'irregular' | ''
  holidayStart: string
  holidayEnd: string
  holidayTimesMode?: 'irregular' | ''
}

export type GalleryValue = {
  enabled: boolean
  images: (File | null)[]
  base64: (string | null)[]
}

export type BackgroundValue = {
  type: 'color' | 'gradient' | 'image'
  /** color: string, gradient: [from, to], image: URL string or base64 */
  value: string | [string, string]
  imageFile?: File | null
  base64?: string | null
}
