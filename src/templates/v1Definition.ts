import type { TemplateDefinition } from '@/blocks/types'
import { CARD_V1_WIDTH, CARD_V1_HEIGHT } from '@/components/CardV1'

/**
 * CardV1 landscape を TemplateDefinition で表現したもの。
 * 汎用レンダラーへの移行基準として使用する。
 *
 * レイアウト構造:
 * ┌──────────┬──────────────┬──────────────┐
 * │ 左(1)    │  中央(1.5)   │  右(1.5)     │
 * │ 画像     │  名前        │  自己紹介    │
 * │ 言語     │  性別/環境   │  ギャラリー  │
 * │ マイクON率│  SNS        │              │
 * │ ステータス│  フレンド申請│              │
 * │          │  OK/NG      │              │
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
  sections: [
    {
      label: 'main',
      columns: [
        // ── 左カラム ──
        {
          width: 1,
          components: [
            { blockKey: 'profileImage', variant: 'default' },
            { blockKey: 'language',     variant: 'slash' },
            { blockKey: 'micOnRate',    variant: 'gradient' },
            { blockKey: 'status',       variant: 'default', grow: true },
          ],
        },
        // ── 中央カラム ──
        {
          width: 1.5,
          components: [
            { blockKey: 'name',         variant: 'default' },
            { blockKey: 'genderTag',    variant: 'default' },
            { blockKey: 'playEnv',      variant: 'slash' },
            { blockKey: 'sns',          variant: 'icon' },
            { blockKey: 'friendPolicy', variant: 'default', grow: true },
            { blockKey: 'interactions', variant: 'grid' },
          ],
        },
        // ── 右カラム ──
        {
          width: 1.5,
          components: [
            { blockKey: 'selfIntro',    variant: 'default', grow: true },
            { blockKey: 'gallery',      variant: 'default' },
          ],
        },
      ],
    },
  ],
}
