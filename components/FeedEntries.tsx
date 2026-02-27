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

              {(() => {
                const location = entry.campgrounds?.address ? parseCityState(entry.campgrounds.address) : null
                const tags = (entry.journal_entry_tags as Array<{ profiles: { username: string, avatar_url: string | null } }> | null) ?? []
                if (!location && tags.length === 0) return null
                return (
                  <div className="flex items-center justify-between mt-0.5 mb-2 gap-2">
                    {location ? (
                      <p className="text-xs text-gray-400">📍 {location}</p>
                    ) : <span />}
                    {tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-xs text-gray-400">with</span>
                        {tags.slice(0, 5).map((tag) => {
                          const p = tag.profiles
                          return p.avatar_url ? (
                            <Link key={p.username} href={`/profile/${p.username}`} title={`@${p.username}`}>
                              <img src={p.avatar_url} alt={p.username} className="w-5 h-5 rounded-full object-cover" />
                            </Link>
                          ) : (
                            <Link key={p.username} href={`/profile/${p.username}`} title={`@${p.username}`}>
                              <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold">
                                {p.username[0].toUpperCase()}
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
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
