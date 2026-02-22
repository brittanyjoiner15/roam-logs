# Prompt: Build a Camping Journal Social App with Next.js

## Overview
Build a personal RV & camping travel journal application where users can log campground visits, share their experiences, and follow other campers. Think Instagram meets camping trip tracker.

## Tech Stack
- **Next.js 15+** (App Router with Server Components)
- **TypeScript**
- **Tailwind CSS** with custom camping theme
- **Supabase** (PostgreSQL + Auth + Storage)
- **Google Maps JavaScript API** (Places, Geocoding, Maps)
- **React Hook Form + Zod** for form validation
- **date-fns** for date handling

## Core Features

### 1. Authentication (Supabase Auth)
- Email/password signup with username, full name, email
- Sign in / sign out
- Protected routes (use Next.js middleware)
- User profiles with bio, avatar, website link

### 2. Campground Search & Discovery
- Search campgrounds using **Google Places API Text Search**
- Display results with name, address, formatted address
- Detailed campground pages showing:
  - Location on Google Map with custom tent marker
  - Total visitor count
  - List of users who have visited
  - All journal entries for this campground
- Save campgrounds to database when users log visits

### 3. Journal Entry System
- Users can log visits to campgrounds with:
  - Date range (start_date, end_date)
  - Notes/description (rich text)
  - Multiple photo uploads (max 5MB each, JPG/PNG/WebP)
  - Status: draft or published
- Personal journal page showing user's own entries (tabs for published/drafts)
- Edit and delete own entries
- Share published entries with other users (creates a draft copy for recipient)

### 4. Social Features
- Follow/unfollow other users
- Feed page showing published journal entries from followed users
- User profiles displaying:
  - Bio, avatar, stats (followers, following, campgrounds visited, states visited)
  - Their published journal entries
  - Interactive map showing all campgrounds they've visited
- User search functionality
- Share journal entries with specific users

### 5. Interactive Maps
- Map view of all campgrounds a user has visited
- Custom tent SVG markers (orange #F25C2A)
- Click markers to see campground info
- Auto-center map based on user's entries

### 6. Photo Management
- Upload to Supabase Storage (path: `userId/campgroundId/timestamp-filename`)
- Display in journal entries and feed
- Delete with cascade when entry deleted

## Database Schema (Supabase PostgreSQL)

```sql
-- Profiles (extends auth.users)
profiles:
  - id (uuid, FK to auth.users)
  - username (unique, required)
  - full_name
  - bio
  - avatar_url
  - website
  - created_at, updated_at

-- Campgrounds (from Google Places API)
campgrounds:
  - id (uuid, PK)
  - google_place_id (unique)
  - name
  - address
  - formatted_address
  - latitude (DECIMAL 10,8)
  - longitude (DECIMAL 10,8)
  - created_at, updated_at

-- Journal Entries
journal_entries:
  - id (uuid, PK)
  - user_id (FK to profiles)
  - campground_id (FK to campgrounds, cascade delete)
  - start_date (date)
  - end_date (date)
  - notes (text)
  - status (enum: 'published', 'draft')
  - shared_from_user_id (FK to profiles) -- if this is a shared entry
  - shared_with_user_id (FK to profiles) -- who this was shared with
  - shared_accepted (boolean)
  - created_at, updated_at

-- Photos
photos:
  - id (uuid, PK)
  - journal_entry_id (FK, cascade delete)
  - campground_id (FK to campgrounds)
  - storage_path (text)
  - caption (text)
  - created_at

-- Follows (social relationships)
follows:
  - follower_id (FK to profiles)
  - following_id (FK to profiles)
  - created_at
  - UNIQUE (follower_id, following_id)
```

## Pages & Routes (Next.js App Router)

```
app/
  ├── page.tsx                          // Landing page (public)
  ├── login/page.tsx                    // Sign in
  ├── signup/page.tsx                   // User registration
  ├── search/page.tsx                   // Search campgrounds (public)
  ├── campground/[id]/page.tsx          // Campground details (public)
  ├── journal/page.tsx                  // User's journal (protected)
  ├── journal-entry/[id]/page.tsx       // Single journal entry (protected)
  ├── feed/page.tsx                     // Social feed (protected)
  ├── profile/[username]/
  │   ├── page.tsx                      // User profile (protected)
  │   └── map/page.tsx                  // User's campground map (protected)
```

## Key User Flows

### Flow 1: Search & Log a Visit
1. User searches for "Yosemite campground" on /search
2. Results load from Google Places API
3. User clicks a campground → /campground/[id]
4. If not in DB, save campground details from Google Places
5. User clicks "Log a Visit"
6. Form: select date range, add notes, upload photos, publish or save draft
7. Entry saved to database, photos uploaded to Supabase Storage

### Flow 2: Social Feed
1. User goes to /feed
2. Load published journal entries from users they follow (ordered by created_at DESC)
3. Display as cards with: campground name, user info, dates, notes, photos
4. Can click through to user profiles or campground pages

### Flow 3: Sharing an Entry
1. User on their journal selects "Share" on a published entry
2. Search for username to share with
3. Creates a draft copy of entry for recipient (with shared_from_user_id set)
4. Recipient sees draft in their journal, can publish or delete

## Google Maps Integration

Create a service to:
- Load Google Maps script once (singleton pattern)
- `searchCampgrounds(query)` - use Places API Text Search
- `getCampgroundDetails(placeId)` - get lat/lng, formatted address
- `geocodeAddress(address)` - fallback if coordinates missing
- `initializeMap(container, center, zoom)` - create map instance
- `createMarker(map, position, title)` - custom tent SVG marker

**Tent Marker SVG:**
```html
<svg width="24" height="24" fill="#F25C2A">
  <path d="M12 2L2 22h20L12 2z"/>
</svg>
```

## Tailwind Custom Theme

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: '#F25C2A',      // Sunset orange (primary)
      pine: '#3A9270',       // Forest green
      sand: '#C4B5A8',       // Warm neutral
      ink: '#2D2821',        // Dark text
    },
    borderRadius: {
      card: '12px',
      button: '10px',
      badge: '20px',
    },
    boxShadow: {
      card: '0 2px 8px rgba(0,0,0,0.1)',
    },
    fontFamily: {
      display: ['Outfit', 'sans-serif'],
      sans: ['Inter', 'sans-serif'],
    },
  },
}
```

## Simplification Guidelines for Next.js Implementation

### Use Next.js Strengths:
1. **Server Components by default** - fetch data on server for initial page loads
2. **Server Actions** for form submissions (journal entries, follow/unfollow)
3. **Middleware** for route protection
4. **Image component** for optimized photos
5. **Parallel Routes** for feed and loading states
6. **Route Handlers** (`/api` routes) for Google Maps API calls (keep API key secret)

### Minimal Client Components:
- Interactive map component (`'use client'`)
- Forms with React Hook Form
- Follow/unfollow buttons
- Image upload with preview
- Search autocomplete

### Data Fetching Patterns:
- Use Supabase Server Client in Server Components
- Create Supabase Client Component for client-side mutations
- Use Server Actions for form submissions (no separate API routes needed)
- Cache strategy: `revalidatePath()` after mutations

### Authentication:
- Supabase Auth with Next.js middleware
- Check session in middleware, redirect if needed
- Server Component: `createServerClient()` for SSR
- Client Component: `createBrowserClient()` for interactivity

### File Structure:
```
src/
  ├── app/                 # Next.js App Router pages
  ├── components/          # React components
  │   ├── CampgroundCard.tsx
  │   ├── JournalCard.tsx
  │   ├── GoogleMap.tsx (client)
  │   └── forms/
  ├── lib/
  │   ├── supabase/
  │   │   ├── server.ts    # Server client
  │   │   ├── client.ts    # Browser client
  │   │   └── middleware.ts
  │   ├── google-maps.ts   # Google Maps service
  │   └── utils.ts
  ├── actions/             # Server Actions
  │   ├── journal.ts
  │   ├── follow.ts
  │   └── profile.ts
  └── types/               # TypeScript types
```

## Step-by-Step Implementation Order

1. **Setup:** Next.js project, Tailwind, Supabase client, Google Maps API
2. **Auth:** Signup/login pages, middleware, session management
3. **Database:** Run Supabase migrations for schema
4. **Campground Search:** Google Places integration, search page
5. **Campground Details:** Show campground with map, visitors
6. **Journal Entry Form:** Create/edit entries with photos
7. **Personal Journal:** List user's entries with tabs
8. **Social Features:** Follow system, user profiles
9. **Feed:** Show followed users' entries
10. **Map View:** Display user's visited campgrounds on map
11. **Sharing:** Share entries between users
12. **Polish:** Loading states, error handling, responsive design

## Key Simplifications vs Original

- **Use Server Actions** instead of separate service layer
- **Server Components** for data fetching (no client-side loading states needed)
- **Route Handlers** for Google API calls (keep API key server-side)
- **No separate context providers** (use server/client components appropriately)
- **Simpler caching** (leverage Next.js built-in caching and revalidation)
- **Middleware auth** instead of client-side AuthContext

## Expected User Experience

A clean, camping-themed app where users can:
- Quickly search for campgrounds
- Log their camping trips with photos and notes
- See where they've been on a map
- Follow friends and see their adventures
- Share favorite campground experiences

Keep the UI simple with clear calls-to-action, warm earthy colors, and intuitive navigation focused on the camping experience.
