'use client'

import { useTransition } from 'react'
import { followUser, unfollowUser } from '@/actions/follow'

type FollowButtonProps = {
  profileId: string
  username: string
  isFollowing: boolean
}

export default function FollowButton({
  profileId,
  username,
  isFollowing,
}: FollowButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      if (isFollowing) {
        await unfollowUser(profileId, username)
      } else {
        await followUser(profileId, username)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`px-5 py-2 rounded-button font-semibold text-sm transition-colors disabled:opacity-50 ${
        isFollowing
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          : 'bg-brand text-white hover:bg-brand/90'
      }`}
    >
      {isPending ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
