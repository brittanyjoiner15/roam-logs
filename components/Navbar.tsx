import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/actions/auth'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user profile if logged in
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-brand">RoamLogs</span>
          </Link>

          {/* Navigation Links */}
          {user ? (
            <div className="flex items-center gap-6">
              <Link
                href="/search"
                className="text-gray-700 hover:text-brand transition-colors font-medium"
              >
                Search
              </Link>
              <Link
                href="/journal"
                className="text-gray-700 hover:text-brand transition-colors font-medium"
              >
                Journal
              </Link>
              <Link
                href="/feed"
                className="text-gray-700 hover:text-brand transition-colors font-medium"
              >
                Feed
              </Link>
              <Link
                href={`/profile/${profile?.username || user.id}`}
                className="text-gray-700 hover:text-brand transition-colors font-medium"
              >
                Profile
              </Link>

              {/* User Menu */}
              <div className="flex items-center gap-3 border-l border-gray-300 pl-6">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-bold">
                    {profile?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <form action={logout}>
                  <button
                    type="submit"
                    className="text-sm text-gray-600 hover:text-brand transition-colors"
                  >
                    Logout
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/search"
                className="text-gray-700 hover:text-brand transition-colors font-medium"
              >
                Search
              </Link>
              <Link
                href="/login"
                className="bg-brand text-white px-4 py-2 rounded-button hover:bg-brand/90 transition-colors font-medium"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
