'use client'

import { useState, useEffect, useRef } from 'react'
import { searchCampgrounds } from '@/actions/campground'
import { searchUsers, touchLastActive } from '@/actions/profile'
import Link from 'next/link'
import mixpanel from 'mixpanel-browser'

type Tab = 'campgrounds' | 'people'

type FeaturedCampground = {
  name: string
  photo: string
  city: string
  state: string
  description: string
  placeId: string
}

const FEATURED_CAMPGROUNDS: FeaturedCampground[] = [
  {
    name: 'Raccoon Valley RV Park',
    photo: 'https://raccoonrv.com/wp-content/uploads/2024/12/Untitled-4-1.png',
    city: 'Knoxville',
    state: 'TN',
    description: 'Central Knoxville location with everything you need an amazing price. Friendly and helpful staff.',
    placeId: 'ChIJmR4BILk4XIgRGhBViRGHol0',
  },
  {
    name: 'Little River Campground',
    photo: 'https://scontent.fric1-2.fna.fbcdn.net/v/t39.30808-6/304890396_480330280769978_3492528433453356650_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=h3qCjY9sMzIQ7kNvwHoDIjF&_nc_oc=AdneZCIaM2jsy-acjFXyhW06kICYv2QKH6Zefb-Ci0zBwsmA2SaWtFmb6EDcijP_Bd0&_nc_zt=23&_nc_ht=scontent.fric1-2.fna&_nc_gid=a92VN1a57_d3hcVstYQm9A&oh=00_AfvaDQ6tsY0is_VVgMT4Ra6s5UXRQN3wVyQMRfmNAWTKtw&oe=69A6BE63',
    city: 'Townsend',
    state: 'TN',
    description: 'Absolutely gorgoeus campground right on the river, and balconies at riverside spots! Easy access to the Smoky Mountains.',
    placeId: 'ChIJYUChOYKnXogRNqTYiYbG-0Y',
  },
  {
    name: 'Whispering Hills RV Resort',
    photo: 'https://scontent.fric1-1.fna.fbcdn.net/v/t39.30808-1/305492796_1050849682413861_5038824533929058178_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=108&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=Ulcqfep5ZiwQ7kNvwG5Lu0d&_nc_oc=AdlFUo3fIK8XvYRcAYsm9pzGt2tK3wRILhcK5BtcwquaWFLf-DqJrPupi6-jijTG-i0&_nc_zt=24&_nc_ht=scontent.fric1-1.fna&_nc_gid=sqUl7N6Sht8MG6gdRM9ZKA&oh=00_Afunog97cLsQZZ-9X7BdtWOcDGkuaf2dPsW4aS5yi8c3SA&oe=69A6AE49',
    city: 'Georgetown',
    state: 'KY',
    description: 'Just north of Lexington, KY, this beautiful location is spacious, has spots on the water, and all the amenenities.',
    placeId: 'ChIJcZk_bEw8QogRs9Oa2h1J40U',
  },
  {
    name: 'Americamps RV Resort',
    photo: 'https://scontent.fric1-2.fna.fbcdn.net/v/t39.30808-1/511035031_122100449870921130_3780170022025541643_n.jpg?stp=c54.0.1939.1939a_dst-jpg_s480x480_tt6&_nc_cat=111&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=ImDZLlCdKwUQ7kNvwGlQFHG&_nc_oc=Adk-ugGr7ZoK8Ubjkr13r-vqaJ64RkyY1aR-cmubDJ26mllySpKDJpPVl10AIrkqHtk&_nc_zt=24&_nc_ht=scontent.fric1-2.fna&_nc_gid=FrODymjdEZP_UygHCENmhA&oh=00_AfsSQdGaIMZN1uQcu7C5YsPYxUEYGYPHky2iBMETjMsmXw&oe=69A6BDBA',
    city: 'Ashland',
    state: 'VA',
    description: 'Resort-style campground with full amenities (dog park, gym, pickleball and basketball courts, pool, and more!',
    placeId: 'ChIJZ9e0P2s8sYkRtFPSv9nMbRE',
  },
]

type UserResult = {
  username: string
  full_name: string | null
  avatar_url: string | null
}

export default function SearchPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void touchLastActive()
  }, [])

  const [tab, setTab] = useState<Tab>('campgrounds')
  const [query, setQuery] = useState('')

  // Dropdown (live as-you-type)
  const [dropdownCampgrounds, setDropdownCampgrounds] = useState<any[]>([])
  const [dropdownUsers, setDropdownUsers] = useState<UserResult[]>([])
  const [dropdownLoading, setDropdownLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // Full results (after form submit)
  const [campgroundResults, setCampgroundResults] = useState<any[]>([])
  const [userResults, setUserResults] = useState<UserResult[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // Debounced dropdown
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setDropdownCampgrounds([])
      setDropdownUsers([])
      setShowDropdown(false)
      return
    }

    const delay = tab === 'campgrounds' ? 500 : 300
    const timer = setTimeout(async () => {
      setDropdownLoading(true)
      mixpanel.track('Search Typed', { query: trimmed, type: tab })
    
      if (tab === 'campgrounds') {
        const res = await searchCampgrounds(trimmed)
        setDropdownCampgrounds(res.results?.slice(0, 5) ?? [])
      } else {
        const res = await searchUsers(trimmed)
        setDropdownUsers(res.results?.slice(0, 5) ?? [])
      }
      setDropdownLoading(false)
      setShowDropdown(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [query, tab])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleTabChange = (next: Tab) => {
    setTab(next)
    setQuery('')
    setDropdownCampgrounds([])
    setDropdownUsers([])
    setShowDropdown(false)
    setCampgroundResults([])
    setUserResults([])
    setError('')
    setSearched(false)
  }

  // function to setDropdown to false and log mixpanel track event when user clicks on a dropdown item
  const handleDropdownClick = (type: Tab) => {
    mixpanel.track('Search Result Clicked', { query, type })
    setShowDropdown(false)
  }

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    mixpanel.track('Search Button Clicked', { query, type: tab })
    e.preventDefault()
    if (!query.trim()) return

    setShowDropdown(false)
    setLoading(true)
    setError('')
    setCampgroundResults([])
    setUserResults([])
    setSearched(true)

    if (tab === 'campgrounds') {
      const response = await searchCampgrounds(query)
      if (response.error) setError(response.error)
      else setCampgroundResults(response.results || [])
    } else {
      const response = await searchUsers(query)
      if (response.error) setError(response.error)
      else setUserResults(response.results || [])
    }

    setLoading(false)
  }

  const hasResults =
    tab === 'campgrounds' ? campgroundResults.length > 0 : userResults.length > 0

  const dropdownItems =
    tab === 'campgrounds' ? dropdownCampgrounds : dropdownUsers
  const hasDropdown = showDropdown && dropdownItems.length > 0

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        
        {/* Filter toggle */}
        <div className="flex items-center gap-5 mb-4">
          {(['campgrounds', 'people'] as Tab[]).map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer select-none">
              <span
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  tab === t ? 'border-brand' : 'border-gray-400'
                }`}
              >
                {tab === t && <span className="w-2 h-2 rounded-full bg-brand block" />}
              </span>
              <input
                type="radio"
                name="searchType"
                value={t}
                checked={tab === t}
                onChange={() => handleTabChange(t)}
                className="sr-only"
              />
              <span className={`text-sm font-medium transition-colors ${tab === t ? 'text-ink' : 'text-gray-400'}`}>
                {t === 'campgrounds' ? 'Campgrounds' : 'People'}
              </span>
            </label>
          ))}
        </div>

        {/* Search form + dropdown */}
        <div ref={containerRef} className="relative mb-6">
          <form onSubmit={handleSearch}>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => dropdownItems.length > 0 && setShowDropdown(true)}
                onKeyDown={(e) => e.key === 'Escape' && setShowDropdown(false)}
                placeholder={
                  tab === 'campgrounds'
                    ? 'Search for a campground to log a journal entry...'
                    : 'Search by name or username...'
                }
                className="flex-1 px-4 py-3 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-brand"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-brand text-white px-6 py-3 rounded-button hover:bg-brand/90 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? '...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Dropdown */}
          {(hasDropdown || dropdownLoading) && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-card shadow-lg border border-gray-100 z-50 overflow-hidden">
              {dropdownLoading && !hasDropdown ? (
                <div className="px-4 py-3 text-sm text-gray-400">Searching...</div>
              ) : tab === 'campgrounds' ? (
                dropdownCampgrounds.map((place, i) => (
                  <Link
                    key={place.place_id ?? i}
                    href={`/campground/${place.place_id}`}
                    onClick={() => handleDropdownClick('campgrounds')}
                    className="flex flex-col px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <span className="font-medium text-ink text-sm">{place.name}</span>
                    <span className="text-xs text-gray-400 truncate">{place.formatted_address}</span>
                  </Link>
                ))
              ) : (
                dropdownUsers.map((person) => (
                  <Link
                    key={person.username}
                    href={`/profile/${person.username}`}
                    onClick={() => handleDropdownClick('people')}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    {person.avatar_url ? (
                      <img
                        src={person.avatar_url}
                        alt={person.username}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {person.username[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {person.full_name || person.username}
                      </p>
                      <p className="text-xs text-gray-400">@{person.username}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        {/* Featured Campgrounds */}
        {!query.trim() && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-ink mb-3">Featured Campgrounds</p>
            <div className="space-y-3">
              {FEATURED_CAMPGROUNDS.map((cg) => (
                <Link
                  key={cg.placeId}
                  onClick={() => mixpanel.track("Featured Campground Clicked", { place_id: cg.placeId, name: cg.name })}
                  href={`/campground/${cg.placeId}`}
                  className="flex items-center gap-3 bg-white rounded-card shadow-card p-3 hover:shadow-md transition-shadow"
                >
                  <img
                    src={cg.photo}
                    alt={cg.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{cg.name}</p>
                    <p className="text-xs text-gray-400 mb-1">{cg.city}, {cg.state}</p>
                    <p className="text-xs text-gray-500">{cg.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Campground full results */}
        {tab === 'campgrounds' && campgroundResults.length > 0 && (
          <div className="space-y-4">
            {campgroundResults.map((place, index) => (
              <Link
                key={place.place_id || index}
                href={`/campground/${place.place_id}`}
                className="block bg-white p-4 rounded-card shadow-card hover:shadow-lg transition-shadow"
              >
                <h3 className="font-bold text-lg mb-1 text-brand">{place.name}</h3>
                <p className="text-gray-600 text-sm mb-2">📍 {place.formatted_address}</p>
                {place.rating && (
                  <p className="text-sm text-gray-500">
                    ⭐ {place.rating} ({place.user_ratings_total} reviews)
                  </p>
                )}
                <p className="text-xs text-brand mt-2">Tap to view details →</p>
              </Link>
            ))}
          </div>
        )}

        {/* People full results */}
        {tab === 'people' && userResults.length > 0 && (
          <div className="space-y-2">
            {userResults.map((person) => (
              <Link
                key={person.username}
                href={`/profile/${person.username}`}
                className="flex items-center gap-3 bg-white p-4 rounded-card shadow-card hover:shadow-lg transition-shadow"
              >
                {person.avatar_url ? (
                  <img
                    src={person.avatar_url}
                    alt={person.username}
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-brand text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                    {person.username[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-ink truncate">
                    {person.full_name || person.username}
                  </p>
                  <p className="text-sm text-gray-400">@{person.username}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && searched && !hasResults && !error && (
          <p className="text-gray-500 text-center">
            {tab === 'campgrounds'
              ? 'No campgrounds found. Try a different search.'
              : 'No people found. Try a different name or username.'}
          </p>
        )}
      </div>
    </div>
  )
}
