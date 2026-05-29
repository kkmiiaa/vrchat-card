import type { TemplateDefinition } from '@/blocks/types'
import { CARD_LANDSCAPE_WIDTH, CARD_LANDSCAPE_HEIGHT, CARD_PORTRAIT_WIDTH, CARD_PORTRAIT_HEIGHT } from '@/lib/cardDimensions'

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
    cardWidth:  CARD_LANDSCAPE_WIDTH,
    cardHeight: CARD_LANDSCAPE_HEIGHT,
    grid: { cellSize: 8, gap: 4 },
    layout: {
      type: 'row',
      flex: 1,
      gap: 4,
      children: [
        {
          type: 'col',
          minW: 24,
          justify: 'space-between',
          children: [
            { type: 'block', componentKey: 'profileImage', dataKey: 'profileImage', variant: 'default', minH: 24 },
            { type: 'block', componentKey: 'language', dataKey: 'language', variant: 'slash', minH: 3, label: '言語', subLabel: 'languages spoken', contentFontScale: 0.9, bgVariant: 'default' },
            { type: 'block', componentKey: 'gauge', dataKey: 'micOnRate', variant: 'default', minH: 3, label: 'マイクON率', subLabel: 'microphone usage', contentFontScale: 0.9, bgVariant: 'default', blockConfig: { unit: '%' } },
            {
              type: 'block', componentKey: 'color-status', dataKey: 'status', variant: 'default', minH: 12,
              label: 'ステータス', subLabel: 'status description', bgVariant: 'default',
              blockConfig: {
                fields: [
                  { key: 'blue',   label: '青', color: '#60a5fa' },
                  { key: 'green',  label: '緑', color: '#4ade80' },
                  { key: 'yellow', label: '黃', color: '#facc15' },
                  { key: 'red',    label: '赤', color: '#f87171' },
                ],
              },
            },
          ],
        },
        {
          type: 'col',
          minW: 35,
          gap: 2,
          justify: 'space-between',
          children: [
            { type: 'block', componentKey: 'text', dataKey: 'name', variant: 'default', minH: 5, label: '名前', subLabel: 'name', contentFontScale: 1.4, blockConfig: { multiline: false }, bgVariant: 'default' },
            {
              type: 'row',
              minH: 6,
              gap: 2,
              children: [
                { type: 'block', componentKey: 'gender', dataKey: 'gender', variant: 'default', minW: 12, minH: 2, label: '性別', subLabel: 'gender', contentFontScale: 0.9, bgVariant: 'default' },
                {
                  type: 'block', componentKey: 'multi-select', dataKey: 'playEnv', variant: 'slash', flex: 1,
                  label: '環境', subLabel: 'environment', bgVariant: 'default',
                  blockConfig: {
                    options: [
                      { value: 'pcvr',    label: 'PCVR',    icon: 'TbBadgeVr' },
                      { value: 'quest',   label: 'Quest',   icon: 'TbDeviceGamepad2' },
                      { value: 'desktop', label: 'Desktop', icon: 'TbDeviceDesktop' },
                    ],
                  },
                },
              ],
            },
            {
              type: 'col',
              gap: 1,
              justify: 'center',
              children: [
                { type: 'block', componentKey: 'simple-sns', dataKey: 'vrchat',  variant: 'default', minH: 3, contentFontScale: 1, blockConfig: { platform: 'vrchat' } },
                { type: 'block', componentKey: 'simple-sns', dataKey: 'x',       variant: 'default', minH: 3, contentFontScale: 1, blockConfig: { platform: 'x' },       bgVariant: 'default' },
                { type: 'block', componentKey: 'simple-sns', dataKey: 'discord', variant: 'default', minH: 3, contentFontScale: 1, blockConfig: { platform: 'discord' }, bgVariant: 'default' },
              ],
            },
            {
              type: 'block', componentKey: 'multi-select', dataKey: 'friendPolicy', variant: 'slash', minH: 4,
              label: 'フレンド申請', subLabel: 'friend request policy', contentFontScale: 1, bgVariant: 'default',
              blockConfig: {
                options: [
                  { value: 'frPolicyAnyone',             label: 'だれでもOK' },
                  { value: 'frPolicyIfInterested',       label: '気になったら許可' },
                  { value: 'frPolicyMutualsOnX',         label: 'X相互は申請OK' },
                  { value: 'frPolicyAfterGettingToKnow', label: '仲良くなってから許可' },
                  { value: 'frPolicyNo',                 label: '送らないでください' },
                ],
              },
            },
            {
              type: 'block', componentKey: 'mark-grid', dataKey: 'mark-grid1', variant: 'default', minH: 15,
              label: 'OKなこと・NGなこと', subLabel: 'ok & ng', contentFontScale: 0.9,
              blockConfig: {
                items: [
                  { label: '触る' },
                  { label: '近距離' },
                  { label: 'お砂糖' },
                  { label: '武器' },
                  { label: '暴言/暴力' },
                  { label: '下ネタ' },
                ],
                marks: [
                  { symbol: '◎', color: '#22c55e', bg: '#f9fafb' },
                  { symbol: '◯', color: '#22c55e', bg: '#f9fafb' },
                  { symbol: '△', color: '#f59e0b', bg: '#f9fafb' },
                  { symbol: '✕', color: '#ef4444', bg: '#f9fafb' },
                ],
                cols: 3,
                rows: 3,
              },
            },
          ],
        },
        {
          type: 'col',
          flex: 1,
          gap: 1,
          children: [
            { type: 'block', componentKey: 'text', dataKey: 'selfIntro', variant: 'default', flex: 1, label: '自己紹介', subLabel: 'about me', contentFontScale: 0.75, bgVariant: 'default' },
            { type: 'block', componentKey: 'gallery', dataKey: 'gallery', variant: 'default', minH: 12, bgVariant: 'default' },
          ],
        },
      ],
    },
  },

  portrait: {
    cardWidth:  CARD_PORTRAIT_WIDTH,
    autoHeight: true,
    grid: { cellSize: 8, gap: 4 },
    defaultLabelFontScale: 1.8,
    defaultContentFontScale: 1.6,
    defaultPaddingScale: 1.8,
    layout: {
      type: 'col',
      flex: 1,
      gap: 3,
      children: [
        {
          type: 'row',
          minH: 20,
          gap: 3,
          children: [
            { type: 'block', componentKey: 'profileImage', dataKey: 'profileImage', variant: 'default', minW: 20 },
            {
              type: 'col',
              flex: 1,
              gap: 2,
              justify: 'space-between',
              children: [
                { type: 'block', componentKey: 'text', dataKey: 'name', variant: 'default', minH: 4, label: '名前', subLabel: 'name', contentFontScale: 0.9 },
                {
                  type: 'row',
                  minH: 4,
                  gap: 2,
                  children: [
                    { type: 'block', componentKey: 'gender', dataKey: 'gender', variant: 'default', flex: 1, label: '性別', subLabel: 'gender', contentFontScale: 0.8 },
                    { type: 'block', componentKey: 'multi-select', dataKey: 'playEnv',   variant: 'slash',   flex: 2, label: '環境', subLabel: 'env' },
                  ],
                },
                {
                  type: 'col',
                  gap: 1,
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
