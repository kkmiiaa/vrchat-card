import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchTemplateLayout } from '@/lib/templateLayout'
import VrchatCardEditorClient from './VrchatCardEditorClient'

export const metadata: Metadata = {
  title: 'VRChat 自己紹介カードメーカー | vaacard',
  description: 'ログイン不要で使えるVRChat向け自己紹介カードメーカー。作ったカードを画像で保存・Xでシェアできます。',
}

export default async function VrchatCardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // ログイン済み: V1 カードを created_at 昇順で取得
    const { data: v1Cards } = await supabase
      .from('cards')
      .select('id')
      .eq('user_id', user.id)
      .eq('template_id', 'vrchat-simple')
      .order('created_at', { ascending: true })
      .limit(1)

    if (v1Cards && v1Cards.length > 0) {
      redirect(`/card/${v1Cards[0].id}/edit`)
    } else {
      redirect('/card/new')
    }
  }

  const templateDbRow = await fetchTemplateLayout('vrchat-simple')
  return <VrchatCardEditorClient templateDbRow={templateDbRow} />
}
