import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_type')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.account_type === 'organizer' || user.user_metadata?.account_type === 'organizer') {
    redirect('/dashboard/organizer')
  }

  redirect('/dashboard/exhibitor')
}
