import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SuggestedFollowers from '@/components/SuggestedFollowers'
import FeedEntries from '@/components/FeedEntries'
import { touchLastActive } from '@/actions/profile'
import { loadMoreFeedEntries } from '@/actions/feed'

export default async function FeedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Track last activity (fire and forget)
  void touchLastActive()

  // Fetch current user's profile to check completeness
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('username, full_name')
    .eq('id', user.id)
    .single()

  // Get the list of users this user follows (for suggestions filter)
  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const followingIds = following?.map((f) => f.following_id) ?? []

  // Fetch suggested profiles — most recently active, excluding already-followed and self
  const { data: suggestedProfiles } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .neq('id', user.id)
    .order('last_active_at', { ascending: false, nullsFirst: false })
    .limit(10)

  const suggestions = (suggestedProfiles ?? []).filter(
    (p) => !followingIds.includes(p.id)
  )

  // Use the same action as "load more" so the limit is always consistent
  const { entries, hasMore } = await loadMoreFeedEntries(0)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {!currentProfile?.full_name && (
          <Link
            href={`/profile/${currentProfile?.username}/edit`}
            className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-card px-4 py-3 mb-4 hover:bg-amber-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-amber-500">✏️</span>
              <div>
                <p className="text-sm font-medium text-amber-800">Update your profile</p>
                <p className="text-xs text-amber-600">Add your name so friends can find you!</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </Link>
        )}
        {suggestions.length > 0 && <SuggestedFollowers profiles={suggestions} />}
        <FeedEntries
          initialEntries={entries}
          initialHasMore={hasMore}
          supabaseUrl={supabaseUrl}
        />
      </div>
    </div>
  )
}
