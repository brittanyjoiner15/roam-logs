import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock Next.js server-only modules
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ getAll: () => [], set: vi.fn() }),
}))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

// Hoist mock refs so they're available inside the vi.mock factory
const { mockLimit, mockOr, mockSelect, mockFrom, mockGetUser } = vi.hoisted(() => ({
  mockLimit: vi.fn(),
  mockOr: vi.fn(),
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockGetUser: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

import { searchUsers } from './profile'

describe('searchUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Wire up the query chain: from → select → or → limit → {data, error}
    mockLimit.mockResolvedValue({ data: [], error: null })
    mockOr.mockReturnValue({ limit: mockLimit })
    mockSelect.mockReturnValue({ or: mockOr })
    mockFrom.mockReturnValue({ select: mockSelect })
  })

  it('returns empty results immediately for an empty string', async () => {
    const result = await searchUsers('')
    expect(result).toEqual({ results: [] })
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('returns empty results immediately for a whitespace-only query', async () => {
    const result = await searchUsers('   ')
    expect(result).toEqual({ results: [] })
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('queries the profiles table with the trimmed search term', async () => {
    await searchUsers('  alice  ')
    expect(mockFrom).toHaveBeenCalledWith('profiles')
    expect(mockSelect).toHaveBeenCalledWith('id, username, full_name, avatar_url')
    expect(mockOr).toHaveBeenCalledWith('username.ilike.%alice%,full_name.ilike.%alice%')
    expect(mockLimit).toHaveBeenCalledWith(20)
  })

  it('returns the users from Supabase', async () => {
    const fakeUsers = [
      { id: 'u1', username: 'alice', full_name: 'Alice Smith', avatar_url: null },
      { id: 'u2', username: 'alicia', full_name: 'Alicia Keys', avatar_url: 'https://example.com/a.jpg' },
    ]
    mockLimit.mockResolvedValue({ data: fakeUsers, error: null })

    const result = await searchUsers('alice')
    expect(result).toEqual({ results: fakeUsers })
  })

  it('falls back to empty array when Supabase returns null data', async () => {
    mockLimit.mockResolvedValue({ data: null, error: null })
    const result = await searchUsers('bob')
    expect(result).toEqual({ results: [] })
  })

  it('returns an error message when Supabase returns an error', async () => {
    mockLimit.mockResolvedValue({ data: null, error: { message: 'Connection timeout' } })
    const result = await searchUsers('bob')
    expect(result).toEqual({ error: 'Connection timeout' })
  })
})
