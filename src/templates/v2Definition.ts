import type { TemplateDefinition } from '@/blocks/types'

const LANDSCAPE_WIDTH  = 900
const LANDSCAPE_HEIGHT = 506
const PORTRAIT_WIDTH   = 630
const PORTRAIT_HEIGHT  = 900

export const cardV2Definition: TemplateDefinition = {
  id: 'v2',
  label: 'VRChat 自己紹介カード v2',
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
  overlayFixed: {
    variant: 'glass',
    opacity: 35,
    blur: 18,
    inset: { top: 20, right: 24, bottom: 20, left: 24 },
    borderRadius: 16,
    borderColor: 'rgba(255,255,255,0.75)',
    innerPadding: 24,
  },

  landscape: {
    cardWidth:  LANDSCAPE_WIDTH,
    cardHeight: LANDSCAPE_HEIGHT,
    grid: { cellSize: 10, gap: 2 },
    layout: {
      type: 'row',
      flex: 1,
      gap: 24,
      children: [
        {
          type: 'col',
          minW: 18,
          gap: 10,
          justify: 'center',
          children: [
            { type: 'block', componentKey: 'profileImage', dataKey: 'profileImage', variant: 'default', minH: 18, glass: true, glassRadius: 16 },
            {
              type: 'col',
              gap: 4,
              children: [
                { type: 'block', componentKey: 'simple-sns', dataKey: 'vrchat',  variant: 'glass', minH: 4, blockConfig: { platform: 'vrchat' } },
                { type: 'block', componentKey: 'simple-sns', dataKey: 'x',       variant: 'glass', minH: 2, blockConfig: { platform: 'x' } },
                { type: 'block', componentKey: 'simple-sns', dataKey: 'discord', variant: 'glass', minH: 2, blockConfig: { platform: 'discord' } },
              ],
            },
            { type: 'block', componentKey: 'gallery', dataKey: 'gallery', variant: 'glass', minH: 6 },
          ],
        },
        { type: 'block', componentKey: 'divider', dataKey: 'divider', variant: 'vertical' },
        {
          type: 'col',
          flex: 1,
          gap: 8,
          children: [
            {
              type: 'row',
              gap: 8,
              justify: 'space-between',
              minH: 4,
              children: [
                { type: 'block', componentKey: 'text', dataKey: 'name',      variant: 'default', flex: 1,       alignSelf: 'center' },
                { type: 'block', componentKey: 'select', dataKey: 'trustRank', variant: 'default', alignSelf: 'center' },
              ],
            },
            {
              type: 'row',
              gap: 4,
              children: [
                { type: 'block', componentKey: 'gender', dataKey: 'gender', variant: 'default', flex: 1 },
                { type: 'block', componentKey: 'age', dataKey: 'age',       variant: 'default', flex: 1 },
                { type: 'block', componentKey: 'multi-select', dataKey: 'playEnv',   variant: 'slash',   flex: 2 },
                { type: 'block', componentKey: 'language', dataKey: 'language',  variant: 'slash',   flex: 2 },
                { type: 'block', componentKey: 'gauge', dataKey: 'micOnRate', variant: 'default', flex: 1 },
              ],
            },
            { type: 'block', componentKey: 'divider', dataKey: 'divider',   variant: 'default', minH: 1 },
            { type: 'block', componentKey: 'text', dataKey: 'selfIntro', variant: 'default', flex: 1, label: 'ABOUT', contentFontScale: 0.85, glass: true },
            {
              type: 'row',
              gap: 16,
              children: [
                { type: 'block', componentKey: 'color-status', dataKey: 'status',   variant: 'default', flex: 1, label: 'STATUS',   contentFontScale: 0.9, glass: true, minH: 8 },
                { type: 'block', componentKey: 'activity', dataKey: 'activity', variant: 'v2',      flex: 1, label: 'ACTIVITY' },
              ],
            },
            { type: 'block', componentKey: 'mark-list', dataKey: 'interactions', variant: 'default', label: 'INTERACTION', contentFontScale: 0.9, minH: 2 },
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
        // 上部: プロフィール画像 + 名前/タグ/SNS
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
                {
                  type: 'row',
                  gap: 8,
                  children: [
                    { type: 'block', componentKey: 'text', dataKey: 'name',      variant: 'default', flex: 1 },
                    { type: 'block', componentKey: 'select', dataKey: 'trustRank', variant: 'default', alignSelf: 'center' },
                  ],
                },
                {
                  type: 'row',
                  gap: 6,
                  children: [
                    { type: 'block', componentKey: 'gender', dataKey: 'gender', variant: 'default', flex: 1 },
                    { type: 'block', componentKey: 'age', dataKey: 'age',       variant: 'default', flex: 1 },
                  ],
                },
                { type: 'block', componentKey: 'sns-bundle', dataKey: 'sns', variant: 'v2', flex: 1 },
              ],
            },
          ],
        },
        // 区切り
        { type: 'block', componentKey: 'divider', dataKey: 'divider', variant: 'default' },
        // ABOUT
        { type: 'block', componentKey: 'text', dataKey: 'selfIntro', variant: 'default', minH: 8, label: 'ABOUT', contentFontScale: 0.9 },
        // 区切り
        { type: 'block', componentKey: 'divider', dataKey: 'divider', variant: 'default' },
        // 下部 2 カラム
        {
          type: 'row',
          flex: 1,
          children: [
            // 左: PROFILE + STATUS
            {
              type: 'col',
              flex: 1,
              gap: 8,
              justify: 'space-between',
              children: [
                { type: 'block', componentKey: 'multi-select', dataKey: 'playEnv',   variant: 'slash',   minH: 3, label: '環境',        subLabel: 'env' },
                { type: 'block', componentKey: 'language', dataKey: 'language',  variant: 'slash',   minH: 3, label: '言語',        subLabel: 'language' },
                { type: 'block', componentKey: 'gauge', dataKey: 'micOnRate', variant: 'default', minH: 3, label: 'マイクON率', subLabel: 'mic' },
                { type: 'block', componentKey: 'color-status', dataKey: 'status',    variant: 'default', flex: 1, label: 'STATUS',      contentFontScale: 0.9 },
              ],
            },
            // 縦区切り
            { type: 'block', componentKey: 'divider', dataKey: 'divider', variant: 'vertical', minW: 2 },
            // 右: ACTIVITY + INTERACTION
            {
              type: 'col',
              flex: 1,
              gap: 8,
              children: [
                { type: 'block', componentKey: 'activity', dataKey: 'activity',     variant: 'v2',     minH: 12, label: 'ACTIVITY' },
                { type: 'block', componentKey: 'mark-list', dataKey: 'interactions', variant: 'default', flex: 1, label: 'INTERACTION', contentFontScale: 0.9 },
              ],
            },
          ],
        },
      ],
    },
  },
}
