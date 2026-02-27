'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import PhotoCarousel from '@/components/PhotoCarousel'
import { parseCityState } from '@/lib/utils'
import { loadMoreFeedEntries } from '@/actions/feed'

type Entry = any

type Props = {
  initialEntries: Entry[]
  initialHasMore: boolean
  supabaseUrl: string
}

export default function FeedEntries({ initialEntries, initialHasMore, supabaseUrl }: Props) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)

  const loadMore = async () => {
    setLoading(true)
    const result = await loadMoreFeedEntries(entries.length)
    setEntries((prev) => [...prev, ...result.entries])
    setHasMore(result.hasMore)
    setLoading(false)
  }

  if (entries.length === 0) {
    return (
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
    )
  }

  return (
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
              {entry.campgrounds && (
                <Link
                  href={`/campground/${entry.campgrounds.google_place_id}`}
                  className="font-bold text-ink hover:text-brand transition-colors block leading-snug"
                >
                  {entry.campgrounds.name}
                </Link>
              )}

              {entry.campgrounds?.address && (() => {
                const location = parseCityState(entry.campgrounds.address)
                return location ? (
                  <p className="text-xs text-gray-400 mt-0.5 mb-2">📍 {location}</p>
                ) : null
              })()}

              <p className="text-xs text-gray-500 mb-2">
                📅 {format(new Date(entry.start_date), 'MMM d, yyyy')}
                {entry.end_date !== entry.start_date && (
                  <> – {format(new Date(entry.end_date), 'MMM d, yyyy')}</>
                )}
              </p>

              {entry.notes && (
                <p className="text-gray-700 text-sm whitespace-pre-wrap line-clamp-4">
                  {entry.notes}
                </p>
              )}
            </div>
          </div>
        )
      })}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full py-3 text-sm font-medium text-brand hover:text-brand/80 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  )
}
