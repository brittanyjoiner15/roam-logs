import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import FollowButton from '@/components/FollowButton'

export default async function FollowingPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  // Fetch everyone this profile follows
  const { data: rows } = await supabase
    .from('follows')
    .select('profiles!following_id(id, username, full_name, avatar_url)')
    .eq('follower_id', profile.id)

  const following = (rows ?? [])
    .map((r: any) => r.profiles)
    .filter(Boolean)

  // Which of these does the current user already follow?
  let currentUserFollowingIds: string[] = []
  if (currentUser && following.length > 0) {
    const ids = following.map((f: any) => f.id)
    const { data: alreadyFollowing } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUser.id)
      .in('following_id', ids)
    currentUserFollowingIds = (alreadyFollowing ?? []).map((f) => f.following_id)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link
            href={`/profile/${username}`}
            className="p-2 rounded-button hover:bg-gray-100 transition-colors text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div>
            <h1 className="font-bold text-ink">Following</h1>
            <p className="text-xs text-gray-400">@{username}</p>
          </div>
        </div>

        {following.length === 0 ? (
          <div className="bg-white rounded-card shadow-card p-8 text-center text-gray-500">
            <p className="text-3xl mb-3">🔭</p>
            <p className="font-medium text-ink">Not following anyone yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-card shadow-card divide-y divide-gray-100">
            {following.map((person: any) => {
              const isCurrentUser = currentUser?.id === person.id
              const isFollowing = currentUserFollowingIds.includes(person.id)
              return (
                <div key={person.id} className="flex items-center gap-3 px-4 py-3">
                  <Link href={`/profile/${person.username}`} className="flex-shrink-0">
                    {person.avatar_url ? (
                      <img
                        src={person.avatar_url}
                        alt={person.username}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-brand text-white flex items-center justify-center text-lg font-bold">
                        {person.username[0].toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <Link href={`/profile/${person.username}`} className="flex-1 min-w-0">
                    <p className="font-semibold text-ink text-sm truncate">
                      {person.full_name || person.username}
                    </p>
                    <p className="text-xs text-gray-400">@{person.username}</p>
                  </Link>
                  {currentUser && !isCurrentUser && (
                    <FollowButton
                      profileId={person.id}
                      username={person.username}
                      isFollowing={isFollowing}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
