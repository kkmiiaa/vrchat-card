import type { TemplateDefinition } from '@/blocks/types'
import { CARD_V1_WIDTH, CARD_V1_HEIGHT } from '@/components/CardV1'

/**
 * CardV1 landscape を TemplateDefinition（グリッド座標ベース）で表現したもの。
 *
 * 12列 × 10行グリッド:
 * ┌──────────┬──────────────┬──────────────┐
 * │ 左 col0-2│  中央 col3-7 │  右 col8-11  │
 * │ 画像(0-3)│  名前(0)     │  自己紹介    │
 * │ 言語(4)  │  性別/環境(1)│  (0-8)       │
 * │ マイク(5)│  SNS(2-4)    │              │
 * │ ステータス│  フレンド(5-6)│  ギャラリー │
 * │ (6-9)   │  OKNG(7-9)   │  (9)         │
 * └──────────┴──────────────┴──────────────┘
 */
export const cardV1Definition: TemplateDefinition = {
  id: 'v1',
  label: 'VRChat 自己紹介カード v1',
  cardWidth: CARD_V1_WIDTH,
  cardHeight: CARD_V1_HEIGHT,
  theme: {
    accent:  '#00AADB',
    text:    '#1f2937',
    subText: '#9ca3af',
    bg:      'rgba(255,255,255,0.85)',
  },
  fontFamily: 'sans-serif',
  grid: { cols: 12, rows: 10, gap: 8 },
  components: [
    // ── 左カラム（col 0-2） ──
    { blockKey: 'profileImage', variant: 'default', x: 0, y: 0, w: 3, h: 3 },
    { blockKey: 'language',     variant: 'slash',   x: 0, y: 3, w: 3, h: 1 },
    { blockKey: 'micOnRate',    variant: 'gradient',x: 0, y: 4, w: 3, h: 1 },
    { blockKey: 'status',       variant: 'default', x: 0, y: 5, w: 3, h: 5 },

    // ── 中央カラム（col 3-7） ──
    { blockKey: 'name',         variant: 'default', x: 3, y: 0, w: 5, h: 1 },
    { blockKey: 'genderTag',    variant: 'default', x: 3, y: 1, w: 2, h: 1 },
    { blockKey: 'playEnv',      variant: 'slash',   x: 5, y: 1, w: 3, h: 1 },
    { blockKey: 'sns',          variant: 'icon',    x: 3, y: 2, w: 5, h: 3 },
    { blockKey: 'friendPolicy', variant: 'default', x: 3, y: 5, w: 5, h: 2 },
    { blockKey: 'interactions', variant: 'grid',    x: 3, y: 7, w: 5, h: 3 },

    // ── 右カラム（col 8-11） ──
    { blockKey: 'selfIntro',    variant: 'default', x: 8, y: 0, w: 4, h: 9 },
    { blockKey: 'gallery',      variant: 'default', x: 8, y: 9, w: 4, h: 1 },
  ],
}
