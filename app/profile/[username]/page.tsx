import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import FollowButton from '@/components/FollowButton'
import DeleteEntryButton from '@/components/DeleteEntryButton'
import ProfileMenuButton from '@/components/ProfileMenuButton'

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
                  <h1 className="text-xl font-bold text-ink">
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
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/profile/${profile.username}/edit`}
                      className="p-2 rounded-button border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                      title="Edit profile"
                    >
                      {/* Pencil icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </Link>
                    <ProfileMenuButton />
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

          {/* View Map button */}
          {campgroundsVisited > 0 && (
            <Link
              href={`/profile/${profile.username}/map`}
              className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-button border border-brand text-brand text-sm font-medium hover:bg-brand hover:text-white transition-colors"
            >
              <span>🗺️</span> <span>View Map</span>
            </Link>
          )}

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

        {/* Onboarding Checklist — own profile, no journal entries yet */}
        {isOwnProfile && entries.length === 0 && (() => {
          const profileDone = !!(profile.avatar_url || profile.bio)
          const followDone = (followingCount ?? 0) > 0
          const steps = [
            {
              label: 'Edit your profile',
              hint: 'Add a photo or bio',
              done: profileDone,
              href: `/profile/${profile.username}/edit`,
            },
            {
              label: 'Follow someone',
              hint: 'Find other campers',
              done: followDone,
              href: '/feed',
            },
            {
              label: 'Log a journal entry',
              hint: 'Record your last trip',
              done: false,
              href: '/search',
            },
          ]
          const completedCount = steps.filter((s) => s.done).length
          return (
            <div className="bg-white rounded-card shadow-card p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-ink">Get started</p>
                <p className="text-xs text-gray-400">{completedCount} / {steps.length} done</p>
              </div>
              <div className="space-y-2">
                {steps.map((step) => (
                  step.done ? (
                    <div key={step.label} className="flex items-center gap-3 py-2">
                      <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 line-through">{step.label}</p>
                      </div>
                    </div>
                  ) : (
                    <Link key={step.label} href={step.href} className="flex items-center gap-3 py-2 group">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 group-hover:border-brand transition-colors" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink group-hover:text-brand transition-colors">{step.label}</p>
                        <p className="text-xs text-gray-400">{step.hint}</p>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-300 group-hover:text-brand transition-colors ml-auto flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  )
                ))}
              </div>
            </div>
          )
        })()}

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
