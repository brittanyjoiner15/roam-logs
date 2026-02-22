import { createClient } from '@/lib/supabase/server'
import BottomNav from './BottomNav'

export default async function BottomNavWrapper() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Don't show nav on login/signup pages
  if (!user) {
    return null
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  return <BottomNav username={profile?.username} />
}
