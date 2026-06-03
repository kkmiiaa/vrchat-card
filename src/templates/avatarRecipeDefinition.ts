// @ts-nocheck
import type { TemplateDefinition } from '@/blocks/types'
import {
  CARD_LANDSCAPE_WIDTH as W,
  CARD_LANDSCAPE_HEIGHT as H,
} from '@/lib/cardDimensions'

// ─── ルーラーあり版 ──────────────────────────────────────────────────────────

export const avatarRecipeDefinition: TemplateDefinition = {
  id: 'avatar-recipe',
  label: 'アバター改変レシピカード',
  theme: {
    accent:  '#7c6fcd',
    text:    '#2d2640',
    subText: '#9ca3af',
    bg:      'rgba(255,255,255,0.85)',
  },
  fontFamily: 'sans-serif',
  borderRadius: 20,
  backgroundKey: 'background',

  blockPool: {
    background: {
      componentKey: 'background',
      dataKey: 'background',
    },
    // ── 左パネル: プロフィール ──
    avatarName: {
      componentKey: 'text',
      dataKey: 'avatarName',
      variant: 'simple',
      label: 'AVATAR NAME',
      blockConfig: { multiline: false, noPadding: true },
    },
    avatarNameSub: {
      componentKey: 'text',
      dataKey: 'avatarNameSub',
      variant: 'simple',
      blockConfig: { multiline: false, noPadding: true },
    },
    height: {
      componentKey: 'text',
      dataKey: 'height',
      variant: 'simple',
      label: 'HEIGHT',
      labelInset: true,
      labelInsetDir: 'row',
      labelColor: '#9ca3af',
      blockConfig: { multiline: false, noPadding: true },
    },
    birthdate: {
      componentKey: 'text',
      dataKey: 'birthdate',
      variant: 'simple',
      label: 'BIRTHDATE',
      labelInset: true,
      labelInsetDir: 'row',
      labelColor: '#9ca3af',
      blockConfig: { multiline: false, noPadding: true },
    },
    personality: {
      componentKey: 'text',
      dataKey: 'personality',
      variant: 'simple',
      label: 'PERSONALITY',
      labelInset: true,
      labelInsetDir: 'row',
      labelColor: '#9ca3af',
      blockConfig: { multiline: false, noPadding: true },
    },
    concept: {
      componentKey: 'text',
      dataKey: 'concept',
      variant: 'simple',
      label: 'CONCEPT',
      blockConfig: { multiline: true },
    },
    themeTags: {
      componentKey: 'tag-list',
      dataKey: 'themeTags',
      variant: 'simple',
      label: 'THEME TAGS',
    },
    // ── 中央: ルーラー ──
    heightRuler: {
      componentKey: 'height-ruler',
      dataKey: 'heightRuler',
      variant: 'simple',
      hideWhenEmpty: false,
    },
    // ── アイテムリスト ──
    items: {
      componentKey: 'item-list',
      dataKey: 'items',
      variant: 'simple',
      label: 'AVATAR ITEMS',
    },
    // ── SNS ──
    snsX: {
      componentKey: 'simple-sns',
      dataKey: 'x',
      variant: 'contained',
      blockConfig: { platform: 'x' },
    },
    snsDiscord: {
      componentKey: 'simple-sns',
      dataKey: 'discord',
      variant: 'contained',
      blockConfig: { platform: 'discord' },
    },
    snsBooth: {
      componentKey: 'link-item',
      dataKey: 'booth',
      variant: 'simple',
      label: 'Booth',
      blockConfig: { icon: 'TbShoppingBag' },
    },
  },

  // ─── カード表示レイアウト（横長） ────────────────────────────────────────
  card: {
    cardWidth: W,
    cardHeight: H,
    grid: { cellSize: 10, gap: 4 },
    defaultLabelFontScale: 0.75,
    layout: {
      type: 'row',
      flex: 1,
      gap: 8,
      children: [
        // 左パネル: プロフィール情報
        {
          type: 'col',
          minW: 22,
          gap: 3,
          children: [
            { type: 'ref', blockId: 'avatarName',    minH: 5, contentFontScale: 1.6 },
            { type: 'ref', blockId: 'avatarNameSub', minH: 2, contentFontScale: 0.85 },
            { type: 'block', componentKey: 'divider', variant: 'horizontal' },
            { type: 'ref', blockId: 'height',      minH: 3 },
            { type: 'ref', blockId: 'birthdate',   minH: 3 },
            { type: 'ref', blockId: 'personality', minH: 3 },
            { type: 'block', componentKey: 'divider', variant: 'horizontal' },
            { type: 'ref', blockId: 'concept',   flex: 1, minH: 5 },
            { type: 'ref', blockId: 'themeTags', minH: 4 },
          ],
        },
        // 中央: ルーラー
        {
          type: 'col',
          minW: 16,
          gap: 0,
          alignItems: 'center',
          justify: 'flex-end',
          children: [
            { type: 'ref', blockId: 'heightRuler', flex: 1 },
          ],
        },
        // 右パネル: アイテム + SNS
        {
          type: 'col',
          flex: 1,
          gap: 3,
          children: [
            { type: 'ref', blockId: 'items', flex: 1 },
            { type: 'block', componentKey: 'divider', variant: 'horizontal' },
            {
              type: 'row',
              gap: 2,
              label: 'CONNECT',
              children: [
                { type: 'ref', blockId: 'snsX',       flex: 1, minH: 3 },
                { type: 'ref', blockId: 'snsDiscord', flex: 1, minH: 3 },
                { type: 'ref', blockId: 'snsBooth',   flex: 1, minH: 3 },
              ],
            },
          ],
        },
      ],
    },
  },

  // ─── Web 表示レイアウト（縦スクロール） ─────────────────────────────────
  web: {
    cardWidth: 480,
    autoHeight: true,
    grid: { cellSize: 10, gap: 4 },
    defaultLabelFontScale: 0.75,
    layout: {
      type: 'col',
      flex: 1,
      gap: 4,
      children: [
        { type: 'ref', blockId: 'avatarName',    minH: 5, contentFontScale: 1.6 },
        { type: 'ref', blockId: 'avatarNameSub', minH: 2, contentFontScale: 0.85 },
        {
          type: 'row',
          gap: 3,
          children: [
            { type: 'ref', blockId: 'height',      flex: 1, minH: 3 },
            { type: 'ref', blockId: 'birthdate',   flex: 1, minH: 3 },
            { type: 'ref', blockId: 'personality', flex: 1, minH: 3 },
          ],
        },
        { type: 'ref', blockId: 'concept',   minH: 5 },
        { type: 'ref', blockId: 'themeTags', minH: 4 },
        { type: 'ref', blockId: 'heightRuler', minH: 30 },
        { type: 'ref', blockId: 'items', minH: 10 },
        {
          type: 'row',
          gap: 2,
          label: 'CONNECT',
          children: [
            { type: 'ref', blockId: 'snsX',       flex: 1, minH: 3 },
            { type: 'ref', blockId: 'snsDiscord', flex: 1, minH: 3 },
            { type: 'ref', blockId: 'snsBooth',   flex: 1, minH: 3 },
          ],
        },
      ],
    },
  },

  formSections: [
    {
      title: 'アバター情報',
      defaultOpen: true,
      items: [
        { type: 'block', dataKey: 'avatarName',    formLabel: 'アバター名' },
        { type: 'block', dataKey: 'avatarNameSub', formLabel: 'サブ名（読み仮名など）' },
        { type: 'block', dataKey: 'height',        formLabel: '身長' },
        { type: 'block', dataKey: 'birthdate',     formLabel: '誕生日' },
        { type: 'block', dataKey: 'personality',   formLabel: '性格' },
        { type: 'block', dataKey: 'concept',       formLabel: 'コンセプト' },
        { type: 'block', dataKey: 'themeTags',     formLabel: 'テーマタグ' },
      ],
    },
    {
      title: 'ルーラー・アバター画像',
      defaultOpen: true,
      items: [
        { type: 'block', dataKey: 'heightRuler', formLabel: '身長ルーラー' },
      ],
    },
    {
      title: '改変アイテム',
      defaultOpen: true,
      items: [
        { type: 'block', dataKey: 'items', formLabel: '使用アイテム' },
      ],
    },
    {
      title: 'SNS / リンク',
      defaultOpen: false,
      items: [
        { type: 'block', dataKey: 'x',       formLabel: 'X (Twitter)' },
        { type: 'block', dataKey: 'discord',  formLabel: 'Discord' },
        { type: 'block', dataKey: 'booth',    formLabel: 'Booth' },
      ],
    },
    {
      title: '背景',
      defaultOpen: false,
      items: [
        { type: 'block', dataKey: 'background', formLabel: '背景' },
      ],
    },
  ],
}

// ─── ルーラーなし版 ──────────────────────────────────────────────────────────

export const avatarRecipeSimpleDefinition: TemplateDefinition = {
  ...avatarRecipeDefinition,
  id: 'avatar-recipe-simple',
  label: 'アバター改変レシピカード（シンプル）',

  card: {
    cardWidth: W,
    cardHeight: H,
    grid: { cellSize: 10, gap: 4 },
    defaultLabelFontScale: 0.75,
    layout: {
      type: 'row',
      flex: 1,
      gap: 8,
      children: [
        // 左パネル: プロフィール情報
        {
          type: 'col',
          minW: 26,
          gap: 3,
          children: [
            { type: 'ref', blockId: 'avatarName',    minH: 5, contentFontScale: 1.6 },
            { type: 'ref', blockId: 'avatarNameSub', minH: 2, contentFontScale: 0.85 },
            { type: 'block', componentKey: 'divider', variant: 'horizontal' },
            { type: 'ref', blockId: 'height',      minH: 3 },
            { type: 'ref', blockId: 'birthdate',   minH: 3 },
            { type: 'ref', blockId: 'personality', minH: 3 },
            { type: 'block', componentKey: 'divider', variant: 'horizontal' },
            { type: 'ref', blockId: 'concept',   flex: 1, minH: 5 },
            { type: 'ref', blockId: 'themeTags', minH: 4 },
          ],
        },
        // 右パネル: アイテム + SNS
        {
          type: 'col',
          flex: 1,
          gap: 3,
          children: [
            { type: 'ref', blockId: 'items', flex: 1 },
            { type: 'block', componentKey: 'divider', variant: 'horizontal' },
            {
              type: 'row',
              gap: 2,
              label: 'CONNECT',
              children: [
                { type: 'ref', blockId: 'snsX',       flex: 1, minH: 3 },
                { type: 'ref', blockId: 'snsDiscord', flex: 1, minH: 3 },
                { type: 'ref', blockId: 'snsBooth',   flex: 1, minH: 3 },
              ],
            },
          ],
        },
      ],
    },
  },

  web: {
    cardWidth: 480,
    autoHeight: true,
    grid: { cellSize: 10, gap: 4 },
    defaultLabelFontScale: 0.75,
    layout: {
      type: 'col',
      flex: 1,
      gap: 4,
      children: [
        { type: 'ref', blockId: 'avatarName',    minH: 5, contentFontScale: 1.6 },
        { type: 'ref', blockId: 'avatarNameSub', minH: 2, contentFontScale: 0.85 },
        {
          type: 'row',
          gap: 3,
          children: [
            { type: 'ref', blockId: 'height',      flex: 1, minH: 3 },
            { type: 'ref', blockId: 'birthdate',   flex: 1, minH: 3 },
            { type: 'ref', blockId: 'personality', flex: 1, minH: 3 },
          ],
        },
        { type: 'ref', blockId: 'concept',   minH: 5 },
        { type: 'ref', blockId: 'themeTags', minH: 4 },
        { type: 'ref', blockId: 'items', minH: 10 },
        {
          type: 'row',
          gap: 2,
          label: 'CONNECT',
          children: [
            { type: 'ref', blockId: 'snsX',       flex: 1, minH: 3 },
            { type: 'ref', blockId: 'snsDiscord', flex: 1, minH: 3 },
            { type: 'ref', blockId: 'snsBooth',   flex: 1, minH: 3 },
          ],
        },
      ],
    },
  },

  formSections: [
    {
      title: 'アバター情報',
      defaultOpen: true,
      items: [
        { type: 'block', dataKey: 'avatarName',    formLabel: 'アバター名' },
        { type: 'block', dataKey: 'avatarNameSub', formLabel: 'サブ名（読み仮名など）' },
        { type: 'block', dataKey: 'height',        formLabel: '身長' },
        { type: 'block', dataKey: 'birthdate',     formLabel: '誕生日' },
        { type: 'block', dataKey: 'personality',   formLabel: '性格' },
        { type: 'block', dataKey: 'concept',       formLabel: 'コンセプト' },
        { type: 'block', dataKey: 'themeTags',     formLabel: 'テーマタグ' },
      ],
    },
    {
      title: '改変アイテム',
      defaultOpen: true,
      items: [
        { type: 'block', dataKey: 'items', formLabel: '使用アイテム' },
      ],
    },
    {
      title: 'SNS / リンク',
      defaultOpen: false,
      items: [
        { type: 'block', dataKey: 'x',       formLabel: 'X (Twitter)' },
        { type: 'block', dataKey: 'discord',  formLabel: 'Discord' },
        { type: 'block', dataKey: 'booth',    formLabel: 'Booth' },
      ],
    },
    {
      title: '背景',
      defaultOpen: false,
      items: [
        { type: 'block', dataKey: 'background', formLabel: '背景' },
      ],
    },
  ],
}
