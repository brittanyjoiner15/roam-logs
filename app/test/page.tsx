import { createClient } from '@/lib/supabase/server'
import { logout } from '@/actions/auth'
import Link from 'next/link'

export default async function TestPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // Try to read from profiles table
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(5)

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Supabase Connection Test</h1>
        {user ? (
          <form action={logout}>
            <button
              type="submit"
              className="bg-red-500 text-white px-4 py-2 rounded-button hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="bg-brand text-white px-4 py-2 rounded-button hover:bg-brand/90 transition-colors"
          >
            Login
          </Link>
        )}
      </div>

      {/* Authentication Status */}
      <div className="border-2 border-gray-300 rounded-lg p-4">
        <h2 className="text-xl font-bold mb-3">Authentication Status</h2>
        {authError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Auth Error:</p>
            <p>{authError.message}</p>
          </div>
        ) : user ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p className="font-bold mb-2">✅ Logged in!</p>
            <p className="mb-1"><strong>User ID:</strong> {user.id}</p>
            <p className="mb-1"><strong>Email:</strong> {user.email}</p>
            <pre className="bg-white p-2 rounded text-xs overflow-auto mt-2">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p className="font-bold">❌ Not logged in</p>
            <p className="text-sm mt-1">No active session found</p>
          </div>
        )}
      </div>

      {/* Database Query */}
      <div className="border-2 border-gray-300 rounded-lg p-4">
        <h2 className="text-xl font-bold mb-3">Database Query</h2>
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error:</p>
            <p>{error.message}</p>
          </div>
        ) : (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p className="font-bold mb-2">✅ Connected successfully!</p>
            <p className="mb-2">Found {profiles?.length || 0} profiles</p>
            {profiles && profiles.length > 0 && (
              <pre className="bg-white p-2 rounded text-xs overflow-auto">
                {JSON.stringify(profiles, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
