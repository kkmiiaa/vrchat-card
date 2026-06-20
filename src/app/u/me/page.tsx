import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/** ログイン済みユーザー自身のマイページへリダイレクト */
export default async function MePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data } = await supabase
    .from('users')
    .select('username_slug')
    .eq('id', user.id)
    .single()

  if (data?.username_slug) {
    redirect(`/u/${data.username_slug}`)
  }

  // slug 未設定 → マイページを仮表示（slug 設定を促す）
  redirect('/onboarding')
}
