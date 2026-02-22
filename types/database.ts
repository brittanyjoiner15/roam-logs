export type Profile = {
  id: string
  username: string
  full_name: string
  bio: string | null
  avatar_url: string | null
  website: string | null
  created_at: string
  updated_at: string
}

export type Campground = {
  id: string
  google_place_id: string
  name: string
  address: string
  formatted_address: string
  latitude: number
  longitude: number
  created_at: string
  updated_at: string
}

export type JournalEntry = {
  id: string
  user_id: string
  campground_id: string
  start_date: string
  end_date: string
  notes: string | null
  status: 'published' | 'draft'
  shared_from_user_id: string | null
  shared_with_user_id: string | null
  shared_accepted: boolean | null
  created_at: string
  updated_at: string
}

export type Photo = {
  id: string
  journal_entry_id: string
  campground_id: string
  storage_path: string
  caption: string | null
  created_at: string
}

export type Follow = {
  follower_id: string
  following_id: string
  created_at: string
}

// Joined types for common queries
export type JournalEntryWithDetails = JournalEntry & {
  campground: Campground
  profile: Profile
  photos: Photo[]
}

export type ProfileWithStats = Profile & {
  follower_count?: number
  following_count?: number
  campgrounds_visited?: number
  states_visited?: number
}
