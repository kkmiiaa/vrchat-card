import type { TemplateDefinition } from '@/blocks/types'
import { CARD_LANDSCAPE_WIDTH, CARD_LANDSCAPE_HEIGHT, CARD_PORTRAIT_WIDTH } from '@/lib/cardDimensions'

/**
 * CardV1 の実際のレイアウトに合わせた TemplateDefinition
 *
 * CardV1 card 実寸:
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

  blockPool: {
    // ── 共通（card・web 両方で使用）────────────────────────────────────
    // variant / bgVariant はレイアウト側の ref で指定する
    profileImage: { componentKey: 'profileImage', dataKey: 'profileImage' },
    name:         { componentKey: 'text',         dataKey: 'name',         label: '名前',         subLabel: 'name',               blockConfig: { multiline: false } },
    gender:       { componentKey: 'gender',        dataKey: 'gender',       label: '性別',         subLabel: 'gender' },
    language:     { componentKey: 'language',      dataKey: 'language',     label: '言語',         subLabel: 'languages spoken' },
    vrchat:       { componentKey: 'simple-sns',    dataKey: 'vrchat',                              blockConfig: { platform: 'vrchat' } },
    x:            { componentKey: 'simple-sns',    dataKey: 'x',                                   blockConfig: { platform: 'x' } },
    discord:      { componentKey: 'simple-sns',    dataKey: 'discord',                             blockConfig: { platform: 'discord' } },
    selfIntro:    { componentKey: 'text',          dataKey: 'selfIntro',    label: '自己紹介',     subLabel: 'about me' },
    gallery:      { componentKey: 'gallery',       dataKey: 'gallery' },
    divider:      { componentKey: 'divider',       dataKey: 'divider' },
    dividerV:     { componentKey: 'divider',       dataKey: 'divider' },

    // ── card / web 共用（表示スタイルは ref 側で variant/bgVariant を指定）──
    micOnRate: {
      componentKey: 'gauge',        dataKey: 'micOnRate',    label: 'マイクON率', subLabel: 'microphone usage',
      blockConfig: { unit: '%' },
    },
    playEnv: {
      componentKey: 'multi-select', dataKey: 'playEnv',      label: '環境',       subLabel: 'environment',
      blockConfig: { options: [
        { value: 'pcvr',    label: 'PCVR',    icon: 'TbBadgeVr' },
        { value: 'quest',   label: 'Quest',   icon: 'TbDeviceGamepad2' },
        { value: 'desktop', label: 'Desktop', icon: 'TbDeviceDesktop' },
      ]},
    },
    friendPolicy: {
      componentKey: 'multi-select', dataKey: 'friendPolicy', label: 'フレンド申請', subLabel: 'friend request policy',
      blockConfig: { options: [
        { value: 'frPolicyAnyone',             label: 'だれでもOK' },
        { value: 'frPolicyIfInterested',       label: '気になったら許可' },
        { value: 'frPolicyMutualsOnX',         label: 'X相互は申請OK' },
        { value: 'frPolicyAfterGettingToKnow', label: '仲良くなってから許可' },
        { value: 'frPolicyNo',                 label: '送らないでください' },
      ]},
    },
    status: {
      componentKey: 'color-status', dataKey: 'status',       label: 'ステータス', subLabel: 'status description',
      blockConfig: { fields: [
        { key: 'blue',   label: '青', color: '#60a5fa' },
        { key: 'green',  label: '緑', color: '#4ade80' },
        { key: 'yellow', label: '黃', color: '#facc15' },
        { key: 'red',    label: '赤', color: '#f87171' },
      ]},
    },
    markGrid: {
      componentKey: 'mark-grid',    dataKey: 'mark-grid1',   label: 'OKなこと・NGなこと', subLabel: 'ok & ng',
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
    interactions: {
      componentKey: 'mark-list',    dataKey: 'interactions', label: 'OKなこと・NGなこと', subLabel: 'my boundaries',
    },
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
            { type: 'ref', blockId: 'language',    minH: 3, contentFontScale: 0.9, variant: 'slash',   bgVariant: 'default' },
            { type: 'ref', blockId: 'micOnRate',    minH: 3, contentFontScale: 0.9,                    bgVariant: 'default' },
            { type: 'ref', blockId: 'status',       minH: 12,                                          bgVariant: 'default', subLabel: 'status description' },
          ],
        },
        {
          type: 'col',
          minW: 35,
          gap: 2,
          justify: 'space-between',
          children: [
            { type: 'ref', blockId: 'name',         minH: 5, contentFontScale: 1.4,                    bgVariant: 'default' },
            {
              type: 'row',
              minH: 6,
              gap: 2,
              children: [
                { type: 'ref', blockId: 'gender',   minW: 12, minH: 2, contentFontScale: 0.9,          bgVariant: 'default' },
                { type: 'ref', blockId: 'playEnv',  flex: 1,                        variant: 'slash',  bgVariant: 'default' },
              ],
            },
            {
              type: 'col',
              gap: 1,
              justify: 'center',
              children: [
                { type: 'ref', blockId: 'vrchat',   minH: 3, contentFontScale: 1 },
                { type: 'ref', blockId: 'x',        minH: 3, contentFontScale: 1 },
                { type: 'ref', blockId: 'discord',  minH: 3, contentFontScale: 1 },
              ],
            },
            { type: 'ref', blockId: 'friendPolicy', minH: 4, contentFontScale: 1,  variant: 'slash',  bgVariant: 'default' },
            { type: 'ref', blockId: 'markGrid',     minH: 15, contentFontScale: 0.9 },
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
            { type: 'ref', blockId: 'profileImage', minW: 20 },
            {
              type: 'col',
              flex: 1,
              gap: 2,
              justify: 'space-between',
              children: [
                { type: 'ref', blockId: 'name',    minH: 4, contentFontScale: 0.9 },
                {
                  type: 'row',
                  minH: 4,
                  gap: 2,
                  children: [
                    { type: 'ref', blockId: 'gender',  flex: 1, contentFontScale: 0.8 },
                    { type: 'ref', blockId: 'playEnv', flex: 2, variant: 'slash' },
                  ],
                },
                {
                  type: 'col',
                  gap: 1,
                  children: [
                    { type: 'ref', blockId: 'vrchat' },
                    { type: 'ref', blockId: 'x' },
                    { type: 'ref', blockId: 'discord' },
                  ],
                },
              ],
            },
          ],
        },
        { type: 'ref', blockId: 'divider',   variant: 'horizontal' },
        {
          type: 'row',
          children: [
            {
              type: 'col',
              flex: 2,
              justify: 'space-between',
              children: [
                { type: 'ref', blockId: 'language',     minH: 3, variant: 'slash' },
                { type: 'ref', blockId: 'micOnRate',    minH: 3, variant: 'gradient' },
                { type: 'ref', blockId: 'status',       minH: 11 },
                { type: 'ref', blockId: 'friendPolicy', minH: 5, contentFontScale: 0.9 },
                { type: 'ref', blockId: 'interactions', minH: 12, variant: 'grid' },
              ],
            },
            { type: 'ref', blockId: 'dividerV', minW: 2, variant: 'vertical' },
            {
              type: 'col',
              flex: 3,
              children: [
                { type: 'ref', blockId: 'selfIntro', minH: 10, contentFontScale: 0.7 },
                { type: 'ref', blockId: 'gallery',   minH: 9 },
              ],
            },
          ],
        },
      ],
    },
  },
}
