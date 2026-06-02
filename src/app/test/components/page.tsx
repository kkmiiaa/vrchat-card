'use client'

import React from 'react'
import { textComponent } from '@/blocks/text'
import { selectComponent } from '@/blocks/select'
import { multiSelectComponent } from '@/blocks/multiSelect'
import { gaugeComponent } from '@/blocks/gauge'
import { expressiveSelectComponent } from '@/blocks/expressiveSelect'
import { badgeComponent } from '@/blocks/badge'
import { booleanFlagComponent } from '@/blocks/booleanFlag'
import { ratingComponent } from '@/blocks/rating'
import { linkItemComponent } from '@/blocks/linkItem'
import { dateItemComponent } from '@/blocks/dateItem'
import { markListComponent } from '@/blocks/markList'
import { markGridComponent } from '@/blocks/markGrid'
import { colorStatusComponent } from '@/blocks/colorStatus'
import { activityComponent } from '@/blocks/activity'
import { simpleSnsComponent } from '@/blocks/simpleSns'
import { snsWithFriendPolicyComponent } from '@/blocks/snsWithFriendPolicy'
import { genderComponent } from '@/blocks/gender'
import { languageComponent } from '@/blocks/language'
import { ageComponent } from '@/blocks/age'
import { tagListComponent } from '@/blocks/tagList'
import { colorPaletteComponent } from '@/blocks/colorPalette'
import { profileImageComponent } from '@/blocks/profileImage'
import { galleryComponent } from '@/blocks/gallery'
import { colorLabeledListComponent } from '@/blocks/colorLabeledList'
import { dividerComponent } from '@/blocks/divider'
import type { ComponentDef, SurfaceVariant, CardRenderContext } from '@/blocks/types'
import { DEFAULT_CARD_RENDER_CONTEXT, SURFACE_STYLE } from '@/blocks/types'

const ctx: CardRenderContext = {
  ...DEFAULT_CARD_RENDER_CONTEXT,
  cardWidth: 600,
}

const SURFACES: SurfaceVariant[] = ['transparent', 'contained', 'glass', 'flat', 'outline']

type ComponentSpec = {
  name: string
  component: ComponentDef<unknown>
  value: unknown
  blockConfig?: Record<string, unknown>
}

const SELECT_BLOCKCONFIG = {
  options: [
    { value: 'Known User', label: 'Known User', color: '#94a3b8' },
    { value: 'Trusted User', label: 'Trusted User', color: '#60a5fa' },
    { value: 'Veteran User', label: 'Veteran User', color: '#a78bfa' },
    { value: 'Legendary User', label: 'Legendary User', color: '#f59e0b' },
  ],
}

const MARK_VALUE = {
  marks: { 0: '◎', 1: '◯', 2: '△', 3: '✗' },
  custom: [{ label: 'カスタム', mark: '◎' }],
}

const MARK_ITEMS = [
  { label: '通話' },
  { label: '写真' },
  { label: '動画' },
  { label: '深夜' },
]

const MARK_BLOCKCONFIG = {
  items: MARK_ITEMS,
}

const MARK_GRID_BLOCKCONFIG = {
  items: MARK_ITEMS,
  cols: 2,
}

const COLOR_STATUS_VALUE = { a: 'option1', b: 'option2', c: 'option1' }
const COLOR_STATUS_BLOCKCONFIG = {
  fields: [
    { key: 'a', label: 'VRChat', color: '#60a5fa', statusOptions: [{ value: 'option1', label: 'Active' }, { value: 'option2', label: 'Away' }] },
    { key: 'b', label: 'Discord', color: '#818cf8', statusOptions: [{ value: 'option1', label: 'Online' }, { value: 'option2', label: 'DND' }] },
    { key: 'c', label: 'Twitter', color: '#38bdf8', statusOptions: [{ value: 'option1', label: 'Active' }] },
  ],
}

const ACTIVITY_VALUE = {
  days: [true, true, false, false, false, true, true],
  weekdayStart: '20:00',
  weekdayEnd: '23:00',
  holidayStart: '12:00',
  holidayEnd: '24:00',
}

const SPECS: ComponentSpec[] = [
  {
    name: 'text',
    component: textComponent as ComponentDef<unknown>,
    value: 'VRChatを楽しんでいます！お気軽に声をかけてください。',
    blockConfig: { multiline: true },
  },
  {
    name: 'select',
    component: selectComponent as ComponentDef<unknown>,
    value: 'Trusted User',
    blockConfig: SELECT_BLOCKCONFIG,
  },
  {
    name: 'multiSelect',
    component: multiSelectComponent as ComponentDef<unknown>,
    value: ['PCVR', 'Quest'],
    blockConfig: { options: [{ value: 'PCVR', label: 'PCVR', icon: 'TbDeviceDesktop' }, { value: 'Quest', label: 'Quest', icon: 'TbDeviceMobile' }, { value: 'Desktop', label: 'Desktop', icon: 'TbKeyboard' }] },
  },
  {
    name: 'gauge',
    component: gaugeComponent as ComponentDef<unknown>,
    value: 75,
    blockConfig: { unit: '%', showLabel: true },
  },
  {
    name: 'expressiveSelect',
    component: expressiveSelectComponent as ComponentDef<unknown>,
    value: { tag: 'female', display: '女の子♀' },
    blockConfig: { options: [{ value: 'male', label: '男性', color: '#60a5fa', icon: 'TbMars' }, { value: 'female', label: '女性', color: '#f472b6', icon: 'TbVenus' }, { value: 'other', label: 'その他', color: '#a78bfa', icon: 'TbGenderBigender' }] },
  },
  {
    name: 'badge',
    component: badgeComponent as ComponentDef<unknown>,
    value: { label: 'VRC歴3年', color: '#60a5fa' },
  },
  {
    name: 'booleanFlag',
    component: booleanFlagComponent as ComponentDef<unknown>,
    value: true,
    blockConfig: { trueLabel: '通話OK', falseLabel: 'NG' },
  },
  {
    name: 'rating',
    component: ratingComponent as ComponentDef<unknown>,
    value: 4,
    blockConfig: { max: 5 },
  },
  {
    name: 'linkItem',
    component: linkItemComponent as ComponentDef<unknown>,
    value: { label: 'Portfolio', url: 'https://example.com' },
  },
  {
    name: 'dateItem',
    component: dateItemComponent as ComponentDef<unknown>,
    value: { display: '2021年4月', iso: '2021-04' },
  },
  {
    name: 'markList',
    component: markListComponent as ComponentDef<unknown>,
    value: MARK_VALUE,
    blockConfig: MARK_BLOCKCONFIG,
  },
  {
    name: 'markGrid',
    component: markGridComponent as ComponentDef<unknown>,
    value: MARK_VALUE,
    blockConfig: MARK_GRID_BLOCKCONFIG,
  },
  {
    name: 'colorStatus',
    component: colorStatusComponent as ComponentDef<unknown>,
    value: COLOR_STATUS_VALUE,
    blockConfig: COLOR_STATUS_BLOCKCONFIG,
  },
  {
    name: 'activity',
    component: activityComponent as ComponentDef<unknown>,
    value: ACTIVITY_VALUE
  },
  {
    name: 'simpleSns',
    component: simpleSnsComponent as ComponentDef<unknown>,
    value: '@vrcuser_example',
    blockConfig: { platform: 'x', policies: [] }
  },
  {
    name: 'snsWithFriendPolicy',
    component: snsWithFriendPolicyComponent as ComponentDef<unknown>,
    value: { id: '@vrcuser_example', friendPolicy: 'frPolicyAnyone' },
    blockConfig: { platform: 'x' }
  },
  {
    name: 'gender',
    component: genderComponent as ComponentDef<unknown>,
    value: { tag: 'female', display: '女の子' },
  },
  {
    name: 'language',
    component: languageComponent as ComponentDef<unknown>,
    value: { preset: ['日本語', 'English'], custom: ['関西弁'] },
  },
  {
    name: 'age',
    component: ageComponent as ComponentDef<unknown>,
    value: { searchTag: '18+', display: '20代' },
  },
  {
    name: 'tagList',
    component: tagListComponent as ComponentDef<unknown>,
    value: ['VRChat', 'ゲーム', 'イラスト', '音楽'],
  },
  {
    name: 'colorPalette',
    component: colorPaletteComponent as ComponentDef<unknown>,
    value: ['#60a5fa', '#4ade80', '#fbbf24', '#f87171'],
  },
  {
    name: 'profileImage',
    component: profileImageComponent as ComponentDef<unknown>,
    value: { base64: null, url: null },
  },
  {
    name: 'gallery',
    component: galleryComponent as ComponentDef<unknown>,
    value: { enabled: false, images: [null, null, null], base64: [null, null, null] },
  },
]

// ─── ラベルモード ───────────────────────────────────────────────────────────
type LabelMode = 'none' | 'outside' | 'inset-col' | 'inset-row'

const LABEL_MODES: { value: LabelMode; label: string; desc: string }[] = [
  { value: 'none',      label: 'ラベルなし',        desc: 'surface コンテナのみ' },
  { value: 'outside',   label: '外ラベル',          desc: 'ラベル → コンテナ（縦並び）' },
  { value: 'inset-col', label: 'inset col',        desc: 'コンテナ内 ラベル上・値下' },
  { value: 'inset-row', label: 'inset row',        desc: 'コンテナ内 ラベル左・値右' },
]

const LABEL_TEXT = 'ラベル'
const LABEL_FS = ctx.fontSize.sm

/**
 * GenericCardRenderer と同じロジックで surface コンテナ＋ラベルを描画する。
 * paddingScale を正しく適用し、実際のカード描画に近い状態を確認できる。
 */
function VariantPreview({
  spec, variant, surface, labelMode,
}: {
  spec: ComponentSpec
  variant: string
  surface: SurfaceVariant
  labelMode: LabelMode
}) {
  const { component, value, blockConfig } = spec
  if (!component.CardItem) return null

  const isInternalSurface = component.surfaceMode === 'internal'
  const hasSurface = !isInternalSurface && surface !== 'transparent'
  const ss = hasSurface ? SURFACE_STYLE[surface] : null
  const pad = hasSurface
    ? `${ctx.cardWidth * 0.006 * ctx.paddingScale}px ${ctx.cardWidth * 0.008 * ctx.paddingScale}px`
    : undefined
  const surfaceProps: React.CSSProperties = ss ? {
    background: ss.background,
    border: ss.border,
    boxShadow: ss.boxShadow,
    borderRadius: ctx.cardWidth * 0.006,
    padding: pad,
  } : {}

  const blockCtx = isInternalSurface ? { ...ctx, surface } : ctx

  const content = (
    <component.CardItem value={value} ctx={blockCtx} variant={variant} blockConfig={blockConfig} />
  )

  const labelEl = (
    <span style={{ fontSize: LABEL_FS, fontWeight: 700, color: ctx.theme.text, fontFamily: ctx.fontFamily, flexShrink: 0 }}>
      {LABEL_TEXT}
    </span>
  )

  let inner: React.ReactNode
  if (labelMode === 'none') {
    inner = (
      <div style={{ width: '100%', display: 'flex', overflow: 'hidden', ...surfaceProps }}>
        {content}
      </div>
    )
  } else if (labelMode === 'outside') {
    // ラベル → surface コンテナ（縦並び）
    inner = (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: ctx.cardWidth * 0.004 }}>
        {labelEl}
        <div style={{ display: 'flex', overflow: 'hidden', ...surfaceProps }}>
          {content}
        </div>
      </div>
    )
  } else if (labelMode === 'inset-col') {
    // surface コンテナ内で縦並び
    inner = (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: ctx.cardWidth * 0.003, overflow: 'hidden', ...surfaceProps }}>
        {labelEl}
        <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0, display: 'flex', alignItems: 'stretch' }}>
          {content}
        </div>
      </div>
    )
  } else {
    // inset-row: surface コンテナ内で横並び
    inner = (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'row', gap: ctx.cardWidth * 0.005, alignItems: 'center', overflow: 'hidden', ...surfaceProps }}>
        {labelEl}
        <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0, display: 'flex', alignItems: 'stretch' }}>
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1 items-center">
        <span className="text-[9px] font-mono bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">{variant}</span>
        <span className="text-[9px] font-mono bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100">{surface}</span>
      </div>
      <div style={{
        background: 'linear-gradient(135deg, #fcd5ce 0%, #e0f7fa 100%)',
        borderRadius: 8, padding: 8, minHeight: 40, display: 'flex', alignItems: 'stretch',
      }}>
        {inner}
      </div>
    </div>
  )
}

function ComponentSection({ spec, labelMode }: { spec: ComponentSpec; labelMode: LabelMode }) {
  const { component, name } = spec
  const variants = component.variants ?? ['simple']

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 flex-wrap">
        <span className="font-mono text-sm font-bold text-gray-800">{name}</span>
        <div className="flex gap-1.5 flex-wrap">
          {variants.map(v => (
            <span key={v} className="text-[10px] font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">{v}</span>
          ))}
        </div>
      </div>
      <div className="px-5 py-4">
        {variants.map(variant => (
          <div key={variant} className="mb-6 last:mb-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              variant: {variant} × surfaces
            </p>
            <div className="grid grid-cols-3 gap-3">
              {SURFACES.map(surface => (
                <VariantPreview key={surface} spec={spec} variant={variant} surface={surface} labelMode={labelMode} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function ComponentsTestPage() {
  const [labelMode, setLabelMode] = React.useState<LabelMode>('none')

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-2">コンポーネント variant × surface 一覧</h1>
        <p className="text-sm text-gray-500 mb-4">
          各コンポーネントの全 variant と surface の組み合わせを確認するためのビューワー。
          ラベルモードを切り替えて labelInset や外ラベルの見た目を確認できます。
        </p>

        {/* ラベルモード選択 */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex items-center gap-4 flex-wrap">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ラベルモード</span>
          {LABEL_MODES.map(m => (
            <button
              key={m.value}
              type="button"
              onClick={() => setLabelMode(m.value)}
              className={`flex flex-col items-start px-3 py-2 rounded-lg border text-left transition-all ${
                labelMode === m.value
                  ? 'border-sky-400 bg-sky-50 text-sky-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <span className="text-xs font-semibold">{m.label}</span>
              <span className="text-[10px] text-gray-400">{m.desc}</span>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {SPECS.map(spec => (
            <ComponentSection key={spec.name} spec={spec} labelMode={labelMode} />
          ))}
        </div>
      </div>
    </div>
  )
}
