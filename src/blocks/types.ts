import type { ReactNode } from 'react'
import type { translations } from '@/utils/translations'

export type Translations = typeof translations.ja

export type ComponentFormProps<T> = {
  value: T
  onChange: (v: T) => void
  t: Translations
  /** ブロック作成時にテンプレート作成者が設定した値（FormItem・CardItem 共通） */
  blockConfig?: Record<string, unknown>
  /** テンプレート作成者が設定したフォームラベル。FormItem のタイトル表示に使用 */
  formLabel?: string
}

export type BlockConfigFormProps = {
  blockConfig: Record<string, unknown>
  onChange: (config: Record<string, unknown>) => void
}

/** カードレンダリング時のスタイルコンテキスト */
/** cardWidth に対する比率で表したフォントスケール設定 */
export type FontScale = {
  xs: number   // 補助テキスト・バッジ内ラベル
  sm: number   // コンパクト本文・ラベル
  md: number   // 標準本文
  lg: number   // やや大きめ本文
  xl: number   // 名前など大見出し
}

/** ctx.fontSize に格納される実 px 値 */
export type FontSizeTokens = FontScale

export const DEFAULT_FONT_SCALE: FontScale = {
  xs: 0.009,
  sm: 0.010,
  md: 0.012,
  lg: 0.014,
  xl: 0.024,
}

export function makeFontSizeTokens(cardWidth: number, scale?: Partial<FontScale>): FontSizeTokens {
  const s = { ...DEFAULT_FONT_SCALE, ...scale }
  return {
    xs: cardWidth * s.xs,
    sm: cardWidth * s.sm,
    md: cardWidth * s.md,
    lg: cardWidth * s.lg,
    xl: cardWidth * s.xl,
  }
}

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
  /** フォントサイズトークン */
  fontSize: FontSizeTokens
  /** ラベルのフォントサイズ倍率デフォルト値 */
  defaultLabelFontScale?: number
  /** コンテンツのフォントサイズ倍率デフォルト値 */
  defaultContentFontScale?: number
  /** パディング倍率（デフォルト 1） */
  paddingScale: number
  /** カード個別ページの URL（QR コード等に利用） */
  cardUrl?: string
  /** ユーザーページの URL（QR コード等に利用） */
  userUrl?: string
  /** カード閲覧画面でのインタラクティブ表示（クリック可能）かどうか */
  isInteractive?: boolean
  /** ブロックの surface 未指定時のフォールバック。デザインプリセットから注入される */
  defaultSurface?: SurfaceVariant
  /** surfaceMode='internal' のブロックに注入される surface 値 */
  surface?: SurfaceVariant
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
  fontSize: makeFontSizeTokens(900),
  paddingScale: 1,
}

/** ブロックのデザインバリアント識別子 */
export type BlockVariant = string

/**
 * 背景・コンテナの見た目バリアント
 * - contained:   半透明白の基本コンテナ
 * - glass:       すりガラス（rgba(255,255,255,0.55) + border）
 * - flat:        不透明白 + 細いボーダー（フラットデザイン向け）
 * - transparent: 背景なし
 * - outline:     枠線のみ
 * - default:     後方互換エイリアス（DB保存済みデータ向け）
 */
export type SurfaceVariant = 'contained' | 'default' | 'glass' | 'flat' | 'transparent' | 'outline'

/** ラベル定義。外ラベル・insetLabel 共通で使用 */
export type LabelDef = {
  text: string
  subText?: string
  /** テキスト色。省略時はテーマの text 色 */
  color?: string
  /** フォントサイズ倍率。省略時は 1 */
  fontScale?: number
  /** ラベルとコンテンツの並び方向。'row'=横並び / 'col'=縦並び（デフォルト） */
  dir?: 'row' | 'col'
  /** ラベル左に表示するアイコンキー（iconRegistry の key） */
  icon?: string
}

export const SURFACE_STYLE: Record<SurfaceVariant | 'simple', { background: string; border: string; boxShadow?: string }> = {
  contained:   { background: 'rgba(255,255,255,0.85)', border: 'none',                                   boxShadow: undefined },
  simple:      { background: 'rgba(255,255,255,0.85)', border: 'none',                                   boxShadow: undefined }, // 後方互換エイリアス
  default:     { background: 'rgba(255,255,255,0.85)', border: 'none',                                   boxShadow: undefined }, // 後方互換エイリアス
  glass:       { background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.75)',        boxShadow: '0 0 12px rgba(0,0,0,0.08)' },
  flat:        { background: 'rgba(255,255,255,0.95)', border: '0.75px solid rgba(0,0,0,0.30)',          boxShadow: undefined },
  transparent: { background: 'transparent',            border: 'none',                                   boxShadow: undefined },
  outline:     { background: 'transparent',            border: '1px solid rgba(255,255,255,0.6)',         boxShadow: undefined },
}

export type ComponentCardProps<T> = {
  value: T
  ctx: CardRenderContext
  /** コンテンツの表示方法バリアント */
  variant?: BlockVariant
  /** ブロック作成時にテンプレート作成者が設定した値（FormItem・CardItem 共通） */
  blockConfig?: Record<string, unknown>
  /** カード閲覧画面でのインタラクティブ表示（クリック可能）かどうか */
  isInteractive?: boolean
}

/** コンポーネント定義: フォームUIとカードUIをセットで持つ単位 */
export type ComponentDef<T = unknown> = {
  key: string
  defaultValue: T
  /** このコンポーネントが対応するデザインバリアント一覧。未定義は ['simple'] 扱い */
  variants?: BlockVariant[]
  /** true のとき選択肢・スキーマが全界隈共通で固定（界隈横断検索が可能） */
  global?: boolean
  /** フォームエリアに描画されるUI */
  FormItem: (props: ComponentFormProps<T>) => ReactNode
  /** カードエリアに描画されるUI（テンプレートが参照可能） */
  CardItem?: (props: ComponentCardProps<T>) => ReactNode
  /** テンプレート作成者向けのブロック設定UI */
  blockConfigForm?: (props: BlockConfigFormProps) => ReactNode
  /** 値が「空」かどうかを判定する関数。未定義なら defaultValue と深い比較でフォールバック */
  isEmpty?: (value: T) => boolean
  /** 'internal': GenericCardRenderer が外側 surface コンテナを描画せず、ctx.surface でコンポーネント内部に伝播する */
  surfaceMode?: 'internal'
  /** true のとき、isInteractive な共有画面で surface コンテナにホバークラスを付与する */
  interactiveSurface?: boolean
}

// --- テンプレート定義型 ---

/** グリッド設定 */
export type TemplateGridDef = {
  /** 1セルの一辺（px）。minW/minH の基準単位 */
  cellSize: number
  /** 間隔の基準単位（px）。node.gap はこの倍数で指定する */
  gap: number
}

/** セル数をピクセルに変換するユーティリティ */
export function cellsToPixels(cells: number, cellSize: number): number {
  return cells * cellSize
}

/**
 * レイアウトノード: flex ベースの再帰ツリー構造
 *
 * - block: ブロックを描画するリーフノード
 * - row:   子を横並び（flex-direction: row）にするコンテナ
 * - col:   子を縦並び（flex-direction: column）にするコンテナ
 *
 * サイズ指定はグリッドセル単位（cellSize/gap から px に変換）。
 * flex を指定すると残余スペースを分配する。
 */
export type Block = {
  type: 'block'
  /** 使用するコンポーネントのキー */
  componentKey: string
  /** card_data に保存・参照するキー。省略時はデータの読み書きを行わない（divider 等の装飾専用ブロック向け） */
  dataKey?: string
  /** コンテンツの表示方法バリアント */
  variant: BlockVariant
  /** 背景・コンテナの見た目バリアント */
  surface?: SurfaceVariant
  /** 最小幅（セル数）。親が row のとき有効 */
  minW?: number
  /** 最小高（セル数）。親が col のとき有効 */
  minH?: number
  /** flex 伸長係数。指定時は minW/minH を超えて伸長する */
  flex?: number
  /** ブロック上部に表示するラベル */
  label?: string
  /** ラベルの右に表示するサブテキスト（英語説明など） */
  subLabel?: string
  /** ラベルのテキスト色（省略時はテーマの text 色） */
  labelColor?: string
  /** ラベルの左に表示するアイコン（Tabler Icons キー: 例 'TbMicrophone'） */
  labelIcon?: string
  /** true のときラベルをコンテンツ枠の内側に描画する */
  labelInset?: boolean
  /** labelInset 時のラベルとコンテンツの並び方向。'col'=上下（デフォルト）, 'row'=左右 */
  labelInsetDir?: 'col' | 'row'
  /** コンテンツ（CardItem）のフォントサイズ倍率。1.0がデフォルト。ラベルには影響しない */
  contentFontScale?: number
  /** ラベル・サブラベルのフォントサイズ倍率。1.0がデフォルト */
  labelFontScale?: number
  /** テンプレート定義時にブロックへ渡す設定（mark-list の marks など） */
  blockConfig?: Record<string, unknown>
  /** ユーザーの編集フォームに表示するラベル */
  formLabel?: string
  /** flex コンテナ内での自身の揃え（例: 'flex-start' でコンテンツ高さに縮む） */
  alignSelf?: string
  /** true のとき値が空なら FormItem を非表示にする（デフォルト false） */
  hideWhenEmpty?: boolean
  /** コンテンツエリアの縦方向揃え（alignItems）。省略時は 'stretch' */
  contentAlign?: string
}

export type LayoutNodeRow = {
  type: 'row'
  children: LayoutNode[]
  /** 最小高（セル数）。親が col のとき有効 */
  minH?: number
  /** flex 伸長係数 */
  flex?: number
  /** 子要素間のギャップ（px）。省略時は grid.gap を使用 */
  gap?: number
  /** justify-content 値（例: 'space-between'） */
  justify?: string
  /** align-items 値（例: 'center'）。省略時は stretch */
  alignItems?: string
  /** コンテナ上部に表示するセクションラベル */
  label?: string
  /** ラベルの右に表示するサブテキスト */
  subLabel?: string
  /** ラベルのテキスト色（省略時はテーマの text 色） */
  labelColor?: string
  /** ラベルの左に表示するアイコン（Tabler Icons キー: 例 'TbMicrophone'） */
  labelIcon?: string
}

export type LayoutNodeCol = {
  type: 'col'
  children: LayoutNode[]
  /** 最小幅（セル数）。親が row のとき有効 */
  minW?: number
  /** flex 伸長係数 */
  flex?: number
  /** 子要素間のギャップ（px）。省略時は grid.gap を使用 */
  gap?: number
  /** justify-content 値（例: 'space-between'） */
  justify?: string
  /** align-items 値（例: 'center'）。省略時は stretch */
  alignItems?: string
  /** コンテナ上部に表示するセクションラベル */
  label?: string
  /** ラベルの右に表示するサブテキスト */
  subLabel?: string
  /** ラベルのテキスト色（省略時はテーマの text 色） */
  labelColor?: string
  /** ラベルの左に表示するアイコン（Tabler Icons キー: 例 'TbMicrophone'） */
  labelIcon?: string
}

/**
 * blockPool のエントリ。
 * 「何を表示するか」を定義する共有プロパティのみ持つ。
 * variant / surface / label 系はプールで一度だけ定義し、レイアウト側では上書きしない。
 */
export type BlockPoolEntry = {
  componentKey: string
  dataKey: string
  variant?: BlockVariant
  surface?: SurfaceVariant
  blockConfig?: Record<string, unknown>
  label?: string
  subLabel?: string
  labelColor?: string
  labelIcon?: string
  labelInset?: boolean
  labelInsetDir?: 'col' | 'row'
  hideWhenEmpty?: boolean
  formLabel?: string
}

/**
 * blockPool に定義したブロックをレイアウト内で参照するノード。
 * サイズ・配置・フォントスケールなどレイアウト固有のプロパティを指定する。
 * variant / surface はレイアウトごとに異なる値を指定でき、pool 側の値を上書きする。
 */
export type LayoutNodeRef = {
  type: 'ref'
  /** blockPool のキー */
  blockId: string
  minW?: number
  minH?: number
  flex?: number
  alignSelf?: string
  contentAlign?: string
  contentFontScale?: number
  labelFontScale?: number
  /** このレイアウト専用の variant。pool 側の variant を上書きする */
  variant?: BlockVariant
  /** このレイアウト専用の surface。pool 側の surface を上書きする */
  surface?: SurfaceVariant
  /** このレイアウト専用の label 上書き */
  label?: string
  /** このレイアウト専用の subLabel 上書き */
  subLabel?: string
  /** labelInset 上書き */
  labelInset?: boolean
  /** labelInsetDir 上書き */
  labelInsetDir?: 'col' | 'row'
  /** grid 親のとき有効: 列方向の跨ぎ数 */
  colSpan?: number
  /** grid 親のとき有効: 行方向の跨ぎ数 */
  rowSpan?: number
}

export type LayoutNodeGrid = {
  type: 'grid'
  children: LayoutNode[]
  /** 列定義。数値（等幅列数）または CSS grid-template-columns 文字列 */
  columns: number | string
  /** 行定義。省略時は auto */
  rows?: number | string
  /** セル間ギャップ（px）。省略時は親の gap を継承 */
  gap?: number
  /** 列方向ギャップ（px）。gap より優先 */
  columnGap?: number
  /** 行方向ギャップ（px）。gap より優先 */
  rowGap?: number
  /** align-items 値（省略時は stretch） */
  alignItems?: string
  /** justify-items 値（省略時は stretch） */
  justifyItems?: string
  /** コンテナ上部に表示するセクションラベル */
  label?: string
  labelColor?: string
  labelIcon?: string
  /** flex 伸長係数（row/col 親のとき有効） */
  flex?: number
  minW?: number
  minH?: number
}

export type LayoutNode = Block | LayoutNodeRow | LayoutNodeCol | LayoutNodeGrid | LayoutNodeRef

/** 向き別レイアウト定義（card / web それぞれ持つ） */
export type TemplateOrientationDef = {
  cardWidth: number
  /** 固定高さ（px）。省略時は autoHeight: true と組み合わせてコンテンツ高さに追従 */
  cardHeight?: number
  /** true のとき高さをコンテンツに合わせてスクロール可能な Web 表示にする */
  autoHeight?: boolean
  grid: TemplateGridDef
  /** ルートレイアウトノード（通常 row か col） */
  layout: LayoutNode
  /** ラベルのフォントサイズ倍率デフォルト値（個別 labelFontScale で上書き可） */
  defaultLabelFontScale?: number
  /** コンテンツのフォントサイズ倍率デフォルト値（個別 contentFontScale で上書き可） */
  defaultContentFontScale?: number
  /** パディング倍率デフォルト値（デフォルト 1） */
  defaultPaddingScale?: number
}

/** テンプレート全体の定義（汎用レンダラーが参照するJSON構造） */
export type TemplateDefinition = {
  id: string
  label: string
  /** デフォルトテーマ */
  theme: CardRenderContext['theme']
  /** デフォルトフォント */
  fontFamily: string
  /** カード外周の角丸（px）。省略時は 20 */
  borderRadius?: number
  /** 背景ブロックのキー（省略時は背景なし） */
  backgroundKey?: string
  /** オーバーレイブロックのキー（背景の上・グリッドの下に描画） */
  overlayKey?: string
  /** テンプレート固定のオーバーレイ値。設定時はユーザー値を無視してこちらを使用 */
  overlayFixed?: import('./overlay').OverlayValue
  /** フォントサイズ比率のオーバーライド（省略時はデフォルト比率を使用） */
  fontScale?: Partial<FontScale>
  /** カード表示レイアウト（固定サイズ・画像書き出し用） */
  card: TemplateOrientationDef
  /** Web表示レイアウト（autoHeight・スマホ閲覧用） */
  web: TemplateOrientationDef
  /** フォームのセクション構成（省略時はレイアウト上のブロックをフラット表示） */
  formSections?: FormSection[]
  /**
   * 名前付きブロック定義プール。
   * componentKey / dataKey / blockConfig / label など「何を表示するか」を一度だけ定義し、
   * レイアウト内の LayoutNodeRef から blockId で参照する。
   * サイズ・フォントスケールなどレイアウト固有の値は ref ノード側で指定する。
   */
  blockPool?: Record<string, BlockPoolEntry>
}

/** フォームレイアウト定義 */
export type FormNodeBlock = {
  type: 'block'
  dataKey: string
  hideWhenEmpty?: boolean
  formLabel?: string
}

export type FormNodeText = {
  type: 'text'
  content: string
  style?: 'heading' | 'description'
}

export type FormNodeFont = { type: 'font' }

export type FormNode = FormNodeBlock | FormNodeText | FormNodeFont

export type FormSection = {
  title: string
  items: FormNode[]
  defaultOpen?: boolean
}

/** ブロック値の集合 */
export type BlockValues = Record<string, unknown>

/** フォームのセクション定義 */
export type TemplateSectionBlock = {
  key: string
  /** true のとき値が空なら FormItem を非表示にする（デフォルト false） */
  hideWhenEmpty?: boolean
  /** ユーザーの編集フォームに表示するラベル */
  formLabel?: string
}

export type TemplateSection = {
  titleKey: string
  blockKeys: (string | TemplateSectionBlock)[]
  defaultOpen?: boolean
}

/** テンプレート定義 */
export type CardTemplate = {
  id: string
  title: string
  desc: string
  badge: string
  badgeColor: string
  communities: string[]
  communitySlug?: string  // DBの communities.slug に対応
  cardWidth: number
  cardHeight: number
  PreviewCard: () => ReactNode
  /** このテンプレートで使用するコンポーネント一覧 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocks: ComponentDef<any>[]
  /** フォームのセクション構成 */
  sections: TemplateSection[]
  /** カード全体のレンダラー。全ブロック値を受け取り描画する */
  webWidth?: number
  webHeight?: number
  CardRenderer: (props: {
    values: BlockValues
    fontFamily: string
    t: Translations
    background?: BackgroundValue
    isInteractive?: boolean
    noBackground?: boolean
    orientation?: 'card' | 'web'
    cardUrl?: string
    userUrl?: string
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
  /** 検索用タグ（自動セット） */
  searchTag: '' | '18歳未満' | '18+' | '非公開'
  /** カード表示用テキスト（自由入力） */
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
  base64: (string | null)[]  // 後方互換
  urls?: (string | null)[]   // Storage URL（新形式、あれば優先）
}

export type BackgroundValue = {
  type: 'color' | 'gradient' | 'image'
  /** color: string, gradient: [from, to], image: URL string or base64 */
  value: string | [string, string]
  imageFile?: File | null
  base64?: string | null  // 後方互換
  url?: string | null     // Storage URL（新形式、あれば優先）
}
