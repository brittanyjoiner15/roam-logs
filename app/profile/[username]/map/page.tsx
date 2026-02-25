import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import CampgroundMap, { CampgroundVisit } from '@/components/CampgroundMap'

export default async function UserMapPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .eq('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  const { data: entries } = await supabase
    .from('journal_entries')
    .select(`
      start_date,
      end_date,
      campgrounds(
        id,
        google_place_id,
        name,
        latitude,
        longitude
      )
    `)
    .eq('user_id', profile.id)
    .eq('status', 'published')
    .order('start_date', { ascending: false })

  console.log('Profile:', profile)
  console.log('Fetched campgrounds:', entries)

  // Group visits by campground id
  const campgroundMap = new Map<string, CampgroundVisit>()
  for (const entry of entries ?? []) {
    const cg = Array.isArray(entry.campgrounds) ? entry.campgrounds[0] : (entry.campgrounds as CampgroundVisit['campground'] | null)
    if (!cg) continue
    if (!campgroundMap.has(cg.id)) {
      campgroundMap.set(cg.id, { campground: cg, visits: [] })
    }
    campgroundMap.get(cg.id)!.visits.push({
      start_date: entry.start_date,
      end_date: entry.end_date,
    })
  }

  const campgrounds = Array.from(campgroundMap.values())

  const displayName = profile.full_name || profile.username

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <Link
          href={`/profile/${username}`}
          className="text-brand hover:text-brand/80 transition-colors flex items-center gap-1 text-sm font-medium"
        >
          ← {displayName}
        </Link>
        <span className="text-gray-300">|</span>
        <h1 className="text-sm font-semibold text-ink">
          {campgrounds.length === 0
            ? 'No campgrounds visited yet'
            : `${campgrounds.length} campground${campgrounds.length !== 1 ? 's' : ''} visited`}
        </h1>
      </div>

      {/* Map or empty state */}
      {campgrounds.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-5xl mb-4">🏕️</p>
            <p className="font-medium text-lg">No trips logged yet</p>
            <p className="text-sm mt-1">
              Campgrounds will appear here once {displayName} logs a visit.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <CampgroundMap campgrounds={campgrounds} />
        </div>
      )}
    </div>
  )
}
