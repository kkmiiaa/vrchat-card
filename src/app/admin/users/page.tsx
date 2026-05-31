import { createAdminClient } from '@/lib/supabase/server'
import UsersClient from './UsersClient'

export default async function AdminUsersPage() {
  const supabase = createAdminClient()

  // users テーブルと auth.users を結合してメールアドレスを取得
  const { data: users } = await supabase
    .from('users')
    .select('id, username_slug, plan, plan_expires_at, role, created_at')
    .order('created_at', { ascending: false })

  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const emailMap = Object.fromEntries(
    (authUsers?.users ?? []).map(u => [u.id, u.email])
  )

  const merged = (users ?? []).map(u => ({
    ...u,
    email: emailMap[u.id] ?? null,
  }))

  return <UsersClient users={merged} />
}
