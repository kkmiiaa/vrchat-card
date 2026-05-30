import type { TemplateDefinition } from '@/blocks/types'
import { CARD_LANDSCAPE_WIDTH, CARD_LANDSCAPE_HEIGHT, CARD_PORTRAIT_WIDTH } from '@/lib/cardDimensions'

/**
 * V1 テンプレート定義。DB の保存値と一致させる。
 * blockPool でブロックを一元定義し、card / web レイアウトは ref ノードで参照する。
 * variant / bgVariant はレイアウト固有のため ref 側で指定する。
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

  blockPool: {
    profileImage: { componentKey: 'profileImage', dataKey: 'profileImage' },
    name:         { componentKey: 'text',         dataKey: 'name',         label: '名前',              subLabel: 'name',                 blockConfig: { multiline: false } },
    gender:       { componentKey: 'gender',        dataKey: 'gender',       label: '性別',              subLabel: 'gender' },
    language:     { componentKey: 'language',      dataKey: 'language',     label: '言語',              subLabel: 'languages spoken',     variant: 'slash' },
    micOnRate:    { componentKey: 'gauge',         dataKey: 'micOnRate',    label: 'マイクON率',        subLabel: 'microphone usage',     blockConfig: { unit: '%' } },
    status:       { componentKey: 'color-status',  dataKey: 'status',       label: 'ステータス',        subLabel: 'status description',
      blockConfig: { fields: [
        { key: 'blue',   label: '青', color: '#60a5fa' },
        { key: 'green',  label: '緑', color: '#4ade80' },
        { key: 'yellow', label: '黃', color: '#facc15' },
        { key: 'red',    label: '赤', color: '#f87171' },
      ]},
    },
    playEnv: { componentKey: 'multi-select', dataKey: 'playEnv', label: '環境', subLabel: 'environment', variant: 'slash',
      blockConfig: { options: [
        { value: 'pcvr',    label: 'PCVR',    icon: 'TbBadgeVr' },
        { value: 'quest',   label: 'Quest',   icon: 'TbDeviceGamepad2' },
        { value: 'desktop', label: 'Desktop', icon: 'TbDeviceDesktop' },
      ]},
    },
    vrchat:   { componentKey: 'simple-sns', dataKey: 'vrchat',   blockConfig: { platform: 'vrchat' } },
    x:        { componentKey: 'simple-sns', dataKey: 'x',        blockConfig: { platform: 'x' } },
    discord:  { componentKey: 'simple-sns', dataKey: 'discord',  blockConfig: { platform: 'discord' } },
    friendPolicy: { componentKey: 'multi-select', dataKey: 'friendPolicy', label: 'フレンド申請', subLabel: 'friend request policy', variant: 'slash',
      blockConfig: { options: [
        { value: 'frPolicyAnyone',             label: 'だれでもOK' },
        { value: 'frPolicyIfInterested',       label: '気になったら許可' },
        { value: 'frPolicyMutualsOnX',         label: 'X相互は申請OK' },
        { value: 'frPolicyAfterGettingToKnow', label: '仲良くなってから許可' },
        { value: 'frPolicyNo',                 label: '送らないでください' },
      ]},
    },
    'mark-grid1': { componentKey: 'mark-grid', dataKey: 'mark-grid1', label: 'OKなこと・NGなこと', subLabel: 'ok & ng',
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
    selfIntro:    { componentKey: 'text',     dataKey: 'selfIntro',    label: '自己紹介',          subLabel: 'about me' },
    gallery:      { componentKey: 'gallery',  dataKey: 'gallery' },
    divider:      { componentKey: 'divider',  dataKey: 'divider' },
    interactions: { componentKey: 'mark-list',dataKey: 'interactions', label: 'OKなこと・NGなこと', subLabel: 'my boundaries', variant: 'grid' },
  },

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
            { type: 'ref', blockId: 'profileImage', minH: 24 },
            { type: 'ref', blockId: 'language',     minH: 3,  contentFontScale: 0.9, bgVariant: 'default' },
            { type: 'ref', blockId: 'micOnRate',    minH: 3,  contentFontScale: 0.9, bgVariant: 'default' },
            { type: 'ref', blockId: 'status',       minH: 12, bgVariant: 'default',  subLabel: 'status description' },
          ],
        },
        {
          type: 'col',
          minW: 35,
          gap: 2,
          justify: 'space-between',
          children: [
            { type: 'ref', blockId: 'name', minH: 5, contentFontScale: 1.4, bgVariant: 'default' },
            {
              type: 'row',
              minH: 6,
              gap: 2,
              children: [
                { type: 'ref', blockId: 'gender',  minW: 12, minH: 2, contentFontScale: 0.9, bgVariant: 'default' },
                { type: 'ref', blockId: 'playEnv', flex: 1,                                  bgVariant: 'default' },
              ],
            },
            {
              type: 'col',
              gap: 1,
              justify: 'center',
              children: [
                { type: 'ref', blockId: 'vrchat',  minH: 3, contentFontScale: 1 },
                { type: 'ref', blockId: 'x',       minH: 3, contentFontScale: 1, bgVariant: 'default' },
                { type: 'ref', blockId: 'discord', minH: 3, contentFontScale: 1, bgVariant: 'default' },
              ],
            },
            { type: 'ref', blockId: 'friendPolicy', minH: 4,  contentFontScale: 1,   bgVariant: 'default' },
            { type: 'ref', blockId: 'mark-grid1',   minH: 15, contentFontScale: 0.9 },
          ],
        },
        {
          type: 'col',
          flex: 1,
          gap: 1,
          children: [
            { type: 'ref', blockId: 'selfIntro', flex: 1, contentFontScale: 0.75, bgVariant: 'default' },
            { type: 'ref', blockId: 'gallery',   minH: 12,                        bgVariant: 'default' },
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
            { type: 'ref', blockId: 'profileImage', minW: 27 },
            {
              type: 'col',
              flex: 1,
              gap: 2,
              justify: 'space-between',
              children: [
                { type: 'ref', blockId: 'name', minH: 6, contentFontScale: 1.3, bgVariant: 'default' },
                {
                  type: 'row',
                  gap: 2,
                  children: [
                    { type: 'ref', blockId: 'gender',  flex: 1, minH: 3, contentFontScale: 0.8, bgVariant: 'default' },
                    { type: 'ref', blockId: 'playEnv', flex: 2, minH: 3,                        bgVariant: 'default', subLabel: 'env' },
                  ],
                },
                {
                  type: 'col',
                  gap: 1,
                  children: [
                    { type: 'ref', blockId: 'vrchat',  minH: 3.5 },
                    { type: 'ref', blockId: 'x',       minH: 3.5 },
                    { type: 'ref', blockId: 'discord', minH: 3.5 },
                  ],
                },
              ],
            },
          ],
        },
        { type: 'ref', blockId: 'divider' },
        {
          type: 'row',
          children: [
            {
              type: 'col',
              flex: 2,
              children: [
                { type: 'ref', blockId: 'language',     minH: 4,  bgVariant: 'default' },
                { type: 'ref', blockId: 'micOnRate',    minH: 4,  bgVariant: 'default', variant: 'gradient' },
                { type: 'ref', blockId: 'status',       minH: 15, bgVariant: 'default', subLabel: 'status' },
                { type: 'ref', blockId: 'friendPolicy', minH: 4,  bgVariant: 'default', contentFontScale: 0.9 },
                { type: 'ref', blockId: 'interactions', minH: 12 },
              ],
            },
            { type: 'ref', blockId: 'divider', minW: 2, variant: 'vertical' },
            {
              type: 'col',
              flex: 3,
              children: [
                { type: 'ref', blockId: 'selfIntro', flex: 1, minH: 10, contentFontScale: 0.7, bgVariant: 'default' },
                { type: 'ref', blockId: 'gallery',   minH: 9 },
              ],
            },
          ],
        },
      ],
    },
  },
}
