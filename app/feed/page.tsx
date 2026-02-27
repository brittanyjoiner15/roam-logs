import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import SuggestedFollowers from '@/components/SuggestedFollowers'
import PhotoCarousel from '@/components/PhotoCarousel'
import { parseCityState } from '@/lib/utils'

const SUGGESTED_USERNAMES = ['VeeWhy', 'britt', 'merylvdm']

export default async function FeedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get the list of users this user follows
  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const followingIds = following?.map((f) => f.following_id) ?? []

  // Fetch suggested profiles, excluding ones already followed and the current user
  const { data: suggestedProfiles } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .in('username', SUGGESTED_USERNAMES)
    .neq('id', user.id)

  const suggestions = (suggestedProfiles ?? []).filter(
    (p) => !followingIds.includes(p.id)
  )

  // If not following anyone, skip the entries query
  let entries: any[] = []

  if (followingIds.length > 0) {
    const { data } = await supabase
      .from('journal_entries')
      .select(`
        *,
        campgrounds(*),
        photos(*),
        profiles!user_id(username, full_name, avatar_url)
      `)
      .in('user_id', followingIds)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(30)

    entries = data ?? []
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {suggestions.length > 0 && <SuggestedFollowers profiles={suggestions} />}
        {entries.length === 0 ? (
          <div className="bg-white rounded-card shadow-card p-8 text-center text-gray-500">
            <p className="text-4xl mb-3">🏕️</p>
            <p className="font-medium text-ink mb-1">Nothing here yet</p>
            <p className="text-sm text-gray-400 mb-4">
              Follow other campers to see their trips in your feed.
            </p>
            <Link
              href="/search"
              className="inline-block text-brand text-sm font-medium hover:underline"
            >
              Search to find campers →
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {entries.map((entry) => {
              const profile = entry.profiles as {
                username: string
                full_name: string | null
                avatar_url: string | null
              } | null

              return (
                <div key={entry.id} className="bg-white rounded-card shadow-card overflow-hidden">
                  {/* User header */}
                  <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                    <Link href={`/profile/${profile?.username}`}>
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.username}
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {profile?.username?.[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                    </Link>
                    <div className="min-w-0">
                      <Link
                        href={`/profile/${profile?.username}`}
                        className="font-semibold text-ink text-sm hover:text-brand transition-colors"
                      >
                        {profile?.full_name || profile?.username}
                      </Link>
                      <p className="text-xs text-gray-400">
                        {format(new Date(entry.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  {/* Photos */}
                  {entry.photos && entry.photos.length > 0 && (
                    <PhotoCarousel photos={entry.photos} supabaseUrl={supabaseUrl} />
                  )}

                  {/* Content */}
                  <div className="px-4 py-3">
                    {/* Campground name */}
                    {entry.campgrounds && (
                      <Link
                        href={`/campground/${entry.campgrounds.google_place_id}`}
                        className="font-bold text-ink hover:text-brand transition-colors block leading-snug"
                      >
                        {entry.campgrounds.name}
                      </Link>
                    )}

                    {/* City, State */}
                    {entry.campgrounds?.address && (() => {
                      const location = parseCityState(entry.campgrounds.address)
                      return location ? (
                        <p className="text-xs text-gray-400 mt-0.5 mb-2">📍 {location}</p>
                      ) : null
                    })()}

                    {/* Dates */}
                    <p className="text-xs text-gray-500 mb-2">
                      📅 {format(new Date(entry.start_date), 'MMM d, yyyy')}
                      {entry.end_date !== entry.start_date && (
                        <> – {format(new Date(entry.end_date), 'MMM d, yyyy')}</>
                      )}
                    </p>

                    {/* Notes */}
                    {entry.notes && (
                      <p className="text-gray-700 text-sm whitespace-pre-wrap line-clamp-4">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
