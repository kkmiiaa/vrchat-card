import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export type SystemNotification = {
  id: string
  title: string
  body: string
  created_at: string
  read: boolean
}

export type UserNotification = {
  id: string
  type: 'like'
  card_id: string | null
  read_at: string | null
  created_at: string
  from_profile: { display_name: string | null; avatar_url: string | null } | null
}

export type NotificationsResponse = {
  system: SystemNotification[]
  activity: UserNotification[]
  unread_count: number
}

// GET /api/notifications — ログインユーザーの通知一覧
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const [systemRes, activityRes, readsRes] = await Promise.all([
    // 運営通知（最新20件）
    supabase
      .from('system_notifications')
      .select('id, title, body, created_at')
      .order('created_at', { ascending: false })
      .limit(20),

    // アクティビティ通知（最新30件）
    supabase
      .from('user_notifications')
      .select('id, type, card_id, read_at, created_at, from_user_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30),

    // 既読済み system_notification の ID 一覧
    supabase
      .from('system_notification_reads')
      .select('notification_id')
      .eq('user_id', user.id),
  ])

  const readIds = new Set((readsRes.data ?? []).map(r => r.notification_id))

  const system: SystemNotification[] = (systemRes.data ?? []).map(n => ({
    ...n,
    read: readIds.has(n.id),
  }))

  // from_user_id のプロフィールをまとめて取得
  const fromUserIds = [...new Set(
    (activityRes.data ?? []).map(n => n.from_user_id).filter(Boolean)
  )]
  const { data: fromProfiles } = fromUserIds.length
    ? await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', fromUserIds)
    : { data: [] }
  const profileMap = Object.fromEntries((fromProfiles ?? []).map(p => [p.user_id, p]))

  const activity: UserNotification[] = (activityRes.data ?? []).map(n => ({
    id: n.id,
    type: n.type as 'like',
    card_id: n.card_id,
    read_at: n.read_at,
    created_at: n.created_at,
    from_profile: n.from_user_id ? (profileMap[n.from_user_id] ?? null) : null,
  }))

  const unread_count =
    system.filter(n => !n.read).length +
    activity.filter(n => !n.read_at).length

  return NextResponse.json({ system, activity, unread_count } satisfies NotificationsResponse)
}

// POST /api/notifications/read — 既読にする
