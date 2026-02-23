import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import EditJournalEntryForm from '@/components/forms/EditJournalEntryForm'
import Link from 'next/link'

export default async function EditJournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the entry with campground and photos
  const { data: entry } = await supabase
    .from('journal_entries')
    .select(`
      *,
      campgrounds(name),
      photos(id, storage_path)
    `)
    .eq('id', id)
    .single()

  if (!entry) {
    notFound()
  }

  // Only the owner can edit
  if (entry.user_id !== user.id) {
    redirect('/')
  }

  // Get username for redirect after save
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const username = profile?.username ?? ''

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
          <h1 className="text-xl font-bold text-ink">Edit Entry</h1>
        </div>

        <div className="bg-white rounded-card shadow-card p-6">
          <EditJournalEntryForm
            entry={entry}
            username={username}
            supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
          />
        </div>
      </div>
    </div>
  )
}
