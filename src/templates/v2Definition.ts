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
    grid: { cellSize: 10, gap: 4 },
    layout: {
      type: 'row',
      flex: 1,
      gap: 6,
      children: [
        {
          type: 'col',
          minW: 22,
          gap: 2,
          justify: 'center',
          children: [
            { type: 'block', componentKey: 'profileImage', dataKey: 'profileImage', variant: 'default', minH: 22, glass: true, glassRadius: 16 },
            {
              type: 'col',
              gap: 1,
              children: [
                {
                  type: 'block', componentKey: 'sns-with-friend-policy', dataKey: 'sns-with-friend-policy1', variant: 'glass', minH: 5, bgVariant: 'glass',
                  blockConfig: {
                    platform: 'vrchat',
                    policies: [
                      { value: 'frPolicyAnyone',             label: 'だれでもOK',         icon: 'TbHeart' },
                      { value: 'frPolicyIfInterested',       label: '気になったら許可',     icon: 'TbStar' },
                      { value: 'frPolicyMutualsOnX',         label: 'X相互は申請OK',       icon: 'TbBrandX' },
                      { value: 'frPolicyAfterGettingToKnow', label: '仲良くなってから許可', icon: 'TbSparkles' },
                      { value: 'frPolicyNo',                 label: '送らないでください',   icon: 'TbShield' },
                    ],
                  },
                },
                { type: 'block', componentKey: 'simple-sns', dataKey: 'x',       variant: 'glass', minH: 3, blockConfig: { platform: 'x' } },
                { type: 'block', componentKey: 'simple-sns', dataKey: 'discord', variant: 'glass', minH: 3, blockConfig: { platform: 'discord' } },
              ],
            },
            { type: 'block', componentKey: 'gallery', dataKey: 'gallery', variant: 'glass', minH: 7 },
          ],
        },
        { type: 'block', componentKey: 'divider', dataKey: 'divider', variant: 'vertical' },
        {
          type: 'col',
          flex: 1,
          gap: 2,
          children: [
            {
              type: 'row',
              gap: 2,
              justify: 'space-between',
              minH: 3,
              children: [
                { type: 'block', componentKey: 'text',   dataKey: 'name',      variant: 'default', flex: 1, alignSelf: 'center', contentFontScale: 1.5 },
                {
                  type: 'block', componentKey: 'select', dataKey: 'trustRank', variant: 'default', alignSelf: 'center', minH: 2.2,
                  blockConfig: {
                    options: [
                      { value: 'visitor',     label: 'Visitor',      icon: 'TbShield' },
                      { value: 'newuser',     label: 'New User',     icon: 'TbShield', color: '#3b82f6' },
                      { value: 'user',        label: 'User',         icon: 'TbShield', color: '#22c55e' },
                      { value: 'knownuser',   label: 'Known User',   icon: 'TbShield', color: '#f59e0b' },
                      { value: 'trusteduser', label: 'Trusted User', icon: 'TbShield', color: '#8b5cf6' },
                    ],
                  },
                },
              ],
            },
            {
              type: 'col',
              gap: 1,
              children: [
                {
                  type: 'row',
                  gap: 1,
                  label: 'PROFILE',
                  minH: 2.3,
                  children: [
                    { type: 'block', componentKey: 'gender',       dataKey: 'gender',   variant: 'default', bgVariant: 'glass', minH: 2.3 },
                    { type: 'block', componentKey: 'age',          dataKey: 'age',      variant: 'default', bgVariant: 'glass', minH: 2.3, label: '年齢',  labelInset: true, labelInsetDir: 'row', contentFontScale: 0.9, labelColor: '#9ca3af' },
                    {
                      type: 'block', componentKey: 'multi-select', dataKey: 'playEnv', variant: 'icon-slash', bgVariant: 'glass', minH: 2.3, label: '環境',  labelInset: true, labelInsetDir: 'row', contentFontScale: 0.9, labelColor: '#9ca3af',
                      blockConfig: {
                        options: [
                          { value: 'pcvr',    label: 'PCVR',    color: '#6b7280', icon: 'TbBadgeVr' },
                          { value: 'quest',   label: 'Quest',   color: '#6b7280', icon: 'TbDeviceGamepad2' },
                          { value: 'desktop', label: 'Desktop', color: '#6b7280', icon: 'TbDeviceDesktop' },
                        ],
                      },
                    },
                    { type: 'block', componentKey: 'language',     dataKey: 'language', variant: 'slash',   bgVariant: 'glass', minH: 2.3, label: '言語',  labelInset: true, labelInsetDir: 'row', contentFontScale: 0.9, labelColor: '#9ca3af' },
                  ],
                },
                {
                  type: 'block', componentKey: 'gauge', dataKey: 'gauge1', variant: 'default', bgVariant: 'glass', minW: 18, minH: 2.3,
                  label: 'マイクON率', labelInset: true, labelInsetDir: 'row', contentFontScale: 0.9, labelColor: '#9ca3af',
                  blockConfig: { unit: '%' },
                },
              ],
            },
            { type: 'block', componentKey: 'divider', dataKey: 'divider', variant: 'default', minH: 0.5 },
            { type: 'block', componentKey: 'text', dataKey: 'selfIntro', variant: 'default', flex: 1, label: 'ABOUT', contentFontScale: 0.8, glass: true },
            {
              type: 'row',
              gap: 3,
              minH: 11,
              children: [
                {
                  type: 'block', componentKey: 'color-status', dataKey: 'status', variant: 'cards', flex: 1, label: 'STATUS', contentFontScale: 0.9, minH: 8,
                  blockConfig: {
                    fields: [
                      { key: 'blue',   label: '青', color: '#60a5fa' },
                      { key: 'green',  label: '緑', color: '#4ade80' },
                      { key: 'yellow', label: '黄', color: '#facc15' },
                      { key: 'red',    label: '赤', color: '#f87171' },
                    ],
                  },
                },
                { type: 'block', componentKey: 'activity', dataKey: 'activity', variant: 'v2', flex: 1, label: 'ACTIVITY' },
              ],
            },
            {
              type: 'block', componentKey: 'mark-list', dataKey: 'interactions', variant: 'default', label: 'INTERACTION', contentFontScale: 0.9, minH: 1.8,
              blockConfig: {
                items: [{ label: '触る' }],
                marks: [{ symbol: '◎', color: '#22c55e', bg: '#f9fafb' }],
              },
            },
          ],
        },
      ],
    },
  },

  portrait: {
    cardWidth:  PORTRAIT_WIDTH,
    cardHeight: PORTRAIT_HEIGHT,
    grid: { cellSize: 10, gap: 4 },
    defaultLabelFontScale: 1.8,
    defaultContentFontScale: 1.6,
    defaultPaddingScale: 1.8,
    layout: {
      type: 'col',
      flex: 1,
      gap: 3,
      children: [
        // 上部: プロフィール画像 + 名前/タグ/SNS
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
                {
                  type: 'row',
                  gap: 2,
                  children: [
                    { type: 'block', componentKey: 'text', dataKey: 'name',      variant: 'default', flex: 1 },
                    { type: 'block', componentKey: 'select', dataKey: 'trustRank', variant: 'default', alignSelf: 'center' },
                  ],
                },
                {
                  type: 'row',
                  gap: 1.5,
                  children: [
                    { type: 'block', componentKey: 'gender', dataKey: 'gender', variant: 'default', flex: 1 },
                    { type: 'block', componentKey: 'age', dataKey: 'age',       variant: 'default', flex: 1 },
                  ],
                },
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
              gap: 2,
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
              gap: 2,
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
