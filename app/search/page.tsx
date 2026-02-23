'use client'

import { useState } from 'react'
import { searchCampgrounds } from '@/actions/campground'
import { searchUsers } from '@/actions/profile'
import Link from 'next/link'

type Tab = 'campgrounds' | 'people'

export default function SearchPage() {
  const [tab, setTab] = useState<Tab>('campgrounds')
  const [query, setQuery] = useState('')
  const [campgroundResults, setCampgroundResults] = useState<any[]>([])
  const [userResults, setUserResults] = useState<
    { username: string; full_name: string | null; avatar_url: string | null }[]
  >([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleTabChange = (next: Tab) => {
    setTab(next)
    setQuery('')
    setCampgroundResults([])
    setUserResults([])
    setError('')
    setSearched(false)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setCampgroundResults([])
    setUserResults([])
    setSearched(true)

    if (tab === 'campgrounds') {
      const response = await searchCampgrounds(query)
      if (response.error) {
        setError(response.error)
      } else {
        setCampgroundResults(response.results || [])
      }
    } else {
      const response = await searchUsers(query)
      if (response.error) {
        setError(response.error)
      } else {
        setUserResults(response.results || [])
      }
    }

    setLoading(false)
  }

  const hasResults =
    tab === 'campgrounds' ? campgroundResults.length > 0 : userResults.length > 0

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <h1 className="text-xl font-bold text-ink mb-5">Search</h1>

        {/* Tab toggle */}
        <div className="flex gap-2 mb-4">
          {(['campgrounds', 'people'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTabChange(t)}
              className={`flex-1 py-2 px-4 rounded-button text-sm font-medium border transition-colors ${
                tab === t
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-brand'
              }`}
            >
              {t === 'campgrounds' ? 'Campgrounds' : 'People'}
            </button>
          ))}
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                tab === 'campgrounds'
                  ? 'Search for a campground...'
                  : 'Search by name or username...'
              }
              className="flex-1 px-4 py-3 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-brand"
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

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Campground results */}
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
                {/* Debug: Show raw data */}
                <details className="mt-2" onClick={(e) => e.preventDefault()}>
                  <summary className="text-xs text-gray-400 cursor-pointer">Raw data</summary>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(place, null, 2)}
                  </pre>
                </details>
              </Link>
            ))}
          </div>
        )}

        {/* People results */}
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
