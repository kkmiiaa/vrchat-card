// @ts-nocheck
import type { TemplateDefinition } from '@/blocks/types'
import { CARD_LANDSCAPE_WIDTH as LANDSCAPE_WIDTH, CARD_LANDSCAPE_HEIGHT as LANDSCAPE_HEIGHT, CARD_PORTRAIT_WIDTH as PORTRAIT_WIDTH, CARD_PORTRAIT_HEIGHT as PORTRAIT_HEIGHT } from '@/lib/cardDimensions'

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

  // ─── ブロック定義プール ─────────────────────────────────────────────────────
  // componentKey / dataKey / blockConfig など「何を表示するか」を一度だけ定義。
  // レイアウト内の ref ノードから blockId で参照し、サイズ・variant を上書きできる。
  blockPool: {
    profileImage: {
      componentKey: 'profileImage',
      dataKey: 'profileImage',
      variant: 'glass',
    },
    name: {
      componentKey: 'text',
      dataKey: 'name',
      variant: 'simple',
      blockConfig: { multiline: false, noPadding: true },
    },
    trustRank: {
      componentKey: 'select',
      dataKey: 'trustRank',
      variant: 'simple',
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
    gender: {
      componentKey: 'gender',
      dataKey: 'gender',
      variant: 'simple',
    },
    age: {
      componentKey: 'age',
      dataKey: 'age',
      variant: 'simple',
      label: '年齢',
    },
    playEnv: {
      componentKey: 'multi-select',
      dataKey: 'playEnv',
      variant: 'icon-slash',
      label: '環境',
      bgVariant: 'glass',
      labelInset: true,
      labelInsetDir: 'row',
      contentFontScale: 0.9,
      labelColor: '#9ca3af',
      blockConfig: {
        options: [
          { value: 'pcvr',    label: 'PCVR',    color: '#6b7280', icon: 'TbBadgeVr' },
          { value: 'quest',   label: 'Quest',   color: '#6b7280', icon: 'TbDeviceGamepad2' },
          { value: 'desktop', label: 'Desktop', color: '#6b7280', icon: 'TbDeviceDesktop' },
        ],
      },
    },
    language: {
      componentKey: 'language',
      dataKey: 'language',
      variant: 'slash',
      label: '言語',
      bgVariant: 'glass',
      labelInset: true,
      labelInsetDir: 'row',
      contentFontScale: 0.9,
      labelColor: '#9ca3af',
    },
    gauge1: {
      componentKey: 'gauge',
      dataKey: 'gauge1',
      variant: 'simple',
      label: 'マイクON率',
      bgVariant: 'glass',
      labelInset: true,
      labelInsetDir: 'row',
      contentFontScale: 0.9,
      labelColor: '#9ca3af',
      blockConfig: { unit: '%' },
    },
    selfIntro: {
      componentKey: 'text',
      dataKey: 'selfIntro',
      variant: 'simple',
      label: 'ABOUT',
    },
    status: {
      componentKey: 'color-status',
      dataKey: 'status',
      label: 'STATUS',
      blockConfig: {
        fields: [
          { key: 'blue',   label: '青', color: '#60a5fa' },
          { key: 'green',  label: '緑', color: '#4ade80' },
          { key: 'yellow', label: '黄', color: '#facc15' },
          { key: 'red',    label: '赤', color: '#f87171' },
        ],
      },
    },
    activity: {
      componentKey: 'activity',
      dataKey: 'activity',
      variant: 'v2',
      label: 'ACTIVITY',
    },
    interactions: {
      componentKey: 'mark-list',
      dataKey: 'interactions',
      variant: 'simple',
      label: 'INTERACTION',
      contentFontScale: 0.9,
      blockConfig: {
        items: [{ label: '触る' }],
        marks: [{ symbol: '◎', color: '#22c55e', bg: '#f9fafb' }],
      },
    },
    snsWithFriendPolicy: {
      componentKey: 'sns-with-friend-policy',
      dataKey: 'sns-with-friend-policy1',
      variant: 'glass',
      bgVariant: 'glass',
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
    snsX: {
      componentKey: 'simple-sns',
      dataKey: 'x',
      variant: 'glass',
      blockConfig: { platform: 'x' },
    },
    snsDiscord: {
      componentKey: 'simple-sns',
      dataKey: 'discord',
      variant: 'glass',
      blockConfig: { platform: 'discord' },
    },
    gallery: {
      componentKey: 'gallery',
      dataKey: 'gallery',
      variant: 'glass',
    },
  },

  // ─── カード表示レイアウト ────────────────────────────────────────────────────
  card: {
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
            { type: 'ref', blockId: 'profileImage', minH: 22 },
            {
              type: 'col',
              gap: 1,
              children: [
                { type: 'ref', blockId: 'snsWithFriendPolicy', minH: 5 },
                { type: 'ref', blockId: 'snsX',       minH: 3 },
                { type: 'ref', blockId: 'snsDiscord', minH: 3 },
              ],
            },
            { type: 'ref', blockId: 'gallery', minH: 7 },
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
                { type: 'ref', blockId: 'name',      flex: 1, alignSelf: 'center', contentFontScale: 1.5 },
                { type: 'ref', blockId: 'trustRank', alignSelf: 'center', minH: 2.2 },
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
                    { type: 'ref', blockId: 'gender',   bgVariant: 'glass', minH: 2.3 },
                    { type: 'ref', blockId: 'age',      bgVariant: 'glass', minH: 2.3, labelInset: true, labelInsetDir: 'row', contentFontScale: 0.9, labelColor: '#9ca3af' },
                    { type: 'ref', blockId: 'playEnv',  minH: 2.3 },
                    { type: 'ref', blockId: 'language', minH: 2.3 },
                  ],
                },
                { type: 'ref', blockId: 'gauge1', minW: 18, minH: 2.3 },
              ],
            },
            { type: 'block', componentKey: 'divider', dataKey: 'divider', variant: 'simple', minH: 0.5 },
            { type: 'ref', blockId: 'selfIntro', flex: 1, bgVariant: 'glass', contentFontScale: 0.8 },
            {
              type: 'row',
              gap: 3,
              minH: 11,
              children: [
                { type: 'ref', blockId: 'status',       variant: 'cards', flex: 1, contentFontScale: 0.9, minH: 8 },
                { type: 'ref', blockId: 'activity',     flex: 1 },
              ],
            },
            { type: 'ref', blockId: 'interactions', minH: 1.8 },
          ],
        },
      ],
    },
  },

  // ─── Web表示レイアウト（流動高さ・スクロール対応）────────────────────────────
  web: {
    cardWidth:  PORTRAIT_WIDTH,
    autoHeight: true,
    grid: { cellSize: 10, gap: 4 },
    defaultLabelFontScale: 1.8,
    defaultContentFontScale: 1.6,
    defaultPaddingScale: 1.8,
    layout: {
      type: 'col',
      gap: 3,
      children: [
        // プロフィールヘッダー
        {
          type: 'row',
          gap: 3,
          alignItems: 'center',
          children: [
            { type: 'ref', blockId: 'profileImage', minW: 18 },
            {
              type: 'col',
              flex: 1,
              gap: 2,
              children: [
                {
                  type: 'row',
                  gap: 2,
                  alignItems: 'center',
                  children: [
                    { type: 'ref', blockId: 'name',      flex: 1 },
                    { type: 'ref', blockId: 'trustRank', alignSelf: 'center' },
                  ],
                },
                {
                  type: 'row',
                  gap: 1.5,
                  children: [
                    { type: 'ref', blockId: 'gender', flex: 1 },
                    { type: 'ref', blockId: 'age',    flex: 1 },
                  ],
                },
              ],
            },
          ],
        },
        { type: 'block', componentKey: 'divider', dataKey: 'divider', variant: 'simple' },
        // 自己紹介
        { type: 'ref', blockId: 'selfIntro', minH: 8 },
        { type: 'block', componentKey: 'divider', dataKey: 'divider', variant: 'simple' },
        // プレイ環境・言語・マイク
        {
          type: 'col',
          gap: 2,
          children: [
            { type: 'ref', blockId: 'playEnv',  minH: 3 },
            { type: 'ref', blockId: 'language', minH: 3 },
            { type: 'ref', blockId: 'gauge1',   minH: 3 },
          ],
        },
        { type: 'block', componentKey: 'divider', dataKey: 'divider', variant: 'simple' },
        // ステータス
        { type: 'ref', blockId: 'status', variant: 'cards', minH: 8 },
        { type: 'block', componentKey: 'divider', dataKey: 'divider', variant: 'simple' },
        // アクティビティ・インタラクション
        { type: 'ref', blockId: 'activity',     minH: 12 },
        { type: 'ref', blockId: 'interactions', minH: 8 },
      ],
    },
  },
}
