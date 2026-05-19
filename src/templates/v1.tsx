'use client'
import type { CardTemplate } from '@/blocks/types'
import type { SnsValue, StatusValue, BackgroundValue, GalleryValue } from '@/blocks/types'
import type { InteractionItem } from '@/blocks/interactions'
import { nameBlock }         from '@/blocks/name'
import { genderBlock, genderTagBlock } from '@/blocks/gender'
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
import { showBalloonBlock }  from '@/blocks/showBalloon'
import { friendPolicyMultiBlock } from '@/blocks/friendPolicyMulti'
import { galleryBlock }      from '@/blocks/gallery'
import CardV1, { CARD_V1_WIDTH, CARD_V1_HEIGHT, CARD_V1_PORTRAIT_WIDTH, CARD_V1_PORTRAIT_HEIGHT } from '@/components/CardV1'
import { fontMap } from '@/lib/fontMap'

export const v1Template: CardTemplate = {
  id: 'v1',
  title: '自己紹介カード · Standard',
  desc: '環境・マイク率・OK/NGなど情報を詳しく載せるスタンダードなレイアウト',
  badge: '定番',
  badgeColor: 'bg-sky-100 text-sky-500',
  communities: ['VRChat'],
  communitySlug: 'vrchat',
  cardWidth: CARD_V1_WIDTH,
  cardHeight: CARD_V1_HEIGHT,
  portraitWidth: CARD_V1_PORTRAIT_WIDTH,
  portraitHeight: CARD_V1_PORTRAIT_HEIGHT,
  sections: [
    { titleKey: 'カードデザイン',   blockKeys: ['background', 'font', 'showBalloon'], defaultOpen: true },
    { titleKey: 'プロフィール情報', blockKeys: ['name', 'genderTag', 'gender', 'age'] },
    { titleKey: 'SNS・コンタクト', blockKeys: ['sns', 'friendPolicy', 'status', 'interactions'] },
    { titleKey: '自己紹介・画像',   blockKeys: ['selfIntro', 'gallery'] },
    { titleKey: '使用環境・言語',   blockKeys: ['playEnv', 'language', 'micOnRate'] },
  ],
  blocks: [
    backgroundBlock,
    fontBlock,
    showBalloonBlock,
    nameBlock,
    genderTagBlock,
    genderBlock,
    ageBlock,
    playEnvBlock,
    languageBlock,
    micOnRateBlock,
    snsBlock,
    friendPolicyMultiBlock,
    statusBlock,
    selfIntroBlock,
    interactionsBlock,
    galleryBlock,
  ],
  CardRenderer({ values, fontFamily, t, isInteractive, noBackground, orientation }) {
    const sns    = (values.sns    as SnsValue)    ?? { vrchatId: '', twitterId: '', discordId: '' }
    const status = (values.status as StatusValue) ?? { blue: '', green: '', yellow: '', red: '' }
    const bg     = (values.background as BackgroundValue) ?? { type: 'gradient', value: ['#60a5fa', '#a78bfa'] }
    const interactions = (values.interactions as InteractionItem[]) ?? []
    const gallery      = (values.gallery as GalleryValue) ?? { enabled: false, images: [], base64: [] }

    const bgValue = bg.imageFile instanceof File ? (bg.base64 ?? '') : bg.value
    const frLabels = {
      frPolicyAnyone: t.frPolicyAnyone,
      frPolicyAfterGettingToKnow: t.frPolicyAfterGettingToKnow,
      frPolicyIfInterested: t.frPolicyIfInterested,
      frPolicyMutualsOnX: t.frPolicyMutualsOnX,
      frPolicyNo: t.frPolicyNo,
    }

    return (
      <CardV1
        name={values.name as string ?? ''}
        profileImageBase64={values.profileImageBase64 as string | null ?? null}
        profileImageUrl={values.profileImageUrl as string | null ?? null}
        genderTag={values.genderTag as { tag: string; display: string } | string}
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
        friendPolicy={Array.isArray(values.friendPolicy) ? values.friendPolicy as string[] : [values.friendPolicy as string].filter(Boolean)}
        friendPolicyLabels={frLabels}
        interactions={interactions}
        backgroundType={bg.type}
        backgroundValue={bgValue as string | [string, string]}
        backgroundImageBase64={bg.base64 ?? null}
        fontFamily={fontFamily}
        showBalloon={values.showBalloon as boolean ?? true}
        galleryEnabled={gallery.enabled}
        galleryImages={(gallery.base64?.length ? gallery.base64 : gallery.images) as (string | null)[]}
        isInteractive={isInteractive}
        noBackground={noBackground}
        orientation={orientation}
      />
    )
  },
  PreviewCard() {
    return (
      <CardV1
        name="vaacard User"
        profileImageBase64={null}
        genderTag="male"
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
          { label: 'touch', mark: '○', isCustom: false },
          { label: 'closeRange', mark: '◎', isCustom: false },
          { label: 'romantic', mark: '×', isCustom: false },
          { label: 'weapons', mark: '○', isCustom: false },
          { label: 'abuseViolence', mark: '×', isCustom: false },
          { label: 'dirtyJokes', mark: '×', isCustom: false },
        ]}
        backgroundType="gradient"
        backgroundValue={['#60a5fa', '#a78bfa']}
        backgroundImageBase64={null}
        fontFamily={fontMap.rounded.style.fontFamily}
        showBalloon={true}
        galleryEnabled={false}
      />
    )
  },
}

export { CARD_V1_WIDTH, CARD_V1_HEIGHT }
