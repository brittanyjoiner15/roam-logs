'use server'

import { createClient } from '@/lib/supabase/server'

const LIMIT = 10

export async function loadMoreFeedEntries(offset: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { entries: [], hasMore: false }

  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const followingIds = following?.map((f) => f.following_id) ?? []

  if (followingIds.length === 0) return { entries: [], hasMore: false }

  // Fetch one extra to detect if there's a next page
  const { data } = await supabase
    .from('journal_entries')
    .select(`
      *,
      campgrounds(*),
      photos(*),
      profiles!user_id(username, full_name, avatar_url),
      journal_entry_tags(tagged_user_id, profiles!tagged_user_id(username, avatar_url))
    `)
    .in('user_id', followingIds)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range(offset, offset + LIMIT)

  const rows = data ?? []
  const hasMore = rows.length > LIMIT

  return { entries: hasMore ? rows.slice(0, LIMIT) : rows, hasMore }
}
