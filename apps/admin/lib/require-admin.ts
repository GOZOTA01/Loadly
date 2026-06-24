import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role, full_name, email')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/login')

  return { supabase, session, profile }
}
