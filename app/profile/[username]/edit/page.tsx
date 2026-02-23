import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import EditProfileForm from '@/components/forms/EditProfileForm'
import Link from 'next/link'

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  // Only the owner can edit their profile
  if (profile.id !== user.id) {
    redirect(`/profile/${username}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/profile/${username}`}
            className="text-gray-500 hover:text-ink transition-colors"
            aria-label="Back to profile"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-ink">Edit Profile</h1>
        </div>

        <div className="bg-white rounded-card shadow-card p-6">
          <EditProfileForm profile={profile} />
        </div>
      </div>
    </div>
  )
}
