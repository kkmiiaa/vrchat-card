'use client'
import type { ComponentDef, BlockConfigFormProps } from './types'
import { SiInstagram, SiYoutube, SiTiktok } from 'react-icons/si'
import { renderIcon, IconPicker } from './iconRegistry'

export type SnsWithFriendPolicyValue = {
  id: string
  friendPolicy: string
}

const DEFAULT_VALUE: SnsWithFriendPolicyValue = { id: '', friendPolicy: '' }

const DEFAULT_POLICIES = [
  { value: 'frPolicyAnyone',             label: 'だれでもOK',          icon: 'TbHeart' },
  { value: 'frPolicyIfInterested',       label: '気になったら許可',      icon: 'TbStar' },
  { value: 'frPolicyMutualsOnX',         label: 'X相互は申請OK',        icon: 'TbBrandX' },
  { value: 'frPolicyAfterGettingToKnow', label: '仲良くなってから許可',  icon: 'TbSparkles' },
  { value: 'frPolicyNo',                 label: '送らないでください',    icon: 'TbShield' },
]

type PolicyOption = { value: string; label: string; icon?: string }

function getPolicies(blockConfig?: Record<string, unknown>): PolicyOption[] {
  if (Array.isArray(blockConfig?.policies) && (blockConfig!.policies as PolicyOption[]).length > 0) {
    return blockConfig!.policies as PolicyOption[]
  }
  return DEFAULT_POLICIES
}

const PLATFORM_IMG_ICONS: Record<string, string> = {
  vrchat:  '/icon_vrchat.png',
  x:       '/icon_x.png',
  discord: '/icon_discord.png',
}

type ReactIconComponent = React.ComponentType<{ style?: React.CSSProperties; size?: number | string }>

const PLATFORM_REACT_ICONS: Record<string, ReactIconComponent> = {
  instagram: SiInstagram,
  youtube:   SiYoutube,
  tiktok:    SiTiktok,
}

const PLATFORM_LABELS: Record<string, string> = {
  vrchat:  'VRChat ID',
  x:       'X（旧Twitter）',
  discord: 'Discord',
}

const PLATFORM_PLACEHOLDERS: Record<string, string> = {
  vrchat:  '',
  x:       '@yourhandle',
  discord: 'YourName#1234',
}

function getPlatform(blockConfig?: Record<string, unknown>): string {
  return typeof blockConfig?.platform === 'string' ? blockConfig.platform : 'vrchat'
}

export const snsWithFriendPolicyComponent: ComponentDef<SnsWithFriendPolicyValue> = {
  key: 'sns-with-friend-policy',
  defaultValue: DEFAULT_VALUE,
  variants: ['default', 'glass'],
  CardItem({ value, ctx, variant, blockConfig }) {
    const isInteractive = ctx.isInteractive
    const safe: SnsWithFriendPolicyValue =
      (value && typeof value === 'object' && 'id' in value)
        ? value as SnsWithFriendPolicyValue
        : DEFAULT_VALUE

    const platform = getPlatform(blockConfig)
    const imgIcon = PLATFORM_IMG_ICONS[platform]
    const ReactIcon = PLATFORM_REACT_ICONS[platform]
    const id = safe.id
    const policy = getPolicies(blockConfig).find(p => p.value === safe.friendPolicy)
    const friendIconKey = policy?.icon ?? null

    const xHref = platform === 'x' && id ? `https://x.com/${id.replace(/^@/, '')}` : null
    const canCopy = platform !== 'x' && !!id
    function handleCopy() {
      navigator.clipboard.writeText(id)
      window.dispatchEvent(new CustomEvent('vaacard:copied', { detail: `${id} をコピーしました` }))
    }

    const fs = ctx.fontSize.md
    const fsSmall = ctx.fontSize.sm
    const iconSize = ctx.cardWidth * 0.018 * ctx.paddingScale
    const isGlass = variant === 'glass'

    const snsSize = iconSize * (isGlass ? 0.65 : 1)
    const snsIconEl = (
      <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {imgIcon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgIcon} alt="" style={{ width: snsSize, height: snsSize, borderRadius: 3, objectFit: 'contain', display: 'block' }} />
        ) : ReactIcon ? (
          <ReactIcon size={snsSize} />
        ) : null}
      </span>
    )

    const friendIconSize = isGlass ? iconSize * 0.6 : iconSize * 0.85
    const friendIconEl = friendIconKey
      ? <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: ctx.theme.subText }}>{renderIcon(friendIconKey, friendIconSize)}</span>
      : null

    if (isGlass) {
      const iconColW = snsSize + 6  // アイコン幅 + gap 分で列幅を固定
      const glassEl = (
        <div className={isInteractive && id ? 'vaacard-sns-item' : undefined} style={{ width: '100%', background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.75)', borderRadius: ctx.cardWidth * 0.006, boxShadow: '0 0 12px rgba(0,0,0,0.08)', padding: '4px 8px', display: 'flex', flexDirection: 'column', cursor: isInteractive && id ? 'pointer' : 'default' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
            <div style={{ width: iconColW, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              {snsIconEl}
            </div>
            <span style={{ fontSize: fs * 0.9, color: id ? ctx.theme.text : 'rgba(0,0,0,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0, fontFamily: ctx.fontFamily }}>
              {id || '-'}
            </span>
          </div>
          {policy && (
            <>
              <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                <div style={{ width: iconColW, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  {friendIconEl}
                </div>
                <span style={{ fontSize: fsSmall * 0.9, color: ctx.theme.subText, fontFamily: ctx.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {policy.label}
                </span>
              </div>
            </>
          )}
        </div>
      )
      if (isInteractive && xHref) return <a href={xHref} target="_blank" rel="noopener noreferrer" style={{ display: 'contents' }}>{glassEl}</a>
      if (isInteractive && canCopy) return <div style={{ display: 'contents' }} onClick={handleCopy}>{glassEl}</div>
      return glassEl
    }

    const defaultEl = (
      <div className={isInteractive && id ? 'vaacard-sns-item' : undefined} style={{ display: 'flex', alignItems: 'stretch', gap: 6, width: '100%', flexGrow: 1, minHeight: 0, cursor: isInteractive && id ? 'pointer' : 'default' }}>
        <div style={{ display: 'flex', alignSelf: 'center' }}>{snsIconEl}</div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.85)', borderRadius: ctx.cardWidth * 0.005, padding: `${ctx.cardWidth * 0.004 * ctx.paddingScale}px ${ctx.cardWidth * 0.007 * ctx.paddingScale}px`, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
          <span style={{ fontSize: fs, lineHeight: 1, color: id ? ctx.theme.text : ctx.theme.subText, fontFamily: ctx.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {id || '-'}
          </span>
          {policy && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {friendIconEl}
              <span style={{ fontSize: fsSmall, lineHeight: 1, color: ctx.theme.subText, fontFamily: ctx.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {policy.label}
              </span>
            </div>
          )}
        </div>
      </div>
    )
    if (isInteractive && xHref) return <a href={xHref} target="_blank" rel="noopener noreferrer" style={{ display: 'contents' }}>{defaultEl}</a>
    if (isInteractive && canCopy) return <div style={{ display: 'contents' }} onClick={handleCopy}>{defaultEl}</div>
    return defaultEl
  },
  FormItem({ value, onChange, blockConfig }) {
    const safe: SnsWithFriendPolicyValue =
      (value && typeof value === 'object' && 'id' in value)
        ? value as SnsWithFriendPolicyValue
        : DEFAULT_VALUE

    const platform = getPlatform(blockConfig)
    const label = PLATFORM_LABELS[platform] ?? platform
    const placeholder = PLATFORM_PLACEHOLDERS[platform] ?? ''
    const FormImgIcon = PLATFORM_IMG_ICONS[platform]
    const FormReactIcon = PLATFORM_REACT_ICONS[platform]

    const visiblePolicies = getPolicies(blockConfig)

    const selectPolicy = (policyValue: string) =>
      onChange({ ...safe, friendPolicy: safe.friendPolicy === policyValue ? '' : policyValue })

    return (
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            {FormImgIcon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={FormImgIcon} alt="" className="w-4 h-4 object-contain rounded" />
            ) : FormReactIcon ? (
              <FormReactIcon size={14} />
            ) : null}
            {label}
          </span>
          <input
            type="text"
            value={safe.id}
            onChange={e => onChange({ ...safe, id: e.target.value })}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </label>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500">フレンド申請</span>
          <div className="flex flex-wrap gap-2">
            {visiblePolicies.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => selectPolicy(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs border font-medium transition-all flex items-center gap-1 ${
                  safe.friendPolicy === p.value
                    ? 'border-[#00AADB] bg-sky-50 text-[#00AADB]'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                {p.icon && <span className="opacity-70">{renderIcon(p.icon, 11)}</span>}
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  },
  blockConfigForm({ blockConfig, onChange }: BlockConfigFormProps) {
    const platform = getPlatform(blockConfig)
    const policies: PolicyOption[] = Array.isArray(blockConfig.policies)
      ? blockConfig.policies as PolicyOption[]
      : []

    const PLATFORM_OPTIONS = [
      { value: 'vrchat',     label: 'VRChat' },
      { value: 'x',         label: 'X（旧Twitter）' },
      { value: 'discord',   label: 'Discord' },
      { value: 'instagram', label: 'Instagram' },
      { value: 'youtube',   label: 'YouTube' },
      { value: 'tiktok',    label: 'TikTok' },
    ]

    const updatePolicy = (i: number, patch: Partial<PolicyOption>) =>
      onChange({ ...blockConfig, policies: policies.map((p, idx) => idx === i ? { ...p, ...patch } : p) })
    const addPolicy = () =>
      onChange({ ...blockConfig, policies: [...policies, { value: '', label: '' }] })
    const removePolicy = (i: number) =>
      onChange({ ...blockConfig, policies: policies.filter((_, idx) => idx !== i) })

    return (
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-24 shrink-0">プラットフォーム</span>
          <select
            value={platform}
            onChange={e => onChange({ ...blockConfig, platform: e.target.value })}
            className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-white"
          >
            {PLATFORM_OPTIONS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[10px] text-gray-400">ポリシー選択肢（未設定時はデフォルト5件）</p>
          {policies.map((p, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <IconPicker
                value={p.icon ?? ''}
                onChange={v => updatePolicy(i, { icon: v || undefined })}
              />
              <div className="flex flex-col gap-0.5 w-36 shrink-0">
                <span className="text-[9px] text-gray-400 font-mono leading-none">key</span>
                <input type="text" value={p.value} placeholder="frPolicyAnyone"
                  onChange={e => updatePolicy(i, { value: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1 bg-white font-mono" />
              </div>
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="text-[9px] text-gray-400 leading-none">ラベル</span>
                <input type="text" value={p.label} placeholder="表示ラベル"
                  onChange={e => updatePolicy(i, { label: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1 bg-white" />
              </div>
              <button type="button" onClick={() => removePolicy(i)} className="text-xs text-red-400 hover:text-red-600 self-end mb-1">×</button>
            </div>
          ))}
          <button type="button" onClick={addPolicy} className="text-xs text-sky-500 hover:text-sky-700 mt-1">+ 追加</button>
        </div>
      </div>
    )
  },
}
