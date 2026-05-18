'use client'

import React, { forwardRef } from 'react'
import { getBackgroundStyle, CARD_BG_FALLBACK } from '@/utils/backgroundUtils'
import { FiMic } from 'react-icons/fi'
import { PiGenderMaleBold, PiGenderFemaleBold, PiGenderIntersexBold } from 'react-icons/pi'
import { TbBadgeVr, TbDeviceGamepad2, TbDeviceDesktop, TbDeviceMobile } from 'react-icons/tb'

type Interaction = {
  label: string
  mark: string
  isCustom?: boolean
}

type Props = {
  name: string
  profileImageBase64: string | null
  profileImageUrl?: string | null
  gender?: string
  language?: string[]
  playEnv?: string[]
  micOnRate?: number
  selfIntro?: string
  vrchatId?: string
  twitterId?: string
  discordId?: string
  statusBlue?: string
  statusGreen?: string
  statusYellow?: string
  statusRed?: string
  interactions: Interaction[]
  friendPolicy?: string[]
  friendPolicyLabels?: Record<string, string>
  ageDisplay?: string
  trustRank?: string
  weekdayStart?: string
  weekdayEnd?: string
  holidayStart?: string
  holidayEnd?: string
  activeDays?: boolean[]
  daysMode?: '' | 'irregular'
  weekdayTimesMode?: 'irregular' | ''
  holidayTimesMode?: 'irregular' | ''

  galleryImages?: (string | null)[]
  backgroundType?: 'color' | 'gradient' | 'image'
  backgroundValue?: string | [string, string]
  backgroundImageBase64?: string | null
  fontFamily: string
  okNgLabels: Record<string, string>
  isInteractive?: boolean
  noBackground?: boolean
  orientation?: 'landscape' | 'portrait'
}

function getBackground(
  type?: string,
  value?: string | [string, string],
  bgBase64?: string | null
): string {
  return getBackgroundStyle(type, value, bgBase64, CARD_BG_FALLBACK) as string
}

const STATUS_COLORS = {
  blue:   '#60a5fa',
  green:  '#4ade80',
  yellow: '#fbbf24',
  red:    '#f87171',
}

const ENV_ICONS: Record<string, React.ReactNode> = {
  'PCVR':    <TbBadgeVr size={13} />,
  'Quest':   <TbDeviceGamepad2 size={13} />,
  'Desktop': <TbDeviceDesktop size={13} />,
  'Mobile':  <TbDeviceMobile size={13} />,
}

const MALE_KEYWORDS   = ['男性', '男', 'male', 'man', 'boy', 'おとこ']
const FEMALE_KEYWORDS = ['女性', '女', 'female', 'woman', 'girl', 'おんな']
const OTHER_KEYWORDS  = ['その他', '両', 'other', 'nonbinary', 'non-binary', 'nb']

function getGenderIcon(gender: string): React.ReactNode | null {
  const g = gender.toLowerCase()
  const isMale   = MALE_KEYWORDS.some(k => g.includes(k.toLowerCase()))
  const isFemale = FEMALE_KEYWORDS.some(k => g.includes(k.toLowerCase()))
  const isOther  = OTHER_KEYWORDS.some(k => g.includes(k.toLowerCase()))
  if (isOther || (isMale && isFemale)) return <PiGenderIntersexBold size={11} />
  if (isMale)   return <PiGenderMaleBold size={11} />
  if (isFemale) return <PiGenderFemaleBold size={11} />
  return <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block', flexShrink: 0 }} />
}

const FRIEND_POLICY_ICONS: Record<string, React.ReactNode> = {
  frPolicyAnyone:           <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" /></svg>,
  frPolicyAfterGettingToKnow: <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>,
  frPolicyIfInterested:     <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"/></svg>,
  frPolicyMutualsOnX:       <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  frPolicyNo:               <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>,
}

function timeToRatio(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return (h * 60 + m) / (24 * 60)
}

function timeBarSegments(start: string, end: string): { left: string; width: string }[] {
  const s = timeToRatio(start)
  const e = timeToRatio(end)
  if (e >= s) return [{ left: `${s * 100}%`, width: `${(e - s) * 100}%` }]
  return [
    { left: `${s * 100}%`, width: `${(1 - s) * 100}%` },
    { left: '0%', width: `${e * 100}%` },
  ]
}

const getMicColor = (_rate: number) => '#60a5fa'

const sectionLabel: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: 'rgba(0,0,0,0.35)',
  textTransform: 'uppercase',
}

const glass = {
  background: 'rgba(255,255,255,0.55)',
  border: '1px solid rgba(255,255,255,0.75)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
}

const CardV2 = forwardRef<HTMLDivElement, Props>(function CardV2(props, ref) {
  const {
    name,
    profileImageBase64,
    profileImageUrl,
    gender,
    language,
    playEnv,
    micOnRate,
    selfIntro,
    vrchatId,
    twitterId,
    discordId,
    statusBlue,
    statusGreen,
    statusYellow,
    statusRed,
    interactions,
    friendPolicy,
    friendPolicyLabels,
    ageDisplay,
    trustRank,
    weekdayStart,
    weekdayEnd,
    holidayStart,
    holidayEnd,
    activeDays,
    daysMode,
    weekdayTimesMode,
    holidayTimesMode,
    galleryImages,
    backgroundType,
    backgroundValue,
    backgroundImageBase64,
    fontFamily,
    okNgLabels,
    isInteractive,
    noBackground,
    orientation = 'landscape',
  } = props

  const visibleGallery = (galleryImages ?? []).filter(Boolean) as string[]

  const snsHref = (src: string, value: string) => {
    if (src === '/icon_x.png') return `https://x.com/${value.replace(/^@/, '')}`
    return null
  }

  const profileItems = [
    { label: '性別', value: gender },
    { label: '言語', value: (language ?? []).join(' / ') },
    { label: '環境', value: (playEnv ?? []).join(' / ') },
  ].filter(item => item.value) as { label: string; value: string }[]

  const snsItems = [
    { src: '/icon_vrchat.png',  value: vrchatId  || '' },
    { src: '/icon_x.png',       value: twitterId || '' },
    { src: '/icon_discord.png', value: discordId || '' },
  ]

  const statusItems = [
    { color: STATUS_COLORS.blue,   value: statusBlue   || '' },
    { color: STATUS_COLORS.green,  value: statusGreen  || '' },
    { color: STATUS_COLORS.yellow, value: statusYellow || '' },
    { color: STATUS_COLORS.red,    value: statusRed    || '' },
  ]

  const visibleInteractions = interactions.filter(i => i.mark !== '-')

  const bg = getBackground(backgroundType, backgroundValue as string | [string, string], backgroundImageBase64)

  const TRUST_COLORS: Record<string, string> = {
    'Visitor':      '#9ca3af',
    'New User':     '#3b82f6',
    'User':         '#22c55e',
    'Known User':   '#f97316',
    'Trusted User': '#a855f7',
  }

  if (orientation === 'portrait') {
    const PW = 900, PH = 1125
    // 縦レイアウト用フォントスケール（横より約30%大きく）
    const pLabel: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(0,0,0,0.35)', textTransform: 'uppercase' as const }
    const pFs = { name: 34, tag: 14, sns: 14, snsSubLabel: 9, friendPolicy: 11, sectionContent: 13, sectionSmall: 11, activityLabel: 10, activityTime: 10, dayCircle: 9, timeTick: 8 }
    return (
      <div
        ref={ref}
        style={{
          width: PW,
          height: PH,
          fontFamily,
          background: (isInteractive || noBackground) ? 'transparent' : bg,
          overflow: 'hidden',
          position: 'relative',
          borderRadius: (isInteractive || noBackground) ? 0 : 24,
        }}
      >
        {/* ガラスパネル全体 */}
        <div className="vaacard-glass-panel" style={{
          position: 'absolute',
          inset: '24px 28px',
          borderRadius: 20,
          backdropFilter: noBackground ? undefined : 'blur(18px)',
          WebkitBackdropFilter: noBackground ? undefined : 'blur(18px)',
          background: noBackground ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.35)',
          border: '1px solid rgba(255,255,255,0.75)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}>
          {/* 上部: プロフィール画像 + 基本情報（横並び） */}
          <div style={{ display: 'flex', gap: 24, padding: '28px 28px 20px', flexShrink: 0 }}>
            {/* 左: 画像 */}
            <div style={{
              width: 380, height: 380, borderRadius: 16, overflow: 'hidden', flexShrink: 0,
              border: '3px solid rgba(255,255,255,0.85)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              background: 'rgba(0,0,0,0.06)',
            }}>
              {(profileImageUrl || profileImageBase64) ? (
                <img src={profileImageUrl ?? profileImageBase64!} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="rgba(0,0,0,0.2)">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </div>
              )}
            </div>
            {/* 右: 名前 + タグ + SNS */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
              <div style={{ fontSize: pFs.name, fontWeight: 800, color: '#111827', lineHeight: 1.2, letterSpacing: '-0.3px', wordBreak: 'break-all' }}>
                {name || '名前未設定'}
              </div>
              {/* タグ */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 6, padding: '4px 12px' }}>
                  <span style={{ color: '#6b7280', display: 'flex' }}>{gender ? getGenderIcon(gender) : null}</span>
                  <span style={{ fontSize: pFs.tag, color: gender ? '#1f2937' : 'rgba(0,0,0,0.3)' }}>{gender || '性別 —'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 6, padding: '4px 12px' }}>
                  <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)', fontWeight: 700 }}>年齢</span>
                  <span style={{ fontSize: pFs.tag, color: ageDisplay ? '#1f2937' : 'rgba(0,0,0,0.3)' }}>{ageDisplay || '—'}</span>
                </div>
                {trustRank ? (() => {
                  const color = TRUST_COLORS[trustRank] ?? '#6b7280'
                  return (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: `${color}18`, border: `1px solid ${color}60`, borderRadius: 99, padding: '4px 12px' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill={color}><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                      <span style={{ fontSize: pFs.sectionSmall, color, fontWeight: 700 }}>{trustRank}</span>
                    </div>
                  )
                })() : null}
              </div>
              {/* SNS */}
              {snsItems.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {snsItems.map((sns, i) => {
                    const isVrchat = sns.src === '/icon_vrchat.png'
                    const showFr = isVrchat && friendPolicy && friendPolicy.length > 0 && friendPolicyLabels
                    const href = isInteractive ? snsHref(sns.src, sns.value!) : null
                    const handleClick = isInteractive && !href ? () => {
                      navigator.clipboard.writeText(sns.value!)
                      window.dispatchEvent(new CustomEvent('vaacard:copied', { detail: `${sns.value} をコピーしました` }))
                    } : undefined
                    const boxStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 8, padding: '6px 12px', display: 'flex', flexDirection: 'column', gap: 0, cursor: isInteractive ? 'pointer' : 'default', textDecoration: 'none' }
                    const inner = (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <img src={sns.src} alt="" style={{ width: 16, height: 16, borderRadius: 3, flexShrink: 0 }} />
                          <span style={{ fontSize: pFs.sns, color: sns.value ? '#1f2937' : 'rgba(0,0,0,0.3)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sns.value || '—'}</span>
                          {isInteractive && <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.3)', flexShrink: 0 }}>{href ? '↗' : 'コピー'}</span>}
                        </div>
                        {showFr && (
                          <>
                            <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', margin: '5px 0' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', flexShrink: 0, width: 16, justifyContent: 'center' }}>
                                {FRIEND_POLICY_ICONS[friendPolicy![0]]}
                              </span>
                              <span style={{ fontSize: pFs.snsSubLabel, color: 'rgba(0,0,0,0.3)', fontWeight: 700, flexShrink: 0 }}>フレンド申請</span>
                              <span style={{ fontSize: pFs.friendPolicy, color: '#6b7280', whiteSpace: 'nowrap' }}>
                                {friendPolicyLabels![friendPolicy![0]] ?? friendPolicy![0]}
                              </span>
                            </div>
                          </>
                        )}
                      </>
                    )
                    return href
                      ? <a key={i} href={href} target="_blank" rel="noopener noreferrer" style={boxStyle} className="vaacard-sns-item">{inner}</a>
                      : <div key={i} style={boxStyle} onClick={handleClick} className={isInteractive ? 'vaacard-sns-item' : ''}>{inner}</div>
                  })}
                </div>
              )}
              {/* ギャラリー: SNSの下、プロフィール画像右側 */}
              {visibleGallery.length > 0 && (
                <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                    {visibleGallery.slice(0, 3).map((src, i) => (
                      <div key={i} style={{ aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.8)', background: 'rgba(0,0,0,0.06)' }}>
                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 区切り */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.5)', flexShrink: 0, marginInline: 28 }} />

          {/* ABOUT: 全幅 */}
          <div style={{ padding: '16px 24px 0', flexShrink: 0 }}>
            <div style={pLabel}>ABOUT</div>
            <div style={{ fontSize: 15, color: selfIntro ? '#374151' : 'rgba(0,0,0,0.3)', lineHeight: 1.75, marginTop: 6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', wordBreak: 'break-all', background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 8, padding: '10px 14px' }}>
              {selfIntro || '—'}
            </div>
          </div>

          {/* 区切り */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.5)', flexShrink: 0, marginInline: 28, marginTop: 16 }} />

          {/* 中段: 2カラム */}
          <div style={{ display: 'flex', gap: 0, flexShrink: 0 }}>
            {/* 左カラム: PROFILE + STATUS */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px 16px 16px 24px', overflow: 'hidden' }}>
              {/* 環境・言語・マイク */}
              <div>
                <div style={pLabel}>PROFILE</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 8, padding: '7px 12px' }}>
                    <span style={{ fontSize: pFs.sectionSmall, color: 'rgba(0,0,0,0.4)', fontWeight: 700, flexShrink: 0 }}>環境</span>
                    <span style={{ fontSize: pFs.sectionContent, color: (playEnv ?? []).length > 0 ? '#374151' : 'rgba(0,0,0,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(playEnv ?? []).join(' / ') || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 8, padding: '7px 12px' }}>
                    <span style={{ fontSize: pFs.sectionSmall, color: 'rgba(0,0,0,0.4)', fontWeight: 700, flexShrink: 0 }}>言語</span>
                    <span style={{ fontSize: pFs.sectionContent, color: (language ?? []).length > 0 ? '#374151' : 'rgba(0,0,0,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(language ?? []).join(' / ') || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 8, padding: '7px 12px' }}>
                    <FiMic size={12} color="rgba(0,0,0,0.4)" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, height: 5, borderRadius: 99, background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${micOnRate ?? 0}%`, borderRadius: 99, background: getMicColor(micOnRate ?? 0) }} />
                    </div>
                    <span style={{ fontSize: pFs.sectionSmall, color: micOnRate ? getMicColor(micOnRate) : 'rgba(0,0,0,0.3)', fontWeight: 700, flexShrink: 0 }}>{micOnRate ? `${micOnRate}%` : '—'}</span>
                  </div>
                </div>
              </div>
              {/* STATUS */}
              <div style={{ marginTop: 12 }}>
                <div style={pLabel}>STATUS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 6 }}>
                  {statusItems.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.55)', border: `1px solid ${s.color}40`, borderLeft: `3px solid ${s.color}`, borderRadius: 8, padding: '7px 12px', minWidth: 0 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0, boxShadow: `0 0 4px ${s.color}` }} />
                      <span style={{ fontSize: pFs.sectionContent, color: s.value ? '#374151' : 'rgba(0,0,0,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 縦区切り */}
            <div style={{ width: 1, background: 'rgba(255,255,255,0.5)', flexShrink: 0, marginBlock: 16 }} />

            {/* 右カラム: ACTIVITY + INTERACTION */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 24px 16px 16px', overflow: 'hidden' }}>
              {/* ACTIVITY */}
              <div>
                  <div style={pLabel}>ACTIVITY</div>
                  <div style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 8, padding: '10px 12px', marginTop: 6, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {activeDays && activeDays.length === 7 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {['月','火','水','木','金','土','日'].map((d, i) => (
                            <div key={i} style={{ width: 20, height: 20, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: daysMode ? 'rgba(0,0,0,0.08)' : (activeDays[i] ? (i >= 5 ? 'rgba(251,191,36,0.85)' : 'rgba(96,165,250,0.85)') : 'rgba(0,0,0,0.1)'), fontSize: pFs.dayCircle, fontWeight: 700, color: (!daysMode && activeDays[i]) ? '#fff' : 'rgba(0,0,0,0.25)' }}>{d}</div>
                          ))}
                        </div>
                        {daysMode && (
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#60a5fa', background: 'rgba(96,165,250,0.15)', borderRadius: 99, padding: '2px 8px' }}>
                            {'バラバラ'}
                          </div>
                        )}
                      </div>
                    )}
                    {[
                      { label: '平日', start: weekdayStart, end: weekdayEnd, color: '#60a5fa', irregular: weekdayTimesMode === 'irregular' },
                      { label: '休日', start: holidayStart, end: holidayEnd, color: '#f59e0b', irregular: holidayTimesMode === 'irregular' },
                    ].map(({ label, start, end, color, irregular }, idx, arr) => (
                      <div key={label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: pFs.activityLabel, color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>{label}</span>
                          {irregular
                            ? <span style={{ fontSize: pFs.activityTime, fontWeight: 700, color: '#60a5fa', background: 'rgba(96,165,250,0.15)', borderRadius: 99, padding: '1px 8px' }}>バラバラ</span>
                            : <span style={{ fontSize: pFs.activityTime, color: '#6b7280' }}>{start && end ? `${start} – ${end}` : '—'}</span>
                          }
                        </div>
                        <div style={{ position: 'relative' }}>
                          <div style={{ height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden' }}>
                            {!irregular && start && end && timeBarSegments(start, end).map((seg, i) => (
                              <div key={i} style={{ position: 'absolute', top: 0, height: '100%', background: color, left: seg.left, width: seg.width }} />
                            ))}
                          </div>
                          {[6, 12, 18].map(h => (
                            <div key={h} style={{ position: 'absolute', top: 0, left: `${(h / 24) * 100}%`, width: 1, height: 8, background: 'rgba(255,255,255,0.8)', pointerEvents: 'none' }} />
                          ))}
                        </div>
                        {idx === arr.length - 1 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                            {['0', '6', '12', '18', '24'].map(h => (
                              <span key={h} style={{ fontSize: pFs.timeTick, color: 'rgba(0,0,0,0.3)', lineHeight: 1 }}>{h}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              {/* インタラクション */}
              <div>
                <div style={pLabel}>INTERACTION</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginTop: 6 }}>
                  {visibleInteractions.slice(0, 6).map((item, i) => {
                    const label = item.isCustom ? item.label : (okNgLabels[item.label] ?? item.label)
                    const isOk = item.mark === 'OK' || item.mark === '○' || item.mark === '✓' || item.mark === '◎' || item.mark === '◯'
                    const markSymbol = item.mark === '◎' ? '◎' : item.mark === '△' ? '△' : isOk ? '○' : '×'
                    return (
                      <div key={i} style={{ background: item.mark === '△' ? 'rgba(254,243,199,0.85)' : isOk ? 'rgba(220,252,231,0.85)' : 'rgba(254,226,226,0.85)', border: item.mark === '△' ? '1px solid rgba(253,211,77,0.8)' : isOk ? '1px solid rgba(134,239,172,0.8)' : '1px solid rgba(252,165,165,0.8)', borderRadius: 99, padding: '5px 10px', fontSize: pFs.sectionContent, color: item.mark === '△' ? '#92400e' : isOk ? '#15803d' : '#b91c1c', display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden' }}>
                        <span style={{ fontWeight: 700, flexShrink: 0 }}>{markSymbol}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    )
  }

  return (
    /* 背景レイヤー */
    <div
      ref={ref}
      className="vaacard-v2-root"
      style={{
        width: 900,
        height: 506,
        fontFamily,
        background: (isInteractive || noBackground) ? 'transparent' : bg,
        overflow: 'hidden',
        position: 'relative',
        borderRadius: (isInteractive || noBackground) ? 0 : 20,
      }}
    >
      {/* ガラスカード本体 */}
      <div className="vaacard-glass-panel" style={{
        position: 'absolute',
        inset: '20px 24px',
        borderRadius: 16,
        backdropFilter: noBackground ? undefined : 'blur(18px)',
        WebkitBackdropFilter: noBackground ? undefined : 'blur(18px)',
        background: noBackground ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.35)',
        border: '1px solid rgba(255,255,255,0.75)',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '0 28px 0 24px',
        overflow: 'hidden',
      }}>
        {/* 左: 写真 + 名前 + SNS + ギャラリー */}
        <div style={{
          width: 220,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          alignSelf: 'stretch',
          padding: '20px 0',
          justifyContent: 'center',
        }}>
          {/* メイン写真 */}
          <div style={{
            width: 220,
            height: 220,
            flexShrink: 0,
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            background: 'rgba(0,0,0,0.06)',
          }}>
            {(profileImageUrl || profileImageBase64) ? (
              <img
                src={profileImageUrl ?? profileImageBase64!}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="rgba(0,0,0,0.2)">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
            )}
          </div>

          {/* SNS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
              {snsItems.map((sns, i) => {
                const isVrchat = sns.src === '/icon_vrchat.png'
                const frPolicy = isVrchat && friendPolicyLabels && friendPolicy?.[0]
                const href = isInteractive && sns.value ? snsHref(sns.src, sns.value) : null
                const handleClick = isInteractive && !href && sns.value
                  ? () => {
                      navigator.clipboard.writeText(sns.value)
                      window.dispatchEvent(new CustomEvent('vaacard:copied', { detail: `${sns.value} をコピーしました` }))
                    }
                  : undefined
                const boxStyle: React.CSSProperties = {
                    background: 'rgba(255,255,255,0.55)',
                    border: '1px solid rgba(255,255,255,0.85)',
                    borderRadius: 6,
                    padding: '4px 8px',
                    display: 'flex', flexDirection: 'column', gap: 0,
                    cursor: isInteractive ? 'pointer' : 'default',
                    textDecoration: 'none',
                  }
                const inner = (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <img src={sns.src} alt="" style={{ width: 12, height: 12, borderRadius: 3, flexShrink: 0 }} />
                      <span style={{ fontSize: 10, color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>
                        {sns.value || '—'}
                      </span>
                    </div>
                    {isVrchat && (
                      <>
                        <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', margin: '4px 0' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', flexShrink: 0, width: 12, justifyContent: 'center' }}>
                            {frPolicy ? FRIEND_POLICY_ICONS[friendPolicy![0]] : null}
                          </span>
                          <span style={{ fontSize: 7, color: 'rgba(0,0,0,0.3)', fontWeight: 700, flexShrink: 0 }}>フレンド申請</span>
                          <span style={{ fontSize: 8, color: frPolicy ? '#6b7280' : 'rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
                            {frPolicy ? (friendPolicyLabels![friendPolicy![0]] ?? friendPolicy![0]) : '—'}
                          </span>
                        </div>
                      </>
                    )}
                  </>
                )
                return href
                  ? <a key={i} href={href} target="_blank" rel="noopener noreferrer" style={boxStyle} className="vaacard-sns-item">{inner}</a>
                  : <div key={i} style={boxStyle} onClick={handleClick} className={isInteractive ? 'vaacard-sns-item' : ''}>{inner}</div>
              })}
          </div>

          {/* ギャラリーサムネイル */}
          {visibleGallery.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
              {visibleGallery.slice(0, 3).map((src, i) => (
                <div key={i} style={{
                  flex: 1,
                  height: 64,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  background: 'rgba(0,0,0,0.06)',
                }}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 縦区切り */}
        <div style={{ width: 1, alignSelf: 'stretch', margin: '24px 0', background: 'rgba(0,0,0,0.08)', flexShrink: 0 }} />

        {/* 右: コンテンツ */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          overflow: 'hidden',
          padding: '16px 0',
        }}>

        {/* 名前 + Trust Rank */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, overflow: 'hidden' }}>
          <div style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#111827',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '-0.3px',
            flex: 1,
            minWidth: 0,
          }}>
            {name || '名前未設定'}
          </div>
          {trustRank && (() => {
            const color = TRUST_COLORS[trustRank] ?? '#6b7280'
            return (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: `${color}18`, border: `1px solid ${color}60`, borderRadius: 99, padding: '2px 8px', flexShrink: 0 }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill={color}><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                <span style={{ fontSize: 9, color, fontWeight: 700, whiteSpace: 'nowrap' }}>{trustRank}</span>
              </div>
            )
          })()}
        </div>

        {/* PROFILE + Mic 行 */}
        <div style={{ flexShrink: 0 }}>
            <div style={sectionLabel}>PROFILE</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 6px', marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 6, padding: '2px 8px' }}>
                <span style={{ color: '#6b7280', display: 'flex' }}>{gender ? getGenderIcon(gender) : null}</span>
                <span style={{ fontSize: 10, color: gender ? '#1f2937' : 'rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>{gender || '性別 —'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 6, padding: '2px 8px' }}>
                <span style={{ fontSize: 8, color: 'rgba(0,0,0,0.4)', fontWeight: 700, flexShrink: 0 }}>年齢</span>
                <span style={{ fontSize: 10, color: ageDisplay ? '#1f2937' : 'rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>{ageDisplay || '—'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 6, padding: '2px 8px' }}>
                <span style={{ fontSize: 8, color: 'rgba(0,0,0,0.4)', fontWeight: 700, flexShrink: 0 }}>環境</span>
                {(playEnv ?? []).length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {(playEnv ?? []).map((env, i) => (
                      <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#374151' }}>
                        <span style={{ color: '#6b7280', display: 'flex' }}>{ENV_ICONS[env] ?? null}</span>
                        <span style={{ fontSize: 10, whiteSpace: 'nowrap' }}>{env}</span>
                      </span>
                    ))}
                  </div>
                ) : <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.3)' }}>—</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 6, padding: '2px 8px' }}>
                <span style={{ fontSize: 8, color: 'rgba(0,0,0,0.4)', fontWeight: 700, flexShrink: 0 }}>言語</span>
                <span style={{ fontSize: 10, color: (language ?? []).length > 0 ? '#1f2937' : 'rgba(0,0,0,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>{(language ?? []).join(' / ') || '—'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 6, padding: '2px 8px' }}>
                <FiMic size={10} color="rgba(0,0,0,0.4)" style={{ flexShrink: 0 }} />
                <div style={{ width: 120, height: 4, borderRadius: 99, background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${micOnRate ?? 0}%`, borderRadius: 99, background: getMicColor(micOnRate ?? 0) }} />
                </div>
                <span style={{ fontSize: 8, color: micOnRate ? getMicColor(micOnRate) : 'rgba(0,0,0,0.3)', fontWeight: 700, flexShrink: 0 }}>{micOnRate ? `${micOnRate}%` : '—'}</span>
              </div>
            </div>
          </div>

        {/* 区切り */}
        <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', flexShrink: 0 }} />

        {/* 自己紹介 */}
        <div style={{ flexShrink: 0 }}>
            <div style={sectionLabel}>ABOUT</div>
            <div style={{
              background: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.8)',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 10.5,
              color: '#374151',
              lineHeight: 1.7,
              maxHeight: 120,
              overflow: 'hidden',
              wordBreak: 'break-all',
              marginTop: 5,
            }}>
              {selfIntro || '—'}
            </div>
          </div>

        {/* STATUS + ACTIVITY 横並び */}
        <div style={{ display: 'flex', gap: 16, flexShrink: 0, alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div>
                    <div style={sectionLabel}>STATUS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
                      {statusItems.map((s, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          background: 'rgba(255,255,255,0.55)',
                          border: `1px solid ${s.color}40`,
                          borderLeft: `3px solid ${s.color}`,
                          borderRadius: 6,
                          padding: '2px 8px 2px 6px',
                          minWidth: 0,
                        }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0, boxShadow: `0 0 4px ${s.color}` }} />
                          <span style={{ fontSize: 9.5, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {s.value || '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
              </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={sectionLabel}>ACTIVITY</div>
                <div style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 6, padding: '6px 8px', marginTop: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {activeDays && activeDays.length === 7 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: 3 }}>
                      {['月','火','水','木','金','土','日'].map((d, i) => (
                        <div key={i} style={{
                          width: 14, height: 14, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: daysMode ? 'rgba(0,0,0,0.08)' : (activeDays[i]
                            ? (i >= 5 ? 'rgba(251,191,36,0.85)' : 'rgba(96,165,250,0.85)')
                            : 'rgba(0,0,0,0.1)'),
                          fontSize: 7,
                          fontWeight: 700,
                          color: (!daysMode && activeDays[i]) ? '#fff' : 'rgba(0,0,0,0.25)',
                        }}>{d}</div>
                      ))}
                      </div>
                      {daysMode && (
                        <div style={{ fontSize: 8, fontWeight: 700, color: '#60a5fa', background: 'rgba(96,165,250,0.15)', borderRadius: 99, padding: '1px 6px' }}>
                          {'バラバラ'}
                        </div>
                      )}
                    </div>
                  )}
                  {[
                    { label: '平日', start: weekdayStart, end: weekdayEnd, color: '#60a5fa', irregular: weekdayTimesMode === 'irregular' },
                    { label: '休日', start: holidayStart, end: holidayEnd, color: '#f59e0b', irregular: holidayTimesMode === 'irregular' },
                  ].map(({ label, start, end, color, irregular }, idx, arr) => (
                    <div key={label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 8, color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>{label}</span>
                        {irregular
                          ? <span style={{ fontSize: 8, fontWeight: 700, color: '#60a5fa', background: 'rgba(96,165,250,0.15)', borderRadius: 99, padding: '1px 6px' }}>バラバラ</span>
                          : <span style={{ fontSize: 8, color: '#6b7280' }}>{start && end ? `${start} – ${end}` : '—'}</span>
                        }
                      </div>
                      <div style={{ position: 'relative' }}>
                        <div style={{ height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden' }}>
                          {!irregular && start && end && timeBarSegments(start, end).map((seg, i) => (
                            <div key={i} style={{ position: 'absolute', top: 0, height: '100%', background: color, left: seg.left, width: seg.width }} />
                          ))}
                        </div>
                        {[6, 12, 18].map(h => (
                          <div key={h} style={{ position: 'absolute', top: 0, left: `${(h / 24) * 100}%`, width: 1, height: 6, background: 'rgba(255,255,255,0.8)', pointerEvents: 'none' }} />
                        ))}
                      </div>
                      {idx === arr.length - 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                          {['0', '6', '12', '18', '24'].map(h => (
                            <span key={h} style={{ fontSize: 7, color: 'rgba(0,0,0,0.3)', lineHeight: 1 }}>{h}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
            </div>
          </div>

        {/* OK/NG */}
        <div style={{ marginTop: 'auto', flexShrink: 0 }}>
            <div style={sectionLabel}>INTERACTION</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 5 }}>
              {visibleInteractions.slice(0, 9).map((item, i) => {
                const label = item.isCustom ? item.label : (okNgLabels[item.label] ?? item.label)
                const isOk = item.mark === 'OK' || item.mark === '○' || item.mark === '✓' || item.mark === '◎' || item.mark === '◯'
                const markSymbol = item.mark === '◎' ? '◎' : item.mark === '△' ? '△' : isOk ? '○' : '×'
                return (
                  <div key={i} style={{
                    background: item.mark === '△' ? 'rgba(254,243,199,0.85)' : isOk ? 'rgba(220,252,231,0.85)' : 'rgba(254,226,226,0.85)',
                    border: item.mark === '△' ? '1px solid rgba(253,211,77,0.8)' : isOk ? '1px solid rgba(134,239,172,0.8)' : '1px solid rgba(252,165,165,0.8)',
                    borderRadius: 99,
                    padding: '2px 9px',
                    fontSize: 9.5,
                    color: item.mark === '△' ? '#92400e' : isOk ? '#15803d' : '#b91c1c',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}>
                    <span style={{ fontSize: 9, fontWeight: 700 }}>{markSymbol}</span>
                    {label}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default CardV2
