'use client'

import { useState } from 'react'

type User = {
  id: string
  username_slug: string
  plan: string
  plan_expires_at: string | null
  role: string
  created_at: string
  email?: string | null
}

type UpdateField = 'role' | 'plan'

export default function UsersClient({ users: initial }: { users: User[] }) {
  const [users, setUsers] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const deleteUser = async (userId: string, slug: string) => {
    if (!confirm(`「${slug}」を削除しますか？この操作は取り消せません。`)) return
    setLoading(`${userId}-delete`)
    setError(null)
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    setLoading(null)
    if (!res.ok) {
      const json = await res.json()
      setError(json.error ?? '削除に失敗しました')
      return
    }
    setUsers(prev => prev.filter(u => u.id !== userId))
  }

  const update = async (userId: string, field: UpdateField, value: string) => {
    setLoading(`${userId}-${field}`)
    setError(null)
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    setLoading(null)
    if (!res.ok) {
      const json = await res.json()
      setError(json.error ?? '更新に失敗しました')
      return
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, [field]: value } : u))
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 w-full overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold text-gray-900">ユーザー管理（{users.length}件）</h2>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">slug</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">メール</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">プラン</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">ロール</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">登録日</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <a
                    href={`/u/${user.username_slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-[#00AADB] hover:underline"
                  >
                    {user.username_slug}
                  </a>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">
                  {user.email ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={user.plan}
                    disabled={loading === `${user.id}-plan`}
                    onChange={e => update(user.id, 'plan', e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:opacity-50"
                  >
                    <option value="free">free</option>
                    <option value="pro">pro</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    disabled={loading === `${user.id}-role`}
                    onChange={e => update(user.id, 'role', e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:opacity-50"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {new Date(user.created_at).toLocaleDateString('ja-JP')}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => deleteUser(user.id, user.username_slug)}
                    disabled={loading === `${user.id}-delete`}
                    className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 rounded px-2 py-0.5 transition-colors disabled:opacity-40"
                  >
                    {loading === `${user.id}-delete` ? '...' : '削除'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
