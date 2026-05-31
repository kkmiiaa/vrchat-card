import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/notifications/read — 既読にする
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const { systemIds, activityIds } = await request.json() as {
    systemIds?: string[]
    activityIds?: string[]
  }

  const ops: Promise<unknown>[] = []

  if (systemIds?.length) {
    ops.push(
      supabase.from('system_notification_reads').upsert(
        systemIds.map(id => ({ user_id: user.id, notification_id: id })),
        { onConflict: 'user_id,notification_id' }
      )
    )
  }

  if (activityIds?.length) {
    ops.push(
      supabase.from('user_notifications')
        .update({ read_at: new Date().toISOString() })
        .in('id', activityIds)
        .eq('user_id', user.id)
        .is('read_at', null)
    )
  }

  await Promise.all(ops)
  return NextResponse.json({ ok: true })
}
