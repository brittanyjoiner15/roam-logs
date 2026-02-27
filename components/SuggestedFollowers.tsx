'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { followUser } from '@/actions/follow'

type SuggestedProfile = {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
}

export default function SuggestedFollowers({ profiles }: { profiles: SuggestedProfile[] }) {
  const [followed, setFollowed] = useState<Set<string>>(new Set())
  const [pending, startTransition] = useTransition()

  const visible = profiles.filter((p) => !followed.has(p.id))

  if (visible.length === 0) return null

  const handleFollow = (profile: SuggestedProfile) => {
    startTransition(async () => {
      await followUser(profile.id, profile.username)
      setFollowed((prev) => new Set([...prev, profile.id]))
    })
  }

  return (
    <div className="bg-white rounded-card shadow-card p-4 mb-5">
      <p className="text-sm font-semibold text-ink mb-3">Suggested for you</p>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {visible.map((profile) => (
          <div
            key={profile.id}
            className="flex flex-col items-center gap-2 flex-shrink-0 w-28 bg-gray-50 rounded-xl p-3"
          >
            <Link href={`/profile/${profile.username}`}>
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-brand text-white flex items-center justify-center text-xl font-bold">
                  {profile.username[0].toUpperCase()}
                </div>
              )}
            </Link>
            <div className="text-center min-w-0 w-full">
              <Link href={`/profile/${profile.username}`}>
                <p className="text-xs font-semibold text-ink truncate">
                  {profile.full_name || profile.username}
                </p>
                <p className="text-xs text-gray-400 truncate">@{profile.username}</p>
              </Link>
            </div>
            <button
              onClick={() => handleFollow(profile)}
              disabled={pending}
              className="w-full py-1.5 rounded-button bg-brand text-white text-xs font-semibold hover:bg-brand/90 transition-colors disabled:opacity-50"
            >
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
