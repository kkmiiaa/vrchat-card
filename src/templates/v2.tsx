'use client'
import type { CardTemplate } from '@/blocks/types'
import { nameBlock }         from '@/blocks/name'
import { genderBlock }       from '@/blocks/gender'
import { playEnvBlock }      from '@/blocks/playEnv'
import { languageBlock }     from '@/blocks/language'
import { micOnRateBlock }    from '@/blocks/micOnRate'
import { snsBlock }          from '@/blocks/sns'
import { statusBlock }       from '@/blocks/status'
import { selfIntroBlock }    from '@/blocks/selfIntro'
import { interactionsBlock } from '@/blocks/interactions'
import { backgroundBlock }   from '@/blocks/background'
import { fontBlock }         from '@/blocks/font'
import { ageBlock }          from '@/blocks/age'
import { trustRankBlock }    from '@/blocks/trustRank'
import { activityBlock }     from '@/blocks/activity'
import { friendPolicyBlock } from '@/blocks/friendPolicy'
import { galleryBlock }      from '@/blocks/gallery'
import CardV2 from '@/components/CardV2'
import { fontMap } from '@/lib/fontMap'
import type { SnsValue, StatusValue, AgeValue, ActivityValue, GalleryValue, BackgroundValue } from '@/blocks/types'
import type { InteractionItem } from '@/blocks/interactions'
import { translations } from '@/utils/translations'

const jaDefaults = translations.ja.okNgDefaults

export const v2Template: CardTemplate = {
  id: 'v2',
  title: '自己紹介カード · Glass',
  desc: 'アバター写真を大きく見せる、ビジュアル重視のレイアウト',
  badge: 'NEW',
  badgeColor: 'bg-[#00AADB] text-white',
  communities: ['VRChat'],
  cardWidth: 900,
  cardHeight: 506,
  portraitWidth: 900,
  portraitHeight: 1125,
  sections: [
    { titleKey: 'カードデザイン',   blockKeys: ['background', 'font'],                              defaultOpen: true },
    { titleKey: 'プロフィール情報', blockKeys: ['name', 'gender', 'age', 'trustRank'] },
    { titleKey: 'SNS・コンタクト', blockKeys: ['sns', 'friendPolicy', 'status', 'interactions'] },
    { titleKey: '自己紹介・画像',   blockKeys: ['selfIntro', 'gallery'] },
    { titleKey: '使用環境・言語',   blockKeys: ['playEnv', 'language', 'micOnRate', 'activity'] },
  ],
  blocks: [
    backgroundBlock,
    fontBlock,
    nameBlock,
    genderBlock,
    ageBlock,
    trustRankBlock,
    playEnvBlock,
    languageBlock,
    micOnRateBlock,
    snsBlock,
    friendPolicyBlock,
    statusBlock,
    activityBlock,
    selfIntroBlock,
    galleryBlock,
    interactionsBlock,
  ],
  CardRenderer({ values, fontFamily, t, isInteractive, noBackground, orientation }) {
    const sns        = (values.sns        as SnsValue)        ?? { vrchatId: '', twitterId: '', discordId: '' }
    const status     = (values.status     as StatusValue)     ?? { blue: '', green: '', yellow: '', red: '' }
    const age        = (values.age        as AgeValue)        ?? { mode: '', display: '' }
    const activity   = (values.activity   as ActivityValue)   ?? { days: [true,true,true,true,true,false,false], weekdayStart:'', weekdayEnd:'', holidayStart:'', holidayEnd:'' }
    const bg         = (values.background as BackgroundValue) ?? { type: 'image', value: '/backgrounds/bg_1.webp' }
    const interactions = (values.interactions as InteractionItem[]) ?? []
    const gallery    = (values.gallery as GalleryValue) ?? { enabled: false, images: [], base64: [] }

    const bgValue = bg.imageFile instanceof File
      ? (bg.base64 ?? '')
      : bg.value

    return (
      <CardV2
        name={values.name as string ?? ''}
        profileImageBase64={values.profileImageBase64 as string | null ?? null}
        profileImageUrl={values.profileImageUrl as string | null ?? null}
        gender={values.gender as string}
        language={values.language as string[]}
        playEnv={values.playEnv as string[]}
        micOnRate={values.micOnRate as number}
        selfIntro={values.selfIntro as string}
        vrchatId={sns.vrchatId}
        twitterId={sns.twitterId}
        discordId={sns.discordId}
        statusBlue={status.blue}
        statusGreen={status.green}
        statusYellow={status.yellow}
        statusRed={status.red}
        interactions={interactions}
        backgroundType={bg.type}
        backgroundValue={bgValue as string | [string, string]}
        backgroundImageBase64={bg.base64 ?? null}
        fontFamily={fontFamily}
        okNgLabels={jaDefaults}
        trustRank={values.trustRank as string}
        ageDisplay={age.display || age.mode}
        activeDays={activity.days}
        weekdayStart={activity.weekdayStart}
        weekdayEnd={activity.weekdayEnd}
        holidayStart={activity.holidayStart}
        holidayEnd={activity.holidayEnd}
        friendPolicy={Array.isArray(values.friendPolicy) ? values.friendPolicy.filter(Boolean) : [values.friendPolicy as string].filter(Boolean)}
        friendPolicyLabels={{
          frPolicyAnyone: t.frPolicyAnyone,
          frPolicyAfterGettingToKnow: t.frPolicyAfterGettingToKnow,
          frPolicyIfInterested: t.frPolicyIfInterested,
          frPolicyMutualsOnX: t.frPolicyMutualsOnX,
          frPolicyNo: t.frPolicyNo,
        }}
        galleryImages={gallery.enabled ? gallery.base64 : []}
        isInteractive={isInteractive}
        noBackground={noBackground}
        orientation={orientation}
      />
    )
  },
  PreviewCard() {
    return (
      <CardV2
        name="vaacard User"
        profileImageBase64={null}
        gender="男性"
        language={['日本語', 'English']}
        playEnv={['PCVR', 'Quest']}
        micOnRate={80}
        selfIntro="はじめまして！VRChatで活動しています。気軽に声かけてください🎉"
        vrchatId="vaacarduser"
        twitterId=""
        discordId=""
        statusBlue="ワールド探索中"
        statusGreen="いつでも歓迎"
        statusYellow="取り込み中"
        statusRed="応答できません"
        interactions={[
          { label: '挨拶', mark: '◎', isCustom: false },
          { label: 'ボイチャ', mark: '○', isCustom: false },
          { label: 'インスタンス誘い', mark: '○', isCustom: false },
        ]}
        backgroundType="image"
        backgroundValue="/backgrounds/bg_1.webp"
        backgroundImageBase64={null}
        fontFamily={fontMap.rounded.style.fontFamily}
        okNgLabels={{}}
        trustRank="Trusted User"
        ageDisplay="20代"
        activeDays={[true, true, true, true, true, false, false]}
        weekdayStart="21:00"
        weekdayEnd="24:00"
        holidayStart="14:00"
        holidayEnd="24:00"
        friendPolicy={['frPolicyAfterGettingToKnow']}
      />
    )
  },
}
