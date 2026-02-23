'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function followUser(followingId: string, username: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to follow users' }
  }

  const { error } = await supabase.from('follows').insert({
    follower_id: user.id,
    following_id: followingId,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/profile/${username}`)
  return { success: true }
}

export async function unfollowUser(followingId: string, username: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to unfollow users' }
  }

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/profile/${username}`)
  return { success: true }
}
