import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNav from './AdminNav'

export const metadata = { title: 'Admin | vaacard' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userRow?.role !== 'admin') redirect('/')

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 h-12 flex items-center gap-4 flex-shrink-0">
        <a href="/" className="text-[#00AADB] font-black text-lg">vaacard</a>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-semibold text-gray-600">Admin</span>
        <AdminNav />
      </header>
      <div className="mt-12 flex-1 min-h-0">
        {children}
      </div>
    </div>
  )
}
