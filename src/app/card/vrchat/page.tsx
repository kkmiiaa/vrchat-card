import type { Metadata } from 'next'
import { Suspense } from 'react'
import CardEditor from '@/components/CardEditor'
import { v1Template } from '@/templates/v1'

export const metadata: Metadata = {
  title: 'VRChat 自己紹介カードメーカー | vaacard',
  description: 'ログイン不要で使えるVRChat向け自己紹介カードメーカー。作ったカードを画像で保存・Xでシェアできます。',
}

export default function VrchatCardPage() {
  return (
    <Suspense>
      <CardEditor template={v1Template} />
    </Suspense>
  )
}
