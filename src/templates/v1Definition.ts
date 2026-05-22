import type { TemplateDefinition } from '@/blocks/types'
import { CARD_V1_WIDTH, CARD_V1_HEIGHT } from '@/components/CardV1'

const PORTRAIT_WIDTH  = 630
const PORTRAIT_HEIGHT = 900

/**
 * CardV1 の実際のレイアウトに合わせた TemplateDefinition
 *
 * CardV1 landscape 実寸:
 *   colLeftW  = W * 0.195 ≈ 175px → minW:15 (178px)
 *   colMidW   = W * 0.300 ≈ 270px → minW:22 (262px)
 *   COL_GAP   = W * 0.022 ≈ 20px  → gap:20 (flex gap として overlay innerPadding 扱い)
 *   colRight  = 残り (flex:1)
 */
export const cardV1Definition: TemplateDefinition = {
  id: 'v1',
  label: 'VRChat 自己紹介カード v1',
  theme: {
    accent:  '#00AADB',
    text:    '#1f2937',
    subText: '#9ca3af',
    bg:      'rgba(255,255,255,0.85)',
  },
  fontFamily: 'sans-serif',
  borderRadius: 20,
  backgroundKey: 'background',
  overlayKey: 'overlay',

  landscape: {
    cardWidth:  CARD_V1_WIDTH,
    cardHeight: CARD_V1_HEIGHT,
    grid: { cellSize: 10, gap: 2 },
    layout: {
      type: 'row',
      flex: 1,
      gap: 20,
      children: [
        {
          type: 'col',
          minW: 16,
          justify: 'space-between',
          children: [
            { type: 'block', componentKey: 'profileImage', dataKey: 'profileImage', variant: 'default', minH: 16 },
            { type: 'block', componentKey: 'language', dataKey: 'language',  variant: 'slash',    minH: 2, label: '言語',      subLabel: 'languages spoken',  contentFontScale: 0.9 },
            { type: 'block', componentKey: 'gauge', dataKey: 'micOnRate', variant: 'default', minH: 2, label: 'マイクON率', subLabel: 'microphone usage',  contentFontScale: 0.9 },
            { type: 'block', componentKey: 'color-status', dataKey: 'status',    variant: 'default',  minH: 9, label: 'ステータス', subLabel: 'status description' },
          ],
        },
        {
          type: 'col',
          minW: 22,
          gap: 8,
          children: [
            { type: 'block', componentKey: 'text', dataKey: 'name',      variant: 'default', minH: 4, label: '名前', subLabel: 'name', contentFontScale: 0.8 },
            {
              type: 'row',
              minH: 4,
              gap: 8,
              children: [
                { type: 'block', componentKey: 'gender', dataKey: 'gender', variant: 'default', minW: 8, minH: 2, label: '性別', subLabel: 'gender', contentFontScale: 0.8 },
                { type: 'block', componentKey: 'multi-select', dataKey: 'playEnv',   variant: 'slash',   flex: 1,          label: '環境', subLabel: 'environment' },
              ],
            },
            {
              type: 'col',
              gap: 4,
              justify: 'center',
              children: [
                { type: 'block', componentKey: 'simple-sns', dataKey: 'vrchat',  variant: 'default', minH: 2, contentFontScale: 1, blockConfig: { platform: 'vrchat' } },
                { type: 'block', componentKey: 'simple-sns', dataKey: 'x',       variant: 'default', minH: 2, contentFontScale: 1, blockConfig: { platform: 'x' } },
                { type: 'block', componentKey: 'simple-sns', dataKey: 'discord', variant: 'default', minH: 2, contentFontScale: 1, blockConfig: { platform: 'discord' } },
              ],
            },
            { type: 'block', componentKey: 'multi-select', dataKey: 'friendPolicy', variant: 'default', minH: 4,  label: 'フレンド申請', subLabel: 'friend request policy', contentFontScale: 0.8 },
            { type: 'block', componentKey: 'mark-list', dataKey: 'interactions', variant: 'grid',    minH: 10, label: 'OKなこと・NGなこと', subLabel: 'ok & ng', contentFontScale: 0.85 },
          ],
        },
        {
          type: 'col',
          flex: 1,
          gap: 8,
          children: [
            { type: 'block', componentKey: 'text', dataKey: 'selfIntro', variant: 'default', flex: 1, label: '自己紹介', subLabel: 'about me', contentFontScale: 0.75 },
            { type: 'block', componentKey: 'gallery', dataKey: 'gallery',   variant: 'default', minH: 9 },
          ],
        },
      ],
    },
  },

  portrait: {
    cardWidth:  PORTRAIT_WIDTH,
    cardHeight: PORTRAIT_HEIGHT,
    grid: { cellSize: 10, gap: 2 },
    defaultLabelFontScale: 1.8,
    defaultContentFontScale: 1.6,
    defaultPaddingScale: 1.8,
    layout: {
      type: 'col',
      flex: 1,
      gap: 12,
      children: [
        {
          type: 'row',
          minH: 20,
          gap: 12,
          children: [
            { type: 'block', componentKey: 'profileImage', dataKey: 'profileImage', variant: 'default', minW: 20 },
            {
              type: 'col',
              flex: 1,
              gap: 8,
              justify: 'space-between',
              children: [
                { type: 'block', componentKey: 'text', dataKey: 'name', variant: 'default', minH: 4, label: '名前', subLabel: 'name', contentFontScale: 0.9 },
                {
                  type: 'row',
                  minH: 4,
                  gap: 8,
                  children: [
                    { type: 'block', componentKey: 'gender', dataKey: 'gender', variant: 'default', flex: 1, label: '性別', subLabel: 'gender', contentFontScale: 0.8 },
                    { type: 'block', componentKey: 'multi-select', dataKey: 'playEnv',   variant: 'slash',   flex: 2, label: '環境', subLabel: 'env' },
                  ],
                },
                {
                  type: 'col',
                  gap: 4,
                  children: [
                    { type: 'block', componentKey: 'simple-sns', dataKey: 'vrchat',  variant: 'default', blockConfig: { platform: 'vrchat' } },
                    { type: 'block', componentKey: 'simple-sns', dataKey: 'x',       variant: 'default', blockConfig: { platform: 'x' } },
                    { type: 'block', componentKey: 'simple-sns', dataKey: 'discord', variant: 'default', blockConfig: { platform: 'discord' } },
                  ],
                },
              ],
            },
          ],
        },
        { type: 'block', componentKey: 'divider', dataKey: 'divider', variant: 'default' },
        {
          type: 'row',
          flex: 1,
          children: [
            {
              type: 'col',
              flex: 2,
              justify: 'space-between',
              children: [
                { type: 'block', componentKey: 'language', dataKey: 'language',     variant: 'slash',    label: '言語',          subLabel: 'language spoken',      minH: 3 },
                { type: 'block', componentKey: 'gauge', dataKey: 'micOnRate',    variant: 'gradient', label: 'マイクON率',    subLabel: 'microphone usage',     minH: 3 },
                { type: 'block', componentKey: 'color-status', dataKey: 'status',       variant: 'default',  label: 'ステータス',    subLabel: 'status',               minH: 11 },
                { type: 'block', componentKey: 'multi-select', dataKey: 'friendPolicy', variant: 'default',  label: 'フレンド申請',  subLabel: 'friend request policy', minH: 5, contentFontScale: 0.9 },
                { type: 'block', componentKey: 'mark-list', dataKey: 'interactions', variant: 'grid',     label: 'OKなこと・NGなこと', subLabel: 'my boundaries',   minH: 12 },
              ],
            },
            { type: 'block', componentKey: 'divider', dataKey: 'divider', variant: 'vertical', minW: 2 },
            {
              type: 'col',
              flex: 3,
              children: [
                { type: 'block', componentKey: 'text', dataKey: 'selfIntro', variant: 'default', flex: 1, label: '自己紹介', subLabel: 'about me', contentFontScale: 0.7 },
                { type: 'block', componentKey: 'gallery', dataKey: 'gallery',   variant: 'default', minH: 9 },
              ],
            },
          ],
        },
      ],
    },
  },
}
