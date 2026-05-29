'use client'

import React, { forwardRef } from 'react'
import { PiGenderMaleBold, PiGenderFemaleBold, PiGenderIntersexBold } from 'react-icons/pi'
import { getBackgroundStyle, CARD_BG_FALLBACK } from '@/utils/backgroundUtils'
const GENDER_TAG_LABELS: Record<string, string> = {
  male: '男性',
  female: '女性',
  nonbinary: 'ノンバイナリ',
}

function GenderIcon({ tag, size = 13 }: { tag?: string; size?: number }) {
  if (tag === 'male')      return <PiGenderMaleBold size={size} />
  if (tag === 'female')    return <PiGenderFemaleBold size={size} />
  if (tag === 'nonbinary') return <PiGenderIntersexBold size={size} />
  return null
}

type Interaction = {
  label: string
  mark: string
  isCustom?: boolean
}

type Props = {
  name: string
  profileImageBase64: string | null
  profileImageUrl?: string | null
  genderTag?: { tag: string; display: string } | string
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
  friendPolicy?: string[]
  interactions: Interaction[]
  backgroundType?: 'color' | 'gradient' | 'image'
  backgroundValue?: string | [string, string]
  backgroundImageBase64?: string | null
  galleryEnabled?: boolean
  galleryImagesBase64?: (string | null)[]
  galleryImages?: (string | null)[]
  fontFamily: string
  showBalloon?: boolean
  lang?: 'ja' | 'en'
  okNgLabels?: Record<string, string>
  friendPolicyLabels?: Record<string, string>
  isInteractive?: boolean
  noBackground?: boolean
  orientation?: 'landscape' | 'portrait'
}

import { CARD_LANDSCAPE_WIDTH, CARD_LANDSCAPE_HEIGHT } from '@/lib/cardDimensions'
export const CARD_V1_WIDTH  = CARD_LANDSCAPE_WIDTH
export const CARD_V1_HEIGHT = CARD_LANDSCAPE_HEIGHT
export const CARD_V1_PORTRAIT_WIDTH  = 900
export const CARD_V1_PORTRAIT_HEIGHT = 1125

const W = CARD_V1_WIDTH
const H = CARD_V1_HEIGHT

const JA = {
  name: '名前', sub_name: 'name',
  gender: '性別', sub_gender: 'gender',
  env: '環境', sub_env: 'env',
  lang: '言語', sub_lang: 'languages spoken',
  mic: 'マイクON率', sub_mic: 'microphone usage',
  status: 'ステータス', sub_status: 'status description',
  friend: 'フレンド申請', sub_friend: 'friend request policy',
  okng: 'OKなこと・NGなこと', sub_okng: 'my boundaries',
  about: '自己紹介', sub_about: 'about me',
  frPolicyAnyone: 'だれでもOK',
  frPolicyAfterGettingToKnow: '仲良くなってから許可',
  frPolicyIfInterested: '気になったら許可',
  frPolicyMutualsOnX: 'Twitter相互は申請OK',
  frPolicyNo: '送らないでください',
  defaults: { touch: '触る', closeRange: '近距離', romantic: 'お砂糖', weapons: '武器', abuseViolence: '暴言/暴力', dirtyJokes: '下ネタ' },
} as const

const EN = {
  name: 'Name', sub_name: 'on vrchat',
  gender: 'Pron.', sub_gender: 'gender',
  env: 'Env', sub_env: 'env',
  lang: 'Languages', sub_lang: 'languages spoken',
  mic: 'Mic Usage Rate', sub_mic: 'microphone usage',
  status: 'Status', sub_status: 'status description',
  friend: 'Friend Request', sub_friend: 'friend request policy',
  okng: 'OK & NG', sub_okng: 'my boundaries',
  about: 'About Me', sub_about: 'about me',
  frPolicyAnyone: 'Anyone is welcome',
  frPolicyAfterGettingToKnow: 'Accept after getting to know',
  frPolicyIfInterested: 'Accept if interested',
  frPolicyMutualsOnX: 'Mutuals on X are welcome',
  frPolicyNo: 'Please do not send',
  defaults: { touch: 'Touch', closeRange: 'Close range', romantic: 'Romantic RP', weapons: 'Weapons', abuseViolence: 'Abuse/Violence', dirtyJokes: 'Dirty jokes' },
} as const

function getBg(type?: string, value?: string | [string, string], base64?: string | null): string {
  return getBackgroundStyle(type, value, base64, CARD_BG_FALLBACK) as string
}

function isOkMark(m: string) {
  return m === '◎' || m === '◯' || m === '○' || m === 'OK' || m === '✓'
}
function markBg(m: string) {
  if (isOkMark(m)) return 'rgba(220,252,231,0.95)'
  if (m === '△') return 'rgba(254,243,199,0.95)'
  if (m === '✗' || m === '×') return 'rgba(254,226,226,0.95)'
  return 'rgba(243,244,246,0.95)'
}
function markFg(m: string) {
  if (isOkMark(m)) return '#15803d'
  if (m === '△') return '#92400e'
  if (m === '✗' || m === '×') return '#b91c1c'
  return '#6b7280'
}

const box = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: 'rgba(255,255,255,0.85)',
  borderRadius: W * 0.006,
  padding: `${H * 0.007}px ${W * 0.008}px`,
  ...extra,
})

function LabelRow({ title, sub, fontFamily, large }: { title: string; sub: string; fontFamily: string; large?: boolean }) {
  const titleFs = large ? 16 : W * 0.011
  const subFs   = large ? 13 : W * 0.008
  const mb      = large ? 4  : H * 0.005
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: W * 0.004, marginBottom: mb }}>
      <span style={{ fontSize: titleFs, fontWeight: 700, color: '#1f2937', fontFamily }}>{title}</span>
      <span style={{ fontSize: subFs, color: '#9ca3af', fontFamily }}>{sub}</span>
    </div>
  )
}

const STATUS_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#ef4444']

function resolveGenderTag(g: { tag: string; display: string } | string | undefined): { tag: string; display: string } {
  if (!g) return { tag: 'none', display: '' }
  if (typeof g === 'string') return { tag: g, display: '' }
  return g
}

const CardV1 = forwardRef<HTMLDivElement, Props>(function CardV1(
  {
    name, profileImageBase64, profileImageUrl, genderTag: genderTagRaw, gender, language, playEnv, micOnRate = 0,
    selfIntro, vrchatId, twitterId, discordId,
    statusBlue, statusGreen, statusYellow, statusRed,
    friendPolicy, interactions,
    backgroundType, backgroundValue, backgroundImageBase64,
    galleryEnabled, galleryImagesBase64, galleryImages,
    fontFamily, showBalloon = true, lang = 'ja',
    okNgLabels, friendPolicyLabels, isInteractive, noBackground, orientation,
  },
  ref
) {
  const L = lang === 'en' ? EN : JA
  const genderTag = resolveGenderTag(genderTagRaw)
  const genderDisplay = genderTag.display || (genderTag.tag !== 'none' ? GENDER_TAG_LABELS[genderTag.tag] ?? '' : '—')

  const frLabels: Record<string, string> = friendPolicyLabels ?? {
    frPolicyAnyone: L.frPolicyAnyone,
    frPolicyAfterGettingToKnow: L.frPolicyAfterGettingToKnow,
    frPolicyIfInterested: L.frPolicyIfInterested,
    frPolicyMutualsOnX: L.frPolicyMutualsOnX,
    frPolicyNo: L.frPolicyNo,
  }

  const iLabel = (item: Interaction) => {
    if (item.isCustom) return item.label
    return okNgLabels?.[item.label] ?? (L.defaults as Record<string, string>)[item.label] ?? item.label
  }

  const fs = W * 0.010

  // ── Portrait layout ──
  if (orientation === 'portrait') {
    const PW = CARD_V1_PORTRAIT_WIDTH
    const PH = CARD_V1_PORTRAIT_HEIGHT
    const pBox = (extra?: React.CSSProperties): React.CSSProperties => ({
      background: 'rgba(255,255,255,0.85)',
      borderRadius: PW * 0.006,
      padding: `${H * 0.016}px ${PW * 0.016}px`,
      ...extra,
    })
    const pFs = 15
    const divider = <div style={{ height: 1, background: 'rgba(200,220,240,0.7)', margin: '20px 0' }} />

    const imgSrc = profileImageUrl ?? profileImageBase64 ?? null

    const snsRows = [
      { icon: '/icon_vrchat.png', value: vrchatId, href: null },
      { icon: '/icon_x.png',     value: twitterId, href: twitterId ? `https://x.com/${twitterId.replace(/^@/, '')}` : null },
      { icon: '/icon_discord.png', value: discordId, href: null },
    ]

    const statuses = [statusBlue, statusGreen, statusYellow, statusRed] as string[]

    const galleryImgSrcs = (galleryImages ?? galleryImagesBase64 ?? [null, null, null]).slice(0, 3)

    return (
      <div
        ref={ref}
        style={{
          width: PW, height: PH, position: 'relative', overflow: 'hidden', fontFamily,
          background: (isInteractive || noBackground) ? 'transparent' : getBg(backgroundType, backgroundValue, backgroundImageBase64),
        }}
      >
        {/* balloon panel */}
        <div className="vaacard-glass-panel" style={{
          position: 'absolute', left: 20, top: 20,
          width: PW - 40, height: PH - 40,
          borderRadius: 20,
        }}>
          {showBalloon && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(255,255,255,0.82)',
              borderRadius: 20,
              border: '2px solid rgba(200,220,240,0.7)',
            }} />
          )}

          {/* content */}
          <div style={{
            position: 'absolute', inset: 0,
            padding: `${H * 0.050}px ${PW * 0.030}px`,
            display: 'flex', flexDirection: 'column', gap: 0,
            overflowY: 'hidden',
          }}>
            {/* ── Header: image + name/gender/env/SNS ── */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexShrink: 0 }}>
              <div style={{ width: 350, height: 350, borderRadius: 14, overflow: 'hidden', background: '#e5e7eb', flexShrink: 0 }}>
                {imgSrc && <img src={imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {/* name */}
                <div>
                  <LabelRow title={L.name} sub={L.sub_name} fontFamily={fontFamily} large />
                  <div style={pBox({ padding: '10px 14px' })}>
                    <div style={{ fontSize: 30, fontWeight: 700, color: '#1f2937', fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name || '—'}</div>
                  </div>
                </div>
                {/* gender + env */}
                <div style={{ display: 'flex', gap: 5, marginTop: 10 }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <LabelRow title={L.gender} sub={L.sub_gender} fontFamily={fontFamily} large />
                    <div style={pBox()}>
                      <div style={{ fontSize: pFs, color: '#1f2937', fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <GenderIcon tag={genderTag.tag} size={pFs} />
                        {gender || genderDisplay}
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
                    <LabelRow title={L.env} sub={L.sub_env} fontFamily={fontFamily} large />
                    <div style={pBox()}>
                      <div style={{ fontSize: pFs, color: '#1f2937', fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(playEnv ?? []).join(' / ') || '—'}</div>
                    </div>
                  </div>
                </div>
                {/* SNS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10 }}>
                  {snsRows.map(({ icon, value, href }, i) => {
                    const content = (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <img src={icon} alt="" style={{ width: 16, height: 16, borderRadius: 3, objectFit: 'contain', flexShrink: 0 }} />
                        <div style={pBox({ flex: 1, cursor: isInteractive && value ? 'pointer' : 'default' })}>
                          <div style={{ fontSize: 14, color: '#374151', fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || '—'}</div>
                        </div>
                      </div>
                    )
                    if (!isInteractive || !value) return <div key={i}>{content}</div>
                    if (href) return <a key={i} href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }} className="vaacard-sns-item">{content}</a>
                    return <div key={i} style={{ cursor: 'pointer' }} className="vaacard-sns-item" onClick={() => { navigator.clipboard.writeText(value); window.dispatchEvent(new CustomEvent('vaacard:copied', { detail: `${value} をコピーしました` })) }}>{content}</div>
                  })}
                </div>
              </div>
            </div>

            {divider}

            {/* ── 2-column body (50/50) ── */}
            <div style={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden', minHeight: 0 }}>

              {/* Left column: 言語 / マイクON率 / ステータス / フレンド申請 / OKなこと・NGなこと */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden', paddingRight: 20 }}>

                {/* 言語 */}
                <div style={{ flexShrink: 0 }}>
                  <LabelRow title={L.lang} sub={L.sub_lang} fontFamily={fontFamily} large />
                  <div style={pBox()}>
                    <div style={{ fontSize: pFs, color: '#1f2937', fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(language ?? []).join(' / ') || '—'}</div>
                  </div>
                </div>

                {/* マイクON率 */}
                <div style={{ flexShrink: 0 }}>
                  <LabelRow title={L.mic} sub={L.sub_mic} fontFamily={fontFamily} large />
                  <div style={pBox({ display: 'flex', alignItems: 'center', gap: 6 })}>
                    <div style={{ flex: 1, height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${micOnRate}%`, background: 'linear-gradient(to right, #60a5fa, #a78bfa)', borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: pFs, color: '#374151', fontFamily, flexShrink: 0, minWidth: 32, textAlign: 'right' }}>{micOnRate}%</div>
                  </div>
                </div>

                {/* ステータス */}
                <div style={{ flexShrink: 0 }}>
                  <LabelRow title={L.status} sub={L.sub_status} fontFamily={fontFamily} large />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {statuses.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 9, height: 9, borderRadius: '50%', background: STATUS_COLORS[i], flexShrink: 0 }} />
                        <div style={pBox({ flex: 1 })}>
                          <div style={{ fontSize: 13, color: '#374151', fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s || '—'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* フレンド申請 */}
                <div style={{ flexShrink: 0 }}>
                  <LabelRow title={L.friend} sub={L.sub_friend} fontFamily={fontFamily} large />
                  <div style={pBox()}>
                    <div style={{ fontSize: 14, color: '#1f2937', fontFamily, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '3em' }}>
                      {(friendPolicy ?? []).map(k => frLabels[k] ?? k).join(' / ') || '—'}
                    </div>
                  </div>
                </div>

                {/* OKなこと・NGなこと */}
                <div style={{ flexShrink: 0 }}>
                  <LabelRow title={L.okng} sub={L.sub_okng} fontFamily={fontFamily} large />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                    {interactions.slice(0, 9).map((item, i) => (
                      <div key={i} style={{
                        background: markBg(item.mark), borderRadius: PW * 0.006,
                        padding: '5px 4px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                      }}>
                        <div style={{ fontSize: 12, color: '#6b7280', fontFamily, textAlign: 'center', wordBreak: 'break-all', lineHeight: 1.2 }}>{iLabel(item)}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: markFg(item.mark), fontFamily }}>{item.mark}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right column: 自己紹介 / ギャラリー */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden', borderLeft: '1px solid rgba(200,220,240,0.7)', paddingLeft: 20 }}>

                {/* 自己紹介 */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <LabelRow title={L.about} sub={L.sub_about} fontFamily={fontFamily} large />
                  <div style={pBox({ flex: 1, overflow: 'hidden' })}>
                    <div style={{ fontSize: 15, color: '#374151', fontFamily, lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-all', overflow: 'hidden', height: '100%' }}>
                      {selfIntro || ''}
                    </div>
                  </div>
                </div>

                {/* ギャラリー */}
                {galleryEnabled && (
                  <div style={{ flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {galleryImgSrcs.map((src, i) => (
                        <div key={i} style={{ flex: 1, aspectRatio: '1', borderRadius: 8, overflow: 'hidden', background: '#e5e7eb' }}>
                          {src && <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Landscape layout ──
  // カラム内パディング・ギャップ
  const PAD_X = W * 0.030   // 左右外余白
  const PAD_Y = H * 0.050   // 上下外余白
  const COL_GAP = W * 0.022 // カラム間ギャップ
  const ROW_GAP = H * 0.022 // セクション間ギャップ

  const colLeftW  = W * 0.195
  const colMidW   = W * 0.300
  // colRight = 残り

  return (
    <div
      ref={ref}
      style={{ width: W, height: H, position: 'relative', overflow: 'hidden', fontFamily,
        background: (isInteractive || noBackground) ? 'transparent' : getBg(backgroundType, backgroundValue, backgroundImageBase64) }}
    >
      {/* バルーン＋コンテンツ まとめてホバー対象 */}
      <div className="vaacard-glass-panel" style={{
        position: 'absolute',
        left: 20, top: 20,
        width: W - 40, height: H - 40,
        borderRadius: W * 0.025,
      }}>
        {/* バルーン背景 */}
        {showBalloon && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,255,255,0.82)',
            borderRadius: W * 0.025,
            border: '2px solid rgba(200,220,240,0.7)',
          }} />
        )}

        {/* ３カラムレイアウト */}
        <div style={{
          position: 'absolute',
          left: PAD_X, top: PAD_Y,
          width:  (W - 40) - PAD_X * 2,
          height: (H - 40) - PAD_Y * 2,
          display: 'flex',
          gap: COL_GAP,
        }}>

        {/* ── 左カラム ── */}
        <div style={{ width: colLeftW, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: ROW_GAP }}>

          {/* プロフィール画像 */}
          <div style={{
            width: '100%', aspectRatio: '1',
            borderRadius: W * 0.018, overflow: 'hidden',
            background: '#e5e7eb', flexShrink: 0,
          }}>
            {(profileImageUrl || profileImageBase64) && (
              <img src={profileImageUrl ?? profileImageBase64!} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>

          {/* 言語 */}
          <div>
            <LabelRow title={L.lang} sub={L.sub_lang} fontFamily={fontFamily} />
            <div style={box()}>
              <div style={{ fontSize: fs, color: '#1f2937', fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {(language ?? []).join(' / ') || '—'}
              </div>
            </div>
          </div>

          {/* マイクON率 */}
          <div>
            <LabelRow title={L.mic} sub={L.sub_mic} fontFamily={fontFamily} />
            <div style={{ display: 'flex', alignItems: 'center', gap: W * 0.002 }}>
              <div style={{ flex: 1, height: H * 0.022, background: '#e5e7eb', borderRadius: W * 0.010, overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${micOnRate}%`, background: 'linear-gradient(to right, #60a5fa, #a78bfa)', borderRadius: W * 0.010 }} />
              </div>
              <div style={{ fontSize: fs, color: '#374151', fontFamily, flexShrink: 0, minWidth: W * 0.030, textAlign: 'right' }}>{micOnRate}%</div>
            </div>
          </div>

          {/* ステータス（下に押し出す） */}
          <div style={{ marginTop: 'auto' }}>
            <LabelRow title={L.status} sub={L.sub_status} fontFamily={fontFamily} />
            {([statusBlue, statusGreen, statusYellow, statusRed] as string[]).map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: W * 0.006, marginBottom: H * 0.008 }}>
                <div style={{ width: W * 0.010, height: W * 0.010, borderRadius: '50%', background: STATUS_COLORS[i], flexShrink: 0 }} />
                <div style={box({ flex: 1, padding: `${H * 0.010}px ${W * 0.007}px` })}>
                  <div style={{ fontSize: W * 0.009, color: '#374151', fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 中央カラム ── */}
        <div style={{ width: colMidW, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: ROW_GAP, height: '100%' }}>

          {/* 名前 */}
          <div>
            <LabelRow title={L.name} sub={L.sub_name} fontFamily={fontFamily} />
            <div style={box()}>
              <div style={{ fontSize: W * 0.019, fontWeight: 700, color: '#1f2937', fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {name || '—'}
              </div>
            </div>
          </div>

          {/* 性別・環境（横並び） */}
          <div style={{ display: 'flex', gap: W * 0.015 }}>
            <div style={{ flex: 1 }}>
              <LabelRow title={L.gender} sub={L.sub_gender} fontFamily={fontFamily} />
              <div style={box()}>
                <div style={{ fontSize: fs, color: '#1f2937', fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <GenderIcon tag={genderTag.tag} size={fs} />
                  {gender || genderDisplay}
                </div>
              </div>
            </div>
            <div style={{ flex: 2 }}>
              <LabelRow title={L.env} sub={L.sub_env} fontFamily={fontFamily} />
              <div style={box()}>
                <div style={{ fontSize: fs, color: '#1f2937', fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {(playEnv ?? []).join(' / ') || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* SNS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: H * 0.012 }}>
            {[
              { icon: '/icon_vrchat.png', value: vrchatId, href: null },
              { icon: '/icon_x.png',     value: twitterId, href: twitterId ? `https://x.com/${twitterId.replace(/^@/, '')}` : null },
              { icon: '/icon_discord.png', value: discordId, href: null },
            ].map(({ icon, value, href }, i) => {
              const content = (
                <div style={{ display: 'flex', alignItems: 'center', gap: W * 0.008 }}>
                  <img src={icon} alt="" style={{ width: W * 0.022, height: W * 0.022, borderRadius: W * 0.003, objectFit: 'contain', flexShrink: 0 }} />
                  <div style={box({ flex: 1, minHeight: H * 0.045, cursor: isInteractive && value ? 'pointer' : 'default' })}>
                    <div style={{ fontSize: fs, color: '#374151', fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || '—'}</div>
                  </div>
                </div>
              )
              if (!isInteractive || !value) return <div key={i}>{content}</div>
              if (href) return <a key={i} href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }} className="vaacard-sns-item">{content}</a>
              return <div key={i} style={{ cursor: 'pointer' }} className="vaacard-sns-item" onClick={() => { navigator.clipboard.writeText(value); window.dispatchEvent(new CustomEvent('vaacard:copied', { detail: `${value} をコピーしました` })) }}>{content}</div>
            })}
          </div>

          {/* フレンド申請（残りスペースを埋める） */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <LabelRow title={L.friend} sub={L.sub_friend} fontFamily={fontFamily} />
            <div style={box({ flex: 1 })}>
              <div style={{ fontSize: W * 0.009, color: '#1f2937', fontFamily, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '3em', wordBreak: 'break-all' }}>
                {(friendPolicy ?? []).map(k => frLabels[k] ?? k).join(' / ') || '—'}
              </div>
            </div>
          </div>

          {/* OKなこと・NGなこと（最大3行=9アイテム） */}
          <div>
            <LabelRow title={L.okng} sub={L.sub_okng} fontFamily={fontFamily} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: W * 0.006 }}>
              {interactions.slice(0, 9).map((item, i) => (
                <div key={i} style={{
                  background: markBg(item.mark), borderRadius: W * 0.004,
                  padding: `${H * 0.008}px ${W * 0.004}px`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: H * 0.003,
                }}>
                  <div style={{ fontSize: W * 0.008, color: '#6b7280', fontFamily, textAlign: 'center', wordBreak: 'break-all', lineHeight: 1.2 }}>
                    {iLabel(item)}
                  </div>
                  <div style={{ fontSize: W * 0.012, fontWeight: 700, color: markFg(item.mark), fontFamily }}>{item.mark}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 右カラム ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: ROW_GAP }}>

          {/* 自己紹介 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <LabelRow title={L.about} sub={L.sub_about} fontFamily={fontFamily} />
            <div style={box({ flex: 1, overflow: 'hidden' })}>
              <div style={{ fontSize: W * 0.011, color: '#374151', fontFamily, lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {selfIntro || ''}
              </div>
            </div>
          </div>

          {/* ギャラリー */}
          {galleryEnabled && (
            <div style={{ display: 'flex', gap: W * 0.008, flexShrink: 0 }}>
              {(galleryImages ?? galleryImagesBase64 ?? [null, null, null]).slice(0, 3).map((src, i) => (
                <div key={i} style={{ flex: 1, aspectRatio: '1', borderRadius: W * 0.008, overflow: 'hidden', background: '#e5e7eb' }}>
                  {src && <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        </div>
      </div>
    </div>
  )
})

export default CardV1
