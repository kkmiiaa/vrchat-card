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
  marks: { '通話': '◎', '写真': '◯', '動画': '△', '深夜': '✗' },
  custom: [],
}

const MARK_BLOCKCONFIG = {
  marks: [
    { label: '通話', icon: 'TbMicrophone', ok: ['◎', '◯'] },
    { label: '写真', icon: 'TbCamera', ok: ['◎', '◯'] },
    { label: '動画', icon: 'TbVideo', ok: ['◎', '◯'] },
    { label: '深夜', icon: 'TbMoon', ok: ['◎', '◯'] },
  ],
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
    blockConfig: MARK_BLOCKCONFIG,
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

/**
 * surface コンテナを renderer と同様に wrapper で適用し、コンポーネント自体には渡さない。
 */
function VariantPreview({
  spec,
  variant,
  surface,
}: {
  spec: ComponentSpec
  variant: string
  surface: SurfaceVariant
}) {
  const { component, value, blockConfig } = spec
  if (!component.CardItem) return null

  const hasSurface = surface !== 'transparent'
  const ss = hasSurface ? SURFACE_STYLE[surface] : null
  const containerStyle: React.CSSProperties = ss ? {
    background: ss.background,
    border: ss.border,
    boxShadow: ss.boxShadow,
    borderRadius: ctx.cardWidth * 0.006,
    padding: `${ctx.cardWidth * 0.006}px ${ctx.cardWidth * 0.008}px`,
  } : {}

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1 items-center">
        <span className="text-[9px] font-mono bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">{variant}</span>
        <span className="text-[9px] font-mono bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100">{surface}</span>
      </div>
      <div
        style={{
          background: 'linear-gradient(135deg, #fcd5ce 0%, #e0f7fa 100%)',
          borderRadius: 8,
          padding: 8,
          minHeight: 40,
          display: 'flex',
          alignItems: 'stretch',
        }}
      >
        <div style={{ width: '100%', display: 'flex', overflow: 'hidden', ...containerStyle }}>
          <component.CardItem
            value={value}
            ctx={ctx}
            variant={variant}
            blockConfig={blockConfig}
          />
        </div>
      </div>
    </div>
  )
}

function ComponentSection({ spec }: { spec: ComponentSpec }) {
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
        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100">surface ✓ (all)</span>
      </div>

      <div className="px-5 py-4">
        {variants.map(variant => (
          <div key={variant} className="mb-6 last:mb-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              variant: {variant} × surfaces
            </p>
            <div className="grid grid-cols-3 gap-3">
              {SURFACES.map(surface => (
                <VariantPreview key={surface} spec={spec} variant={variant} surface={surface} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function ComponentsTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-2">コンポーネント variant × surface 一覧</h1>
        <p className="text-sm text-gray-500 mb-8">
          各コンポーネントの全 variant と surface の組み合わせを確認するためのビューワー。
          背景はグラデーションにして surface の見た目の違いがわかるようにしています。
        </p>
        <div className="space-y-6">
          {SPECS.map(spec => (
            <ComponentSection key={spec.name} spec={spec} />
          ))}
        </div>
      </div>
    </div>
  )
}
