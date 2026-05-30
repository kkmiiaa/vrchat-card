import type { TemplateDefinition } from '@/blocks/types'
import { CARD_LANDSCAPE_WIDTH, CARD_LANDSCAPE_HEIGHT, CARD_PORTRAIT_WIDTH } from '@/lib/cardDimensions'

/**
 * V1 テンプレート定義。
 * card / web レイアウトは DB の保存値と一致させ、「定義に戻す」で現状に戻れるようにする。
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

  card: {
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
            { type: 'block', componentKey: 'language',     dataKey: 'language',     variant: 'slash',   bgVariant: 'default', label: '言語',       subLabel: 'languages spoken',  minH: 3,  contentFontScale: 0.9 },
            { type: 'block', componentKey: 'gauge',        dataKey: 'micOnRate',    variant: 'default', bgVariant: 'default', label: 'マイクON率', subLabel: 'microphone usage',  minH: 3,  contentFontScale: 0.9, blockConfig: { unit: '%' } },
            { type: 'block', componentKey: 'color-status', dataKey: 'status',       variant: 'default', bgVariant: 'default', label: 'ステータス', subLabel: 'status description', minH: 12,
              blockConfig: { fields: [
                { key: 'blue',   label: '青', color: '#60a5fa' },
                { key: 'green',  label: '緑', color: '#4ade80' },
                { key: 'yellow', label: '黃', color: '#facc15' },
                { key: 'red',    label: '赤', color: '#f87171' },
              ]},
            },
          ],
        },
        {
          type: 'col',
          minW: 35,
          gap: 2,
          justify: 'space-between',
          children: [
            { type: 'block', componentKey: 'text', dataKey: 'name', variant: 'default', bgVariant: 'default', label: '名前', subLabel: 'name', minH: 5, contentFontScale: 1.4, blockConfig: { multiline: false } },
            {
              type: 'row',
              minH: 6,
              gap: 2,
              children: [
                { type: 'block', componentKey: 'gender',       dataKey: 'gender',  variant: 'default', bgVariant: 'default', label: '性別', subLabel: 'gender',      minW: 12, minH: 2, contentFontScale: 0.9 },
                { type: 'block', componentKey: 'multi-select', dataKey: 'playEnv', variant: 'slash',   bgVariant: 'default', label: '環境', subLabel: 'environment', flex: 1,
                  blockConfig: { options: [
                    { value: 'pcvr',    label: 'PCVR',    icon: 'TbBadgeVr' },
                    { value: 'quest',   label: 'Quest',   icon: 'TbDeviceGamepad2' },
                    { value: 'desktop', label: 'Desktop', icon: 'TbDeviceDesktop' },
                  ]},
                },
              ],
            },
            {
              type: 'col',
              gap: 1,
              justify: 'center',
              children: [
                { type: 'block', componentKey: 'simple-sns', dataKey: 'vrchat',   variant: 'default',             blockConfig: { platform: 'vrchat' },   minH: 3, contentFontScale: 1 },
                { type: 'block', componentKey: 'simple-sns', dataKey: 'x',       variant: 'default', bgVariant: 'default', blockConfig: { platform: 'x' },       minH: 3, contentFontScale: 1 },
                { type: 'block', componentKey: 'simple-sns', dataKey: 'discord', variant: 'default', bgVariant: 'default', blockConfig: { platform: 'discord' }, minH: 3, contentFontScale: 1 },
              ],
            },
            { type: 'block', componentKey: 'multi-select', dataKey: 'friendPolicy', variant: 'slash', bgVariant: 'default', label: 'フレンド申請', subLabel: 'friend request policy', minH: 4, contentFontScale: 1,
              blockConfig: { options: [
                { value: 'frPolicyAnyone',             label: 'だれでもOK' },
                { value: 'frPolicyIfInterested',       label: '気になったら許可' },
                { value: 'frPolicyMutualsOnX',         label: 'X相互は申請OK' },
                { value: 'frPolicyAfterGettingToKnow', label: '仲良くなってから許可' },
                { value: 'frPolicyNo',                 label: '送らないでください' },
              ]},
            },
            { type: 'block', componentKey: 'mark-grid', dataKey: 'mark-grid1', variant: 'default', label: 'OKなこと・NGなこと', subLabel: 'ok & ng', minH: 15, contentFontScale: 0.9,
              blockConfig: {
                items: [{ label: '触る' }, { label: '近距離' }, { label: 'お砂糖' }, { label: '武器' }, { label: '暴言/暴力' }, { label: '下ネタ' }],
                marks: [
                  { symbol: '◎', color: '#22c55e', bg: '#f9fafb' },
                  { symbol: '◯', color: '#22c55e', bg: '#f9fafb' },
                  { symbol: '△', color: '#f59e0b', bg: '#f9fafb' },
                  { symbol: '✕', color: '#ef4444', bg: '#f9fafb' },
                ],
                cols: 3, rows: 3,
              },
            },
          ],
        },
        {
          type: 'col',
          flex: 1,
          gap: 1,
          children: [
            { type: 'block', componentKey: 'text',    dataKey: 'selfIntro', variant: 'default', bgVariant: 'default', label: '自己紹介', subLabel: 'about me', flex: 1, contentFontScale: 0.75 },
            { type: 'block', componentKey: 'gallery', dataKey: 'gallery',   variant: 'default', bgVariant: 'default', minH: 12 },
          ],
        },
      ],
    },
  },

  web: {
    cardWidth:  CARD_PORTRAIT_WIDTH,
    autoHeight: true,
    grid: { cellSize: 8, gap: 4 },
    defaultLabelFontScale: 1.8,
    defaultContentFontScale: 1.6,
    defaultPaddingScale: 1.8,
    layout: {
      type: 'col',
      gap: 3,
      children: [
        {
          type: 'row',
          minH: 20,
          gap: 3,
          children: [
            { type: 'block', componentKey: 'profileImage', dataKey: 'profileImage', variant: 'default', minW: 27 },
            {
              type: 'col',
              flex: 1,
              gap: 2,
              justify: 'space-between',
              children: [
                { type: 'block', componentKey: 'text', dataKey: 'name', variant: 'default', bgVariant: 'default', label: '名前', subLabel: 'name', minH: 6, contentFontScale: 1.3 },
                {
                  type: 'row',
                  gap: 2,
                  children: [
                    { type: 'block', componentKey: 'gender',       dataKey: 'gender',  variant: 'default', bgVariant: 'default', label: '性別', subLabel: 'gender', flex: 1, minH: 3, contentFontScale: 0.8 },
                    { type: 'block', componentKey: 'multi-select', dataKey: 'playEnv', variant: 'slash',   bgVariant: 'default', label: '環境', subLabel: 'env',    flex: 2, minH: 3 },
                  ],
                },
                {
                  type: 'col',
                  gap: 1,
                  children: [
                    { type: 'block', componentKey: 'simple-sns', dataKey: 'vrchat',   variant: 'default', blockConfig: { platform: 'vrchat' },   minH: 3.5 },
                    { type: 'block', componentKey: 'simple-sns', dataKey: 'x',       variant: 'default', blockConfig: { platform: 'x' },       minH: 3.5 },
                    { type: 'block', componentKey: 'simple-sns', dataKey: 'discord', variant: 'default', blockConfig: { platform: 'discord' }, minH: 3.5 },
                  ],
                },
              ],
            },
          ],
        },
        { type: 'block', componentKey: 'divider', dataKey: 'divider', variant: 'default' },
        {
          type: 'row',
          children: [
            {
              type: 'col',
              flex: 2,
              children: [
                { type: 'block', componentKey: 'language',     dataKey: 'language',     variant: 'slash',    bgVariant: 'default', label: '言語',              subLabel: 'language spoken',       minH: 4 },
                { type: 'block', componentKey: 'gauge',        dataKey: 'micOnRate',    variant: 'gradient', bgVariant: 'default', label: 'マイクON率',        subLabel: 'microphone usage',      minH: 4, blockConfig: { unit: '%' } },
                { type: 'block', componentKey: 'color-status', dataKey: 'status',       variant: 'default',  bgVariant: 'default', label: 'ステータス',        subLabel: 'status',                minH: 15,
                  blockConfig: { fields: [
                    { key: 'blue',   label: '青', color: '#60a5fa' },
                    { key: 'green',  label: '緑', color: '#4ade80' },
                    { key: 'yellow', label: '黃', color: '#facc15' },
                    { key: 'red',    label: '赤', color: '#f87171' },
                  ]},
                },
                { type: 'block', componentKey: 'multi-select', dataKey: 'friendPolicy', variant: 'slash',    bgVariant: 'default', label: 'フレンド申請',      subLabel: 'friend request policy', minH: 4, contentFontScale: 0.9 },
                { type: 'block', componentKey: 'mark-list',    dataKey: 'interactions', variant: 'grid',                          label: 'OKなこと・NGなこと', subLabel: 'my boundaries',         minH: 12 },
              ],
            },
            { type: 'block', componentKey: 'divider', dataKey: 'divider', variant: 'vertical', minW: 2 },
            {
              type: 'col',
              flex: 3,
              children: [
                { type: 'block', componentKey: 'text',    dataKey: 'selfIntro', variant: 'default', bgVariant: 'default', label: '自己紹介', subLabel: 'about me', flex: 1, minH: 10, contentFontScale: 0.7 },
                { type: 'block', componentKey: 'gallery', dataKey: 'gallery',   variant: 'default', minH: 9 },
              ],
            },
          ],
        },
      ],
    },
  },
}
