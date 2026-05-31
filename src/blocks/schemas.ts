import { z } from 'zod'

// ── プリミティブ ────────────────────────────────────────────────

const zStr = z.string().catch('')
const zNum = z.number().catch(0)
const zBool = z.boolean().catch(false)
const zStrOpt = z.string().optional().catch(undefined)
const zNumOpt = z.number().optional().catch(undefined)

// ── 複合型 ─────────────────────────────────────────────────────

export const AgeValueSchema = z.object({
  searchTag: z.enum(['', '18歳未満', '18+', '非公開']).catch(''),
  display:   zStr,
  mode:      zStrOpt,
}).catch({ searchTag: '', display: '' })

export const ActivityValueSchema = z.object({
  days:             z.array(zBool).catch([true, true, true, true, true, false, false]),
  daysMode:         z.enum(['', 'irregular']).optional().catch(undefined),
  weekdayStart:     zStr,
  weekdayEnd:       zStr,
  weekdayTimesMode: z.enum(['', 'irregular']).optional().catch(undefined),
  holidayStart:     zStr,
  holidayEnd:       zStr,
  holidayTimesMode: z.enum(['', 'irregular']).optional().catch(undefined),
}).catch({
  days: [true, true, true, true, true, false, false],
  weekdayStart: '', weekdayEnd: '',
  holidayStart: '', holidayEnd: '',
})

export const GalleryValueSchema = z.object({
  enabled: zBool,
  images:  z.array(z.null()).catch([]),
  base64:  z.array(z.string().nullable()).catch([]),
}).catch({ enabled: false, images: [], base64: [] })

export const BackgroundValueSchema = z.object({
  type:      z.enum(['color', 'gradient', 'image']).catch('image'),
  value:     z.union([z.string(), z.tuple([z.string(), z.string()])]).catch('/backgrounds/bg_1.webp'),
  imageFile: z.null().optional().catch(undefined),
  base64:    z.string().nullable().optional().catch(undefined),
}).catch({ type: 'image', value: '/backgrounds/bg_1.webp' })

export const MarkDefinitionSchema = z.object({
  symbol: zStr,
  color:  zStr,
  bg:     zStr,
}).catch({ symbol: '', color: '#000000', bg: '#f3f4f6' })

// interactions block: { label, mark, isCustom? }[]
export const InteractionItemSchema = z.object({
  label:    zStr,
  mark:     zStr,
  isCustom: zBool.optional().catch(undefined),
}).catch({ label: '', mark: '' })

// markList / markGrid block: { marks: Record<number,string>, custom: { label, mark }[], removed?: number[] }
const MarkMapSchema = z.record(z.string(), zStr).catch({})
const CustomMarkItemSchema = z.object({
  label: zStr,
  mark:  zStr,
}).catch({ label: '', mark: '' })

export const MarkListValueSchema = z.object({
  marks:   MarkMapSchema,
  custom:  z.array(CustomMarkItemSchema).catch([]),
  removed: z.array(zNum).optional().catch(undefined),
}).catch({ marks: {}, custom: [] })

export const BadgeValueSchema = z.object({
  label: zStr,
  color: zStrOpt,
}).catch({ label: '' })

export const BadgeItemSchema = z.object({
  label: zStr,
  color: zStr,
}).catch({ label: '', color: '' })

export const ColorLabeledListItemSchema = z.object({
  color: zStr,
  label: zStr,
}).catch({ color: '#60a5fa', label: '' })

export const ColorLabeledListValueSchema = z.object({
  items: z.array(ColorLabeledListItemSchema).catch([]),
}).catch({ items: [] })

const OverlayInsetSchema = z.object({
  top:    zNum,
  right:  zNum,
  bottom: zNum,
  left:   zNum,
}).catch({ top: 24, right: 40, bottom: 24, left: 40 })

export const OverlayValueSchema = z.object({
  variant:      z.enum(['none', 'glass', 'solid', 'border-only']).catch('glass'),
  color:        zStrOpt,
  opacity:      zNumOpt,
  inset:        OverlayInsetSchema.optional().catch(undefined),
  borderRadius: zNumOpt,
  innerPadding: zNumOpt,
  blur:         zNumOpt,
  borderColor:  zStrOpt,
}).catch({ variant: 'glass', opacity: 82 })

// gender block: { tag: string, display?: string }
export const GenderValueSchema = z.object({
  tag:     zStr,
  display: zStrOpt,
}).catch({ tag: '' })

// language block: { preset: string[], custom: string[] }
export const LanguageValueSchema = z.object({
  preset: z.array(zStr).catch([]),
  custom: z.array(zStr).catch([]),
}).catch({ preset: [], custom: [] })

// sns block: { vrchatId, twitterId, discordId, friendPolicy? }
export const SnsValueSchema = z.object({
  vrchatId:     zStr,
  twitterId:    zStr,
  discordId:    zStr,
  friendPolicy: zStrOpt,
}).catch({ vrchatId: '', twitterId: '', discordId: '' })

// status block: { blue, green, yellow, red }
export const StatusValueSchema = z.object({
  blue:   zStr,
  green:  zStr,
  yellow: zStr,
  red:    zStr,
}).catch({ blue: '', green: '', yellow: '', red: '' })

// dateItem block: { display: string, iso?: string }
export const DateItemValueSchema = z.object({
  display: zStr,
  iso:     zStrOpt,
}).catch({ display: '' })

// linkItem block: { label: string, url: string }
export const LinkItemValueSchema = z.object({
  label: zStr,
  url:   zStr,
}).catch({ label: '', url: '' })

// qrCode block: { customUrl?: string }
export const QrCodeValueSchema = z.object({
  customUrl: zStrOpt,
}).catch({})

// ── BlockValues 全体 ────────────────────────────────────────────

/**
 * DB / localStorage から読んだ生データをこのスキーマで parse する。
 * 各フィールドは .catch() で安全なデフォルトにフォールバックするので
 * parse が例外を投げることはない。
 *
 * ブロックキーごとのデータ型仕様:
 *   name            string
 *   selfIntro       string
 *   font            string
 *   trustRank       string
 *   gender          GenderValue   = { tag: string, display?: string }
 *   language        LanguageValue = { preset: string[], custom: string[] }
 *   playEnv         string[]      (例: ['PCVR', 'Quest'])
 *   micOnRate       number        (0–100)
 *   age             AgeValue      = { searchTag, display, mode? }
 *   activity        ActivityValue = { days, weekdayStart, weekdayEnd, holidayStart, holidayEnd, ... }
 *   gallery         GalleryValue  = { enabled, images, base64 }
 *   background      BackgroundValue
 *   overlay         OverlayValue
 *   interactions    InteractionItem[] = { label, mark, isCustom? }[]
 *   sns             SnsValue      = { vrchatId, twitterId, discordId, friendPolicy? }
 *   status          StatusValue   = { blue, green, yellow, red }
 *
 * .passthrough() により未知のキー（カスタムブロック等）はそのまま通る。
 * カスタムブロックの値型については blockConfig で個別定義される。
 */
export const BlockValuesSchema = z.object({
  // テキスト系
  name:      zStr,
  selfIntro: zStr,
  font:      zStr,
  trustRank: zStr,

  // 複合テキスト
  gender:   GenderValueSchema.optional().catch(undefined),
  language: LanguageValueSchema.optional().catch(undefined),

  // 配列系
  playEnv: z.array(zStr).catch([]),

  // 数値系
  micOnRate: zNum,

  // 複合型
  age:          AgeValueSchema.optional().catch(undefined),
  activity:     ActivityValueSchema.optional().catch(undefined),
  gallery:      GalleryValueSchema.optional().catch(undefined),
  overlay:      OverlayValueSchema.optional().catch(undefined),
  interactions: z.array(InteractionItemSchema).catch([]),
  sns:          SnsValueSchema.optional().catch(undefined),
  status:       StatusValueSchema.optional().catch(undefined),

  // 画像（base64 / URL は File にはならないので文字列または null）
  profileImageBase64: z.string().nullable().optional().catch(undefined),
  profileImageUrl:    z.string().nullable().optional().catch(undefined),
}).passthrough()  // 未知のキーはそのまま通す（カスタムブロック対応）
