'use client'

import { useState } from 'react'
import { searchCampgrounds } from '@/actions/campground'
import Link from 'next/link'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setResults([])

    const response = await searchCampgrounds(query)

    if (response.error) {
      setError(response.error)
    } else {
      setResults(response.results || [])
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-brand mb-6">
          Search Campgrounds
        </h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a campground..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-brand text-white px-6 py-3 rounded-button hover:bg-brand/90 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">
              Found {results.length} results
            </h2>
            <div className="space-y-4">
              {results.map((place, index) => (
                <Link
                  key={place.place_id || index}
                  href={`/campground/${place.place_id}`}
                  className="block bg-white p-4 rounded-card shadow-card hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-bold text-lg mb-1 text-brand">
                    {place.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    📍 {place.formatted_address}
                  </p>
                  {place.rating && (
                    <p className="text-sm text-gray-500">
                      ⭐ {place.rating} ({place.user_ratings_total} reviews)
                    </p>
                  )}
                  <p className="text-xs text-brand mt-2">Tap to view details →</p>
                  {/* Debug: Show raw data */}
                  <details className="mt-2" onClick={(e) => e.preventDefault()}>
                    <summary className="text-xs text-gray-400 cursor-pointer">
                      Raw data
                    </summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(place, null, 2)}
                    </pre>
                  </details>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && results.length === 0 && query && !error && (
          <p className="text-gray-500 text-center">
            No campgrounds found. Try a different search.
          </p>
        )}
      </div>
    </div>
  )
}
