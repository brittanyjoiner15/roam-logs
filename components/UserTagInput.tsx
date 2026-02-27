'use client'

import { useState, useRef, useEffect } from 'react'
import { searchUsers } from '@/actions/profile'

export type TaggedUser = {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
}

type Props = {
  value: TaggedUser[]
  onChange: (users: TaggedUser[]) => void
}

export default function UserTagInput({ value, onChange }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TaggedUser[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (q: string) => {
    setQuery(q)
    clearTimeout(timeoutRef.current)
    if (!q.trim()) {
      setResults([])
      setShowDropdown(false)
      return
    }
    timeoutRef.current = setTimeout(async () => {
      const res = await searchUsers(q)
      const filtered = (res.results ?? []).filter(
        (r) => !value.some((v) => v.id === r.id)
      ) as TaggedUser[]
      setResults(filtered.slice(0, 5))
      setShowDropdown(true)
    }, 300)
  }

  const addUser = (user: TaggedUser) => {
    onChange([...value, user])
    setQuery('')
    setResults([])
    setShowDropdown(false)
  }

  const removeUser = (id: string) => {
    onChange(value.filter((u) => u.id !== id))
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Tag friends (optional)
      </label>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((user) => (
            <div key={user.id} className="flex items-center gap-1.5 bg-gray-100 rounded-full pl-1 pr-2 py-1">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold">
                  {user.username[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs text-gray-700">@{user.username}</span>
              <button
                type="button"
                onClick={() => removeUser(user.id)}
                className="text-gray-400 hover:text-gray-600 ml-0.5 leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search by name or username..."
        className="w-full px-3 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-brand text-sm"
      />

      {showDropdown && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-card shadow-lg overflow-hidden">
          {results.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => addUser(user)}
              className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-50 transition-colors"
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {user.username[0].toUpperCase()}
                </div>
              )}
              <div className="text-left min-w-0">
                <p className="text-sm font-medium text-ink truncate">{user.full_name || user.username}</p>
                <p className="text-xs text-gray-400">@{user.username}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
