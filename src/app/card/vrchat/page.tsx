import type { Metadata } from 'next'
import { fetchTemplateLayout } from '@/lib/templateLayout'
import VrchatCardEditorClient from './VrchatCardEditorClient'

export const metadata: Metadata = {
  title: 'VRChat 自己紹介カードメーカー | vaacard',
  description: 'ログイン不要で使えるVRChat向け自己紹介カードメーカー。作ったカードを画像で保存・Xでシェアできます。',
}

export default async function VrchatCardPage() {
  const templateDbRow = await fetchTemplateLayout('v1')
  return <VrchatCardEditorClient templateDbRow={templateDbRow} />
}
