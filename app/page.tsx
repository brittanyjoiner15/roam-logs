import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-sand/20">
      <div className="text-center px-4">
        <h1 className="text-6xl md:text-7xl font-bold text-brand mb-4">
          RoamLogs
        </h1>
        <p className="text-xl md:text-2xl text-ink/70 mb-8">
          Your Camping Journal
        </p>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Log your camping trips, discover new campgrounds, and share your adventures with fellow campers.
        </p>

        <div className="flex gap-4 justify-center">
          {user ? (
            <>
              <Link
                href="/journal"
                className="bg-brand text-white px-6 py-3 rounded-button hover:bg-brand/90 transition-colors font-medium"
              >
                My Journal
              </Link>
              <Link
                href="/search"
                className="bg-white border-2 border-brand text-brand px-6 py-3 rounded-button hover:bg-brand/5 transition-colors font-medium"
              >
                Search Campgrounds
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="bg-brand text-white px-6 py-3 rounded-button hover:bg-brand/90 transition-colors font-medium"
              >
                Get Started
              </Link>
              <Link
                href="/search"
                className="bg-white border-2 border-brand text-brand px-6 py-3 rounded-button hover:bg-brand/5 transition-colors font-medium"
              >
                Explore
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
