import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ getAll: () => [], set: vi.fn() }),
}))

const { mockGetUser, mockFrom } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

import { loadMoreFeedEntries } from './feed'

// Helper to build a minimal journal entry
const makeEntry = (id: string) => ({ id, user_id: 'u1', status: 'published', created_at: '2024-01-01' })

describe('loadMoreFeedEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty result when user is not logged in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await loadMoreFeedEntries(0)
    expect(result).toEqual({ entries: [], hasMore: false })
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('returns empty result when user follows nobody', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    // from('follows').select().eq() → no following
    const mockEq = vi.fn().mockResolvedValue({ data: [] })
    const mockFollowsSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ select: mockFollowsSelect })

    const result = await loadMoreFeedEntries(0)
    expect(result).toEqual({ entries: [], hasMore: false })
    // Should have queried follows but not journal_entries
    expect(mockFrom).toHaveBeenCalledTimes(1)
    expect(mockFrom).toHaveBeenCalledWith('follows')
  })

  it('returns entries with hasMore false when results are within the limit', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    const followingData = [{ following_id: 'user-2' }, { following_id: 'user-3' }]
    const entries = Array.from({ length: 5 }, (_, i) => makeEntry(`entry-${i}`))

    mockFrom.mockImplementation((table: string) => {
      if (table === 'follows') {
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: followingData }) }) }
      }
      // journal_entries chain: select → in → eq → order → range
      const mockRange = vi.fn().mockResolvedValue({ data: entries })
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange })
      const mockEqStatus = vi.fn().mockReturnValue({ order: mockOrder })
      const mockIn = vi.fn().mockReturnValue({ eq: mockEqStatus })
      return { select: vi.fn().mockReturnValue({ in: mockIn }) }
    })

    const result = await loadMoreFeedEntries(0)
    expect(result.entries).toHaveLength(5)
    expect(result.hasMore).toBe(false)
  })

  it('slices results and sets hasMore true when Supabase returns LIMIT+1 rows', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    const followingData = [{ following_id: 'user-2' }]
    // Return 11 entries (LIMIT is 10) to signal there's a next page
    const entries = Array.from({ length: 11 }, (_, i) => makeEntry(`entry-${i}`))

    mockFrom.mockImplementation((table: string) => {
      if (table === 'follows') {
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: followingData }) }) }
      }
      const mockRange = vi.fn().mockResolvedValue({ data: entries })
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange })
      const mockEqStatus = vi.fn().mockReturnValue({ order: mockOrder })
      const mockIn = vi.fn().mockReturnValue({ eq: mockEqStatus })
      return { select: vi.fn().mockReturnValue({ in: mockIn }) }
    })

    const result = await loadMoreFeedEntries(0)
    expect(result.entries).toHaveLength(10)
    expect(result.hasMore).toBe(true)
  })

  it('passes the offset to the range query', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const followingData = [{ following_id: 'user-2' }]

    const mockRange = vi.fn().mockResolvedValue({ data: [] })
    const mockOrder = vi.fn().mockReturnValue({ range: mockRange })
    const mockEqStatus = vi.fn().mockReturnValue({ order: mockOrder })
    const mockIn = vi.fn().mockReturnValue({ eq: mockEqStatus })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'follows') {
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: followingData }) }) }
      }
      return { select: vi.fn().mockReturnValue({ in: mockIn }) }
    })

    await loadMoreFeedEntries(20)
    // offset=20, LIMIT=10, so range should be called with (20, 30)
    expect(mockRange).toHaveBeenCalledWith(20, 30)
  })
})
