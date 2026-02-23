import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import FollowButton from '@/components/FollowButton'
import DeleteEntryButton from '@/components/DeleteEntryButton'
import { logout } from '@/actions/auth'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  // Get current session (optional — page is public)
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  // Fetch the profile by username
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  // Follower count, following count, campgrounds visited — run in parallel
  const [
    { count: followerCount },
    { count: followingCount },
    { data: visitedEntries },
    { data: isFollowingRow },
  ] = await Promise.all([
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', profile.id),

    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', profile.id),

    supabase
      .from('journal_entries')
      .select('campground_id')
      .eq('user_id', profile.id)
      .eq('status', 'published'),

    // Check if current user follows this profile
    currentUser && currentUser.id !== profile.id
      ? supabase
          .from('follows')
          .select('follower_id')
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const campgroundsVisited = new Set(visitedEntries?.map((e) => e.campground_id)).size
  const isFollowing = !!isFollowingRow

  // Fetch published journal entries with campground + photos
  const { data: journalEntries } = await supabase
    .from('journal_entries')
    .select(`
      *,
      campgrounds(*),
      photos(*)
    `)
    .eq('user_id', profile.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const entries = journalEntries || []
  const isOwnProfile = currentUser?.id === profile.id

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-6">

        {/* Profile Header */}
        <div className="bg-white rounded-card shadow-card p-6 mb-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-20 h-20 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-brand text-white flex items-center justify-center text-3xl font-bold flex-shrink-0">
                {profile.username[0].toUpperCase()}
              </div>
            )}

            {/* Name + username + follow button */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-ink truncate">
                    {profile.full_name || profile.username}
                  </h1>
                  <p className="text-gray-500 text-sm">@{profile.username}</p>
                </div>

                {/* Follow button — only shown to logged-in users viewing another profile */}
                {currentUser && !isOwnProfile && (
                  <FollowButton
                    profileId={profile.id}
                    username={profile.username}
                    isFollowing={isFollowing}
                  />
                )}

                {isOwnProfile && (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profile/${profile.username}/edit`}
                      className="px-5 py-2 rounded-button font-semibold text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      Edit
                    </Link>
                    <form action={logout}>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-button text-sm border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors whitespace-nowrap"
                      >
                        Log out
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-5 mt-3">
                <div className="text-center">
                  <p className="font-bold text-ink text-sm">{followerCount ?? 0}</p>
                  <p className="text-xs text-gray-500">Followers</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-ink text-sm">{followingCount ?? 0}</p>
                  <p className="text-xs text-gray-500">Following</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-ink text-sm">{campgroundsVisited}</p>
                  <p className="text-xs text-gray-500">Campgrounds</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-4 text-gray-700 text-sm whitespace-pre-wrap">{profile.bio}</p>
          )}

          {/* Website */}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-brand text-sm hover:underline inline-block"
            >
              🌐 {profile.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>

        {/* Journal Entries */}
        <h2 className="text-lg font-bold text-ink mb-3">
          Trips {entries.length > 0 && <span className="text-gray-400 font-normal">({entries.length})</span>}
        </h2>

        {entries.length === 0 ? (
          <div className="bg-white rounded-card shadow-card p-8 text-center text-gray-500">
            <p className="text-3xl mb-3">🏕️</p>
            <p className="font-medium">No trips logged yet</p>
            {isOwnProfile && (
              <Link
                href="/search"
                className="mt-3 inline-block text-brand text-sm hover:underline"
              >
                Search for a campground to log your first journal entry.
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry: any) => (
              <div key={entry.id} className="bg-white rounded-card shadow-card p-4">
                {/* Campground name */}
                {entry.campgrounds && (
                  <Link
                    href={`/campground/${entry.campgrounds.google_place_id}`}
                    className="font-bold text-ink hover:text-brand transition-colors block mb-1"
                  >
                    {entry.campgrounds.name}
                  </Link>
                )}

                {/* Dates */}
                <p className="text-sm text-gray-500 mb-3">
                  📅 {format(new Date(entry.start_date), 'MMM d, yyyy')}
                  {entry.end_date !== entry.start_date && (
                    <> – {format(new Date(entry.end_date), 'MMM d, yyyy')}</>
                  )}
                </p>

                {/* Notes */}
                {entry.notes && (
                  <p className="text-gray-700 text-sm mb-3 whitespace-pre-wrap line-clamp-4">
                    {entry.notes}
                  </p>
                )}

                {/* Photos */}
                {entry.photos && entry.photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {entry.photos.map((photo: any) => {
                      const photoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/campground-photos/${photo.storage_path}`
                      return (
                        <img
                          key={photo.id}
                          src={photoUrl}
                          alt={photo.caption || 'Campground photo'}
                          className="w-full h-40 object-cover rounded"
                        />
                      )
                    })}
                  </div>
                )}

                {/* Address */}
                {entry.campgrounds?.formatted_address && (
                  <p className="text-xs text-gray-400 mt-3">
                    📍 {entry.campgrounds.formatted_address}
                  </p>
                )}

                {/* Edit / Delete — only visible on own profile */}
                {isOwnProfile && (
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                    <Link
                      href={`/journal-entry/${entry.id}/edit`}
                      className="text-sm text-gray-400 hover:text-brand transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteEntryButton entryId={entry.id} username={profile.username} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
