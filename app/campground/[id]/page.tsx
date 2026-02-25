import { getCampgroundDetails } from '@/actions/campground'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import LogVisitButton from '@/components/LogVisitButton'

export default async function CampgroundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const response = await getCampgroundDetails(id)

  if (response.error || !response.result) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {response.error || 'Campground not found'}
          </div>
          <Link
            href="/search"
            className="text-brand hover:underline mt-4 inline-block"
          >
            ← Back to search
          </Link>
        </div>
      </div>
    )
  }

  const place = response.result

  // Check if this campground exists in database and get journal entries
  const supabase = await createClient()

  const { data: campground } = await supabase
    .from('campgrounds')
    .select('id')
    .eq('google_place_id', id)
    .single()

  let visitors: any[] = []
  let journalEntries: any[] = []
  let allEntries: any[] = []

  if (campground) {
    // Get unique visitors (users who have journal entries here)
    const { data: visitorData } = await supabase
      .from('journal_entries')
      .select('user_id, profiles!user_id(username, avatar_url, full_name)')
      .eq('campground_id', campground.id)
      .eq('status', 'published')

    // Get unique visitors by user_id
    const uniqueVisitors = new Map()
    visitorData?.forEach((entry: any) => {
      if (entry.profiles && !uniqueVisitors.has(entry.user_id)) {
        uniqueVisitors.set(entry.user_id, entry.profiles)
      }
    })
    visitors = Array.from(uniqueVisitors.values())

    // Get all journal entries for this campground
    const { data: entries, error: entriesError } = await supabase
      .from('journal_entries')
      .select(`
        *,
        profiles!user_id(username, avatar_url, full_name),
        photos(*)
      `)
      .eq('campground_id', campground.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    journalEntries = entries || []

    // Debug: also get ALL entries regardless of status
    const { data: debugEntries } = await supabase
      .from('journal_entries')
      .select('id, status, user_id')
      .eq('campground_id', campground.id)

    allEntries = debugEntries || []
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <Link
          href="/search"
          className="text-brand hover:underline mb-4 inline-block"
        >
          ← Back to search
        </Link>

        {/* Campground Info */}
        <div className="bg-white rounded-card shadow-card p-6 mb-4">
          <h1 className="text-3xl font-bold text-brand mb-2">{place.name}</h1>

          {place.formatted_address && (
            <p className="text-gray-600 mb-4">📍 {place.formatted_address}</p>
          )}

          {place.rating && (
            <div className="flex items-center gap-4 mb-4">
              <span className="text-lg">⭐ {place.rating}</span>
              {place.user_ratings_total && (
                <span className="text-sm text-gray-500">
                  ({place.user_ratings_total} reviews)
                </span>
              )}
            </div>
          )}

          {place.formatted_phone_number && (
            <p className="text-gray-600 mb-2">
              📞 {place.formatted_phone_number}
            </p>
          )}

          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline mb-4 block"
            >
              🌐 Visit website
            </a>
          )}

          {/* Visitors */}
          {visitors.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">
                {visitors.length} {visitors.length === 1 ? 'camper has' : 'campers have'} visited
              </p>
              <div className="flex gap-2 flex-wrap">
                {visitors.map((visitor: any, index: number) => (
                  <Link
                    key={index}
                    href={`/profile/${visitor.username}`}
                    className="group"
                    title={visitor.full_name || visitor.username}
                  >
                    {visitor.avatar_url ? (
                      <img
                        src={visitor.avatar_url}
                        alt={visitor.username}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white group-hover:border-brand transition-colors"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-bold border-2 border-white group-hover:border-pine transition-colors">
                        {visitor.username?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Log Visit Button */}
          <LogVisitButton
            campground={{
              googlePlaceId: id,
              name: place.name,
              address: place.vicinity || place.formatted_address || '',
              formattedAddress: place.formatted_address || '',
              latitude: place.geometry?.location?.lat || 0,
              longitude: place.geometry?.location?.lng || 0,
            }}
          />
        </div>

        {/* Journal Entries */}
        {journalEntries.length > 0 && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">
              Journal Entries ({journalEntries.length})
            </h2>
            <div className="space-y-4">
              {journalEntries.map((entry: any) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-card shadow-card p-4"
                >
                  {/* User info */}
                  <Link
                    href={`/profile/${entry.profiles?.username}`}
                    className="flex items-center gap-3 mb-3"
                  >
                    {entry.profiles?.avatar_url ? (
                      <img
                        src={entry.profiles.avatar_url}
                        alt={entry.profiles.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-bold">
                        {entry.profiles?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900">
                        {entry.profiles?.full_name || entry.profiles?.username}
                      </p>
                      <p className="text-sm text-gray-500">
                        @{entry.profiles?.username}
                      </p>
                    </div>
                  </Link>

                  {/* Dates */}
                  <p className="text-sm text-gray-600 mb-2">
                    📅 {format(new Date(entry.start_date), 'MMM d, yyyy')} - {format(new Date(entry.end_date), 'MMM d, yyyy')}
                  </p>

                  {/* Notes */}
                  {entry.notes && (
                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">
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
                </div>
              ))}
            </div>
          </div>
        )}

        {campground && journalEntries.length === 0 && (
          <div className="bg-gray-100 rounded-card p-6 text-gray-600">
            <p className="font-bold text-center mb-4">🔍 Debug: Journal Entry Query</p>
            <div className="text-sm space-y-2">
              <p>Database campground ID: <code className="bg-white px-2 py-1 rounded">{campground.id}</code></p>
              <p>Published entries found: <code className="bg-white px-2 py-1 rounded">{journalEntries.length}</code></p>
              <p>All entries (any status): <code className="bg-white px-2 py-1 rounded">{allEntries.length}</code></p>
              {allEntries.length > 0 && (
                <div className="mt-3">
                  <p className="font-bold mb-1">Entries in database:</p>
                  <pre className="text-xs bg-white p-2 rounded overflow-auto">
                    {JSON.stringify(allEntries, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
