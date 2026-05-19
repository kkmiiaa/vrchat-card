import type { ReactNode } from 'react'
import type { translations } from '@/utils/translations'

export type Translations = typeof translations.ja

export type BlockFormProps<T> = {
  value: T
  onChange: (v: T) => void
  t: Translations
}

/** カードレンダリング時のスタイルコンテキスト */
export type CardRenderContext = {
  /** フォントファミリー */
  fontFamily: string
  /** カード幅（px）。フォントサイズ等のスケール基準 */
  cardWidth: number
  /** テーマカラー */
  theme: {
    accent: string       // アクセントカラー（ボーダー・ハイライト等）
    text: string         // 本文テキスト色
    subText: string      // サブテキスト・ラベル色
    bg: string           // セル背景色
  }
}

export const DEFAULT_CARD_RENDER_CONTEXT: CardRenderContext = {
  fontFamily: 'sans-serif',
  cardWidth: 900,
  theme: {
    accent:  '#00AADB',
    text:    '#1f2937',
    subText: '#9ca3af',
    bg:      'rgba(255,255,255,0.6)',
  },
}

/** ブロックのデザインバリアント識別子 */
export type BlockVariant = string

export type BlockCardProps<T> = {
  value: T
  ctx: CardRenderContext
  /** 選択されたデザインバリアント。未指定時は 'default' */
  variant?: BlockVariant
}

/** ブロック定義: フォームUIとカードUIをセットで持つ単位 */
export type Block<T = unknown> = {
  key: string
  defaultValue: T
  /** このブロックが対応するデザインバリアント一覧。未定義は ['default'] 扱い */
  variants?: BlockVariant[]
  /** フォームエリアに描画されるUI */
  FormItem: (props: BlockFormProps<T>) => ReactNode
  /** カードエリアに描画されるUI（テンプレートが参照可能） */
  CardItem?: (props: BlockCardProps<T>) => ReactNode
}

// --- テンプレート定義型 ---

/** テンプレートコンポーネント: ブロックをテンプレートに配置する際のインスタンス */
export type TemplateComponentDef = {
  /** 対応するブロックの key */
  blockKey: string
  /** 選択されたデザインバリアント（運営者が定義したパターンから選択） */
  variant: BlockVariant
  /** レイアウト上の横幅（1〜12グリッド。省略時は12=全幅） */
  span?: number
  /** 縦方向に残りスペースを埋める（自己紹介など可変高さ要素に使用） */
  grow?: boolean
}

/** カラム: 横並びの単位。複数コンポーネントを縦に積む */
export type TemplateColumnDef = {
  /** flex比率による相対幅（例: 1, 2, 3） */
  width: number
  components: TemplateComponentDef[]
}

/** セクション: カラムを横に並べる単位 */
export type TemplateSectionDef = {
  /** セクション見出し（データとして保持。翻訳対象外） */
  label: string
  columns: TemplateColumnDef[]
}

/** テンプレート全体の定義（汎用レンダラーが参照するJSON構造） */
export type TemplateDefinition = {
  id: string
  label: string
  /** カードのアスペクト比・サイズ */
  cardWidth: number
  cardHeight: number
  /** デフォルトテーマ */
  theme: CardRenderContext['theme']
  /** デフォルトフォント */
  fontFamily: string
  /** セクション一覧（上から順に並ぶ） */
  sections: TemplateSectionDef[]
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
