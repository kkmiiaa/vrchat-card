import type { Metadata } from 'next'
import { Suspense } from 'react'
import CardEditor from '@/components/CardEditor'
import { buildCardTemplateFromDefinition } from '@/lib/buildCardTemplate'
import { cardV1Definition } from '@/templates/v1Definition'

export const metadata: Metadata = {
  title: 'VRChat 自己紹介カードメーカー | vaacard',
  description: 'ログイン不要で使えるVRChat向け自己紹介カードメーカー。作ったカードを画像で保存・Xでシェアできます。',
}

// DB fetch なし・静的に構築（既存ユーザーへの影響を最小化）
const { template: v1Template } = buildCardTemplateFromDefinition(cardV1Definition, null)

export default function VrchatCardPage() {
  return (
    <Suspense>
      <CardEditor template={v1Template} />
    </Suspense>
  )
}
